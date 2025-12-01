<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use MongoDB\BSON\ObjectId;

class WishlistController extends Controller
{
    /**
     * Get user's wishlist with product details - MONGODB VERSION
     */
    public function index()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }
    
            $wishlistItems = Wishlist::where('user_id', $user->id)
                ->with(['product' => function($query) {
                    // Eager load product data from MongoDB
                }])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($item) {
                    // Debug logging
                    \Log::info("MongoDB Wishlist item:", [
                        'wishlist_id' => $item->_id,
                        'product_id' => $item->product_id,
                        'product_loaded' => !is_null($item->product),
                        'product_data' => $item->product ? [
                            'id' => $item->product->_id,
                            'title' => $item->product->title,
                            'price' => $item->product->price
                        ] : null
                    ]);

                    $productData = null;
                    if ($item->product) {
                        $productData = [
                            'id' => $item->product->_id,
                            'title' => $item->product->title,
                            'price' => $item->product->price,
                            'description' => $item->product->description,
                            'image' => $item->product->image,                           
                            'category' => $item->product->category,
                        ];
                    } else {
                        // If product not found, log for debugging
                        \Log::warning("Product not found for wishlist item", [
                            'wishlist_id' => $item->_id,
                            'product_id' => $item->product_id
                        ]);
                    }
    
                    return [
                        'id' => $item->_id,
                        'product_id' => $item->product_id,
                        'created_at' => $item->created_at,
                        'updated_at' => $item->updated_at,
                        'product' => $productData
                    ];
                });
    
            \Log::info("MongoDB Wishlist response:", [
                'user_id' => $user->id,
                'count' => $wishlistItems->count(),
                'items_with_products' => $wishlistItems->where('product', '!=', null)->count()
            ]);
    
            return response()->json([
                'wishlist' => $wishlistItems,
                'count' => $wishlistItems->count()
            ]);
    
        } catch (\Exception $e) {
            Log::error('MongoDB Wishlist index error:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to fetch wishlist',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle product in wishlist (add/remove) - MONGODB VERSION
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
            
            // Check if product exists in MongoDB
            $product = Product::find($productId);
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
                    'product_id' => $productId,
                    'created_at' => now(),
                    'updated_at' => now()
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
            Log::error('MongoDB Wishlist toggle error:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to toggle wishlist',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if product is in wishlist - MONGODB VERSION
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
            Log::error('MongoDB Wishlist check error:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to check wishlist status',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove product from wishlist - MONGODB VERSION
     */
    public function destroy($productId)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $result = Wishlist::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->delete();

            if ($result === 0) {
                return response()->json(['error' => 'Product not found in wishlist'], 404);
            }

            return response()->json([
                'message' => 'Product removed from wishlist',
                'product_id' => $productId
            ]);

        } catch (\Exception $e) {
            Log::error('MongoDB Wishlist destroy error:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to remove product from wishlist',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Debug endpoint to check MongoDB data
     */
    public function debugMongo()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Get wishlist items from MongoDB
            $wishlistItems = Wishlist::where('user_id', $user->id)->get();
            $productIds = $wishlistItems->pluck('product_id')->toArray();
            
            // Get products from MongoDB
            $products = Product::whereIn('_id', $productIds)->get();
            
            // Check individual product loading
            $individualChecks = [];
            foreach ($productIds as $pid) {
                $product = Product::find($pid);
                $individualChecks[$pid] = $product ? [
                    'found' => true,
                    'title' => $product->title,
                    'price' => $product->price
                ] : ['found' => false];
            }

            return response()->json([
                'wishlist_items_count' => $wishlistItems->count(),
                'product_ids' => $productIds,
                'products_found_count' => $products->count(),
                'individual_checks' => $individualChecks,
                'relationship_test' => $wishlistItems->first()->product ?? 'No first item',
                'mongo_connection' => config('database.connections.mongodb.database')
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}