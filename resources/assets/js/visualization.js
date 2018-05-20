var margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 0
    },
    width = 960 - margin.left - margin.right,
    height = 850 - margin.top - margin.bottom;

var svg = d3.select("svg")
    .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .attr("width", '100%')
    .attr("height", '100%');

var colorarray = ['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f','#e5c494','#b3b3b3'];

var color = d3.scaleOrdinal().range(colorarray);

function treemap(filepath) {
    let x = d3.scaleLinear().range([0, width]),
        y = d3.scaleLinear().range([0, height]);

    let treemap = d3.treemap()
        .tile(d3.treemapResquarify)
        .size([width, height])
        .round(true)
        .paddingInner(1)
        .paddingTop(20);

    svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.json(filepath).then(function(data) {
        let root = d3.hierarchy(data)
            .eachBefore(function(d) {
                d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
            })
            .sum(d => d.size)
            .sort(function(a, b) {
                return b.height - a.height || b.value - a.value;
            });

        node = root;
        treemap(root);

        let cell = svg.selectAll("g")
            .data(root.descendants())
            .enter().append("g")
            .attr("class", function(d) {
                if (d.children) {
                    return "cell inner";
                } else {
                    return "cell leaf";
                }
            })
            .attr("transform", function(d) {
                return "translate(" + d.x0 + "," + d.y0 + ")";
            })
            .on("click", function(d) {
                return zoom(node == d.parent ? root : d.parent);
            });

        cell.append("rect")
            .attr("id", function(d) {
                return d.data.id;
            })
            .attr("width", function(d) {
                return d.x1 - d.x0;
            })
            .attr("height", function(d) {
                return d.y1 - d.y0;
            })
            .attr("fill", function(d) {
                if (!d.children) {
                    return color(d.parent.data.id);
                } else {
                    return "#d4e3fc";
                }
            })
            .attr("stroke", function (d) {
                if (d.children) {
                    return "black";
                } else {
                    return "none";
                }
            }).attr("stroke-width", function (d) {
            if (d.children) {
                return 1;
            } else {
                return null;
            }
        });

        cell.append("text")
            .attr("x", function(d) {
                if (!d.children) {
                    return (d.x1 - d.x0) * 0.5;
                } else {
                    return 0;
                }
            })
            .attr("y", function(d) {
                if (!d.children) {
                    return (d.y1 - d.y0) * 0.5;
                } else {
                    return 10;
                }
            })
            .attr("dy", ".35em")
            .attr("text-anchor", function(d) {
                if (!d.children) {
                    return "middle";
                } else {
                    return "top";
                }
            })
            .text(function(d) {
                return d.data.name;
            })
            .style("opacity", function(d) {
                d.w = this.getComputedTextLength();
                return (d.x1 - d.x0) > d.w ? 1 : 0;
            });

        cell.append('title')
            .text(d => d.data.name + '\n' + d.value);

    });

    function zoom(d) {
        let w = d.x1 - d.x0,
            h = d.y1 - d.y0;
        let kx = width * 1.0 / w,
            ky = height * 1.0 / h;

        x.domain([d.x0, d.x0 + w]);
        y.domain([d.y0, d.y0 + h]);

        let transition = svg.selectAll("g.cell")
            .transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .attr("transform", function(d) {
                return "translate(" + x(d.x0) + "," + y(d.y0) + ")";
            });

        transition.select("rect")
            .attr("width", function(d) {
                return kx * (d.x1 - d.x0) - 1;
            })
            .attr("height", function(d) {
                return ky * (d.y1 - d.y0) - 1;
            });

        transition.select("text")
            .attr("x", function(d) {
                if (!d.children) {
                    return kx * (d.x1 - d.x0) / 2;
                } else {
                    return 0;
                }
            })
            .attr("y", function(d) {
                if (!d.children) {
                    return ky * (d.y1 - d.y0) / 2;
                } else {
                    return 10;
                }
            })
            .style("opacity", function(d) {
                return kx * (d.x1 - d.x0) > d.w ? 1 : 0;
            });

        node = d;
        d3.event.stopPropagation();
    }
}

