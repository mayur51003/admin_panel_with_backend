<?php

namespace App\Http\Controllers;

use App\Models\Curriculum;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class CurriculumController extends Controller
{
    public function index()
    {
        $curriculums = Curriculum::with(['category', 'program'])->get();
        return response()->json([
            'success' => true,
            'data' => $curriculums
        ], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'program_id' => 'required|exists:programs,id',
            'session' => 'required|string|max:255',
            'year' => 'required|string|max:255',
            'pdf_path' => 'required|file|mimes:pdf|max:5120',
        ]);

        $data = [
            'category_id' => $validated['category_id'],
            'program_id' => $validated['program_id'],
            'session' => $validated['session'],
            'year' => $validated['year'],
        ];

        if ($request->hasFile('pdf_path')) {
            $data['pdf_path'] = $request->file('pdf_path')->store('curriculums', 'public');
        }

        $curriculum = Curriculum::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Curriculum created successfully',
            'data' => $curriculum->load(['category', 'program'])
        ], 201);
    }

    public function show($id)
    {
        $curriculum = Curriculum::with(['category', 'program'])->findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => $curriculum
        ], 200);
    }

    public function update(Request $request, $id)
    {
        $curriculum = Curriculum::find($id);

        if (!$curriculum) {
            return response()->json([
                'success' => false,
                'message' => 'Curriculum not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'category_id' => 'sometimes|required|exists:categories,id',
            'program_id' => 'sometimes|required|exists:programs,id',
            'session' => 'sometimes|required|string|max:255',
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
            if ($curriculum->pdf_path && Storage::disk('public')->exists($curriculum->pdf_path)) {
                Storage::disk('public')->delete($curriculum->pdf_path);
            }
            $dataToUpdate['pdf_path'] = $request->file('pdf_path')->store('curriculums', 'public');
        }

        $curriculum->update($dataToUpdate);

        $updatedFields = [];
        foreach ($dataToUpdate as $key => $value) {
            $updatedFields[$key] = $curriculum->$key;
        }

        // Load relationships if foreign keys were updated
        if (isset($dataToUpdate['category_id'])) {
            $updatedFields['category'] = $curriculum->category;
        }
        if (isset($dataToUpdate['program_id'])) {
            $updatedFields['program'] = $curriculum->program;
        }

        return response()->json([
            'success' => true,
            'message' => 'Curriculum updated successfully',
            'data' => $updatedFields
        ], 200);
    }

    public function destroy($id)
    {
        $curriculum = Curriculum::findOrFail($id);

        // Delete PDF file if exists
        if ($curriculum->pdf_path && Storage::disk('public')->exists($curriculum->pdf_path)) {
            Storage::disk('public')->delete($curriculum->pdf_path);
        }

        $curriculum->delete();

        return response()->json([
            'success' => true,
            'message' => 'Curriculum deleted successfully'
        ], 200);
    }
}
