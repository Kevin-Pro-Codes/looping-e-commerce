<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        Log::info('=== UPLOAD CONTROLLER START ===');
        
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        try {
            $file = $request->file('image');
            
            // Generate unique filename
            $filename = uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();
            
            // Store file - this returns the path relative to storage disk
            $filePath = $file->storeAs('uploads', $filename, 'public');
            
            Log::info('File stored:', ['file_path' => $filePath]);

            // Verify file exists
            if (!Storage::disk('public')->exists($filePath)) {
                throw new \Exception('File was not stored correctly');
            }

            // ✅ CRITICAL FIX: Store the RELATIVE PATH (not full URL) in database
            // This should be: "uploads/filename.png" NOT the full storage path
            $relativePath = $filePath; // This is already "uploads/filename.png"
            
            // Generate the full URL for immediate use
            $imageUrl = asset('storage/' . $relativePath);
            
            Log::info('Path analysis:', [
                'file_path' => $filePath,
                'relative_path' => $relativePath,
                'full_url' => $imageUrl,
                'storage_full_path' => Storage::disk('public')->path($filePath),
                'public_full_path' => public_path('storage/' . $relativePath),
                'public_path_exists' => file_exists(public_path('storage/' . $relativePath))
            ]);

            return response()->json([
                'success' => true,
                'imageUrl' => $imageUrl, // Full URL for immediate frontend use
                'imagePath' => $relativePath, // Relative path for database storage
                'message' => 'File uploaded successfully'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Upload failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'error' => 'Upload failed: ' . $e->getMessage()
            ], 500);
        }
    }
}