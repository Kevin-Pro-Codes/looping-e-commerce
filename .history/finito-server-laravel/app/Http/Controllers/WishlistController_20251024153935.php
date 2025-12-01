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
            $product = $productsCollection->findOne(['_id' => new \MongoDB\BSON\ObjectId($item['product_id'])]);
            $item['product'] = $product ? [
                'id' => (string)$product['_id'],
                'title' => $product['title'] ?? $product['name'] ?? null,
                'price' => $product['price'] ?? 0,
                'image' => $product['image'] ?? $product['image_url'] ?? null,
                'description' => $product['description'] ?? null,
                'category' => $product['category'] ?? null
            ] : null;
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
     */
    public function toggle(Request $request)
    {
        Log::info('Toggle wishlist request received', [
            'user_id' => Auth::id(),
            'product_id' => $request->product_id
        ]);
    
        try {
            $user = Auth::user();
            if (!$user) {
                Log::warning('Unauthorized wishlist toggle attempt');
                return response()->json(['error' => 'Unauthorized'], 401);
            }
    
            $request->validate(['product_id' => 'required|string']);
            $productId = $request->product_id;
    
            // Check MongoDB connection
            if (!$this->mongo->isConnected()) {
                Log::error('MongoDB not connected');
                return response()->json(['error' => 'Database connection failed'], 500);
            }
    
            $wishlistCollection = $this->mongo->getWishlistCollection();
            
            Log::info('Checking existing wishlist item', [
                'user_id' => (string)$user->id,
                'product_id' => $productId
            ]);
    
            $existing = $wishlistCollection->findOne([
                'user_id' => (string)$user->id,
                'product_id' => $productId,
            ]);
    
            Log::info('Existing item found:', ['exists' => !is_null($existing)]);
    
            if ($existing) {
                // Remove from wishlist
                $result = $wishlistCollection->deleteOne(['_id' => $existing['_id']]);
                Log::info('Item removed from wishlist', ['deleted_count' => $result->getDeletedCount()]);
    
                return response()->json([
                    'message' => 'Product removed from wishlist',
                    'action' => 'removed',
                    'product_id' => $productId,
                    'in_wishlist' => false,
                ]);
            } else {
                // Add to wishlist
                $insertResult = $wishlistCollection->insertOne([
                    'user_id' => (string)$user->id,
                    'product_id' => $productId,
                    'created_at' => new \MongoDB\BSON\UTCDateTime(now()->getTimestamp() * 1000)
                ]);
    
                Log::info('Item added to wishlist', ['inserted_id' => (string)$insertResult->getInsertedId()]);
    
                return response()->json([
                    'message' => 'Product added to wishlist',
                    'action' => 'added',
                    'product_id' => $productId,
                    'in_wishlist' => true,
                ]);
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error in wishlist toggle', ['errors' => $e->errors()]);
            return response()->json(['error' => 'Validation failed', 'messages' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Wishlist toggle error:', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to toggle wishlist: ' . $e->getMessage()], 500);
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
