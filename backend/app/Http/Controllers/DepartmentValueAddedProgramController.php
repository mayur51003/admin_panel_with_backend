<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\DepartmentValueAddedProgram;
use Illuminate\Http\Request;

class DepartmentValueAddedProgramController extends Controller
{
    public function index(Department $department)
    {
        return response()->json([
            'success' => true,
            'programs' => $department->valueAddedPrograms
        ]);
    }

    public function store(Request $request, Department $department)
    {
        $validated = $request->validate([
            'value_added_program_title' => 'required|string|max:255',
            'co_ordinator_name' => 'required|string|max:255',
            'intake_capacity' => 'required|integer|min:1',
            'duration_in_months' => 'required|integer|min:1',
        ]);

        $program = $department->valueAddedPrograms()->create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Value added program added successfully',
            'program' => $program
        ], 201);
    }

    public function update(Request $request, Department $department, DepartmentValueAddedProgram $program)
    {
        $validated = $request->validate([
            'value_added_program_title' => 'sometimes|required|string|max:255',
            'co_ordinator_name' => 'sometimes|required|string|max:255',
            'intake_capacity' => 'sometimes|required|integer|min:1',
            'duration_in_months' => 'sometimes|required|integer|min:1',
        ]);

        $updatedFields = [];

        foreach ($validated as $key => $value) {
            if ($program->$key !== $value) {
                $program->$key = $value;
                $updatedFields[$key] = $value;
            }
        }

        if (!empty($updatedFields)) {
            $program->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Program updated successfully',
            'updated_fields' => $updatedFields,
            'value_added_program' => $program
        ]);
    }

    public function destroy(Department $department, DepartmentValueAddedProgram $program)
    {
        $program->delete();

        return response()->json([
            'success' => true,
            'message' => 'Program deleted successfully'
        ]);
    }
}
