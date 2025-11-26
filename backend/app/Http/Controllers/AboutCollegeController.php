<?php

namespace App\Http\Controllers;

use App\Models\AboutCollege;
use App\Models\CollegeImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AboutCollegeController extends Controller
{
    public function getCollege()
    {
        $college = AboutCollege::with('images')->first();
        if (!$college) {
            return response()->json([
                'exist' => false,
                'data' => [
                    'id' => null,
                    'name' => '',
                    'description' => '',
                    'location' => '',
                    'established' => '',
                    'affiliations' => [],
                    'highlights' => [],
                    'images' => [],
                ]
            ]);
        }

        return response()->json([
            'exist' => true,
            'data' => $college
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string|max:255',
            'established' => 'required|string|max:255',
            'affiliations' => 'nullable|array',
            'affiliations.*' => 'string',
            'highlights' => 'nullable|array',
            'highlights.*' => 'string',
            'images.*' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if (AboutCollege::count() > 0) {
            return response()->json(['error' => 'College already exists. Use update API.'], 400);
        }

        $college = AboutCollege::create($validated);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $i => $file) {
                $path = $file->store('college_images', 'public');
                CollegeImage::create([
                    'college_id' => $college->id,
                    'image_path' => $path,
                    'display_order' => $i,
                ]);
            }
        }

        return response()->json([
            'message' => 'College created successfully.',
            'data' => $college->load('images')
        ]);
    }

    public function update(Request $request)
    {
        $college = AboutCollege::with('images')->first();
        if (!$college) {
            return response()->json(['error' => 'No college record found.'], 404);
        }

        // Track old data
        $oldData = $college->only(['name', 'description', 'location', 'established', 'affiliations', 'highlights']);

        // Validate request
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'location' => 'sometimes|string|max:255',
            'established' => 'sometimes|string|max:255',
            'affiliations' => 'nullable|array',
            'affiliations.*' => 'string',
            'highlights' => 'nullable|array',
            'highlights.*' => 'string',
            'images.*' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        // Update college
        $college->update($validated);

        // Track updated fields
        $updatedFields = [];
        foreach ($validated as $key => $value) {
            if ($key !== 'images') {
                if ($oldData[$key] != $college->$key) {
                    $updatedFields[$key] = $college->$key;
                }
            }
        }

        // Handle new images
        if ($request->hasFile('images')) {
            $newImages = [];
            $maxOrder = CollegeImage::where('college_id', $college->id)->max('display_order') ?? -1;

            foreach ($request->file('images') as $i => $file) {
                $path = $file->store('college_images', 'public');
                $imageRecord = CollegeImage::create([
                    'college_id' => $college->id,
                    'image_path' => $path,
                    'display_order' => $maxOrder + $i + 1
                ]);
                $newImages[] = $imageRecord;
            }

            if (!empty($newImages)) {
                $updatedFields['images'] = $newImages;
            }
        }

        return response()->json([
            'message' => 'College updated successfully',
            'updated_fields' => $updatedFields
        ]);
    }



    // Individual image delete
    public function deleteImage($imageId)
    {
        $image = CollegeImage::find($imageId);

        if (!$image) {
            return response()->json(['error' => 'Image not found.'], 404);
        }

        // Delete file from storage
        if (Storage::disk('public')->exists($image->image_path)) {
            Storage::disk('public')->delete($image->image_path);
        }

        $image->delete();

        return response()->json(['message' => 'Image deleted successfully.']);
    }

    // Individual image update/replace
    public function updateImage(Request $request, $imageId)
    {
        $image = CollegeImage::find($imageId);

        if (!$image) {
            return response()->json(['error' => 'Image not found.'], 404);
        }

        $validated = $request->validate([
            'image' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $image->update($validated);

        // Delete old image from storage
        if (Storage::disk('public')->exists($image->image_path)) {
            Storage::disk('public')->delete($image->image_path);
        }

        // Store new image
        $path = $request->file('image')->store('college_images', 'public');
        $image->image_path = $path;
        $image->save();

        return response()->json([
            'message' => 'Image updated successfully.',
            'data' => $image
        ]);
    }
}
