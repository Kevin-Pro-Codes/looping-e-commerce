<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        // Validate that the request includes an image file
        $request->validate([
            'image' => 'required|image|mimes:jpg,jpeg,png,gif|max:5120', // 5MB max
        ]);

        // Store the file in storage/app/public/uploads
        $path = $request->file('image')->store('uploads', 'public');

        // Return the public URL to the image
        return response()->json([
            'imageUrl' => asset('storage/' . $path),
            'message' => 'Image uploaded successfully',
        ]);
    }
}
