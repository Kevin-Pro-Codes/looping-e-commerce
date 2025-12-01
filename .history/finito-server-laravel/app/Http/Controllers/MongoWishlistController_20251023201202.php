<?php

namespace App\Http\Controllers;

use App\Services\MongoDBService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use MongoDB\BSON\ObjectId;
use Exception;

class MongoWishlistController extends Controller
{
    private $mongoService;

    public function __construct()
    {
        $this->mongoService = new MongoDBService();
    }

    /**
     * Get user's wishlist with product details - Pure MongoDB version
     */
    public function index()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            if (!$this->mongoService->isConnected()) {
                return response()->json(['error' => 'MongoDB not connected'], 500);
            }

            Log::info("Fetching MongoDB wishlist for user: " . $user->id);

            $wishlistCollection = $this->mongoService->getWishlistCollection();
            $productsCollection = $this->mongoService->getProductsCollection();

            // Get wishlist items for this user
            $wishlistItems = $wishlistCollection->find([
                'user_id' => (string) $user->id
            ]);

            $wishlistWithProducts = [];
            
            foreach ($wishlistItems as $item) {
                try {
                    // Convert product_id to ObjectId for querying
                    $productId = $item['product_id'];
                    
                    // Get product details from products collection
                    $product = $productsCollection->findOne([
                        '_id' => new ObjectId($productId)
                    ]);

                    $productData = null;
                    if ($product) {
                        $productData = [
                            'id' => (string) $product['_id'],
                            'title' => $product['title'] ?? 'No title',
                            'price' => $product['price'] ?? 0,
                            'description' => $product['description'] ?? 'No description',
                            'image' => $product['image'] ?? null,
                            'category' => $product['category'] ?? 'Unknown',
                        ];
                    } else {
                        $productData = [
                            'id' => $productId,
                            'title' => 'Product not found',
                            'price' => 0,
                            'description' => 'This product may have been removed',
                            'image' => null,
                            'category' => 'Unknown'
                        ];
                    }

                    $wishlistWithProducts[] = [
                        'id' => (string) $item['_id'],
                        'product_id' => $item['product_id'],
                        'product' => $productData
                    ];

                } catch (Exception $e) {
                    Log::error('Error processing wishlist item:', [
                        'item_id' => $item['_id'] ?? 'unknown',
                        'error' => $e->getMessage()
                    ]);
                    
                    // Add item with error info
                    $wishlistWithProducts[] = [
                        'id' => (string) ($item['_id'] ?? uniqid()),
                        'product_id' => $item['product_id'] ?? 'unknown',
                        'product' => [
                            'id' => $item['product_id'] ?? 'unknown',
                            'title' => 'Error loading product',
                            'price' => 0,
                            'description' => 'Error: ' . $e->getMessage(),
                            'image' => null,
                            'category' => 'Error'
                        ]
                    ];
                }
            }

            Log::info("MongoDB Wishlist fetched successfully", [
                'user_id' => $user->id,
                'count' => count($wishlistWithProducts)
            ]);

            return response()->json([
                'wishlist' => $wishlistWithProducts,
                'count' => count($wishlistWithProducts),
                'source' => 'mongodb'
            ]);

        } catch (Exception $e) {
            Log::error('MongoDB Wishlist index error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Failed to fetch wishlist',
                'message' => $e->getMessage(),
                'source' => 'mongodb-error'
            ], 500);
        }
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

            if (!$this->mongoService->isConnected()) {
                return response()->json(['error' => 'MongoDB not connected'], 500);
            }

            $request->validate([
                'product_id' => 'required|string'
            ]);

            $productId = $request->product_id;
            $userId = (string) $user->id;

            $wishlistCollection = $this->mongoService->getWishlistCollection();
            $productsCollection = $this->mongoService->getProductsCollection();

            // Check if product exists in products collection
            try {
                $product = $productsCollection->findOne([
                    '_id' => new ObjectId($productId)
                ]);
            } catch (Exception $e) {
                return response()->json([
                    'error' => 'Invalid product ID',
                    'product_id' => $productId
                ], 400);
            }
            
            if (!$product) {
                return response()->json([
                    'error' => 'Product not found',
                    'product_id' => $productId
                ], 404);
            }

            // Check if already in wishlist
            $existingItem = $wishlistCollection->findOne([
                'user_id' => $userId,
                'product_id' => $productId
            ]);

            if ($existingItem) {
                // Remove from wishlist
                $wishlistCollection->deleteOne([
                    'user_id' => $userId,
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
                $wishlistItem = [
                    'user_id' => $userId,
                    'product_id' => $productId,
                    'created_at' => now()->toISOString(),
                    'updated_at' => now()->toISOString()
                ];

                $result = $wishlistCollection->insertOne($wishlistItem);
                $wishlistItem['_id'] = (string) $result->getInsertedId();

                return response()->json([
                    'message' => 'Product added to wishlist',
                    'action' => 'added',
                    'product_id' => $productId,
                    'in_wishlist' => true,
                    'item' => $wishlistItem
                ]);
            }

        } catch (Exception $e) {
            Log::error('MongoDB Wishlist toggle error:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to toggle wishlist',
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

            if (!$this->mongoService->isConnected()) {
                return response()->json(['error' => 'MongoDB not connected'], 500);
            }

            $wishlistCollection = $this->mongoService->getWishlistCollection();

            $result = $wishlistCollection->deleteOne([
                'user_id' => (string) $user->id,
                'product_id' => $productId
            ]);

            if ($result->getDeletedCount() === 0) {
                return response()->json(['error' => 'Product not found in wishlist'], 404);
            }

            return response()->json([
                'message' => 'Product removed from wishlist',
                'product_id' => $productId
            ]);

        } catch (Exception $e) {
            Log::error('MongoDB Wishlist destroy error:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to remove product from wishlist',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Debug endpoint to check MongoDB data
     */
    public function debug()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            if (!$this->mongoService->isConnected()) {
                return response()->json(['error' => 'MongoDB not connected'], 500);
            }

            $wishlistCollection = $this->mongoService->getWishlistCollection();
            $productsCollection = $this->mongoService->getProductsCollection();

            $wishlistCount = $wishlistCollection->countDocuments(['user_id' => (string) $user->id]);
            $productsCount = $productsCollection->countDocuments();

            // Get sample products to verify data
            $sampleProducts = $productsCollection->find([], [
                'limit' => 3,
                'projection' => ['title' => 1, 'price' => 1, 'category' => 1]
            ]);

            $sampleProductsArray = [];
            foreach ($sampleProducts as $product) {
                $sampleProductsArray[] = [
                    'id' => (string) $product['_id'],
                    'title' => $product['title'] ?? 'No title',
                    'price' => $product['price'] ?? 0,
                    'category' => $product['category'] ?? 'Unknown'
                ];
            }

            return response()->json([
                'wishlist_count' => $wishlistCount,
                'products_count' => $productsCount,
                'sample_products' => $sampleProductsArray,
                'user_id' => $user->id,
                'mongo_connected' => true,
                'source' => 'mongodb-native'
            ]);

        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'mongo_connected' => false,
                'source' => 'mongodb-native-error'
            ], 500);
        }
    }
}