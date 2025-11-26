<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\DepartmentCourse;
use Illuminate\Http\Request;

class DepartmentCourseController extends Controller
{
    public function index(Department $department)
    {
        return response()->json([
            'success' => true,
            'courses' => $department->courses
        ]);
    }

    public function store(Request $request, Department $department)
    {
        $validated = $request->validate([
            'course_title' => 'required|string|max:255',
            'duration_in_month_or_years' => 'required|integer|min:1',
            'intake_capacity' => 'required|integer|min:1',
        ]);

        $course = $department->courses()->create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Course added successfully',
            'course' => $course
        ], 201);
    }

    public function update(Request $request, Department $department, DepartmentCourse $course)
    {
        $validated = $request->validate([
            'course_title' => 'sometimes|required|string|max:255',
            'duration_in_month_or_years' => 'sometimes|required|integer|min:1',
            'intake_capacity' => 'sometimes|required|integer|min:1',
        ]);

        $updatedFields = [];

        foreach ($validated as $key => $value) {
            if ($course->$key !== $value) {
                $course->$key = $value;
                $updatedFields[$key] = $value;
            }
        }

        if (!empty($updatedFields)) {
            $course->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Course updated successfully',
            'updated_fields' => $updatedFields,
            'course' => $course
        ]);
    }

    public function destroy(Department $department, DepartmentCourse $course)
    {
        $course->delete();

        return response()->json([
            'success' => true,
            'message' => 'Course deleted successfully'
        ]);
    }
}
