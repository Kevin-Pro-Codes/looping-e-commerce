<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index()
    {
        try {
            $products = Product::orderBy('_id', 'desc')->get();
            
            // Debug: Log what we're getting from database
            \Log::info('Products raw data:', ['count' => $products->count()]);
            
            $products->transform(function ($product) {
                \Log::info('Processing product:', [
                    'id' => $product->_id,
                    'raw_image' => $product->image
                ]);
                
                // If image is already a full URL, keep it
                if ($product->image && Str::startsWith($product->image, ['http://', 'https://'])) {
                    \Log::info('Image is already full URL');
                    return $product;
                }
                
                // If image is a storage path, convert to URL
                if ($product->image) {
                    // Check if file actually exists
                    $exists = Storage::disk('public')->exists($product->image);
                    \Log::info('Storage check:', [
                        'path' => $product->image,
                        'exists' => $exists
                    ]);
                    
                    if ($exists) {
                        $product->image = asset('storage/' . $product->image);
                        \Log::info('Converted to URL:', ['url' => $product->image]);
                    } else {
                        \Log::warning('Image file not found in storage:', ['path' => $product->image]);
                        $product->image = null; // or set to a default image
                    }
                }
                
                return $product;
            });
            
            \Log::info('Final products data sent to frontend');
            
            return response()->json($products);
        } catch (\Exception $e) {
            \Log::error('Error fetching products:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to fetch products',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Update the store method to ensure proper image handling
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'price' => 'required|numeric',
            'image' => 'required|string', // Now accepting URL from upload
            'category' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:1000',
            'stock' => 'nullable|integer',
            'tags' => 'nullable|array',
            'variants' => 'nullable|array',
            'active' => 'nullable|boolean',
            'discount' => 'nullable|numeric'
        ]);

        try {
            // If image is a full URL from upload, store it directly
            // If it's a file upload, handle it (but your frontend sends URL)
            $product = Product::create($validated);
            
            \Log::info('Product created:', [
                'id' => $product->_id,
                'image' => $product->image
            ]);
            
            return response()->json($product, 201);
        } catch (\Exception $e) {
            \Log::error('Error creating product:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to create product',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Add a dedicated image debug method
    public function debugImage($id)
    {
        try {
            $product = Product::findOrFail($id);
            
            $debugInfo = [
                'product_id' => $product->_id,
                'raw_image_field' => $product->image,
                'is_full_url' => $product->image && Str::startsWith($product->image, ['http://', 'https://']),
            ];
            
            if ($product->image && !Str::startsWith($product->image, ['http://', 'https://'])) {
                $debugInfo['storage_check'] = [
                    'exists' => Storage::disk('public')->exists($product->image),
                    'path' => Storage::disk('public')->path($product->image),
                    'url_attempt' => asset('storage/' . $product->image)
                ];
            }
            
            return response()->json($debugInfo);
            
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}