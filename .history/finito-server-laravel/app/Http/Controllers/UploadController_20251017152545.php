<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        // Simple validation
        if (!$request->hasFile('image')) {
            return response()->json(['error' => 'No file uploaded'], 400);
        }

        $file = $request->file('image');
        
        // Basic file validation
        if (!$file->isValid()) {
            return response()->json(['error' => 'File upload failed'], 400);
        }

        try {
            // Store file
            $path = $file->store('uploads', 'public');
            
            return response()->json([
                'success' => true,
                'imageUrl' => asset('storage/' . $path),
                'message' => 'File uploaded successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Upload failed: ' . $e->getMessage()
            ], 500);
        }
    }
}