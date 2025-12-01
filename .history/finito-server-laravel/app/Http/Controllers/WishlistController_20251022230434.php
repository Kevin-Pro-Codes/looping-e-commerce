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
                ->with(['product' => function($query) {
                    // Ensure we only load necessary fields and handle missing products
                    $query->select('id', 'title', 'price', 'description', 'image', 'category');
                }])
                ->get()
                ->map(function ($item) {
                    // If product doesn't exist or is null, create a fallback structure
                    if (!$item->product) {
                        return [
                            'id' => $item->id,
                            'product_id' => $item->product_id,
                            'product' => [
                                'id' => $item->product_id,
                                'name' => 'Produto não encontrado',
                                'price' => 0,
                                'description' => 'Este produto pode ter sido removido',
                                'image' => null,
                                'category' => 'Desconhecida'
                            ]
                        ];
                    }

                    return [
                        'id' => $item->id,
                        'product_id' => $item->product_id,
                        'product' => [
                            'id' => $item->product->id,
                            'name' => $item->product->title ?? 'Sem nome',
                            'price' => $item->product->price ?? 0,
                            'description' => $item->product->description ?? 'Sem descrição',
                            'image' => $item->product->image ?? null,
                            'category' => $item->product->category ?? 'Geral'
                        ]
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