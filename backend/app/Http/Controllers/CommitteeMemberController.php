<?php

namespace App\Http\Controllers;

use App\Models\CommitteeMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class CommitteeMemberController extends Controller
{
    public function index()
    {
        $committeeMembers = CommitteeMember::with('committee')->get();

        return response()->json([
            'success' => true,
            'data' => $committeeMembers
        ], 200);
    }

    public function show($id)
    {
        $committeeMember = CommitteeMember::with('committee')->find($id);

        if (!$committeeMember) {
            return response()->json([
                'success' => false,
                'message' => 'Committee member not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $committeeMember,
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'committee_id' => 'required|exists:committees,id',
            'member_name' => 'required|string|max:255',
            'designation' => 'required|string|max:255',
            'qualification' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('committee_member_photos', 'public');
        }

        $committeeMember = CommitteeMember::create([
            'committee_id' => $request->committee_id,
            'member_name' => $request->member_name,
            'designation' => $request->designation,
            'qualification' => $request->qualification,
            'email' => $request->email,
            'phone' => $request->phone,
            'photo' => $photoPath,
        ]);

        // Load committee relationship for consistency
        $committeeMember->load('committee');

        return response()->json([
            'success' => true,
            'message' => 'Committee member added successfully',
            'data' => $committeeMember
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $committeeMember = CommitteeMember::find($id);

        if (!$committeeMember) {
            return response()->json([
                'success' => false,
                'message' => 'Committee member not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'committee_id' => 'sometimes|exists:committees,id',
            'member_name' => 'sometimes|string|max:255',
            'designation' => 'sometimes|string|max:255',
            'qualification' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $dataToUpdate = [];

        if ($request->has('committee_id')) {
            $dataToUpdate['committee_id'] = $request->committee_id;
        }

        if ($request->has('member_name')) {
            $dataToUpdate['member_name'] = $request->member_name;
        }

        if ($request->has('designation')) {
            $dataToUpdate['designation'] = $request->designation;
        }

        if ($request->has('qualification')) {
            $dataToUpdate['qualification'] = $request->qualification;
        }

        if ($request->has('email')) {
            $dataToUpdate['email'] = $request->email;
        }

        if ($request->has('phone')) {
            $dataToUpdate['phone'] = $request->phone;
        }

        // Handle photo upload
        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($committeeMember->photo && Storage::disk('public')->exists($committeeMember->photo)) {
                Storage::disk('public')->delete($committeeMember->photo);
            }

            $dataToUpdate['photo'] = $request->file('photo')->store('committee_member_photos', 'public');
        }

        // Only update if there are changes
        if (!empty($dataToUpdate)) {
            $committeeMember->update($dataToUpdate);
        }

        $committeeMember->load('committee');

        return response()->json([
            'success' => true,
            'message' => 'Committee member updated successfully',
            'data' => $committeeMember
        ], 200);
    }

    public function destroy($id)
    {
        $committeeMember = CommitteeMember::find($id);

        if (!$committeeMember) {
            return response()->json([
                'success' => false,
                'message' => 'Committee member not found'
            ], 404);
        }

        // Delete photo if exists
        if ($committeeMember->photo && Storage::disk('public')->exists($committeeMember->photo)) {
            Storage::disk('public')->delete($committeeMember->photo);
        }

        $committeeMember->delete();

        return response()->json([
            'success' => true,
            'message' => 'Committee member deleted successfully'
        ], 200);
    }
}
