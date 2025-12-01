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
   public function index()
{
    try {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Get wishlist items without eager loading first
        $wishlistItems = Wishlist::where('user_id', $user->id)->get();
        
        // Manually load products for each item
        $wishlistWithProducts = $wishlistItems->map(function ($item) {
            // Get product directly from MongoDB
            $product = Product::where('_id', $item->product_id)->first();
            
            Log::info("Manual product lookup:", [
                'product_id' => $item->product_id,
                'product_found' => !!$product,
                'product_title' => $product ? $product->title : 'NOT FOUND'
            ]);

            $productData = $product ? [
                'id' => $product->_id,
                'title' => $product->title,
                'price' => (float) $product->price,
                'description' => $product->description ?? '',
                'image' => $product->image ?? null,
                'category' => $product->category ?? 'Geral',
            ] : null;

            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product' => $productData
            ];
        });

        return response()->json([
            'wishlist' => $wishlistWithProducts,
            'count' => $wishlistWithProducts->count()
        ]);

    } catch (\Exception $e) {
        Log::error('Wishlist index error:', ['error' => $e->getMessage()]);
        return response()->json(['error' => 'Failed to fetch wishlist'], 500);
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
    
}