function circlePacking(filepath) {
    var diameter = document.getElementById('panel-body').offsetHeight - 60,
        margin = 0,
        g = svg.append("g")
            .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

    var pack = d3.pack()
        .size([diameter - margin, diameter - margin])
        .padding(2);

    d3.json(filepath).then(function (root) {
        root = d3.hierarchy(root)
            .sum(function (d) {
                return d.size;
            })
            .sort(function (a, b) {
                return b.value - a.value;
            });

        var focus = root,
            nodes = pack(root).descendants(),
            view;

        var circle = g.selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("class", function (d) {
                return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root";
            })
            .style("fill", function (d) {
                return d.children ? color(d.depth) : null;
            })
            .on("click", function (d) {
                if (focus !== d) {
                    zoom(d);
                    d3.event.stopPropagation();
                }
            });

        g.selectAll("text")
            .data(nodes)
            .enter().append("text")
            .attr("class", "label")
            .style("fill-opacity", function (d) {
                return d.parent === root ? 1 : 0;
            })
            .style("display", function (d) {
                return d.parent === root ? "inline" : "none";
            })
            .text(function (d) {
                return d.data.name;
            });

        circle.append('title')
            .text(d => d.data.name + '\n' + d.value);

        var node = g.selectAll("circle,text");

        svg.style("background", color(-1))
            .on("click", function () {
                zoom(root);
            });

        zoomTo([root.x, root.y, root.r * 2 + margin]);

        function zoom(d) {
            var focus0 = focus;
            focus = d;

            var transition = d3.transition()
                .duration(d3.event.altKey ? 7500 : 750)
                .tween("zoom", function (d) {
                    var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
                    return function (t) {
                        zoomTo(i(t));
                    };
                });

            transition.selectAll("text")
                .filter(function (d) {
                    return d.parent === focus || this.style.display === "inline";
                })
                .style("fill-opacity", function (d) {
                    return d.parent === focus ? 1 : 0;
                })
                .on("start", function (d) {
                    if (d.parent === focus) this.style.display = "inline";
                })
                .on("end", function (d) {
                    if (d.parent !== focus) this.style.display = "none";
                });
        }

        function zoomTo(v) {
            var k = diameter / v[2];
            view = v;
            node.attr("transform", function (d) {
                return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
            });
            circle.attr("r", function (d) {
                return d.r * k;
            });
        }
    });
}

function sunburst(filepath) {
    let maxRadius = (Math.min(width, height) / 2) - 5,
        formatNumber = d3.format(',d');

    let x = d3.scaleLinear()
        .range([0, 2 * Math.PI])
        .clamp(true);
    let y = d3.scaleSqrt()
        .range([maxRadius*.1, maxRadius]);

    let partition = d3.partition();
    let arc = d3.arc()
        .startAngle(d => x(d.x0))
        .endAngle(d => x(d.x1))
        .innerRadius(d => Math.max(0, y(d.y0)))
        .outerRadius(d => Math.max(0, y(d.y1)));

    let middleArcLine = d => {
        let r = Math.max(0, (y(d.y0) + y(d.y1)) / 2),
            halfPi = Math.PI/2,
            angles = [x(d.x0) - halfPi, x(d.x1) - halfPi],
            middleAngle = (angles[1] + angles[0]) / 2,
            invertDirection = middleAngle > 0 && middleAngle < Math.PI; // for lower quadrants

        if (invertDirection) {
            angles.reverse();
        }

        let path = d3.path();

        path.arc(0, 0, r, angles[0], angles[1], invertDirection);

        return path.toString();
    };

    let textFits = d => {
        const CHAR_SPACE = 6;

        let deltaAngle = x(d.x1) - x(d.x0),
            r = Math.max(0, (y(d.y0) + y(d.y1)) / 2),
            perimeter = r * deltaAngle;

        return d.data.name.length * CHAR_SPACE < perimeter;
    };

    svg.attr('viewBox', `${-width / 2} ${-height / 2} ${width} ${height}`)
        .on('click', () => focusOn()); // reset zoom on click


    d3.json(filepath).then(function (data) {
        let root = d3.hierarchy(data)
            .sum(d => d.size);

        let slice = svg.selectAll('g.slice')
            .data(partition(root)
            .descendants());

        slice.exit().remove();

        let newSlice = slice.enter()
            .append('g')
            .attr('class', 'slice')
            .on('click', d => {
                d3.event.stopPropagation();
                focusOn(d);
            });

        newSlice.append('title')
            .text(d => d.data.name + '\n' + formatNumber(d.value));

        newSlice.append('path')
            .attr('class', 'main-arc')
            .style('fill', d => color((d.children ? d : d.parent).data.name))
            .attr('d', arc);

        newSlice.append('path')
            .attr('class', 'hidden-arc')
            .attr('id', (_, i) => `hiddenArc${i}`)
            .attr('d', middleArcLine);

        let text = newSlice.append('text')
            .attr('display', d => textFits(d) ? null : 'none');

        // white contour
        text.append('textPath')
            .attr('startOffset','50%')
            .attr('xlink:href', (_, i) => `#hiddenArc${i}` )
            .text(d => d.data.name)
            .style('fill', 'none');

        text.append('textPath')
            .attr('startOffset','50%')
            .attr('xlink:href', (_, i) => `#hiddenArc${i}` )
            .text(d => d.data.name);
    });

    function focusOn(d = { x0: 0, x1: 1, y0: 0, y1: 1 }) {
        // reset to top-level if no data point specified

        let transition = svg.transition()
            .duration(750)
            .tween('scale', () => {
                let xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
                    yd = d3.interpolate(y.domain(), [d.y0, 1]);
                return t => { x.domain(xd(t)); y.domain(yd(t)); };
            });

        transition.selectAll('path.main-arc')
            .attrTween('d', d => () => arc(d));

        transition.selectAll('path.hidden-arc')
            .attrTween('d', d => () => middleArcLine(d));

        transition.selectAll('text')
            .attrTween('display', d => () => textFits(d) ? null : 'none');

        moveStackToFront(d);


        function moveStackToFront(elD) {
            svg.selectAll('.slice').filter(d => d === elD)
                .each(function(d) {
                    this.parentNode.appendChild(this);
                    if (d.parent) { moveStackToFront(d.parent); }
                })
        }
    }
}

