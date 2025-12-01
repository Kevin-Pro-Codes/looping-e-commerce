<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use MongoDB\Client;

class MongoDatabaseService
{
    protected $client;
    protected $db;

    public function __construct()
    {
        try {
            $connectionString = config('database.connections.mongodb.uri');
            $databaseName = config('database.connections.mongodb.database');
            
            $this->client = new Client($connectionString);
            $this->db = $this->client->selectDatabase($databaseName);
            
            Log::info('MongoDB service initialized successfully', [
                'database' => $databaseName
            ]);
            
        } catch (\Exception $e) {
            Log::error('MongoDB service initialization failed', [
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    public function isConnected()
    {
        try {
            // Try to list collections to test connection
            $this->db->listCollections();
            return true;
        } catch (\Exception $e) {
            Log::error('MongoDB connection check failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    public function getWishlistCollection()
    {
        return $this->db->selectCollection('wishlist');
    }

    public function getCartCollection()
    {
        return $this->db->selectCollection('cart');
    }

    public function getProductsCollection()
    {
        return $this->db->selectCollection('products');
    }

    public function getDatabase()
    {
        return $this->db;
    }
}