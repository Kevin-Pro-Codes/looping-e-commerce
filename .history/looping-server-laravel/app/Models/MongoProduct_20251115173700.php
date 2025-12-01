<?php

namespace App\Models;

use MongoDB\Client;
use MongoDB\BSON\ObjectId;
use Illuminate\Support\Facades\Log;

class MongoProduct
{
    protected $collection;

    public function __construct()
    {
        $client = new Client(env('MONGODB_URI', 'mongodb://localhost:27017'));
        $database = env('MONGODB_DATABASE', 'finito');
        $this->collection = $client->$database->products;
    }

    /**
     * Get products by IDs
     */
    public function getByIds(array $productIds)
    {
        try {
            Log::info('MongoProduct getByIds called with:', ['productIds' => $productIds]);
            
            if (empty($productIds)) {
                return [];
            }

            // Convert string IDs to ObjectId if they are valid MongoDB IDs
            $objectIds = [];
            foreach ($productIds as $id) {
                try {
                    // Try as ObjectId first
                    $objectIds[] = new ObjectId($id);
                } catch (\Exception $e) {
                    // If it fails, use as string
                    $objectIds[] = $id;
                }
            }

            $products = $this->collection->find([
                '_id' => ['$in' => $objectIds]
            ])->toArray();

            Log::info('MongoProduct found products:', ['count' => count($products)]);

            $result = [];
            foreach ($products as $product) {
                $productId = (string)$product['_id'];
                $result[$productId] = [
                    'id' => $productId,
                    'title' => $product['title'] ?? $product['name'] ?? 'Unknown Product',
                    'name' => $product['title'] ?? $product['name'] ?? 'Unknown Product',
                    'price' => $product['price'] ?? 0,
                    'image' => $product['image'] ?? $product['image_url'] ?? null,
                    'description' => $product['description'] ?? 'No description available',
                    'category' => $product['category'] ?? 'Unknown'
                ];
            }

            return $result;

        } catch (\Exception $e) {
            Log::error('MongoProduct getByIds error:', [
                'error' => $e->getMessage(),
                'productIds' => $productIds
            ]);
            return [];
        }
    }

    /**
     * Find single product
     */
    public function find($productId)
    {
        try {
            Log::info('MongoProduct find called with:', ['productId' => $productId]);
            
            $product = null;
            
            // Try as ObjectId first
            try {
                $product = $this->collection->findOne(['_id' => new ObjectId($productId)]);
            } catch (\Exception $e) {
                // If ObjectId fails, try as string
                $product = $this->collection->findOne(['_id' => $productId]);
            }

            // If still not found, try by product_id field
            if (!$product) {
                $product = $this->collection->findOne(['product_id' => $productId]);
            }

            if (!$product) {
                Log::warning('MongoProduct product not found:', ['productId' => $productId]);
                return null;
            }

            $result = [
                'id' => (string)$product['_id'],
                'title' => $product['title'] ?? $product['name'] ?? 'Unknown Product',
                'name' => $product['title'] ?? $product['name'] ?? 'Unknown Product',
                'price' => $product['price'] ?? 0,
                'image' => $product['image'] ?? $product['image_url'] ?? null,
                'description' => $product['description'] ?? 'No description available',
                'category' => $product['category'] ?? 'Unknown'
            ];

            Log::info('MongoProduct found:', $result);
            return $result;

        } catch (\Exception $e) {
            Log::error('MongoProduct find error:', [
                'error' => $e->getMessage(),
                'productId' => $productId
            ]);
            return null;
        }
    }
}