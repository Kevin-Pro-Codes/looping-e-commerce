<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class WishlistController extends Controller
{
    /**
     * Toggle product in wishlist (add/remove)
     */
    public function toggle(Request $request)
    {
        DB::beginTransaction();
        
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $request->validate([
                'product_id' => 'required|string'
            ]);

            $productId = $request->product_id;
            
            // Check if product exists first
            $product = Product::find($productId);
            if (!$product) {
                return response()->json(['error' => 'Product not found'], 404);
            }

            // Check if already in wishlist
            $existingWishlist = Wishlist::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->first();

            if ($existingWishlist) {
                // Remove from wishlist
                $existingWishlist->delete();
                
                DB::commit();

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

                DB::commit();

                return response()->json([
                    'message' => 'Product added to wishlist',
                    'action' => 'added',
                    'product_id' => $productId,
                    'in_wishlist' => true,
                    'item' => [
                        'id' => $wishlistItem->id,
                        'product_id' => $wishlistItem->product_id,
                        'user_id' => $wishlistItem->user_id
                    ]
                ]);
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Wishlist toggle error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id(),
                'product_id' => $request->product_id ?? 'none'
            ]);
            
            return response()->json([
                'error' => 'Failed to toggle wishlist',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // ... keep your other methods the same
}