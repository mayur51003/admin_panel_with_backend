<?php

namespace App\Http\Controllers;

use App\Models\Survey;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class SurveyController extends Controller
{
    public function index()
    {
        $surveys = Survey::all();
        return response()->json([
            'success' => true,
            'data' => $surveys
        ], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'survey_title' => 'required|string|max:255',
            'year' => 'required|string|max:255',
            'pdf_path' => 'required|file|mimes:pdf|max:5120',
        ]);

        $data = [
            'survey_title' => $validated['survey_title'],
            'year' => $validated['year'],
        ];

        if ($request->hasFile('pdf_path')) {
            $data['pdf_path'] = $request->file('pdf_path')->store('surveys', 'public');
        }

        $survey = Survey::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Survey created successfully',
            'data' => $survey
        ], 201);
    }

    public function show($id)
    {
        $survey = Survey::findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => $survey
        ], 200);
    }

    public function update(Request $request, $id)
    {
        $survey = Survey::find($id);

        if (!$survey) {
            return response()->json([
                'success' => false,
                'message' => 'Survey not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'survey_title' => 'sometimes|required|string|max:255',
            'year' => 'sometimes|required|string|max:255',
            'pdf_path' => 'nullable|file|mimes:pdf|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $dataToUpdate = $request->except('pdf_path', '_method', '_token');

        if ($request->hasFile('pdf_path')) {
            if ($survey->pdf_path && Storage::disk('public')->exists($survey->pdf_path)) {
                Storage::disk('public')->delete($survey->pdf_path);
            }
            $dataToUpdate['pdf_path'] = $request->file('pdf_path')->store('surveys', 'public');
        }

        $survey->update($dataToUpdate);

        $updatedFields = [];
        foreach ($dataToUpdate as $key => $value) {
            $updatedFields[$key] = $survey->$key;
        }

        return response()->json([
            'success' => true,
            'message' => 'Survey updated successfully',
            'data' => $updatedFields
        ], 200);
    }

    public function destroy($id)
    {
        $survey = Survey::findOrFail($id);


        if ($survey->pdf_path && Storage::disk('public')->exists($survey->pdf_path)) {
            Storage::disk('public')->delete($survey->pdf_path);
        }

        $survey->delete();

        return response()->json([
            'success' => true,
            'message' => 'Survey deleted successfully'
        ], 200);
    }
}
