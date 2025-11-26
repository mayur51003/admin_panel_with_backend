<?php

namespace App\Http\Controllers;

use App\Models\Academic;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class AcademicController extends Controller
{
    public function index()
    {
        $academics = Academic::all();
        return response()->json([
            'success' => true,
            'data' => $academics
        ], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'calendar_title' => 'required|string|max:255',
            'year' => 'required|string|max:255',
            'pdf_path' => 'required|file|mimes:pdf|max:5120',
        ]);

        $data = [
            'calendar_title' => $validated['calendar_title'],
            'year' => $validated['year'],
        ];

        if ($request->hasFile('pdf_path')) {
            $data['pdf_path'] = $request->file('pdf_path')->store('academics', 'public');
        }

        $academic = Academic::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Academic calendar created successfully',
            'data' => $academic
        ], 201);
    }

    public function show($id)
    {
        $academic = Academic::findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => $academic
        ], 200);
    }

    public function update(Request $request, $id)
    {
        $academic = Academic::find($id);

        if (!$academic) {
            return response()->json([
                'success' => false,
                'message' => 'Academic calendar not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'calendar_title' => 'sometimes|required|string|max:255',
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
            if ($academic->pdf_path && Storage::disk('public')->exists($academic->pdf_path)) {
                Storage::disk('public')->delete($academic->pdf_path);
            }
            $dataToUpdate['pdf_path'] = $request->file('pdf_path')->store('academics', 'public');
        }

        $academic->update($dataToUpdate);

        $updatedFields = [];
        foreach ($dataToUpdate as $key => $value) {
            $updatedFields[$key] = $academic->$key;
        }

        return response()->json([
            'success' => true,
            'message' => 'Academic calendar updated successfully',
            'data' => $updatedFields
        ], 200);
    }

    public function destroy($id)
    {
        $academic = Academic::findOrFail($id);

        // Delete PDF file if exists
        if ($academic->pdf_path && Storage::disk('public')->exists($academic->pdf_path)) {
            Storage::disk('public')->delete($academic->pdf_path);
        }

        $academic->delete();

        return response()->json([
            'success' => true,
            'message' => 'Academic calendar deleted successfully'
        ], 200);
    }
}
