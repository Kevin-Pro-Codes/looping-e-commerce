<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class WishlistController extends Controller
{
    /**
     * Get user's wishlist with product details
     */
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

        Log::info("Fetching wishlist for user:", ['user_id' => $user->id]);

        $wishlistItems = Wishlist::where('user_id', $user->id)
            ->with(['product' => function($query) {
                // Explicitly select the fields we need
                $query->select('_id', 'title', 'price', 'description', 'image', 'category');
            }])
            ->get();

        Log::info("Raw wishlist items with products:", [
            'count' => $wishlistItems->count(),
            'items' => $wishlistItems->toArray()
        ]);

        // Transform the data to ensure proper structure
        $transformedItems = $wishlistItems->map(function ($item) {
            $product = $item->product;
            
            if (!$product) {
                Log::warning("Product not found for wishlist item:", [
                    'wishlist_id' => $item->id,
                    'product_id' => $item->product_id
                ]);
                
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product' => [
                        'id' => $item->product_id,
                        'title' => 'Product Not Found',
                        'price' => 0,
                        'description' => 'This product is no longer available',
                        'image' => null,
                        'category' => 'Unknown'
                    ]
                ];
            }

            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product' => [
                    'id' => $product->_id ?? $product->id,
                    'title' => $product->title ?? 'No Title',
                    'price' => $product->price ?? 0,
                    'description' => $product->description ?? 'No description available',
                    'image' => $product->image ?? null,
                    'category' => $product->category ?? 'Uncategorized'
                ]
            ];
        });

        Log::info("Final transformed wishlist:", [
            'transformed_count' => $transformedItems->count(),
            'transformed_items' => $transformedItems->toArray()
        ]);

        return response()->json([
            'wishlist' => $transformedItems,
            'count' => $transformedItems->count()
        ]);

    } catch (\Exception $e) {
        Log::error('Wishlist index error:', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        return response()->json([
            'error' => 'Failed to fetch wishlist',
            'message' => $e->getMessage()
        ], 500);
    }
}
 
   /**
 * Toggle product in wishlist (add/remove) - No product validation
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
            // Add to wishlist without checking product existence
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
     * Check if product is in wishlist
     */
    public function check($productId)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $isInWishlist = Wishlist::isProductInWishlist($user->id, $productId);

            return response()->json([
                'product_id' => $productId,
                'in_wishlist' => $isInWishlist
            ]);

        } catch (\Exception $e) {
            Log::error('Wishlist check error:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to check wishlist status',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove product from wishlist
     */
    public function destroy($productId)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $wishlistItem = Wishlist::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->first();

            if (!$wishlistItem) {
                return response()->json(['error' => 'Product not found in wishlist'], 404);
            }

            $wishlistItem->delete();

            return response()->json([
                'message' => 'Product removed from wishlist',
                'product_id' => $productId
            ]);

        } catch (\Exception $e) {
            Log::error('Wishlist destroy error:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to remove product from wishlist',
                'message' => $e->getMessage()
            ], 500);
        }
    }


    /**
 * Debug endpoint to check product data
 */
public function debug()
{
    try {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Get raw wishlist items
        $wishlistItems = Wishlist::where('user_id', $user->id)->get();
        
        // Get all product IDs from wishlist
        $productIds = $wishlistItems->pluck('product_id')->toArray();
        
        // Get products from database
        $products = Product::whereIn('_id', $productIds)->get();
        
        return response()->json([
            'wishlist_items' => $wishlistItems,
            'product_ids' => $productIds,
            'products_found' => $products,
            'products_count' => $products->count(),
            'wishlist_count' => $wishlistItems->count()
        ]);

    } catch (\Exception $e) {
        Log::error('Wishlist debug error:', ['error' => $e->getMessage()]);
        return response()->json(['error' => $e->getMessage()], 500);
    }
}
}