@extends('layouts.app')

@section('content')
    <div class="container">
        <div class="row">
            <div class="col-md-12">
                <div class="panel panel-default" id="panel">
                    <div class="panel-heading">Acceptable file structures</div>

                    <div class="panel-body" id="panel-body">
                        <p>The master thesis purpose is to show the sample of the most popular the Big Data analysis results visualizations. For each of the diagram types the is an acceptable structure according to their purposes.</p>
                        <h4>Treemap, Circle Packing and Sunburst</h4>
                        <p>All three diagram types has one purpose <span style="color: red">WRITE IT HERE</span>. That is why the most appropriate JSON file structure (which is acceptable by this prototype website is:</p>
                        <pre>
{
    "name": "name",
    "children": [{
            "name": "child_name",
            "children": [{
                    "name": "grand_child_name",
                    "children": [
                        { "name": "grand_grand_child_name", "size": number },
                        { "name": "grand_grand_child_name", "size": number },
                        { "name": "grand_grand_child_name", "size": number }
                    ]
                },
                {
                    "name": "grand_child_name",
                    "children": [
                        { "name": "grand_grand_child_name", "size": number },
                        { "name": "grand_grand_child_name", "size": number }
                    ]
                }
            ]
        }
    ]
}
                        </pre>
                        <h4>Chord</h4>
                        <p>Chord diagram purpose is to show relations between <span style="color: red">BLA-BLA HERE</span>. This is the reason why you should provide the JSON file with the following structure:</p>
                        <pre>
[
    { "name": "name", "size": number, "imports": ["another_name", "one_more_name"] },
    { "name": "another_name", "size": number, "imports": ["name"] },
    { "name": "one_more_name", "size": number, "imports": ["name"] },
]
                        </pre>
                        <h4>Parallel Coordinates</h4>
                        <p>On the other hand, parallel coordinates diagram purpose is to show <span style="color: red">BLA-BLA HERE</span>. So you can provide a CSV file with any structure but keep in mind that the first column have to represent a name of the object that will be displayed on the right and all other columns are values for this object.</p>

                        <h5 style="color: lightskyblue;">Note!</h5>
                        <p>The website has a converter function, so, if you can't provide a JSON with the structure:</p>
                        <pre>
{
    "name": "name",
    "children": [{
            "name": "child_name",
            "children": [{
                    "name": "grand_child_name1",
                    "children": [
                        { "name": "grand_grand_child_name1", "size": number },
                        { "name": "grand_grand_child_name2", "size": number },
                        { "name": "grand_grand_child_name3", "size": number }
                    ]
                },
                {
                    "name": "grand_child_name2",
                    "children": [
                        { "name": "grand_grand_child_name1", "size": number },
                        { "name": "grand_grand_child_name2", "size": number }
                    ]
                }
            ]
        }
    ]
}
                        </pre>
                        <p>you can provide a CSV in the following structure:</p>
                        <pre>
id,value
name,
name.child_name,
name.child_name.grand_child_name1,
name.child_name.grand_child_name1.grand_grand_child_name1,number
name.child_name.grand_child_name1.grand_grand_child_name2,number
name.child_name.grand_child_name1.grand_grand_child_name3,number
name.child_name.grand_child_name2,
name.child_name.grand_child_name2.grand_grand_child_name1,number
name.child_name.grand_child_name2.grand_grand_child_name2,number
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
