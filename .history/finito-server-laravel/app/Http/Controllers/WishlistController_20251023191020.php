<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class WishlistController extends Controller
{
  // In WishlistController.php - update the index method
public function index()
{
    try {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $wishlistItems = Wishlist::where('user_id', $user->id)
            ->with(['product' => function($query) {
                $query->select('_id', 'title', 'price', 'image', 'description', 'category');
            }])
            ->get()
            ->map(function ($item) {
                \Log::info("Wishlist item raw:", [
                    'item_id' => $item->id,
                    'product_id' => $item->product_id,
                    'has_product' => !is_null($item->product),
                    'product_data' => $item->product
                ]);

                // Handle missing product data gracefully
                if (!$item->product) {
                    return [
                        'id' => $item->id,
                        'product_id' => $item->product_id,
                        'product' => [
                            'id' => $item->product_id,
                            'title' => 'Product Not Available',
                            'price' => 0,
                            'description' => 'This product is no longer available',
                            'image' => null,
                            'category' => 'Unknown'
                        ],
                        'product_missing' => true
                    ];
                }

                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product' => [
                        'id' => $item->product->_id ?? $item->product->id,
                        'title' => $item->product->title,
                        'price' => floatval($item->product->price),
                        'description' => $item->product->description,
                        'image' => $item->product->image,
                        'category' => $item->product->category
                    ]
                ];
            });

        \Log::info("Final wishlist response count:", ['count' => $wishlistItems->count()]);

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