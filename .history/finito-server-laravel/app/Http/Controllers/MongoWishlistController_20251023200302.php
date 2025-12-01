<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use MongoDB\Client as MongoClient;
use Exception;

class MongoWishlistController extends Controller
{
    private $mongoDB;
    private $wishlistCollection;
    private $productsCollection;

    public function __construct()
    {
        try {
            // MongoDB connection
            $mongoClient = new MongoClient(env('MONGO_DB_URI', 'mongodb://localhost:27017'));
            $this->mongoDB = $mongoClient->selectDatabase(env('MONGO_DB_DATABASE', 'finito'));
            $this->wishlistCollection = $this->mongoDB->selectCollection('wishlist');
            $this->productsCollection = $this->mongoDB->selectCollection('products');
            
            Log::info('MongoDB Wishlist Controller initialized');
        } catch (Exception $e) {
            Log::error('MongoDB connection failed: ' . $e->getMessage());
        }
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

            Log::info("Fetching wishlist for user: " . $user->id);

            // Get wishlist items from MongoDB
            $wishlistItems = $this->wishlistCollection->find([
                'user_id' => (string) $user->id
            ]);

            $wishlistWithProducts = [];
            
            foreach ($wishlistItems as $item) {
                // Get product details from MongoDB products collection
                $product = $this->productsCollection->findOne([
                    '_id' => $item['product_id']
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
                        'id' => $item['product_id'],
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
            }

            Log::info("Wishlist fetched successfully", [
                'user_id' => $user->id,
                'count' => count($wishlistWithProducts)
            ]);

            return response()->json([
                'wishlist' => $wishlistWithProducts,
                'count' => count($wishlistWithProducts)
            ]);

        } catch (Exception $e) {
            Log::error('MongoWishlist index error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Failed to fetch wishlist',
                'message' => $e->getMessage()
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

            $request->validate([
                'product_id' => 'required|string'
            ]);

            $productId = $request->product_id;
            $userId = (string) $user->id;

            // Check if product exists in products collection
            $product = $this->productsCollection->findOne(['_id' => $productId]);
            
            if (!$product) {
                return response()->json([
                    'error' => 'Product not found',
                    'product_id' => $productId
                ], 404);
            }

            // Check if already in wishlist
            $existingItem = $this->wishlistCollection->findOne([
                'user_id' => $userId,
                'product_id' => $productId
            ]);

            if ($existingItem) {
                // Remove from wishlist
                $this->wishlistCollection->deleteOne([
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

                $result = $this->wishlistCollection->insertOne($wishlistItem);
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
            Log::error('MongoWishlist toggle error:', ['error' => $e->getMessage()]);
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

            $result = $this->wishlistCollection->deleteOne([
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
            Log::error('MongoWishlist destroy error:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to remove product from wishlist',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Debug endpoint
     */
    public function debug()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $wishlistCount = $this->wishlistCollection->countDocuments(['user_id' => (string) $user->id]);
            $productsCount = $this->productsCollection->countDocuments();

            return response()->json([
                'wishlist_count' => $wishlistCount,
                'products_count' => $productsCount,
                'user_id' => $user->id,
                'mongo_connected' => !!$this->mongoDB
            ]);

        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}