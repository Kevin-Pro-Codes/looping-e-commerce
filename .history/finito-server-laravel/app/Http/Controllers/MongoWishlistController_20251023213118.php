<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;
use MongoDB\Client;
use MongoDB\BSON\ObjectId;

class MongoWishlistController
{
    protected $collection;

    public function __construct()
    {
        $client = new Client(env('MONGODB_URI', 'mongodb://localhost:27017'));
        $database = env('MONGODB_DATABASE', 'finito');
        $this->collection = $client->$database->wishlists;
    }

    /**
     * Get user's wishlist with product details
     */
    public function getUserWishlist($userId)
    {
        try {
            // Get wishlist items for user
            $wishlistItems = $this->collection->find([
                'user_id' => (int)$userId
            ])->toArray();

            // Get product IDs from wishlist
            $productIds = array_map(function($item) {
                return $item['product_id'];
            }, $wishlistItems);

            // Get products from MongoDB
            $products = $this->getProductsByIds($productIds);

            // Combine wishlist items with product data
            $result = [];
            foreach ($wishlistItems as $item) {
                $product = $products[$item['product_id']] ?? null;
                
                $result[] = [
                    'id' => (string)$item['_id'],
                    'product_id' => $item['product_id'],
                    'user_id' => $item['user_id'],
                    'created_at' => $item['created_at'] ?? null,
                    'updated_at' => $item['updated_at'] ?? null,
                    'product' => $product ? [
                        'id' => $product['_id'],
                        'title' => $product['title'],
                        'price' => $product['price'],
                        'description' => $product['description'] ?? '',
                        'image' => $product['image'] ?? '',
                        'category' => $product['category'] ?? '',
                    ] : null
                ];
            }

            return $result;

        } catch (\Exception $e) {
            \Log::error('MongoWishlist getUserWishlist error:', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Get products by IDs from MongoDB
     */
    private function getProductsByIds($productIds)
    {
        try {
            $client = new Client(env('MONGODB_URI', 'mongodb://localhost:27017'));
            $database = env('MONGODB_DATABASE', 'finito');
            $productsCollection = $client->$database->products;

            $products = $productsCollection->find([
                '_id' => ['$in' => $productIds]
            ])->toArray();

            $result = [];
            foreach ($products as $product) {
                $result[(string)$product['_id']] = $product;
            }

            return $result;

        } catch (\Exception $e) {
            \Log::error('MongoWishlist getProductsByIds error:', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Check if product is in user's wishlist
     */
    public function isProductInWishlist($userId, $productId)
    {
        try {
            $count = $this->collection->countDocuments([
                'user_id' => (int)$userId,
                'product_id' => $productId
            ]);

            return $count > 0;

        } catch (\Exception $e) {
            \Log::error('MongoWishlist isProductInWishlist error:', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Add product to wishlist
     */
    public function addToWishlist($userId, $productId)
    {
        try {
            // Check if product exists
            $product = $this->getProduct($productId);
            if (!$product) {
                return ['error' => 'Product not found'];
            }

            // Check if already in wishlist
            if ($this->isProductInWishlist($userId, $productId)) {
                return ['error' => 'Product already in wishlist'];
            }

            $result = $this->collection->insertOne([
                'user_id' => (int)$userId,
                'product_id' => $productId,
                'created_at' => now()->toISOString(),
                'updated_at' => now()->toISOString()
            ]);

            return [
                'success' => true,
                'inserted_id' => (string)$result->getInsertedId()
            ];

        } catch (\Exception $e) {
            \Log::error('MongoWishlist addToWishlist error:', ['error' => $e->getMessage()]);
            return ['error' => 'Failed to add to wishlist'];
        }
    }

    /**
     * Remove product from wishlist
     */
    public function removeFromWishlist($userId, $productId)
    {
        try {
            $result = $this->collection->deleteOne([
                'user_id' => (int)$userId,
                'product_id' => $productId
            ]);

            if ($result->getDeletedCount() === 0) {
                return ['error' => 'Product not found in wishlist'];
            }

            return ['success' => true, 'deleted_count' => $result->getDeletedCount()];

        } catch (\Exception $e) {
            \Log::error('MongoWishlist removeFromWishlist error:', ['error' => $e->getMessage()]);
            return ['error' => 'Failed to remove from wishlist'];
        }
    }

    /**
     * Toggle product in wishlist
     */
    public function toggleWishlist($userId, $productId)
    {
        try {
            // Check if product exists
            $product = $this->getProduct($productId);
            if (!$product) {
                return ['error' => 'Product not found'];
            }

            if ($this->isProductInWishlist($userId, $productId)) {
                // Remove from wishlist
                $result = $this->removeFromWishlist($userId, $productId);
                if (isset($result['success'])) {
                    return [
                        'action' => 'removed',
                        'product_id' => $productId,
                        'in_wishlist' => false
                    ];
                }
                return $result;
            } else {
                // Add to wishlist
                $result = $this->addToWishlist($userId, $productId);
                if (isset($result['success'])) {
                    return [
                        'action' => 'added',
                        'product_id' => $productId,
                        'in_wishlist' => true
                    ];
                }
                return $result;
            }

        } catch (\Exception $e) {
            \Log::error('MongoWishlist toggleWishlist error:', ['error' => $e->getMessage()]);
            return ['error' => 'Failed to toggle wishlist'];
        }
    }

    /**
     * Get single product from MongoDB
     */
    private function getProduct($productId)
    {
        try {
            $client = new Client(env('MONGODB_URI', 'mongodb://localhost:27017'));
            $database = env('MONGODB_DATABASE', 'finito');
            $productsCollection = $client->$database->products;

            $product = $productsCollection->findOne(['_id' => $productId]);

            return $product ? (array)$product : null;

        } catch (\Exception $e) {
            \Log::error('MongoWishlist getProduct error:', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Get wishlist count for user
     */
    public function getWishlistCount($userId)
    {
        try {
            return $this->collection->countDocuments([
                'user_id' => (int)$userId
            ]);

        } catch (\Exception $e) {
            \Log::error('MongoWishlist getWishlistCount error:', ['error' => $e->getMessage()]);
            return 0;
        }
    }

    /**
     * Create indexes for better performance
     */
    public function createIndexes()
    {
        try {
            $this->collection->createIndex(['user_id' => 1, 'product_id' => 1], ['unique' => true]);
            $this->collection->createIndex(['user_id' => 1]);
            $this->collection->createIndex(['product_id' => 1]);
            $this->collection->createIndex(['created_at' => -1]);
            
            return ['success' => true, 'message' => 'Indexes created successfully'];

        } catch (\Exception $e) {
            \Log::error('MongoWishlist createIndexes error:', ['error' => $e->getMessage()]);
            return ['error' => 'Failed to create indexes'];
        }
    }
}