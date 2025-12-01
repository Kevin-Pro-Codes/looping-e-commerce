<?php

namespace App\Models;

use MongoDB\Client;
use MongoDB\BSON\ObjectId;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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
     * Get all products
     */
    public function getAll($orderBy = 'created_at', $direction = 'desc')
    {
        try {
            $options = [
                'sort' => [$orderBy => $direction === 'desc' ? -1 : 1]
            ];

            $products = $this->collection->find([], $options)->toArray();

            // Convert MongoDB objects to arrays and transform image URLs
            $result = [];
            foreach ($products as $product) {
                $productArray = (array)$product;
                $result[] = $this->transformProductData($productArray);
            }

            return $result;

        } catch (\Exception $e) {
            \Log::error('MongoProduct getAll error:', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Get product by ID
     */
    public function find($id)
    {
        try {
            $product = $this->collection->findOne(['_id' => $id]);

            if (!$product) {
                return null;
            }

            return $this->transformProductData((array)$product);

        } catch (\Exception $e) {
            \Log::error('MongoProduct find error:', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Create new product
     */
    public function create($data)
    {
        try {
            $productData = [
                '_id' => $data['_id'] ?? (string) new ObjectId(),
                'title' => $data['title'],
                'price' => (float)$data['price'],
                'description' => $data['description'] ?? '',
                'category' => $data['category'] ?? '',
                'created_at' => now()->toISOString(),
                'updated_at' => now()->toISOString()
            ];

            // Handle image upload
            if (isset($data['image']) && $data['image'] instanceof \Illuminate\Http\UploadedFile) {
                $imagePath = $this->storeImage($data['image']);
                $productData['image'] = $imagePath;
                $productData['image_url'] = asset('storage/' . $imagePath);
            } elseif (isset($data['image'])) {
                $productData['image'] = $data['image'];
                $productData['image_url'] = $this->getImageUrl($data['image']);
            }

            $result = $this->collection->insertOne($productData);

            if ($result->getInsertedCount() === 1) {
                return $this->find($productData['_id']);
            }

            return null;

        } catch (\Exception $e) {
            \Log::error('MongoProduct create error:', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Update product
     */
    public function update($id, $data)
    {
        try {
            $updateData = [
                'title' => $data['title'] ?? null,
                'price' => isset($data['price']) ? (float)$data['price'] : null,
                'description' => $data['description'] ?? null,
                'category' => $data['category'] ?? null,
                'updated_at' => now()->toISOString()
            ];

            // Remove null values
            $updateData = array_filter($updateData, function($value) {
                return $value !== null;
            });

            // Handle image upload
            if (isset($data['image']) && $data['image'] instanceof \Illuminate\Http\UploadedFile) {
                // Delete old image if exists
                $existingProduct = $this->find($id);
                if ($existingProduct && $existingProduct['image']) {
                    $this->deleteImage($existingProduct['image']);
                }

                $imagePath = $this->storeImage($data['image']);
                $updateData['image'] = $imagePath;
                $updateData['image_url'] = asset('storage/' . $imagePath);
            }

            $result = $this->collection->updateOne(
                ['_id' => $id],
                ['$set' => $updateData]
            );

            if ($result->getModifiedCount() > 0) {
                return $this->find($id);
            }

            return null;

        } catch (\Exception $e) {
            \Log::error('MongoProduct update error:', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Delete product
     */
    public function delete($id)
    {
        try {
            // Delete associated image
            $product = $this->find($id);
            if ($product && $product['image']) {
                $this->deleteImage($product['image']);
            }

            $result = $this->collection->deleteOne(['_id' => $id]);

            return $result->getDeletedCount() > 0;

        } catch (\Exception $e) {
            \Log::error('MongoProduct delete error:', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Get products by multiple IDs
     */
    public function getByIds($ids)
    {
        try {
            $products = $this->collection->find([
                '_id' => ['$in' => $ids]
            ])->toArray();

            $result = [];
            foreach ($products as $product) {
                $productArray = (array)$product;
                $result[(string)$productArray['_id']] = $this->transformProductData($productArray);
            }

            return $result;

        } catch (\Exception $e) {
            \Log::error('MongoProduct getByIds error:', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Search products
     */
    public function search($query)
    {
        try {
            $filter = [
                '$or' => [
                    ['title' => ['$regex' => $query, '$options' => 'i']],
                    ['description' => ['$regex' => $query, '$options' => 'i']],
                    ['category' => ['$regex' => $query, '$options' => 'i']]
                ]
            ];

            $products = $this->collection->find($filter)->toArray();

            $result = [];
            foreach ($products as $product) {
                $productArray = (array)$product;
                $result[] = $this->transformProductData($productArray);
            }

            return $result;

        } catch (\Exception $e) {
            \Log::error('MongoProduct search error:', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Get products by category
     */
    public function getByCategory($category)
    {
        try {
            $products = $this->collection->find([
                'category' => ['$regex' => $category, '$options' => 'i']
            ])->toArray();

            $result = [];
            foreach ($products as $product) {
                $productArray = (array)$product;
                $result[] = $this->transformProductData($productArray);
            }

            return $result;

        } catch (\Exception $e) {
            \Log::error('MongoProduct getByCategory error:', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Store image file
     */
    private function storeImage($imageFile)
    {
        $filename = Str::random(10) . '_' . time() . '.' . $imageFile->getClientOriginalExtension();
        return $imageFile->storeAs('uploads', $filename, 'public');
    }

    /**
     * Delete image file
     */
    private function deleteImage($imagePath)
    {
        if (Storage::disk('public')->exists($imagePath)) {
            return Storage::disk('public')->delete($imagePath);
        }
        return false;
    }

    /**
     * Get full image URL
     */
    private function getImageUrl($imagePath)
    {
        if (!$imagePath) {
            return null;
        }

        if (Str::startsWith($imagePath, ['http://', 'https://'])) {
            return $imagePath;
        }

        return asset('storage/' . $imagePath);
    }

    /**
     * Transform product data for response
     */
    private function transformProductData($product)
    {
        return [
            'id' => (string)$product['_id'],
            '_id' => (string)$product['_id'],
            'title' => $product['title'] ?? '',
            'price' => $product['price'] ?? 0,
            'description' => $product['description'] ?? '',
            'category' => $product['category'] ?? '',
            'image' => $product['image'] ?? '',
            'image_url' => $this->getImageUrl($product['image'] ?? ''),
            'created_at' => $product['created_at'] ?? null,
            'updated_at' => $product['updated_at'] ?? null
        ];
    }

    /**
     * Create indexes for better performance
     */
    public function createIndexes()
    {
        try {
            $this->collection->createIndex(['title' => 'text', 'description' => 'text']);
            $this->collection->createIndex(['category' => 1]);
            $this->collection->createIndex(['price' => 1]);
            $this->collection->createIndex(['created_at' => -1]);
            
            return ['success' => true, 'message' => 'Product indexes created successfully'];

        } catch (\Exception $e) {
            \Log::error('MongoProduct createIndexes error:', ['error' => $e->getMessage()]);
            return ['error' => 'Failed to create indexes'];
        }
    }

    /**
     * Get product count
     */
    public function count()
    {
        try {
            return $this->collection->countDocuments();
        } catch (\Exception $e) {
            \Log::error('MongoProduct count error:', ['error' => $e->getMessage()]);
            return 0;
        }
    }
}