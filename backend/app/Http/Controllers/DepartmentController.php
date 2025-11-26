<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DepartmentController extends Controller
{

    public function index()
    {
        $departments = Department::with(['hod', 'faculties', 'courses', 'valueAddedPrograms', 'previousHods', 'images'])->get();

        return response()->json([
            'success' => true,
            'departments' => $departments
        ]);
    }

    public function show(Department $department)
    {
        $department->load(['hod', 'previousHods', 'faculties', 'courses', 'valueAddedPrograms', 'images']);

        return response()->json([
            'success' => true,
            'department' => $department
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'department_name' => 'required|string|max:255|unique:departments,department_name',
            'tagline' => 'nullable|string|max:255',
            'about' => 'nullable|string',
            'status' => 'required|in:active,inactive',
            'hod_name' => 'nullable|string|max:255',
            'hod_qualification' => 'nullable|string|max:255',
            'hod_description' => 'nullable|string',
            'hod_photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'dept_images.*' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'previous_hods' => 'nullable|json',
            'faculty' => 'nullable|json',
            'courses' => 'nullable|json',
            'value_added_programs' => 'nullable|json',
        ]);

        $department = Department::create([
            'department_name' => $validated['department_name'],
            'tagline' => $validated['tagline'] ?? null,
            'about' => $validated['about'] ?? null,
            'status' => $validated['status'],
        ]);

        if (!empty($validated['hod_name'])) {
            $hodData = [
                'hod_name' => $validated['hod_name'],
                'qualification' => $validated['hod_qualification'],
                'description' => $validated['hod_description'],
            ];

            if ($request->hasFile('hod_photo')) {
                $hodData['photo'] = $request->file('hod_photo')->store('hods', 'public');
            }

            $department->hod()->create($hodData);
        }

        if ($request->has('previous_hods')) {
            $previousHods = json_decode($request->previous_hods, true);
            if (is_array($previousHods)) {
                foreach ($previousHods as $prevHod) {
                    $department->previousHods()->create([
                        'previous_hod_name' => $prevHod['name'],
                        'previous_hod_tenure' => $prevHod['tenure'],
                    ]);
                }
            }
        }

        if ($request->has('courses')) {
            $courses = json_decode($request->courses, true);
            if (is_array($courses)) {
                foreach ($courses as $course) {
                    $department->courses()->create([
                        'course_title' => $course['title'],
                        'duration_in_month_or_years' => $course['duration'],
                        'intake_capacity' => $course['intake'],
                    ]);
                }
            }
        }

        if ($request->has('faculty')) {
            $faculties = json_decode($request->faculty, true);
            if (is_array($faculties)) {
                foreach ($faculties as $index => $faculty) {
                    $facultyData = [
                        'faculty_name' => $faculty['name'],
                        'faculty_email' => $faculty['email'],
                        'faculty_dob' => $faculty['dob'],
                        'faculty_industrial_exp' => $faculty['industrialExp'] ?? 0,
                        'faculty_teaching_exp' => $faculty['teachingExp'],
                        'course_taught' => $faculty['courseTaught'],
                        'designation' => $faculty['designation'],
                        'faculty_joining_date' => $faculty['joiningDate'],
                        'qualification' => $faculty['qualification'],
                        'nature_of_association' => $faculty['natureOfAssociation'] ?? null,
                        'achievements' => $faculty['achievements'] ?? null,
                        'additional_info' => $faculty['additionalInfo'] ?? null,
                    ];

                    if ($request->hasFile("faculty_photos.{$index}")) {
                        $facultyData['faculty_photo'] = $request->file("faculty_photos.{$index}")->store('faculties', 'public');
                    }

                    $department->faculties()->create($facultyData);
                }
            }
        }

        if ($request->has('value_added_programs')) {
            $programs = json_decode($request->value_added_programs, true);
            if (is_array($programs)) {
                foreach ($programs as $program) {
                    $department->valueAddedPrograms()->create([
                        'value_added_program_title' => $program['title'],
                        'co_ordinator_name' => $program['co_ordinator'],
                        'duration_in_months' => $program['duration'],
                        'intake_capacity' => $program['intake'],
                    ]);
                }
            }
        }

        if ($request->has('dept_images')) {
            $sortOrder = 0;
            foreach ($request->file('dept_images') as $image) {
                $path = $image->store('department-images', 'public');
                $department->images()->create([
                    'image_path' => $path,
                    'sort_order' => $sortOrder++,
                ]);
            }
        }

        $department->load(['hod', 'previousHods', 'faculties', 'courses', 'valueAddedPrograms', 'images']);

        return response()->json([
            'success' => true,
            'message' => 'Department created successfully',
            'department' => $department
        ], 201);
    }

    public function update(Request $request, Department $department)
    {
        $validated = $request->validate([
            'department_name' => 'sometimes|required|string|max:255|unique:departments,department_name,' . $department->id,
            'tagline' => 'sometimes|nullable|string|max:255',
            'about' => 'sometimes|nullable|string',
            'status' => 'sometimes|required|in:active,inactive',
            'hod_name' => 'sometimes|nullable|string|max:255',
            'hod_qualification' => 'sometimes|nullable|string|max:255',
            'hod_description' => 'sometimes|nullable|string',
            'hod_photo' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'dept_images.*' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,webp|max:2048',

            // ADD THESE NEW VALIDATIONS:
            'deleted_image_ids' => 'sometimes|nullable|string', // JSON string of IDs to delete
            'replaced_images.*' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $updatedFields = [];

        // Track department field changes
        if (isset($validated['department_name']) && $department->department_name !== $validated['department_name']) {
            $department->department_name = $validated['department_name'];
            $updatedFields['department_name'] = $validated['department_name'];
        }
        if (isset($validated['tagline']) && $department->tagline !== $validated['tagline']) {
            $department->tagline = $validated['tagline'];
            $updatedFields['tagline'] = $validated['tagline'];
        }
        if (isset($validated['about']) && $department->about !== $validated['about']) {
            $department->about = $validated['about'];
            $updatedFields['about'] = $validated['about'];
        }
        if (isset($validated['status']) && $department->status !== $validated['status']) {
            $department->status = $validated['status'];
            $updatedFields['status'] = $validated['status'];
        }

        if (!empty($updatedFields)) {
            $department->save();
        }

        // Track HOD changes
        $hodUpdated = [];
        if (
            isset($validated['hod_name']) || isset($validated['hod_qualification']) ||
            isset($validated['hod_description']) || $request->hasFile('hod_photo')
        ) {
            $hodData = [];

            if (isset($validated['hod_name'])) {
                $hodData['hod_name'] = $validated['hod_name'];
                $hodUpdated['hod_name'] = $validated['hod_name'];
            }
            if (isset($validated['hod_qualification'])) {
                $hodData['qualification'] = $validated['hod_qualification'];
                $hodUpdated['qualification'] = $validated['hod_qualification'];
            }
            if (isset($validated['hod_description'])) {
                $hodData['description'] = $validated['hod_description'];
                $hodUpdated['description'] = $validated['hod_description'];
            }

            if ($request->hasFile('hod_photo')) {
                if ($department->hod && $department->hod->photo) {
                    Storage::disk('public')->delete($department->hod->photo);
                }
                $hodData['photo'] = $request->file('hod_photo')->store('hods', 'public');
                $hodUpdated['photo'] = $hodData['photo'];
            }

            if (!empty($hodData)) {
                $department->hod()->updateOrCreate(
                    ['department_id' => $department->id],
                    $hodData
                );
            }
        }

        // ==================== NEW CODE: HANDLE DELETED IMAGES ====================
        $deletedImages = [];
        if ($request->has('deleted_image_ids')) {
            $deletedIds = json_decode($request->deleted_image_ids, true);
            if (is_array($deletedIds) && count($deletedIds) > 0) {
                foreach ($deletedIds as $imageId) {
                    $image = $department->images()->find($imageId);
                    if ($image) {
                        // Delete file from storage
                        if (Storage::disk('public')->exists($image->image_path)) {
                            Storage::disk('public')->delete($image->image_path);
                        }
                        // Delete from database
                        $deletedImages[] = $imageId;
                        $image->delete();
                    }
                }
            }
        }

        // ==================== NEW CODE: HANDLE REPLACED IMAGES ====================
        $replacedImages = [];
        if ($request->has('replaced_image_ids') && $request->hasFile('replaced_image_files')) {
            $imageIds = $request->input('replaced_image_ids');
            $files = $request->file('replaced_image_files');

            foreach ($imageIds as $idx => $imageId) {
                if (isset($files[$idx])) {
                    $oldImage = $department->images()->find($imageId);

                    if ($oldImage) {
                        // Delete old file
                        if (Storage::disk('public')->exists($oldImage->image_path)) {
                            Storage::disk('public')->delete($oldImage->image_path);
                        }

                        // Store new file
                        $path = $files[$idx]->store('department-images', 'public');
                        $oldImage->image_path = $path;
                        $oldImage->save();

                        $replacedImages[] = [
                            'id' => $oldImage->id,
                            'new_path' => $path
                        ];
                    }
                }
            }
        }

        // Track NEW department images (additional images)
        $newImages = [];
        if ($request->has('dept_images')) {
            $sortOrder = $department->images()->max('sort_order') ?? 0;
            foreach ($request->file('dept_images') as $image) {
                $path = $image->store('department-images', 'public');
                $img = $department->images()->create([
                    'image_path' => $path,
                    'sort_order' => ++$sortOrder,
                ]);
                $newImages[] = $img;
            }
        }

        // Build response with only updated fields
        $response = [
            'success' => true,
            'message' => 'Department updated successfully',
        ];

        if (!empty($updatedFields)) {
            $response['updated_fields'] = $updatedFields;
        }

        if (!empty($hodUpdated)) {
            $response['hod_updated'] = $hodUpdated;
        }

        if (!empty($deletedImages)) {
            $response['deleted_images'] = $deletedImages;
        }

        if (!empty($replacedImages)) {
            $response['replaced_images'] = $replacedImages;
        }

        if (!empty($newImages)) {
            $response['new_images'] = $newImages;
        }

        return response()->json($response);
    }

    public function destroy(Department $department)
    {
        if ($department->hod && $department->hod->photo) {
            Storage::disk('public')->delete($department->hod->photo);
        }

        foreach ($department->faculties as $faculty) {
            if ($faculty->faculty_photo) {
                Storage::disk('public')->delete($faculty->faculty_photo);
            }
        }

        foreach ($department->images as $image) {
            Storage::disk('public')->delete($image->image_path);
        }

        $department->delete();

        return response()->json([
            'success' => true,
            'message' => 'Department deleted successfully'
        ]);
    }
}
