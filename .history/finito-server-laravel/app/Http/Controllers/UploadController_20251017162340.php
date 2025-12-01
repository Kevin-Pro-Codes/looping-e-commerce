<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        if (!$request->hasFile('image')) {
            return response()->json([
                'success' => false,
                'error' => 'No file uploaded'
            ], 400);
        }

        $file = $request->file('image');
        
        if (!$file->isValid()) {
            return response()->json([
                'success' => false,
                'error' => 'File upload failed'
            ], 400);
        }

        try {
            // Generate unique filename
            $filename = uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();
            
            // Store file
            $path = $file->storeAs('uploads', $filename, 'public');
            
            // Use url() helper instead of asset() for better reliability
            $fullUrl = url('storage/' . $path);
            
            // Alternative: Direct URL construction
            // $fullUrl = 'http://localhost:8000/storage/' . $path;

            \Log::info('File uploaded successfully', [
                'original_name' => $file->getClientOriginalName(),
                'stored_path' => $path,
                'full_url' => $fullUrl,
                'storage_disk_path' => Storage::disk('public')->path($path),
            ]);

            // Verify file exists
            if (!Storage::disk('public')->exists($path)) {
                throw new \Exception('File was not stored correctly');
            }

            return response()->json([
                'success' => true,
                'imageUrl' => $fullUrl,
                'message' => 'File uploaded successfully'
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Upload failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'error' => 'Upload failed: ' . $e->getMessage()
            ], 500);
        }
    }
}