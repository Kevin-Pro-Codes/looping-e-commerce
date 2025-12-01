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
     * Toggle product in wishlist (add/remove)
     */
    public function toggle(Request $request)
    {
        try {
            Log::info('=== MONGODB WISHLIST TOGGLE START ===');
            
            $user = Auth::user();
            
            if (!$user) {
                Log::warning('Unauthorized access attempt');
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $request->validate([
                'product_id' => 'required|string'
            ]);

            $productId = $request->product_id;
            Log::info('Processing:', ['user_id' => $user->id, 'product_id' => $productId]);

            // Check if product exists - MongoDB uses _id field
            $product = Product::where('_id', $productId)->first();
            
            if (!$product) {
                Log::warning('Product not found in MongoDB', ['product_id' => $productId]);
                return response()->json(['error' => 'Product not found'], 404);
            }

            // Check if already in wishlist
            $existingWishlist = Wishlist::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->first();

            if ($existingWishlist) {
                // Remove from wishlist
                Log::info('Removing from wishlist');
                $existingWishlist->delete();

                return response()->json([
                    'message' => 'Product removed from wishlist',
                    'action' => 'removed',
                    'product_id' => $productId,
                    'in_wishlist' => false
                ]);
            } else {
                // Add to wishlist
                Log::info('Adding to wishlist');
                
                $wishlistItem = Wishlist::create([
                    'user_id' => (string) $user->id, // Ensure string type for MongoDB
                    'product_id' => $productId
                ]);

                Log::info('Wishlist item created', ['wishlist_id' => $wishlistItem->_id]);

                return response()->json([
                    'message' => 'Product added to wishlist',
                    'action' => 'added',
                    'product_id' => $productId,
                    'in_wishlist' => true,
                    'item' => [
                        'id' => (string) $wishlistItem->_id,
                        'product_id' => $wishlistItem->product_id
                    ]
                ], 201);
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error:', $e->errors());
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('MongoDB Wishlist Error:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            return response()->json([
                'error' => 'Database error occurred',
                'message' => $e->getMessage()
            ], 500);
        } finally {
            Log::info('=== MONGODB WISHLIST TOGGLE END ===');
        }
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

            $wishlistItems = Wishlist::where('user_id', $user->id)
                ->with('product')
                ->get()
                ->map(function ($item) {
                    return [
                        'id' => (string) $item->_id,
                        'product_id' => $item->product_id,
                        'product' => $item->product ? [
                            '_id' => (string) $item->product->_id,
                            'title' => $item->product->title,
                            'price' => $item->product->price,
                            'image' => $item->product->image,
                            'description' => $item->product->description,
                            'category' => $item->product->category,
                        ] : null
                    ];
                });

            return response()->json([
                'wishlist' => $wishlistItems,
                'count' => $wishlistItems->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Wishlist index error:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to fetch wishlist',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}