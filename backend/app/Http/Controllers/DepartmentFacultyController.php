<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\DepartmentFaculty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DepartmentFacultyController extends Controller
{
    public function index(Department $department)
    {
        return response()->json([
            'success' => true,
            'faculties' => $department->faculties
        ]);
    }

    public function store(Request $request, Department $department)
    {
        $validated = $request->validate([
            'faculty_name' => 'required|string|max:255',
            'faculty_email' => 'required|email|max:255',
            'faculty_dob' => 'required|date',
            'faculty_industrial_exp' => 'nullable|integer|min:0',
            'faculty_teaching_exp' => 'required|integer|min:0',
            'course_taught' => 'required|string',
            'designation' => 'required|string|max:255',
            'faculty_joining_date' => 'required|date',
            'qualification' => 'required|string|max:255',
            'faculty_photo' => 'nullable|image|max:2048',
            'nature_of_association' => 'nullable|string|max:255',
            'achievements' => 'nullable|string',
            'additional_info' => 'nullable|string',
        ]);

        if ($request->hasFile('faculty_photo')) {
            $validated['faculty_photo'] = $request->file('faculty_photo')->store('faculties', 'public');
        }

        $faculty = $department->faculties()->create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Faculty added successfully',
            'faculty' => $faculty
        ], 201);
    }

    public function update(Request $request, Department $department, DepartmentFaculty $faculty)
    {
        $validated = $request->validate([
            'faculty_name' => 'sometimes|required|string|max:255',
            'faculty_email' => 'sometimes|required|email|max:255',
            'faculty_dob' => 'sometimes|required|date',
            'faculty_industrial_exp' => 'sometimes|nullable|integer|min:0',
            'faculty_teaching_exp' => 'sometimes|required|integer|min:0',
            'course_taught' => 'sometimes|required|string',
            'designation' => 'sometimes|required|string|max:255',
            'faculty_joining_date' => 'sometimes|required|date',
            'qualification' => 'sometimes|required|string|max:255',
            'faculty_photo' => 'sometimes|nullable|image|max:2048',
            'nature_of_association' => 'sometimes|nullable|string|max:255',
            'achievements' => 'sometimes|nullable|string',
            'additional_info' => 'sometimes|nullable|string',
        ]);

        $updatedFields = [];

        foreach ($validated as $key => $value) {
            if ($key !== 'faculty_photo' && $faculty->$key !== $value) {
                $faculty->$key = $value;
                $updatedFields[$key] = $value;
            }
        }

        if ($request->hasFile('faculty_photo')) {
            if ($faculty->faculty_photo) {
                Storage::disk('public')->delete($faculty->faculty_photo);
            }
            $photoPath = $request->file('faculty_photo')->store('faculties', 'public');
            $faculty->faculty_photo = $photoPath;
            $updatedFields['faculty_photo'] = $photoPath;
        }

        if (!empty($updatedFields)) {
            $faculty->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Faculty updated successfully',
            'updated_fields' => $updatedFields,
            'faculty' => $faculty
        ]);
    }

    public function destroy(Department $department, DepartmentFaculty $faculty)
    {
        if ($faculty->faculty_photo) {
            Storage::disk('public')->delete($faculty->faculty_photo);
        }

        $faculty->delete();

        return response()->json([
            'success' => true,
            'message' => 'Faculty deleted successfully'
        ]);
    }
}