function chord(filepath) {
    function fade(opacity) {
        return function(d, i) {
            ribbons.filter(function(d) {
                return d.source.index != i && d.target.index != i;
            })
                .transition()
                .style("opacity", opacity);
        };
    }

    let outerRadius = Math.min(width, height) * 0.5 - 40,
        innerRadius = outerRadius - 30;

    let chord = d3.chord()
        .padAngle(.04)
        .sortSubgroups(d3.descending)
        .sortChords(d3.descending);

    let arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    let ribbon = d3.ribbon()
        .radius(innerRadius);

    d3.json(filepath).then(function(data) {
        let indexByName = d3.map(),
            nameByIndex = d3.map(),
            matrix = [],
            n = 0;

        // Returns the Flare package name for the given class name.
        function name(name) {
            return name.substring(0, name.lastIndexOf(".")).substring(6);
        }

        // Compute a unique index for each package name.
        data.forEach(function(d) {
            if (!indexByName.has(d = name(d.name))) {
                nameByIndex.set(n, d);
                indexByName.set(d, n++);
            }
        });

        // construct a square matrix counting package imports
        data.forEach(function(d) {
            let source = indexByName.get(name(d.name)),
                row = matrix[source];
            if (!row) {
                row = matrix[source] = [];
                for (let i = 0; i < n; i++)
                    row[i] = 0;
            }

            d.imports.forEach(function(d) {
                row[indexByName.get(name(d))]++;
            });
        });

        let g = svg.append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
            .datum(chord(matrix));

        let group = g.append("g")
            .attr("class", "groups")
            .selectAll("g")
            .data(function(chords) { return chords.groups; })
            .enter().append("g");

        group.append("path")
            .style("fill", function(d) { return color(d.index); })
            .style("stroke", function(d) { return d3.rgb(color(d.index)).darker(); })
            .attr("d", arc)
            .on("mouseover", fade(.1))
            .on("mouseout", fade(1));

        ribbons = g.append("g")
            .attr("class", "ribbons")
            .selectAll("path")
            .data(function(chords) { return chords; })
            .enter().append("path")
            .attr("d", ribbon)
            .style("fill", function(d) { return color(d.target.index); })
            .style("stroke", function(d) { return d3.rgb(color(d.target.index)).darker(); });

        ribbons.append("title")
            .text(function(d){return chordTip(d);});

        group.append("text")
            .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
            .attr("dy", ".35em")
            .attr("transform", function(d) {
                return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                    + "translate(" + (innerRadius + 36) + ")"
                    + (d.angle > Math.PI ? "rotate(180)" : "");
            })
            .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
            .text(function(d) { return nameByIndex.get(d.index); });

        group.append("title")
            .text(function(d) { return groupTip(d); });

        function chordTip(d){
            return "Flow Info:\n"
                + nameByIndex.get(d.source.index) + " → " + nameByIndex.get(d.target.index) + ": " + d.target.value + "\n"
                + nameByIndex.get(d.target.index) + " → " + nameByIndex.get(d.source.index) + ": " + d.source.value;
        }

        function groupTip(d) {
            return "Total Managed by " + nameByIndex.get(d.index) + ":\n" + d.value;
        }
    });

    d3.select(self.frameElement).style("height", outerRadius * 2 + "px");
}

