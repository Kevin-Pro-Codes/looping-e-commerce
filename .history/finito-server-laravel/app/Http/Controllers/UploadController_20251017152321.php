<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        \Log::info('Upload request received', [
            'hasFile' => $request->hasFile('image'),
            'files' => $request->allFiles(),
            'headers' => $request->headers->all()
        ]);

        try {
            // Validate that the request includes an image file
            $request->validate([
                'image' => 'required|image|mimes:jpg,jpeg,png,gif,webp|max:5120', // 5MB max
            ]);

            \Log::info('File validation passed');

            if ($request->hasFile('image')) {
                $file = $request->file('image');
                
                \Log::info('File details', [
                    'originalName' => $file->getClientOriginalName(),
                    'size' => $file->getSize(),
                    'mimeType' => $file->getMimeType(),
                    'extension' => $file->getClientOriginalExtension()
                ]);

                // Generate unique filename
                $filename = 'product_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                
                \Log::info('Attempting to store file: ' . $filename);

                // Store the file in storage/app/public/uploads
                $path = $file->storeAs('uploads', $filename, 'public');
                
                \Log::info('File stored successfully at: ' . $path);

                // Return the public URL to the image
                return response()->json([
                    'success' => true,
                    'imageUrl' => asset('storage/' . $path),
                    'path' => $path,
                    'message' => 'Image uploaded successfully',
                ]);
            }

            \Log::error('No file found in request');
            return response()->json([
                'success' => false,
                'message' => 'No image file provided'
            ], 400);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed', ['errors' => $e->errors()]);
            return response()->json([
                'success' => false,
                'message' => 'Validation failed: ' . implode(', ', array_flatten($e->errors()))
            ], 422);
            
        } catch (\Exception $e) {
            \Log::error('Upload failed: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Upload failed: ' . $e->getMessage()
            ], 500);
        }
    }
}