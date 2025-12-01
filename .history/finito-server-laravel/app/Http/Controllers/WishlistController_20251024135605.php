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

            $wishlistItems = Wishlist::where('user_id', $user->id)
                ->with('product')
                ->get();

            return response()->json([
                'wishlist' => $wishlistItems,
                'count' => $wishlistItems->count(),
            ]);
        } catch (\Exception $e) {
            Log::error('Wishlist index error:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to fetch wishlist'], 500);
        }
    }

    /**
     * Toggle product in wishlist (add/remove)
     */
    public function toggle(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) return response()->json(['error' => 'Unauthorized'], 401);

            $request->validate(['product_id' => 'required|string']);

            $productId = $request->product_id;

            $exists = Wishlist::where('user_id', $user->id)
                ->where('_id', $productId)
                ->exists();

            if ($exists) {
                Wishlist::where('user_id', $user->id)
                    ->where('_id', $productId)
                    ->delete();

                return response()->json([
                    'message' => 'Product removed from wishlist',
                    'action' => 'removed',
                    'product_id' => $productId,
                    'in_wishlist' => false,
                ]);
            } else {
                Wishlist::create([
                    'user_id' => $user->id,
                    '_id' => $productId,
                ]);

                return response()->json([
                    'message' => 'Product added to wishlist',
                    'action' => 'added',
                    'product_id' => $productId,
                    'in_wishlist' => true,
                ]);
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => 'Validation failed', 'messages' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Wishlist toggle error:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to toggle wishlist'], 500);
        }
    }

    /**
     * Check if product is in wishlist
     */
    public function check($productId)
    {
        try {
            $user = Auth::user();
            if (!$user) return response()->json(['error' => 'Unauthorized'], 401);

            $isInWishlist = Wishlist::isProductInWishlist($user->id, $productId);

            return response()->json([
                'product_id' => $productId,
                'in_wishlist' => $isInWishlist,
            ]);
        } catch (\Exception $e) {
            Log::error('Wishlist check error:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to check wishlist status'], 500);
        }
    }

    /**
     * Remove product from wishlist
     */
    public function destroy($productId)
    {
        try {
            $user = Auth::user();
            if (!$user) return response()->json(['error' => 'Unauthorized'], 401);

            Wishlist::where('user_id', $user->id)
                ->where('_id', $productId)
                ->delete();

            return response()->json([
                'message' => 'Product removed from wishlist',
                'product_id' => $productId,
            ]);
        } catch (\Exception $e) {
            Log::error('Wishlist destroy error:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to remove product from wishlist'], 500);
        }
    }

    /**
     * Get wishlist count
     */
    public function count()
    {
        try {
            $user = Auth::user();
            if (!$user) return response()->json(['error' => 'Unauthorized'], 401);

            $count = Wishlist::where('user_id', $user->id)->count();

            return response()->json(['count' => $count]);
        } catch (\Exception $e) {
            Log::error('Wishlist count error:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to get wishlist count'], 500);
        }
    }
}
