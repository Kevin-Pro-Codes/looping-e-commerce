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

        // Debug: Log what we're getting from wishlist
        \Log::info('Raw wishlist items:', array_map(function($item) {
            return [
                'wishlist_id' => (string)$item['_id'],
                'product_id' => $item['product_id'],
                'product_id_type' => gettype($item['product_id'])
            ];
        }, $wishlistItems));

        // Fetch product details - FIXED: Handle both ObjectId and string product_ids
        $wishlistWithProducts = [];
        
        foreach ($wishlistItems as $item) {
            try {
                $productId = $item['product_id'];
                
                // Try to find product - handle both ObjectId and string IDs
                $product = null;
                
                // First try as ObjectId if it looks like one
                if (preg_match('/^[a-f\d]{24}$/i', $productId)) {
                    try {
                        $product = $productsCollection->findOne(['_id' => new \MongoDB\BSON\ObjectId($productId)]);
                    } catch (\Exception $e) {
                        // If ObjectId conversion fails, try as string
                        $product = $productsCollection->findOne(['_id' => $productId]);
                    }
                } else {
                    // Try as string directly
                    $product = $productsCollection->findOne(['_id' => $productId]);
                }
                
                $item['product'] = $product ? [
                    'id' => (string)$product['_id'],
                    'title' => $product['title'] ?? $product['name'] ?? 'Produto sem nome',
                    'price' => $product['price'] ?? $product['value'] ?? 0,
                    'image' => $product['image'] ?? $product['image_url'] ?? $product['images'][0] ?? null,
                    'description' => $product['description'] ?? $product['desc'] ?? 'Descrição não disponível',
                    'category' => $product['category'] ?? $product['type'] ?? 'Geral'
                ] : [
                    'id' => $productId,
                    'title' => 'Produto não encontrado',
                    'price' => 0,
                    'image' => null,
                    'description' => 'Este produto pode ter sido removido',
                    'category' => 'Desconhecida'
                ];
                
                $wishlistWithProducts[] = $item;
                
            } catch (\Exception $e) {
                \Log::error('Error processing wishlist item:', [
                    'product_id' => $item['product_id'],
                    'error' => $e->getMessage()
                ]);
                
                // Add item with error info
                $item['product'] = [
                    'id' => $item['product_id'],
                    'title' => 'Erro ao carregar produto',
                    'price' => 0,
                    'image' => null,
                    'description' => 'Erro: ' . $e->getMessage(),
                    'category' => 'Erro'
                ];
                $wishlistWithProducts[] = $item;
            }
        }

        \Log::info('Processed wishlist items count:', ['count' => count($wishlistWithProducts)]);

        return response()->json([
            'wishlist' => $wishlistWithProducts,
            'count' => count($wishlistWithProducts),
        ]);
    } catch (\Exception $e) {
        \Log::error('Wishlist index error:', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        return response()->json(['error' => 'Failed to fetch wishlist: ' . $e->getMessage()], 500);
    }
}

    /**
     * Toggle product in wishlist (add/remove)
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
