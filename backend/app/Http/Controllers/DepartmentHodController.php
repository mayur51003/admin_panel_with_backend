<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\DepartmentHod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DepartmentHodController extends Controller
{
    public function index()
    {
        $DepartmentHods = DepartmentHod::all();
        return response()->json([
            'success' => true,
            'data' => $DepartmentHods
        ], 200);
    }

    public function store(Request $request, Department $department)
    {
        $validated = $request->validate([
            'hod_name' => 'required|string|max:255',
            'qualification' => 'required|string|max:255',
            'description' => 'required|string',
            'photo' => 'nullable|image|max:2048',
        ]);

        if ($department->hod && $department->hod->photo && $request->hasFile('photo')) {
            Storage::disk('public')->delete($department->hod->photo);
        }

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('hods', 'public');
        }

        $hod = $department->hod()->updateOrCreate(
            ['department_id' => $department->id],
            $validated
        );

        return response()->json([
            'success' => true,
            'message' => 'HOD saved successfully',
            'hod' => $hod
        ]);
    }

    public function update(Request $request, Department $department, DepartmentHod $hod)
    {
        $validated = $request->validate([
            'hod_name' => 'required|string|max:255',
            'qualification' => 'required|string|max:255',
            'description' => 'required|string',
            'photo' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('photo')) {
            if ($hod->photo) {
                Storage::disk('public')->delete($hod->photo);
            }
            $validated['photo'] = $request->file('photo')->store('hods', 'public');
        }

        $hod->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'HOD updated successfully',
            'hod' => $hod
        ]);
    }

    public function destroy(Department $department, DepartmentHod $hod)
    {
        if ($hod->photo) {
            Storage::disk('public')->delete($hod->photo);
        }

        $hod->delete();

        return response()->json([
            'success' => true,
            'message' => 'HOD deleted successfully'
        ]);
    }
}