function parallel(filepath) {
    let x = d3.scalePoint().rangeRound([0, width]).padding(1),
        y = {},
        dragging = {};

    let line = d3.line(),
        background,
        foreground,
        extents;

    svg.style("padding-top", 20)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let quant_p = function(v) {
        return (parseFloat(v) == v) || (v == "")
    };

    d3.csv(filepath).then(function(data) {
        dimensions = d3.keys(data[0]);
        x.domain(dimensions);

        dimensions.forEach(function(d) {
            let values = data.map(function(p) { return p[d]; });
            if (values.every(quant_p)){
                y[d] = d3.scaleLinear()
                    .domain(d3.extent(data, function(p) { return +p[d]; }))
                    .range([height, 0]);
            } else {
                values.sort();
                y[d] = d3.scalePoint()
                    .domain(values.filter(function(v, i) { return values.indexOf(v) == i; }))
                    .range([height, 0],1);
            }
        });

        extents = dimensions.map(function(p) { return [0,0]; });

        // Add grey background lines for context.
        background = svg.append("g")
            .attr("class", "background")
            .selectAll("path")
            .data(data)
            .enter().append("path")
            .attr("d", path);

        // Add blue foreground lines for focus.
        foreground = svg.append("g")
            .attr("class", "foreground")
            .selectAll("path")
            .data(data)
            .enter().append("path")
            .attr("d", path);

        // Add a group element for each dimension.
        let g = svg.selectAll(".dimension")
            .data(dimensions)
            .enter()
            .append("g")
            .attr("class", "dimension")
            .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
            .call(d3.drag()
                .subject(function(d) { return {x: x(d)}; })
                .on("start", function(d) {
                    dragging[d] = x(d);
                    background.attr("visibility", "hidden");
                })
                .on("drag", function(d) {
                    dragging[d] = Math.min(width, Math.max(0, d3.event.x));
                    foreground.attr("d", path);
                    dimensions.sort(function(a, b) { return position(a) - position(b); });
                    x.domain(dimensions);
                    g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
                })
                .on("end", function(d) {
                    delete dragging[d];
                    transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
                    transition(foreground).attr("d", path);
                    background
                        .attr("d", path)
                        .transition()
                        .delay(500)
                        .duration(0)
                        .attr("visibility", null);
                }));

        // Add an axis and title.
        g = svg.selectAll(".dimension");
        g.append("g")
            .attr("class", "axis")
            .each(function(d) {  d3.select(this).call(d3.axisLeft(y[d]));})
            .append("text")
            .attr("fill", "black")
            .style("text-anchor", "middle")
            .attr("y", -9)
            .text(function(d) { return d; });

        // Add and store a brush for each axis.
        g.append("g")
            .attr("class", "brush")
            .each(function(d) {
                if(y[d].name == 'r'){
                    d3.select(this).call(y[d].brush = d3.brushY().extent([[-8, 0], [8,height]]).on("brush start", brushstart).on("brush", go_brush).on("brush", brush_parallel_chart).on("end", brush_end));
                } else if (y[d].name == 'n')
                    d3.select(this).call(y[d].brush = d3.brushY().extent([[-8, 0], [15,height]]).on("brush start", brushstart).on("brush", go_brush).on("brush", brush_parallel).on("end", brush_end_ordinal));


            })
            .selectAll("rect")
            .attr("x", -8)
            .attr("width", 16);

        svg.select(".axis").selectAll("text:not(.title)")
            .attr("class", "label")
            .data(data, function(d) { return d.name || d; });

        let projection = svg.selectAll(".axis text,.background path,.foreground path")
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);

        function mouseover(d) {
            svg.classed("active", true);
            projection.classed("inactive", function(p) { return p !== d; });
            projection.filter(function(p) { return p === d; }).each(moveToFront);
        }

        function mouseout(d) {
            svg.classed("active", false);
            projection.classed("inactive", false);
        }

        function moveToFront() {
            this.parentNode.appendChild(this);
        }
    });

    function position(d) {
        var v = dragging[d];
        return v == null ? x(d) : v;
    }

    function transition(g) {
        return g.transition().duration(500);
    }

    // Returns the path for a given data point.
    function path(d) {
        return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
    }

    function go_brush() {
        d3.event.sourceEvent.stopPropagation();
    }

    invertExtent = function(y) {
        return domain.filter(function(d, i) { return y === range[i]; });
    };

    function brushstart(selectionName) {
        foreground.style("display", "none");

        let dimensionsIndex = dimensions.indexOf(selectionName);

        extents[dimensionsIndex] = [0, 0];

        foreground.style("display", function(d) {
            return dimensions.every(function(p, i) {
                if(extents[i][0]==0 && extents[i][0]==0) {
                    return true;
                }
                return extents[i][1] <= d[p] && d[p] <= extents[i][0];
            }) ? null : "none";
        });
    }

    // Handles a brush event, toggling the display of foreground lines.
    function brush_parallel_chart() {
        for(var i=0;i<dimensions.length;++i){
            if(d3.event.target==y[dimensions[i]].brush) {
                extents[i]=d3.event.selection.map(y[dimensions[i]].invert,y[dimensions[i]]);
            }
        }

        foreground.style("display", function(d) {
            return dimensions.every(function(p, i) {
                if(extents[i][0]==0 && extents[i][0]==0) {
                    return true;
                }
                return extents[i][1] <= d[p] && d[p] <= extents[i][0];
            }) ? null : "none";
        });
    }

    function brush_end(){
        if (!d3.event.sourceEvent) return; // Only transition after input.
        if (!d3.event.selection) return; // Ignore empty selections.


        for(var i=0;i<dimensions.length;++i){

            if(d3.event.target==y[dimensions[i]].brush) {
                extents[i]=d3.event.selection.map(y[dimensions[i]].invert,y[dimensions[i]]);
                extents[i][0] = Math.round( extents[i][0] * 10 ) / 10;
                extents[i][1] = Math.round( extents[i][1] * 10 ) / 10;

                d3.select(this).transition().call(d3.event.target.move, extents[i].map(y[dimensions[i]]));
            }
        }
    }

    // brush for ordinal cases
    function brush_parallel() {
        for(var i=0;i<dimensions.length;++i){
            if(d3.event.target==y[dimensions[i]].brush) {
                var yScale = y[dimensions[i]];
                var selected = yScale.domain().filter(function (d) {
                    var s = d3.event.selection;

                    return (s[0] <= yScale(d)) && (yScale(d) <= s[1])
                });
                var temp = selected.sort();
                extents[i] = [temp[temp.length - 1], temp[0]];
            }
        }

        foreground.style("display", function(d) {
            return dimensions.every(function(p, i) {
                if(extents[i][0]==0 && extents[i][0]==0) {
                    return true;
                }

                return extents[i][1] <= d[p] && d[p] <= extents[i][0];
            }) ? null : "none";
        });
    }

    function brush_end_ordinal(){
        if (!d3.event.sourceEvent) return; // Only transition after input.

        if (!d3.event.selection) return; // Ignore empty selections.

        for(var i=0;i<dimensions.length;++i){
            if(d3.event.target==y[dimensions[i]].brush) {
                var  yScale = y[dimensions[i]];
                var selected =  yScale.domain().filter(function(d){
                    var s = d3.event.selection;

                    return (s[0] <= yScale(d)) && (yScale(d) <= s[1])

                });

                var temp = selected.sort();
                extents[i] = [temp[temp.length-1], temp[0]];

                if(selected.length >1)
                    d3.select(this).transition().call(d3.event.target.move, extents[i].map(y[dimensions[i]]));
            }
        }
    }
}

