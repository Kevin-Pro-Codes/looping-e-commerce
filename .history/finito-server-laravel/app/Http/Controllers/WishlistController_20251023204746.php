<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class WishlistController extends Controller
{
    /**
     * Get user's wishlist with product details - SIMPLIFIED VERSION
     */
    public function index()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            Log::info("Fetching wishlist for user: " . $user->id);

            // Get wishlist items
            $wishlistItems = Wishlist::where('user_id', $user->id)->get();
            
            // Return basic structure without product data for now
            $formattedItems = $wishlistItems->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product' => [
                        'id' => $item->product_id,
                        'title' => 'Product ' . $item->product_id, // Placeholder
                        'price' => 0, // Placeholder
                        'description' => 'Product details loading...',
                        'image' => null,
                        'category' => 'Unknown'
                    ]
                ];
            });

            Log::info("Wishlist fetched successfully", [
                'user_id' => $user->id,
                'count' => $formattedItems->count()
            ]);

            return response()->json([
                'wishlist' => $formattedItems,
                'count' => $formattedItems->count()
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
     * Toggle product in wishlist
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
            $isInWishlist = Wishlist::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->exists();

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

        } catch (\Exception $e) {
            Log::error('Wishlist toggle error:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to toggle wishlist',
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
     * Debug endpoint
     */
    public function debug()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $wishlistCount = Wishlist::where('user_id', $user->id)->count();
            
            // Test database connection
            $dbConnected = true;
            try {
                DB::connection()->getPdo();
            } catch (\Exception $e) {
                $dbConnected = false;
            }

            return response()->json([
                'wishlist_count' => $wishlistCount,
                'user_id' => $user->id,
                'database_connected' => $dbConnected,
                'message' => 'Wishlist controller is working'
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}