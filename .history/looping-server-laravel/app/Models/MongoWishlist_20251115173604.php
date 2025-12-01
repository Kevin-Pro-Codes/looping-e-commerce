<?php

namespace App\Models;

use MongoDB\Client;
use MongoDB\BSON\ObjectId;
use Illuminate\Support\Facades\Log;

class MongoWishlist
{
    protected $collection;
    protected $mongoProduct;

    public function __construct()
    {
        $client = new Client(env('MONGODB_URI', 'mongodb://localhost:27017'));
        $database = env('MONGODB_DATABASE', 'finito');
        $this->collection = $client->$database->wishlists;
        $this->mongoProduct = new MongoProduct();
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
            $productIds = [];
            foreach ($wishlistItems as $item) {
                if (isset($item['product_id']) && !empty($item['product_id'])) {
                    $productIds[] = $item['product_id'];
                }
            }

            // Get products from MongoDB using MongoProduct
            $products = $this->mongoProduct->getByIds($productIds);

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
                    'product' => $product
                ];
            }

            return $result;

        } catch (\Exception $e) {
            Log::error('MongoWishlist getUserWishlist error:', ['error' => $e->getMessage()]);
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
            Log::error('MongoWishlist isProductInWishlist error:', ['error' => $e->getMessage()]);
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
            Log::error('MongoWishlist addToWishlist error:', ['error' => $e->getMessage()]);
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
            Log::error('MongoWishlist removeFromWishlist error:', ['error' => $e->getMessage()]);
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
            Log::error('MongoWishlist toggleWishlist error:', ['error' => $e->getMessage()]);
            return ['error' => 'Failed to toggle wishlist'];
        }
    }

    /**
     * Get single product from MongoDB using MongoProduct
     */
    private function getProduct($productId)
    {
        return $this->mongoProduct->find($productId);
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
            Log::error('MongoWishlist getWishlistCount error:', ['error' => $e->getMessage()]);
            return 0;
        }
    }

    /**
     * Get all wishlist items for user (without product data)
     */
    public function getWishlistItems($userId)
    {
        try {
            $wishlistItems = $this->collection->find([
                'user_id' => (int)$userId
            ])->toArray();

            $result = [];
            foreach ($wishlistItems as $item) {
                $result[] = [
                    'id' => (string)$item['_id'],
                    'product_id' => $item['product_id'],
                    'user_id' => $item['user_id'],
                    'created_at' => $item['created_at'] ?? null,
                    'updated_at' => $item['updated_at'] ?? null
                ];
            }

            return $result;

        } catch (\Exception $e) {
            Log::error('MongoWishlist getWishlistItems error:', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Clear entire wishlist for user
     */
    public function clearWishlist($userId)
    {
        try {
            $result = $this->collection->deleteMany([
                'user_id' => (int)$userId
            ]);

            return [
                'success' => true,
                'deleted_count' => $result->getDeletedCount()
            ];

        } catch (\Exception $e) {
            Log::error('MongoWishlist clearWishlist error:', ['error' => $e->getMessage()]);
            return ['error' => 'Failed to clear wishlist'];
        }
    }

    /**
     * Get wishlist items with pagination
     */
    public function getWishlistPaginated($userId, $page = 1, $perPage = 20)
    {
        try {
            $skip = ($page - 1) * $perPage;
            
            $wishlistItems = $this->collection->find(
                ['user_id' => (int)$userId],
                [
                    'skip' => $skip,
                    'limit' => $perPage,
                    'sort' => ['created_at' => -1]
                ]
            )->toArray();

            $total = $this->getWishlistCount($userId);

            // Get product IDs from wishlist
            $productIds = array_map(function($item) {
                return $item['product_id'];
            }, $wishlistItems);

            // Get products from MongoDB using MongoProduct
            $products = $this->mongoProduct->getByIds($productIds);

            // Combine wishlist items with product data
            $items = [];
            foreach ($wishlistItems as $item) {
                $product = $products[$item['product_id']] ?? null;
                
                $items[] = [
                    'id' => (string)$item['_id'],
                    'product_id' => $item['product_id'],
                    'user_id' => $item['user_id'],
                    'created_at' => $item['created_at'] ?? null,
                    'updated_at' => $item['updated_at'] ?? null,
                    'product' => $product
                ];
            }

            return [
                'items' => $items,
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $perPage,
                    'total' => $total,
                    'last_page' => ceil($total / $perPage)
                ]
            ];

        } catch (\Exception $e) {
            Log::error('MongoWishlist getWishlistPaginated error:', ['error' => $e->getMessage()]);
            return [
                'items' => [],
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $perPage,
                    'total' => 0,
                    'last_page' => 0
                ]
            ];
        }
    }

    /**
     * Check if multiple products are in wishlist
     */
    public function checkMultipleProducts($userId, $productIds)
    {
        try {
            $wishlistItems = $this->collection->find([
                'user_id' => (int)$userId,
                'product_id' => ['$in' => $productIds]
            ])->toArray();

            $result = [];
            foreach ($productIds as $productId) {
                $result[$productId] = false;
            }

            foreach ($wishlistItems as $item) {
                $result[$item['product_id']] = true;
            }

            return $result;

        } catch (\Exception $e) {
            Log::error('MongoWishlist checkMultipleProducts error:', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Get most wishlisted products
     */
    public function getPopularProducts($limit = 10)
    {
        try {
            $pipeline = [
                [
                    '$group' => [
                        '_id' => '$product_id',
                        'count' => ['$sum' => 1]
                    ]
                ],
                [
                    '$sort' => ['count' => -1]
                ],
                [
                    '$limit' => $limit
                ]
            ];

            $popularProducts = $this->collection->aggregate($pipeline)->toArray();

            $productIds = array_map(function($item) {
                return $item['_id'];
            }, $popularProducts);

            $products = $this->mongoProduct->getByIds($productIds);

            $result = [];
            foreach ($popularProducts as $popular) {
                $productId = $popular['_id'];
                if (isset($products[$productId])) {
                    $result[] = [
                        'product' => $products[$productId],
                        'wishlist_count' => $popular['count']
                    ];
                }
            }

            return $result;

        } catch (\Exception $e) {
            Log::error('MongoWishlist getPopularProducts error:', ['error' => $e->getMessage()]);
            return [];
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
            
            return ['success' => true, 'message' => 'Wishlist indexes created successfully'];

        } catch (\Exception $e) {
            Log::error('MongoWishlist createIndexes error:', ['error' => $e->getMessage()]);
            return ['error' => 'Failed to create indexes'];
        }
    }

    /**
     * Get wishlist statistics
     */
    public function getStats($userId = null)
    {
        try {
            $match = [];
            if ($userId) {
                $match = ['user_id' => (int)$userId];
            }

            $pipeline = [
                [
                    '$match' => $match
                ],
                [
                    '$group' => [
                        '_id' => null,
                        'total_wishlists' => ['$sum' => 1],
                        'unique_users' => ['$addToSet' => '$user_id'],
                        'unique_products' => ['$addToSet' => '$product_id']
                    ]
                ],
                [
                    '$project' => [
                        'total_wishlists' => 1,
                        'unique_users_count' => ['$size' => '$unique_users'],
                        'unique_products_count' => ['$size' => '$unique_products']
                    ]
                ]
            ];

            $stats = $this->collection->aggregate($pipeline)->toArray();

            if (empty($stats)) {
                return [
                    'total_wishlists' => 0,
                    'unique_users_count' => 0,
                    'unique_products_count' => 0
                ];
            }

            return $stats[0];

        } catch (\Exception $e) {
            Log::error('MongoWishlist getStats error:', ['error' => $e->getMessage()]);
            return [
                'total_wishlists' => 0,
                'unique_users_count' => 0,
                'unique_products_count' => 0
            ];
        }
    }

    /**
     * Migrate data from MySQL to MongoDB (one-time use)
     */
    public function migrateFromMySQL($mysqlWishlistItems)
    {
        try {
            $documents = [];
            foreach ($mysqlWishlistItems as $item) {
                $documents[] = [
                    'user_id' => (int)$item->user_id,
                    'product_id' => $item->product_id,
                    'created_at' => $item->created_at?->toISOString() ?? now()->toISOString(),
                    'updated_at' => $item->updated_at?->toISOString() ?? now()->toISOString()
                ];
            }

            if (!empty($documents)) {
                $result = $this->collection->insertMany($documents);
                return [
                    'success' => true,
                    'inserted_count' => $result->getInsertedCount()
                ];
            }

            return ['success' => true, 'inserted_count' => 0];

        } catch (\Exception $e) {
            Log::error('MongoWishlist migrateFromMySQL error:', ['error' => $e->getMessage()]);
            return ['error' => 'Migration failed: ' . $e->getMessage()];
        }
    }
}