// Streamgraph drawing function
function streamgraph(filepath) {
    // Define a stroke color and a date format
    let strokecolor = colorarray[0];
    let format = d3.timeParse("%m/%d/%y");

    // Create a box where values will be shown
    let valuebox = d3.select(".panel-body")
        .append("div")
        .attr("class", "valuebox")
        .style("position", "absolute")
        .style("z-index", "20")
        .style("visibility", "hidden")
        .style("top", "60px")
        .style("left", "50px");

    // Define x and y axis as well as color range
    let x = d3.scaleTime()
        .range([0, width]);
    let y = d3.scaleLinear()
        .range([height - 10, 0]);
    let z = d3.scaleOrdinal()
        .range(colorarray);

    // Define that x axis is on the bottom
    let xAxis = d3.axisBottom(x);

    // Nest data by date
    let nest = d3.nest()
        .key(function(d) { return d.date; });

    // Define SVG area values
    let area = d3.area()
        .x(function(d) { return x(new Date(d.data.key)); })
        .y0(function(d) { return y(d[0]); })
        .y1(function(d) { return y(d[1]); });

    // Create an array to store unique key values
    let keys = [];

    // Start input CSV processing
    d3.csv(filepath).then(function(data) {
        // For each row in CSV format date, process value and push key value to the array if doesn't yet pushed
        data.forEach(function(d) {
            d.date = format(d.date);
            d.value = +d.value;

            if (keys.indexOf(d.key) === -1) {
                keys.push(d.key);
            }
        });

        // Create a stack layout
        let stack = d3.stack()
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetWiggle)
            .value(function(v, k) { return v.values[k].value })
            .keys(d3.range(0, keys.length));

        // Create streamgraph layers from input data
        let layers = stack(nest.entries(data));

        // Add values to x and y axis
        x.domain(d3.extent(data, function(d) { return d.date; }));
        y.domain([-1.5, 2.5]);

        // Append each layer to graph SVG
        svg.selectAll(".layer")
            .data(layers)
            .enter().append("path")
            .attr("class", "layer")
            .attr("d", function(d) { return area(d); })
            .style("fill", function(d, i) { return z(i); });

        // Append x axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Process layers hover effects
        svg.selectAll(".layer")
            .attr("opacity", 1)
            // On specific layer hover make all others less bright
            .on("mouseover", function(d, i) {
                svg.selectAll(".layer").transition()
                    .duration(250)
                    .attr("opacity", function(d, j) {
                        return j != i ? 0.6 : 1;
                    })
            })
            // On mouse move append values to the value box and show it
            .on("mousemove", function(d, i) {
                mouse = d3.mouse(this);
                mousex = mouse[0];
                let invertedx = x.invert(mousex);
                invertedx = invertedx.getDate();
                let hovervalue = data.filter(o => o.key === keys[i]).find(m => m.date.getDate() === invertedx).value;

                d3.select(this)
                    .classed("hover", true)
                    .attr("stroke", strokecolor)
                    .attr("stroke-width", "0.5px");
                valuebox.html("<p>" + keys[i] + "<br>" + hovervalue + "<br>" + invertedx + "</p>").style("visibility", "visible");
            })
            // On hover end hide value box and make all layers bright again
            .on("mouseout", function(d, i) {
                svg.selectAll(".layer")
                    .transition()
                    .duration(250)
                    .attr("opacity", "1");
                d3.select(this)
                    .classed("hover", false)
                    .attr("stroke-width", "0px");
                valuebox.style("visibility", "hidden");
            });

        // Define a vertical line which helps to keep up with values
        let vertical = d3.select(".panel-body")
            .append("div")
            .attr("class", "valuebox")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("width", "1px")
            .style("top", "10px")
            .style("bottom", "30px")
            .style("left", "0px")
            .style("background", "#fff");

        // Move line on mouse move
        d3.select(".panel-body")
            .on("mousemove", function() {
                mousex = d3.mouse(this);
                mousex = mousex[0] + 5;
                vertical.style("left", mousex + "px")
            })
            .on("mouseover", function() {
                mousex = d3.mouse(this);
                mousex = mousex[0] + 5;
                vertical.style("left", mousex + "px")
            });
    });
}
