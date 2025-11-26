<?php

namespace App\Http\Controllers;

use App\Models\MissionVision;
use Illuminate\Http\Request;

class MissionVisionController extends Controller
{
    public function get()
    {
        $data = MissionVision::first();

        return response()->json([
            'exists' => $data ? true : false,
            'data' => $data
        ]);
    }

    public function storeOrUpdate(Request $request)
    {
        $data = MissionVision::first();

        // CREATE
        if (!$data) {
            $request->validate([
                'mission' => 'required|string',
                'vision'  => 'required|string',
            ]);

            $data = MissionVision::create([
                'mission' => $request->mission,
                'vision'  => $request->vision,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Mission & Vision created successfully',
                'updated_data' => [
                    'mission' => $data->mission,
                    'vision'  => $data->vision
                ]
            ]);
        }


        $request->validate([
            'mission' => 'nullable|string',
            'vision'  => 'nullable|string',
        ]);

        $updatedFields = [];

        if ($request->has('mission')) {
            $data->mission = $request->mission;
            $updatedFields['mission'] = $request->mission;
        }

        if ($request->has('vision')) {
            $data->vision = $request->vision;
            $updatedFields['vision'] = $request->vision;
        }

        $data->save();

        return response()->json([
            'success' => true,
            'message' => 'Mission & Vision updated successfully',
            'updated_data' => $updatedFields
        ]);
    }
}
