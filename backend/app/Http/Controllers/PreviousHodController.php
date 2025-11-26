<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\PreviousHod;
use Illuminate\Http\Request;

class PreviousHodController extends Controller
{
    public function index(Department $department)
    {
        return response()->json([
            'success' => true,
            'previousHods' => $department->previousHods
        ]);
    }

    public function store(Request $request, Department $department)
    {
        $validated = $request->validate([
            'previous_hod_name' => 'required|string|max:255',
            'previous_hod_tenure' => 'required|string|max:255',
        ]);

        $previousHod = $department->previousHods()->create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Previous HOD added successfully',
            'previousHod' => $previousHod
        ], 201);
    }

    public function update(Request $request, Department $department, PreviousHod $previousHod)
    {
        $validated = $request->validate([
            'previous_hod_name' => 'sometimes|required|string|max:255',
            'previous_hod_tenure' => 'sometimes|required|string|max:255',
        ]);

        $updatedFields = [];

        foreach ($validated as $key => $value) {
            if ($previousHod->$key !== $value) {
                $previousHod->$key = $value;
                $updatedFields[$key] = $value;
            }
        }

        if (!empty($updatedFields)) {
            $previousHod->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Previous HOD updated successfully',
            'updated_fields' => $updatedFields,
            'previous_hod' => $previousHod
        ]);
    }

    public function destroy(Department $department, PreviousHod $previousHod)
    {
        $previousHod->delete();

        return response()->json([
            'success' => true,
            'message' => 'Previous HOD deleted successfully'
        ]);
    }
}
