<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
                ->with('product') // Eager load product details
                ->get()
                ->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'product_id' => $item->product_id,
                        'product' => $item->product ? [
                            'id' => $item->product->id,
                            'name' => $item->product->name,
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
            return response()->json([
                'error' => 'Failed to fetch wishlist',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add product to wishlist
     */
    public function store(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $request->validate([
                'product_id' => 'required|string'
            ]);

            // Check if product exists
            $product = Product::find($request->product_id);
            if (!$product) {
                return response()->json(['error' => 'Product not found'], 404);
            }

            // Check if already in wishlist
            if (Wishlist::isProductInWishlist($user->id, $request->product_id)) {
                return response()->json(['error' => 'Product already in wishlist'], 409);
            }

            $wishlistItem = Wishlist::create([
                'user_id' => $user->id,
                'product_id' => $request->product_id
            ]);

            // Load product details for response
            $wishlistItem->load('product');

            return response()->json([
                'message' => 'Product added to wishlist',
                'item' => [
                    'id' => $wishlistItem->id,
                    'product_id' => $wishlistItem->product_id,
                    'product' => $wishlistItem->product ? [
                        'id' => $wishlistItem->product->id,
                        'name' => $wishlistItem->product->name,
                        'price' => $wishlistItem->product->price,
                        'image' => $wishlistItem->product->image,
                    ] : null
                ]
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to add product to wishlist',
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
            return response()->json([
                'error' => 'Failed to remove product from wishlist',
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
            return response()->json([
                'error' => 'Failed to check wishlist status',
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
            \Log::info('Toggle wishlist request received', ['request' => $request->all()]);
            
            $user = Auth::user();
            
            if (!$user) {
                \Log::warning('Unauthorized wishlist toggle attempt');
                return response()->json(['error' => 'Unauthorized'], 401);
            }
    
            \Log::info('User authenticated', ['user_id' => $user->id]);
    
            $request->validate([
                'product_id' => 'required|string'
            ]);
    
            $productId = $request->product_id;
            \Log::info('Checking wishlist status', ['user_id' => $user->id, 'product_id' => $productId]);
    
            $isInWishlist = Wishlist::isProductInWishlist($user->id, $productId);
            \Log::info('Wishlist status', ['in_wishlist' => $isInWishlist]);
    
            if ($isInWishlist) {
                // Remove from wishlist
                $deleted = Wishlist::where('user_id', $user->id)
                    ->where('product_id', $productId)
                    ->delete();
    
                \Log::info('Product removed from wishlist', [
                    'deleted_count' => $deleted,
                    'product_id' => $productId
                ]);
    
                return response()->json([
                    'message' => 'Product removed from wishlist',
                    'action' => 'removed',
                    'product_id' => $productId,
                    'in_wishlist' => false
                ]);
            } else {
                // Add to wishlist
                // Check if product exists
                $product = Product::find($productId);
                if (!$product) {
                    \Log::warning('Product not found', ['product_id' => $productId]);
                    return response()->json(['error' => 'Product not found'], 404);
                }
    
                $wishlistItem = Wishlist::create([
                    'user_id' => $user->id,
                    'product_id' => $productId
                ]);
    
                \Log::info('Product added to wishlist', [
                    'wishlist_id' => $wishlistItem->id,
                    'product_id' => $productId
                ]);
    
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
            \Log::error('Validation failed in wishlist toggle', ['errors' => $e->errors()]);
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error in wishlist toggle', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Failed to toggle wishlist',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}