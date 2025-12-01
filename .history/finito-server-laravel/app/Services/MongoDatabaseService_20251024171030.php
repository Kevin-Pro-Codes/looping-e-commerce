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
            // Use MONGO_URI instead of MONGO_DB_URI
            $connectionString = env('MONGO_URI', 'mongodb://localhost:27017');
            $databaseName = env('MONGO_DB_DATABASE', 'finito'); // Keep this or change if needed
            
            Log::info('Attempting MongoDB connection', [
                'connection_string' => $connectionString,
                'database' => $databaseName
            ]);
            
            $this->client = new Client($connectionString);
            $this->database = $this->client->selectDatabase($databaseName);
            
            // Test the connection
            $this->client->listDatabases();
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

    public function getCartCollection()
    {
        return $this->getCollection('cart'); // Fixed: use getCollection method
    }
}