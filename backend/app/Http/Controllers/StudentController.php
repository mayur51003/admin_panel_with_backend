<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Models\Mark;
use App\Models\Student;
use App\Models\Subject;
use Illuminate\Http\Request;

class StudentController extends Controller
{

    public function index()
    {
        $students = Student::with(['classroom', 'marks.subject'])->get();

        $formatted = $students->map(function ($student) {
            return [
                'id' => $student->id,
                'name' => $student->name,
                'age' => $student->age,
                'class' => $student->classroom->name ?? 'N/A',
                'marks' => $student->marks->mapWithKeys(function ($mark) {
                    return [$mark->subject->name => $mark->marks];
                })->toArray(),
            ];
        });

        return response()->json([
            'students' => $formatted
        ]);
    }

    public function show($id)
    {
        $student = Student::with(['classroom', 'marks.subject'])->find($id);

        if (!$student) {
            return response()->json([
                'error' => 'Student not found'
            ], 404);
        }

        $formatted = [
            'id' => $student->id,
            'name' => $student->name,
            'age' => $student->age,
            'class' => $student->classroom->name ?? 'N/A',
            'marks' => $student->marks->mapWithKeys(function ($mark) {
                return [$mark->subject->name => $mark->marks];
            })->toArray(),
        ];

        return response()->json([
            'status' => 'success',
            'student' => $formatted
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'age' => 'required|integer|min:1|max:100',
            'classroom_id' => 'required|exists:classrooms,id',
            'roll_no' => 'nullable|string|max:50',
            'email' => 'nullable|email|unique:students,email',
            'marks' => 'required|array',
            'marks.*.subject_id' => 'required|exists:subjects,id',
            'marks.*.marks' => 'required|integer|min:0|max:100',
        ]);

        $student = Student::create([
            'name' => $validated['name'],
            'age' => $validated['age'],
            'classroom_id' => $validated['classroom_id'],
            'roll_no' => $validated['roll_no'] ?? null,
            'email' => $validated['email'] ?? null,
        ]);

        foreach ($validated['marks'] as $mark) {
            Mark::create([
                'student_id' => $student->id,
                'subject_id' => $mark['subject_id'],
                'marks' => $mark['marks'],
            ]);
        }

        $student->load(['classroom', 'marks.subject']);

        return response()->json([
            'message' => 'Student created successfully',
            'student' => $student
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $student = Student::find($id);

        if (!$student) {
            return response()->json([
                'error' => 'Student not found'
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'age' => 'sometimes|required|integer|min:1|max:100',
            'classroom_id' => 'sometimes|required|exists:classrooms,id',
            'roll_no' => 'nullable|string|max:50',
            'email' => 'nullable|email|unique:students,email,' . $id,
            'marks' => 'sometimes|array',
            'marks.*.subject_id' => 'required_with:marks|exists:subjects,id',
            'marks.*.marks' => 'required_with:marks|integer|min:0|max:100',
        ]);

        $student->update([
            'name' => $validated['name'] ?? $student->name,
            'age' => $validated['age'] ?? $student->age,
            'classroom_id' => $validated['classroom_id'] ?? $student->classroom_id,
            'roll_no' => $validated['roll_no'] ?? $student->roll_no,
            'email' => $validated['email'] ?? $student->email,
        ]);

        if (isset($validated['marks'])) {
            $student->marks()->delete();

            foreach ($validated['marks'] as $mark) {
                Mark::create([
                    'student_id' => $student->id,
                    'subject_id' => $mark['subject_id'],
                    'marks' => $mark['marks'],
                ]);
            }
        }

        $student->load(['classroom', 'marks.subject']);

        return response()->json([
            'message' => 'Student updated successfully',
            'student' => $student
        ]);
    }
    public function destroy($id)
    {
        $student = Student::find($id);

        if (!$student) {
            return response()->json([
                'error' => 'Student not found'
            ], 404);
        }

        $student->delete();

        return response()->json([
            'message' => 'Student deleted successfully'
        ]);
    }

    /**
     * Get statistics for dashboard
     */
    public function statistics()
    {
        $totalStudents = Student::count();
        $totalSubjects = Subject::count();

        $avgScore = Mark::avg('marks');
        $topScore = Mark::max('marks');

        $classDistribution = Classroom::withCount('students')->get();

        $subjectAverages = Subject::with('marks')->get()->map(function ($subject) {
            return [
                'subject' => $subject->name,
                'average' => round($subject->marks->avg('marks'), 2)
            ];
        });

        return response()->json([
            'total_students' => $totalStudents,
            'total_subjects' => $totalSubjects,
            'average_score' => round($avgScore, 2),
            'top_score' => $topScore,
            'class_distribution' => $classDistribution,
            'subject_averages' => $subjectAverages
        ]);
    }
}
