<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Services\MongoDatabaseService;
use MongoDB\BSON\ObjectId;

class WishlistController extends Controller
{
    protected $mongo;

    public function __construct(MongoDatabaseService $mongo)
    {
        $this->mongo = $mongo;
    }

    /**
     * Get user's wishlist with product details - FIXED VERSION
     */
    public function index()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                Log::warning('Unauthorized wishlist access attempt');
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            Log::info('Fetching wishlist for user:', ['user_id' => $user->id]);

            // Check MongoDB connection
            if (!$this->mongo->isConnected()) {
                Log::error('MongoDB not connected');
                return response()->json(['error' => 'Database connection failed'], 500);
            }

            $wishlistCollection = $this->mongo->getWishlistCollection();
            $productsCollection = $this->mongo->getProductsCollection();

            // Find wishlist items for user
            $wishlistItems = $wishlistCollection->find(['user_id' => (string)$user->id]);
            
            $wishlistWithProducts = [];
            
            foreach ($wishlistItems as $item) {
                try {
                    // Convert BSON document to array
                    $itemArray = json_decode(json_encode($item), true);
                    
                    // Handle product_id - it might be stored as ObjectId or string
                    $productId = $itemArray['product_id'];
                    
                    // If product_id is an array (BSON ObjectId), convert to string
                    if (is_array($productId) && isset($productId['$oid'])) {
                        $productId = $productId['$oid'];
                    }
                    
                    Log::info('Processing wishlist item:', [
                        'item_id' => $itemArray['_id']['$oid'] ?? $itemArray['_id'],
                        'product_id' => $productId
                    ]);

                    // Find product - handle both ObjectId and string formats
                    $product = null;
                    if (!empty($productId)) {
                        try {
                            // Try to find product by ObjectId
                            $product = $productsCollection->findOne(['_id' => new ObjectId($productId)]);
                            
                            if (!$product) {
                                // If not found, try as string
                                $product = $productsCollection->findOne(['_id' => $productId]);
                            }
                        } catch (\Exception $e) {
                            Log::warning('Error finding product:', [
                                'product_id' => $productId,
                                'error' => $e->getMessage()
                            ]);
                        }
                    }

                    // Convert product to array if found
                    $productArray = null;
                    if ($product) {
                        $productArray = json_decode(json_encode($product), true);
                        
                        // Ensure _id is converted to string
                        if (isset($productArray['_id']) && is_array($productArray['_id']) && isset($productArray['_id']['$oid'])) {
                            $productArray['id'] = $productArray['_id']['$oid'];
                        } else {
                            $productArray['id'] = (string)$productArray['_id'];
                        }
                        
                        // Ensure consistent field names
                        $productArray['title'] = $productArray['title'] ?? $productArray['name'] ?? 'Produto sem nome';
                        $productArray['price'] = floatval($productArray['price'] ?? 0);
                        $productArray['image'] = $productArray['image'] ?? $productArray['image_url'] ?? null;
                        $productArray['description'] = $productArray['description'] ?? 'Descrição não disponível';
                        $productArray['category'] = $productArray['category'] ?? 'Geral';
                    }

                    // Build the wishlist item with proper structure
                    $wishlistItem = [
                        'id' => $itemArray['_id']['$oid'] ?? (string)$itemArray['_id'],
                        'product_id' => $productId,
                        'user_id' => $itemArray['user_id'],
                        'created_at' => $itemArray['created_at'] ?? null,
                        'product' => $productArray
                    ];

                    $wishlistWithProducts[] = $wishlistItem;
                    
                    Log::debug('Processed wishlist item:', $wishlistItem);

                } catch (\Exception $itemError) {
                    Log::error('Error processing wishlist item:', [
                        'item' => $item,
                        'error' => $itemError->getMessage()
                    ]);
                    continue; // Skip this item but continue with others
                }
            }

            Log::info('Successfully processed wishlist items:', ['count' => count($wishlistWithProducts)]);

            return response()->json([
                'wishlist' => $wishlistWithProducts,
                'count' => count($wishlistWithProducts),
                'success' => true
            ]);

        } catch (\Exception $e) {
            Log::error('Wishlist index error:', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Failed to fetch wishlist: ' . $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * Debug endpoint to check raw data
     */
    public function debug()
    {
        try {
            $user = Auth::user();
            if (!$user) return response()->json(['error' => 'Unauthorized'], 401);

            $wishlistCollection = $this->mongo->getWishlistCollection();
            $productsCollection = $this->mongo->getProductsCollection();

            // Get raw wishlist items
            $wishlistItems = $wishlistCollection->find(['user_id' => (string)$user->id])->toArray();
            $rawItems = [];
            
            foreach ($wishlistItems as $item) {
                $rawItems[] = json_decode(json_encode($item), true);
            }

            // Get sample products to check structure
            $sampleProducts = $productsCollection->find()->limit(3)->toArray();
            $rawProducts = [];
            
            foreach ($sampleProducts as $product) {
                $rawProducts[] = json_decode(json_encode($product), true);
            }

            return response()->json([
                'wishlist_raw' => $rawItems,
                'sample_products' => $rawProducts,
                'user_id' => $user->id
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

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