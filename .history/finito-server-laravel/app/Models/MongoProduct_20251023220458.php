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
            $objectIds = array_map(function($id) {
                try {
                    return new ObjectId($id);
                } catch (\Exception $e) {
                    return $id; // If it's not a valid ObjectId, use as string
                }
            }, $productIds);

            $products = $this->collection->find([
                '_id' => ['$in' => $objectIds]
            ])->toArray();

            $result = [];
            foreach ($products as $product) {
                $productId = (string)$product['_id'];
                $result[$productId] = [
                    'id' => $productId,
                    'title' => $product['title'] ?? null,
                    'name' => $product['title'] ?? $product['name'] ?? null,
                    'price' => $product['price'] ?? 0,
                    'image' => $product['image'] ?? null,
                    'description' => $product['description'] ?? '',
                    'category' => $product['category'] ?? 'Unknown'
                ];
            }

            return $result;

        } catch (\Exception $e) {
            Log::error('MongoProduct getByIds error:', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Find single product
     */
    public function find($productId)
    {
        try {
            try {
                $product = $this->collection->findOne(['_id' => new ObjectId($productId)]);
            } catch (\Exception $e) {
                // If ObjectId fails, try as string
                $product = $this->collection->findOne(['_id' => $productId]);
            }

            if (!$product) {
                return null;
            }

            return [
                'id' => (string)$product['_id'],
                'title' => $product['title'] ?? null,
                'name' => $product['title'] ?? $product['name'] ?? null,
                'price' => $product['price'] ?? 0,
                'image' => $product['image'] ?? null,
                'description' => $product['description'] ?? '',
                'category' => $product['category'] ?? 'Unknown'
            ];

        } catch (\Exception $e) {
            Log::error('MongoProduct find error:', ['error' => $e->getMessage()]);
            return null;
        }
    }
}