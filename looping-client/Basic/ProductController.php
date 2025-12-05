<?php

namespace App\Http\Controllers\Basic;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * List all products
     */
    public function index()
    {
        try {
            $products = Product::orderBy('_id', 'desc')->get();
            
            // Transform image paths to full URLs
            $products->transform(function ($product) {
                if ($product->image && !Str::startsWith($product->image, ['http://', 'https://'])) {
                    $product->image = asset('storage/' . $product->image);
                }
                return $product;
            });
            
            return response()->json($products);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch products',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new product with file upload
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'price' => 'required|numeric',
            'image' => 'required|string', // This should be the relative path from upload
            'category' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:1000',
            'stock' => 'nullable|integer',
            'tags' => 'nullable|array',
            'variants' => 'nullable|array',
            'active' => 'nullable|boolean',
            'discount' => 'nullable|numeric'
        ]);
    
        try {
            // Store the relative path in database
            $product = Product::create($validated);
            
            \Log::info('Product created with image path:', [
                'id' => $product->_id,
                'image_path' => $product->image,
                'image_type' => gettype($product->image)
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

    /**
     * Show a single product by ID
     */
    public function show($id)
    {
        try {
            $product = Product::findOrFail($id);
            
            // Transform image path to full URL
            if ($product->image && !Str::startsWith($product->image, ['http://', 'https://'])) {
                $product->image = asset('storage/' . $product->image);
            }
            
            return response()->json($product);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Product not found',
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update a product
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'price' => 'sometimes|required|numeric',
            'image' => 'sometimes|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'category' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:1000',
        ]);

        try {
            $product = Product::findOrFail($id);

            // Handle new image upload
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($product->image && Storage::disk('public')->exists($product->image)) {
                    Storage::disk('public')->delete($product->image);
                }

                // Store new image
                $image = $request->file('image');
                $filename = Str::random(10) . '_' . time() . '.' . $image->getClientOriginalExtension();
                $imagePath = $image->storeAs('uploads', $filename, 'public');
                $validated['image'] = $imagePath;
            }

            $product->update($validated);
            
            // Return with full image URL
            $product->image = asset('storage/' . $product->image);
            
            return response()->json($product);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update product',
                'message' => $e->getMessage()
            ], 500);
        }
    }

/**
 * Toggle product in wishlist (add/remove)
 */
public function toggle(Request $request)
{
    try {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'product_id' => 'required|string'
        ]);

        $productId = $request->product_id;
        
        // Check if product exists - using where since ID might be string
        $product = Product::where('id', $productId)->first();
        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        $isInWishlist = Wishlist::isProductInWishlist($user->id, $productId);

        if ($isInWishlist) {
            // Remove from wishlist
            Wishlist::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->delete();

            return response()->json([
                'message' => 'Product removed from wishlist',
                'action' => 'removed',
                'product_id' => $productId,
                'in_wishlist' => false
            ]);
        } else {
            // Add to wishlist
            $wishlistItem = Wishlist::create([
                'user_id' => $user->id,
                'product_id' => $productId
            ]);

            return response()->json([
                'message' => 'Product added to wishlist',
                'action' => 'added',
                'product_id' => $productId,
                'in_wishlist' => true,
                'item' => $wishlistItem
            ]);
        }

    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'error' => 'Validation failed',
            'messages' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        Log::error('Wishlist toggle error:', ['error' => $e->getMessage()]);
        return response()->json([
            'error' => 'Failed to toggle wishlist',
            'message' => $e->getMessage()
        ], 500);
    }
}


    /**
     * Delete a product
     */
    public function destroy($id)
    {
        try {
            $product = Product::findOrFail($id);
            
            // Delete associated image file
            if ($product->image && Storage::disk('public')->exists($product->image)) {
                Storage::disk('public')->delete($product->image);
            }
            
            $product->delete();
            
            return response()->json(['message' => 'Product deleted']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete product',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Debug endpoint to check storage configuration
     */
    public function debugStorage()
    {
        return response()->json([
            'storage_path' => storage_path('app/public'),
            'public_storage_path' => public_path('storage'),
            'is_symbolic_link' => is_link(public_path('storage')),
            'link_target' => is_link(public_path('storage')) ? readlink(public_path('storage')) : 'Not a link',
            'uploads_exists' => is_dir(storage_path('app/public/uploads')),
            'files_in_uploads' => Storage::disk('public')->files('uploads'),
        ]);
    }
}