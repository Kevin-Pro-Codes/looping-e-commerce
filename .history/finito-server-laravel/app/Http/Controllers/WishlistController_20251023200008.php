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
     * Get user's wishlist with product details - FIXED VERSION
     */
    public function index()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }
    
            // Get wishlist items
            $wishlistItems = Wishlist::where('user_id', $user->id)->get();
            
            // Manually fetch product data for each wishlist item
            $wishlistWithProducts = $wishlistItems->map(function ($item) {
                // Use where to find the product since we're dealing with MongoDB _id
                $product = Product::where('_id', $item->product_id)->first();
                
                $productData = $product ? [
                    'id' => $product->id,
                    '_id' => $product->_id,
                    'title' => $product->title,
                    'price' => $product->price,
                    'description' => $product->description,
                    'image' => $product->image,                           
                    'category' => $product->category,
                ] : [
                    'id' => $item->product_id,
                    'title' => 'Product not found',
                    'price' => 0,
                    'description' => 'This product may have been removed',
                    'image' => null,
                    'category' => 'Unknown'
                ];
    
                // Log for debugging
                \Log::info("Wishlist item processed:", [
                    'wishlist_id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_found' => !!$product,
                    'product_title' => $productData['title']
                ]);
    
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product' => $productData
                ];
            });
    
            \Log::info("Final wishlist response:", [
                'count' => $wishlistWithProducts->count(),
                'items' => $wishlistWithProducts->toArray()
            ]);
    
            return response()->json([
                'wishlist' => $wishlistWithProducts,
                'count' => $wishlistWithProducts->count()
            ]);
    
        } catch (\Exception $e) {
            Log::error('Wishlist index error:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to fetch wishlist',
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
            
            // Get products from database using _id
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