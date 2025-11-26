<?php

namespace App\Http\Controllers;

use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProgramController extends Controller
{
    public function index()
    {
        $programs = Program::with('category')->get();
        return response()->json([
            'success' => true,
            'data' => $programs
        ], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'program_title' => 'required|string|max:255|unique:programs,program_title',
        ]);

        $program = Program::create([
            'category_id' => $validated['category_id'],
            'program_title' => $validated['program_title']
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Program created successfully',
            'data' => $program->load('category')
        ], 201);
    }

    public function show($id)
    {
        $program = Program::with('category')->findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => $program
        ], 200);
    }

    public function update(Request $request, $id)
    {
        $program = Program::find($id);

        if (!$program) {
            return response()->json([
                'success' => false,
                'message' => 'Program not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'category_id' => 'sometimes|required|exists:categories,id',
            'program_title' => 'sometimes|required|string|max:255|unique:programs,program_title,' . $id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $dataToUpdate = $request->except('_method', '_token');

        $program->update($dataToUpdate);

        $updatedFields = [];
        foreach ($dataToUpdate as $key => $value) {
            $updatedFields[$key] = $program->$key;
        }

        // Load category relationship if category_id was updated
        if (isset($dataToUpdate['category_id'])) {
            $updatedFields['category'] = $program->category;
        }

        return response()->json([
            'success' => true,
            'message' => 'Program updated successfully',
            'data' => $updatedFields
        ], 200);
    }

    public function destroy($id)
    {
        $program = Program::findOrFail($id);
        $program->delete();

        return response()->json([
            'success' => true,
            'message' => 'Program deleted successfully'
        ], 200);
    }
}
