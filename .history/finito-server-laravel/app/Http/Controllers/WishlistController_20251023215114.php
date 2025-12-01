<?php

namespace App\Http\Controllers;

use App\Models\MongoWishlist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class WishlistController extends Controller
{
    protected $mongoWishlist;

    public function __construct()
    {
        $this->mongoWishlist = new MongoWishlist();
    }

    /**
     * Get user's wishlist with product details
     */
    public function index()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $wishlistItems = $this->mongoWishlist->getUserWishlist($user->id);

            Log::info("MongoDB Wishlist fetched:", [
                'user_id' => $user->id,
                'count' => count($wishlistItems)
            ]);

            return response()->json([
                'wishlist' => $wishlistItems,
                'count' => count($wishlistItems)
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

            $result = $this->mongoWishlist->toggleWishlist($user->id, $productId);

            if (isset($result['error'])) {
                return response()->json(['error' => $result['error']], 400);
            }

            return response()->json([
                'message' => 'Product ' . $result['action'] . ' from wishlist',
                'action' => $result['action'],
                'product_id' => $result['product_id'],
                'in_wishlist' => $result['in_wishlist']
            ]);

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

            $isInWishlist = $this->mongoWishlist->isProductInWishlist($user->id, $productId);

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

            $result = $this->mongoWishlist->removeFromWishlist($user->id, $productId);

            if (isset($result['error'])) {
                return response()->json(['error' => $result['error']], 404);
            }

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
     * Get wishlist count
     */
    public function count()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $count = $this->mongoWishlist->getWishlistCount($user->id);

            return response()->json([
                'count' => $count
            ]);

        } catch (\Exception $e) {
            Log::error('Wishlist count error:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to get wishlist count',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create indexes (run once manually)
     */
    public function createIndexes()
    {
        try {
            $result = $this->mongoWishlist->createIndexes();
            
            if (isset($result['error'])) {
                return response()->json(['error' => $result['error']], 500);
            }

            return response()->json([
                'message' => 'MongoDB wishlist indexes created successfully!'
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Debug endpoint to check MongoDB connection and data
     */
    public function debug()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $wishlistItems = $this->mongoWishlist->getUserWishlist($user->id);
            $count = $this->mongoWishlist->getWishlistCount($user->id);

            return response()->json([
                'user_id' => $user->id,
                'wishlist_count' => $count,
                'wishlist_items' => $wishlistItems,
                'items_with_products' => count(array_filter($wishlistItems, function($item) {
                    return !is_null($item['product']);
                }))
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Health check - simple endpoint to test if MongoDB is working
     */
    public function health()
    {
        try {
            // Simple test - try to get wishlist count
            $count = $this->mongoWishlist->getWishlistCount(1);
            
            return response()->json([
                'status' => 'healthy',
                'mongodb' => 'connected',
                'test_count' => $count,
                'timestamp' => now()->toISOString()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'unhealthy',
                'mongodb' => 'disconnected',
                'error' => $e->getMessage(),
                'timestamp' => now()->toISOString()
            ], 500);
        }
    }
}