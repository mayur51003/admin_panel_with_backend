<?php

namespace App\Http\Controllers;

use App\Models\Committee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class CommitteeController extends Controller
{
    public function index()
    {
        $committees = Committee::with('members')->get();

        return response()->json([
            'success' => true,
            'data' => $committees
        ], 200);
    }

    public function show($id)
    {
        $committee = Committee::with('members')->find($id);

        if (!$committee) {
            return response()->json([
                'success' => false,
                'message' => 'Committee not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $committee,
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'committee_title' => 'required|string|max:255',
            'committee_description' => 'required|string',
            'status' => 'nullable',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $status = true; // default value
        if ($request->has('status')) {
            $statusValue = $request->status;
            $status = $statusValue === '1' || $statusValue === 'true' || $statusValue === 1 || $statusValue === true;
        }

        $committee = Committee::create([
            'committee_title' => $request->committee_title,
            'committee_description' => $request->committee_description,
            'status' => $status,
        ]);

        // Load members relationship for consistency
        $committee->load('members');

        return response()->json([
            'success' => true,
            'message' => 'Committee created successfully',
            'data' => $committee,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $committee = Committee::find($id);

        if (!$committee) {
            return response()->json([
                'success' => false,
                'message' => 'Committee not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'committee_title' => 'sometimes|string|max:255',
            'committee_description' => 'sometimes|string',
            'status' => 'sometimes|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $updateData = [];

        if ($request->has('committee_title')) {
            $updateData['committee_title'] = $request->committee_title;
        }

        if ($request->has('committee_description')) {
            $updateData['committee_description'] = $request->committee_description;
        }

        if ($request->has('status')) {
            $status = $request->status;
            $booleanStatus = $status === '1' || $status === 'true' || $status === 1 || $status === true;
            $updateData['status'] = $booleanStatus;
        }

        if (!empty($updateData)) {
            $committee->update($updateData);
        }

        $committee->load('members');

        return response()->json([
            'success' => true,
            'message' => 'Committee updated successfully',
            'data' => $committee
        ], 200);
    }

    public function destroy($id)
    {
        $committee = Committee::find($id);

        if (!$committee) {
            return response()->json([
                'success' => false,
                'message' => 'Committee not found'
            ], 404);
        }

        foreach ($committee->members as $member) {
            if ($member->photo && Storage::disk('public')->exists($member->photo)) {
                Storage::disk('public')->delete($member->photo);
            }
        }

        $committee->delete();

        return response()->json([
            'success' => true,
            'message' => 'Committee deleted successfully'
        ], 200);
    }
}
