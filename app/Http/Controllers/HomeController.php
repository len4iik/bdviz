<?php

namespace App\Http\Controllers;

use Validator;
use Auth;
use Redirect;
use Storage;
use Illuminate\Http\Request;
use App\UserFile;

class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
//    public function __construct()
//    {
//        $this->middleware('auth');
//    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $files = [];

        if (Auth::check()) {
            $files = UserFile::where(['user_id' => Auth::user()->id])->get();
        }

        return view('home', ['files' => $files]);
    }

    /**
     * @param Request $request
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function submitForm(Request $request)
    {
        $rules = [
            'bda-file' => 'mimes:json,csv,txt',
            'visualization' => 'required'
        ];

        $messages = [
            'mimes' => 'The uploaded file must be in JSON or CSV formats.',
            'required' => 'The :attribute field is required.'
        ];

        Validator::make($request->all(), $rules, $messages)->validate();

        $fileName = '';
        $visualizationType = $request->input('visualization');

        switch ($request->input('example-file')) {
            case 'example-treemap':
                $fileName = 'd3_treemap.json';
                break;
            case 'example-chord':
                $fileName = 'd3_chord.json';
                break;
            case 'example-parallel':
                $fileName = 'd3_parallel.csv';
                break;
            case 'example-streamgraph':
                $fileName = 'd3_streamgraph.csv';
                break;
        }

        if ($request->input('before-file')) {
            $fileName = $request->input('before-file');
        }

        if ($request->file('bda-file')) {
            $file = $request->file('bda-file');
            $fileExtension = $file->getClientOriginalExtension();

            if ($fileExtension == 'txt') {
                return Redirect::back()->withErrors(['The uploaded file must be in JSON or CSV formats.']);
            }

            $fileOrigName = $file->getClientOriginalName();
            $userPrefix = Auth::user()->id . '_' . md5(Auth::user()->id . time());
            $fileName = $userPrefix . '_' . $fileOrigName;
            $fileNameNoExtension = $userPrefix . '_' . explode('.', $fileOrigName)[0];

            $file->storePubliclyAs('/', $fileName);
            UserFile::create(['user_id' =>  Auth::user()->id, 'file_name' => $fileName, 'orig_name' => $fileOrigName ]);

            if ($fileExtension == 'json' && $visualizationType == 'parallel') {
                $jsonConvertedToCsv = $this->jsonToCsv($file, $fileNameNoExtension);
                Storage::put($jsonConvertedToCsv, file_get_contents($jsonConvertedToCsv));
                UserFile::create(['user_id' =>  Auth::user()->id, 'file_name' => $jsonConvertedToCsv, 'orig_name' => explode('.', $fileOrigName)[0] . '.csv' ]);
                $fileName = $jsonConvertedToCsv;
            }

            if ($fileExtension == 'csv' && $visualizationType != 'parallel' && $visualizationType != 'streamgraph') {
                $csvConvertedToJson = $this->csvToJson($file, $fileNameNoExtension);
                Storage::put($csvConvertedToJson, file_get_contents($csvConvertedToJson));
                UserFile::create(['user_id' =>  Auth::user()->id, 'file_name' => $csvConvertedToJson, 'orig_name' => explode('.', $fileOrigName)[0] . '.json' ]);
                $fileName = $csvConvertedToJson;
            }
        }

        if ($fileName == '') {
            return Redirect::back()->withErrors(['File selection is required!']);
        }

        return view('visualization', ['name' => $fileName, 'visType' => $visualizationType]);
    }

    /**
     * Converts csv to json format
     *
     * @param $csv
     * @param $fileName
     *
     * @return string
     */
    protected function csvToJson($csv, $fileName)
    {
        $array = $this->csvToArray($csv);
        $convertedArray = array();

        foreach ($array as $entry) {
            $fullPath = explode('.', $entry['name']);
            $value = isset($entry['size']) ? $entry['size'] : array();
            $currentArray = $this->recursiveArray($fullPath, $value);
            $convertedArray = array_merge_recursive($convertedArray, $currentArray);
        }

        $result = array('name' => key($convertedArray));
        $arrayValue = current($convertedArray);
        if (is_array($arrayValue)) {
            $result['children'] = $this->transformArray($arrayValue);
        } else {
            $result['size'] = (int)$arrayValue;
        }

        $fileName .= '_converted.json';

        file_put_contents($fileName, json_encode($result));

        return $fileName;
    }

    /**
     * Converts csv to array
     *
     * @param $csv
     * @return array
     */
    protected function csvToArray($csv)
    {
        $lines = explode("\n", file_get_contents($csv));
        $headers = str_getcsv(array_shift($lines));
        $data = array();
        foreach ($lines as $line) {
            $row = array();
            foreach (str_getcsv($line) as $key => $field) {
                $row[$headers[$key]] = $field;
            }
            $row = array_filter($row);
            $data[] = $row;
        }

        return $data;
    }

    /**
     * Creates associative array
     * Using $array as a path
     * First item of $array is top level key, second is it's child, 3rd is child's child etc.
     *
     * @param $array
     * @param array $value
     * @return array
     */
    protected function recursiveArray($array, $value = array())
    {
        if (empty($array)) {
            return $value;
        }

        $key = array_shift($array);

        return array($key => $this->recursiveArray($array, $value));
    }

    /**
     * Transforms prepared array to a format that will be easily encoded via json_encode
     *
     * @param $array
     * @return array
     */
    protected function transformArray($array)
    {
        $result = array();
        foreach ($array as $key => $value) {
            $newArray = array('name' => $key);
            if (!is_array($value)) {
                $newArray['size'] = (int)$value;
            } else {
                $newArray['children'] = $this->transformArray($value);
            }

            $result[] = $newArray;
        }

        return $result;
    }

    /**
     * Converts json formatted input to csv format
     *
     * @param $json
     * @param $fileName
     *
     * @return string
     */
    protected function jsonToCsv($json, $fileName)
    {
        $array = json_decode(file_get_contents($json), true);
        $result = array();
        $result[] = array('name', 'size');
        $result[] = array($array['name']);
        $result = array_merge($result, $this->prepareForCsv($array['children'], $array['name']));

        $fileName .= '_converted.csv';

        $file = fopen($fileName, 'w+');

        foreach($result as $line) {
            fputcsv($file, $line, ',');
        }

        fclose($file);

        return $fileName;
    }

    /**
     * Given array that was created from json transforms it
     * into array that is ready to be put into csv
     *
     * @param $array
     * @param string $parentKey
     * @return array
     */
    protected function prepareForCsv($array, $parentKey = '')
    {
        $results = array();
        $parentKey = $parentKey ? $parentKey . '.' : '';
        foreach ($array as $entry) {
            $levelKey = $parentKey . $entry['name'];
            $newArray = array($levelKey);
            if(isset($entry['size'])) {
                $newArray[] = $entry['size'];
            }

            $results[] = $newArray;

            if (isset($entry['children'])) {
                $results = array_merge($results, $this->prepareForCsv($entry['children'], $levelKey));
            }
        }

        return $results;
    }
}
