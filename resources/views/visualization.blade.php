@extends('layouts.app')

@section('content')
    @php
        $filepath = asset('storage/' . $name);
    @endphp

    <div class="container">
        <div class="row">
            <div class="col-md-12">
                <div class="panel panel-default" id="panel">
                    <div class="panel-heading"><a href="{{ route('home') }}">Back</a></div>

                    <div class="panel-body" id="panel-body">
                        <svg width="900" height="1000"></svg>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('scripts')
    <script>
        let type = '{!! $visType !!}',
            filepath = '{!! $filepath !!}';

        switch (type) {
            case 'treemap':
                treemap(filepath);
                break;
            case 'circlePacking':
                circlePacking(filepath);
                break;
            case 'sunburst':
                sunburst(filepath);
                break;
            case 'chord':
                chord(filepath);
                break;
            case 'parallel':
                parallel(filepath);
                break;
            case 'streamgraph':
                streamgraph(filepath);
                break;
        }
    </script>
@endsection
