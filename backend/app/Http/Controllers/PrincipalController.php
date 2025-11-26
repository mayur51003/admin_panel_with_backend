<?php

namespace App\Http\Controllers;

use App\Models\Principal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class PrincipalController extends Controller
{

    public function index()
    {
        $principals = Principal::all();

        return response()->json([
            'success' => true,
            'data' => $principals
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'designation' => 'required|string|max:255',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'joining_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:joining_date',
            'quote' => 'nullable|string|max:255',
            'message' => 'required|string',
        ]);

        // If validation fails
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('principal_photos', 'public');
        }

        $principal = Principal::create([
            'name' => $request->name,
            'designation' => $request->designation,
            'photo_path' => $photoPath,
            'joining_date' => $request->joining_date,
            'end_date' => $request->end_date,
            'quote' => $request->quote,
            'message' => $request->message,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Principal added successfully',
            'data' => $principal
        ], 201);
    }

    public function destroy($id)
    {
        $principal = Principal::find($id);

        if (!$principal) {
            return response()->json([
                'success' => false,
                'message' => 'Principal not found'
            ], 404);
        }

        if ($principal->photo_path && Storage::disk('public')->exists($principal->photo_path)) {
            Storage::disk('public')->delete($principal->photo_path);
        }

        $principal->delete();

        return response()->json([
            'success' => true,
            'message' => 'Principal deleted successfully'
        ], 200);
    }

    public function update(Request $request, $id)
    {
        $principal = Principal::find($id);

        if (!$principal) {
            return response()->json([
                'success' => false,
                'message' => 'Principal not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'designation' => 'sometimes|required|string|max:255',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'joining_date' => 'sometimes|required|date',
            'end_date' => 'nullable|date|after_or_equal:joining_date',
            'quote' => 'nullable|string|max:255',
            'message' => 'sometimes|required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $dataToUpdate = $request->except('photo', '_method', '_token');


        if ($request->hasFile('photo')) {

            if ($principal->photo_path && Storage::disk('public')->exists($principal->photo_path)) {
                Storage::disk('public')->delete($principal->photo_path);
            }

            $dataToUpdate['photo_path'] = $request->file('photo')->store('principal_photos', 'public');
        }

        $principal->update($dataToUpdate);

        $updatedFields = [];
        foreach ($dataToUpdate as $key => $value) {
            $updatedFields[$key] = $principal->$key;
        }

        return response()->json([
            'success' => true,
            'message' => 'Principal updated successfully',
            'data' => $updatedFields
        ], 200);
    }
}
