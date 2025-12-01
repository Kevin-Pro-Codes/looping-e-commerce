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
                ->get()
                ->map(function ($item) {
                    // Get product from MongoDB using _id
                    $product = Product::where('_id', $item->product_id)->first();
                    
                    if ($product) {
                        $productData = [
                            'id' => $product->_id,
                            'title' => $product->title, // Use title consistently
                            'price' => (float) $product->price, // Ensure float
                            'description' => $product->description ?? '',
                            'image' => $this->getImageUrl($product->image),
                            'category' => $product->category ?? 'Geral',
                            // Add other MongoDB fields as needed
                        ];
                    } else {
                        $productData = [
                            'id' => $item->product_id,
                            'title' => 'Produto Não Encontrado',
                            'price' => 0,
                            'description' => 'Informação do produto não disponível',
                            'image' => null,
                            'category' => 'Desconhecida'
                        ];
                    }
    
                    Log::info("Wishlist item processed:", [
                        'product_id' => $item->product_id,
                        'product_title' => $productData['title'],
                        'product_price' => $productData['price']
                    ]);
    
                    return [
                        'id' => $item->id,
                        'product_id' => $item->product_id,
                        'product' => $productData
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
     * Helper method to get full image URL
     */
    private function getImageUrl($imagePath)
    {
        if (!$imagePath) {
            return null;
        }

        // If it's already a full URL, return as is
        if (str_starts_with($imagePath, 'http://') || str_starts_with($imagePath, 'https://')) {
            return $imagePath;
        }

        // If it's a storage path, convert to URL
        if (str_starts_with($imagePath, 'storage/') || str_starts_with($imagePath, 'uploads/')) {
            return asset($imagePath);
        }

        return $imagePath;
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
            
            // Check if product exists in MongoDB
            $product = Product::where('_id', $productId)->first();
            if (!$product) {
                return response()->json(['error' => 'Product not found in database'], 404);
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

    // ... keep other methods the same (destroy, check, etc.)
}