<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\DepartmentImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DepartmentImageController extends Controller
{
    public function index(Department $department)
    {
        return response()->json([
            'success' => true,
            'images' => $department->images()->ordered()->get()
        ]);
    }

    public function store(Request $request, Department $department)
    {
        $request->validate([
            'images' => 'required|array',
            'images.*' => 'required|image|max:2048',
        ]);

        $sortOrder = $department->images()->max('sort_order') ?? 0;
        $uploadedImages = [];

        foreach ($request->file('images') as $image) {
            $path = $image->store('department-images', 'public');

            $img = $department->images()->create([
                'image_path' => $path,
                'sort_order' => ++$sortOrder,
            ]);

            $uploadedImages[] = $img;
        }

        return response()->json([
            'success' => true,
            'message' => 'Images uploaded successfully',
            'images' => $uploadedImages
        ], 201);
    }

    public function update(Request $request, Department $department, DepartmentImage $image)
    {
        $request->validate([
            'image' => 'required|image|max:2048',
        ]);

        // Delete old image from storage
        if (Storage::disk('public')->exists($image->image_path)) {
            Storage::disk('public')->delete($image->image_path);
        }

        // Store new image
        $path = $request->file('image')->store('department-images', 'public');
        $image->image_path = $path;
        $image->save();

        return response()->json([
            'success' => true,
            'message' => 'Image updated successfully',
            'image' => $image
        ]);
    }

    public function destroy(Department $department, DepartmentImage $image)
    {
        Storage::disk('public')->delete($image->image_path);
        $image->delete();

        return response()->json([
            'success' => true,
            'message' => 'Image deleted successfully'
        ]);
    }

    public function updateOrder(Request $request, Department $department)
    {
        $request->validate([
            'images' => 'required|array',
            'images.*.id' => 'required|exists:department_images,id',
            'images.*.sort_order' => 'required|integer',
        ]);

        foreach ($request->images as $imageData) {
            DepartmentImage::where('id', $imageData['id'])
                ->update(['sort_order' => $imageData['sort_order']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Image order updated successfully'
        ]);
    }
}
