@extends('layouts.app')

@section('content')
    <div class="container">
        <div class="row">
            <div class="col-md-12">
                <div class="panel panel-default">
                    <div class="panel-body">
                        @if (session('status'))
                            <div class="alert alert-success">
                                {{ session('status') }}
                            </div>
                        @endif

                        @if ($errors->any())
                            <div class="alert alert-danger">
                                <ul>
                                    @foreach ($errors->all() as $error)
                                        <li>{{ $error }}</li>
                                    @endforeach
                                </ul>
                            </div>
                        @endif

                        <form action="/visualization" enctype="multipart/form-data" method="POST">
                            <h3>1. Please, select an example file</h3>
                            <div class="examples">
                                <div class="example">
                                    <input type="radio" name="example-file" id="example1" value="example-treemap">;
                                    <label for="example1">Example 1: fits for all visualizations (except Chord).</label>
                                </div>
                                <div class="example">
                                    <input type="radio" name="example-file" id="example2" value="example-chord">
                                    <label for="example2">Example 2: fits for Chord.</label>
                                </div>
                                <div class="example">
                                    <input type="radio" name="example-file" id="example3" value="example-parallel">
                                    <label for="example3">Example 3: fits for Parallel Coordinates.</label>
                                </div>
                                <div class="example">
                                    <input type="radio" name="example-file" id="example4" value="example-streamgraph">
                                    <label for="example4">Example 4: fits for Streamgraph.</label>
                                </div>
                            </div>

                            @if(count($files) > 0)
                                <h3>or one of the files you have uploaded before</h3>
                                <div class="uploaded-before">
                                    @for($i = 0; $i < count($files); $i++)
                                        <div class="files-before">
                                            <input type="radio" name="before-file" id="file{{ $i }}"
                                                   value="{{ $files[$i]['file_name'] }}">
                                            @if(strpos($files[$i]['file_name'], 'converted'))
                                                <label for="file{{ $i }}" class="converted">{{ $files[$i]['orig_name'] }} converted at {{ $files[$i]['created_at'] }}</label>
                                            @else
                                                <label for="file{{ $i }}">{{ $files[$i]['orig_name'] }} uploaded at {{ $files[$i]['created_at'] }}</label>
                                            @endif
                                        </div>
                                    @endfor
                                </div>
                            @endif

                            @auth
                                <h3>or upload your own in JSON or CSV formats.</h3><p>Note! Before uploading your file, please, read <a href="/structure">here</a> about acceptable structures.</p>
                                <div>
                                    <label for="bda-file">
                                        <input type="file" name="bda-file" id="bda-file">
                                    </label>
                                </div>
                            @endauth

                            <h3>2. Select the diagram type</h3>

                            <div class="viz-selection">
                                <div class="viz-radio">
                                    <input type="radio" name="visualization" id="treemap" value="treemap">
                                    <label for="treemap">
                                        <span class="image-box">
                                            <img src="{{ asset('img/treemap.png') }}">
                                        </span>
                                        <span class="image-text">Treemap</span>
                                    </label>
                                </div>
                                <div class="viz-radio">
                                    <input type="radio" name="visualization" id="circlePacking" value="circlePacking">
                                    <label for="circlePacking">
                                        <span class="image-box">
                                            <img src="{{ asset('img/circle.png') }}">
                                        </span>
                                        <span class="image-text">Circle Packing</span>
                                    </label>
                                </div>
                                <div class="viz-radio">
                                    <input type="radio" name="visualization" id="sunburst" value="sunburst">
                                    <label for="sunburst">
                                        <span class="image-box">
                                            <img src="{{ asset('img/sunburst.png') }}">
                                        </span>
                                        <span class="image-text">Sunburst</span>
                                    </label>
                                </div>
                            </div>
                            <div class="viz-selection">
                                <div class="viz-radio">
                                    <input type="radio" name="visualization" id="chord" value="chord">
                                    <label for="chord">
                                        <span class="image-box">
                                            <img src="{{ asset('img/chord.png') }}">
                                        </span>
                                        <span class="image-text">Chord</span>
                                    </label>
                                </div>
                                <div class="viz-radio">
                                    <input type="radio" name="visualization" id="parallel" value="parallel">
                                    <label for="parallel">
                                        <span class="image-box">
                                            <img src="{{ asset('img/parallel.png') }}">
                                        </span>
                                        <span class="image-text">Parallel Coordinates</span>
                                    </label>
                                </div>
                                <div class="viz-radio">
                                    <input type="radio" name="visualization" id="streamgraph" value="streamgraph">
                                    <label for="streamgraph">
                                        <span class="image-box">
                                            <img src="{{ asset('img/streamgraph.png') }}">
                                        </span>
                                        <span class="image-text">Streamgraph</span>
                                    </label>
                                </div>
                            </div>
                            <div class="button">
                                <button class="btn btn-primary">Visualize!</button>
                            </div>
                            {{ csrf_field() }}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
