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
            Log::info('=== WISHLIST TOGGLE START ===');
            Log::info('Request data:', $request->all());
            
            $user = Auth::user();
            Log::info('User:', [$user ? $user->id : 'NO USER']);
            
            if (!$user) {
                Log::warning('Unauthorized access attempt');
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Validate request
            $request->validate([
                'product_id' => 'required|string'
            ]);

            $productId = $request->product_id;
            Log::info('Product ID:', ['product_id' => $productId]);

            // Check if product exists
            $product = Product::find($productId);
            Log::info('Product found:', [$product ? 'YES' : 'NO']);
            
            if (!$product) {
                Log::warning('Product not found:', ['product_id' => $productId]);
                return response()->json(['error' => 'Product not found'], 404);
            }

            // Check if already in wishlist
            $isInWishlist = Wishlist::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->exists();
                
            Log::info('Currently in wishlist:', ['in_wishlist' => $isInWishlist]);

            if ($isInWishlist) {
                // Remove from wishlist
                Log::info('Removing from wishlist');
                $deleted = Wishlist::where('user_id', $user->id)
                    ->where('product_id', $productId)
                    ->delete();
                    
                Log::info('Delete result:', ['deleted_count' => $deleted]);

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
                    'user_id' => $user->id,
                    'product_id' => $productId
                ]);
                
                Log::info('Wishlist item created:', ['id' => $wishlistItem->id]);

                return response()->json([
                    'message' => 'Product added to wishlist',
                    'action' => 'added',
                    'product_id' => $productId,
                    'in_wishlist' => true,
                    'item' => [
                        'id' => $wishlistItem->id,
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
            Log::error('Wishlist toggle error:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Failed to toggle wishlist',
                'message' => $e->getMessage(),
                'debug' => 'Check laravel logs for details'
            ], 500);
        } finally {
            Log::info('=== WISHLIST TOGGLE END ===');
        }
    }
}