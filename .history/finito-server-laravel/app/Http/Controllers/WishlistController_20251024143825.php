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
            if (!$user) return response()->json(['error' => 'Unauthorized'], 401);
    
            $request->validate(['product_id' => 'required|string']);
            $productId = $request->product_id;
    
            $wishlist = $this->mongo->getWishlistCollection();
    
            $existing = $wishlist->findOne([
                'user_id' => (string)$user->id,
                'product_id' => $productId, // Make sure this matches what you're storing
            ]);
    
            if ($existing) {
                $wishlist->deleteOne(['_id' => $existing['_id']]);
    
                return response()->json([
                    'message' => 'Product removed from wishlist',
                    'action' => 'removed',
                    'product_id' => $productId,
                    'in_wishlist' => false, // This is what your frontend expects
                ]);
            } else {
                $wishlist->insertOne([
                    'user_id' => (string)$user->id,
                    'product_id' => $productId, // Consistent field name
                    'created_at' => new \MongoDB\BSON\UTCDateTime()
                ]);
    
                return response()->json([
                    'message' => 'Product added to wishlist',
                    'action' => 'added',
                    'product_id' => $productId,
                    'in_wishlist' => true, // This is what your frontend expects
                ]);
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => 'Validation failed', 'messages' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Wishlist toggle error:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to toggle wishlist: ' . $e->getMessage()], 500); // Added detailed error
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
