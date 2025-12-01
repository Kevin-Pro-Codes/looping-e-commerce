<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        Log::info('Upload request received', [
            'hasFile' => $request->hasFile('image'),
            'files' => $request->allFiles(),
        ]);

        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        if (!$request->hasFile('image')) {
            Log::error('No file in upload request');
            return response()->json([
                'success' => false,
                'error' => 'No file uploaded'
            ], 400);
        }

        $file = $request->file('image');
        
        if (!$file->isValid()) {
            Log::error('Invalid file upload', [
                'error' => $file->getError(),
                'clientName' => $file->getClientOriginalName(),
            ]);
            return response()->json([
                'success' => false,
                'error' => 'File upload failed: ' . $file->getErrorMessage()
            ], 400);
        }

        try {
            Log::info('File validation passed', [
                'original_name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
            ]);

            // Generate unique filename
            $filename = uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();
            
            Log::info('Attempting to store file', [
                'filename' => $filename,
                'storage_path' => 'uploads/' . $filename,
            ]);

            // Store file
            $path = $file->storeAs('uploads', $filename, 'public');
            
            if (!$path) {
                throw new \Exception('Storage::storeAs returned false');
            }

            Log::info('File stored successfully', [
                'path' => $path,
                'full_disk_path' => Storage::disk('public')->path($path),
            ]);

            // Verify file exists
            if (!Storage::disk('public')->exists($path)) {
                throw new \Exception('File verification failed - file does not exist at path: ' . $path);
            }

            // Get file size to verify it was written
            $fileSize = Storage::disk('public')->size($path);
            Log::info('File verification', [
                'exists' => Storage::disk('public')->exists($path),
                'size' => $fileSize,
            ]);

            if ($fileSize === 0) {
                throw new \Exception('File was stored but has 0 bytes');
            }

            // Generate URL - use different methods to see what works
            $fullUrl = Storage::disk('public')->url($path);
            
            Log::info('Generated URLs', [
                'storage_url' => $fullUrl,
                'alternative_url' => url('storage/' . $path),
            ]);

            return response()->json([
                'success' => true,
                'imageUrl' => $fullUrl,
                'path' => $path,
                'message' => 'File uploaded successfully',
                'debug' => [
                    'storage_path' => $path,
                    'file_size' => $fileSize,
                    'url_method' => 'storage_url'
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Upload failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json([
                'success' => false,
                'error' => 'Upload failed: ' . $e->getMessage(),
                'debug' => [
                    'file' => $file->getClientOriginalName(),
                    'size' => $file->getSize(),
                ]
            ], 500);
        }
    }

    /**
     * Test method to check storage configuration
     */
    public function testStorage()
    {
        try {
            $testContent = 'test file content';
            $testPath = 'uploads/test_' . time() . '.txt';
            
            // Test writing
            Storage::disk('public')->put($testPath, $testContent);
            
            // Test reading
            $content = Storage::disk('public')->get($testPath);
            
            // Test existence
            $exists = Storage::disk('public')->exists($testPath);
            
            // Test URL generation
            $url = Storage::disk('public')->url($testPath);
            
            // Clean up
            Storage::disk('public')->delete($testPath);
            
            return response()->json([
                'success' => true,
                'storage_test' => [
                    'write_read_match' => $content === $testContent,
                    'file_exists' => $exists,
                    'generated_url' => $url,
                    'storage_path' => storage_path('app/public'),
                    'public_path' => public_path('storage'),
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Storage test failed: ' . $e->getMessage()
            ], 500);
        }
    }
}