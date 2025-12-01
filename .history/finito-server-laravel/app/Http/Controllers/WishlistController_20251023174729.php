<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

/**
 * Get user's wishlist with product details - FIXED VERSION
 */
public function index()
{
    try {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        \Log::info("Fetching wishlist for user: " . $user->id);

        // Get wishlist items with product data using proper MongoDB relationship
        $wishlistItems = Wishlist::where('user_id', $user->id)
            ->get()
            ->map(function ($item) {
                // Manually fetch product data to ensure we get it
                $product = Product::where('_id', $item->product_id)->first();
                
                $productData = null;
                if ($product) {
                    $productData = [
                        'id' => $product->_id,
                        'title' => $product->title,
                        'price' => $product->price,
                        'description' => $product->description,
                        'image' => $product->image,
                        'category' => $product->category,
                    ];
                    
                    // Ensure image has full URL if it's a path
                    if ($productData['image'] && !Str::startsWith($productData['image'], ['http://', 'https://'])) {
                        $productData['image'] = asset('storage/' . $productData['image']);
                    }
                }

                \Log::info("Wishlist item processed:", [
                    'wishlist_id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_found' => !is_null($product),
                    'product_title' => $product ? $product->title : 'NOT FOUND'
                ]);

                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product' => $productData
                ];
            });

        // Filter out items with missing products
        $validWishlistItems = $wishlistItems->filter(function ($item) {
            return !is_null($item['product']);
        })->values();

        \Log::info("Final wishlist response:", [
            'total_items' => $wishlistItems->count(),
            'valid_items' => $validWishlistItems->count(),
            'wishlist' => $validWishlistItems
        ]);

        return response()->json([
            'wishlist' => $validWishlistItems,
            'count' => $validWishlistItems->count()
        ]);

    } catch (\Exception $e) {
        Log::error('Wishlist index error:', ['error' => $e->getMessage()]);
        return response()->json([
            'error' => 'Failed to fetch wishlist',
            'message' => $e->getMessage()
        ], 500);
    }
}