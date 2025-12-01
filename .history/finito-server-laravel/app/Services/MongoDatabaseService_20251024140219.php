<?php

namespace App\Services;

use MongoDB\Client;
use Exception;
use Illuminate\Support\Facades\Log;

class MongoDatabaseService
{
    private $client;
    private $database;
    private $connected = false;

    public function __construct()
    {
        try {
            $connectionString = env('MONGO_DB_URI', 'mongodb://localhost:27017');
            $databaseName = env('MONGO_DB_DATABASE', 'finito');
            
            $this->client = new Client($connectionString);
            $this->database = $this->client->selectDatabase($databaseName);
            $this->connected = true;
            
            Log::info('MongoDB Service initialized successfully');
        } catch (Exception $e) {
            Log::error('MongoDB connection failed: ' . $e->getMessage());
            $this->connected = false;
        }
    }

    public function isConnected(): bool
    {
        return $this->connected;
    }

    public function getCollection(string $collectionName)
    {
        if (!$this->connected) {
            throw new Exception('MongoDB not connected');
        }
        return $this->database->selectCollection($collectionName);
    }

    public function getWishlistCollection()
    {
        return $this->getCollection('wishlist');
    }

    public function getProductsCollection()
    {
        return $this->getCollection('products');
    }
}
