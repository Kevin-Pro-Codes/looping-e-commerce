<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Services\MongoDatabaseService;

class WishlistController extends Controller
{
    protected $mongo;

    public function __construct(MongoDatabaseService $mongo)
    {
        $this->mongo = $mongo;
    }

    /**
     * Get user's wishlist with product details
     */
    public function index()
    {
        try {
            $user = Auth::user();
            if (!$user) return response()->json(['error' => 'Unauthorized'], 401);

            $wishlistCollection = $this->mongo->getWishlistCollection();
            $productsCollection = $this->mongo->getProductsCollection();

            $wishlistItems = $wishlistCollection->find(['user_id' => (string)$user->id])->toArray();

            // Fetch product details
            $wishlistWithProducts = array_map(function ($item) use ($productsCollection) {
                $product = $productsCollection->findOne(['_id' => $item['product_id']]);
                $item['product'] = $product ?? null;
                return $item;
            }, $wishlistItems);

            return response()->json([
                'wishlist' => $wishlistWithProducts,
                'count' => count($wishlistWithProducts),
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
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }
    
            \Log::info('Wishlist toggle attempt', [
                'user_id' => $user->id,
                'product_id' => $request->product_id
            ]);
    
            // Just return a success message for testing
            return response()->json([
                'message' => 'Test successful',
                'action' => 'added',
                'product_id' => $request->product_id,
                'in_wishlist' => true,
            ]);
    
        } catch (\Exception $e) {
            \Log::error('Wishlist toggle error:', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
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

            $wishlist = $this->mongo->getWishlistCollection();
            $existing = $wishlist->findOne([
                'user_id' => (string)$user->id,
                'product_id' => $productId,
            ]);

            return response()->json([
                'product_id' => $productId,
                'in_wishlist' => $existing !== null,
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

            $wishlist = $this->mongo->getWishlistCollection();
            $wishlist->deleteOne([
                'user_id' => (string)$user->id,
                'product_id' => $productId,
            ]);

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

            $wishlist = $this->mongo->getWishlistCollection();
            $count = $wishlist->countDocuments(['user_id' => (string)$user->id]);

            return response()->json(['count' => $count]);
        } catch (\Exception $e) {
            Log::error('Wishlist count error:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to get wishlist count'], 500);
        }
    }
}
