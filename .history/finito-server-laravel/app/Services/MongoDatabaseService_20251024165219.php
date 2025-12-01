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
        Log::info('MongoDatabaseService constructor called');
        
        try {
            // Get configuration
            $connectionString = config('database.connections.mongodb.uri', 'mongodb://localhost:27017');
            $databaseName = config('database.connections.mongodb.database', 'forge');
            
            Log::info('MongoDB config', [
                'connectionString' => $connectionString,
                'databaseName' => $databaseName
            ]);
            
            // Create MongoDB client
            $this->client = new Client($connectionString);
            Log::info('MongoDB client created');
            
            // Select database
            $this->db = $this->client->selectDatabase($databaseName);
            Log::info('MongoDB database selected', ['database' => $databaseName]);
            
            // Test connection
            $this->db->listCollections();
            Log::info('MongoDB connection test successful');
            
        } catch (\Exception $e) {
            Log::error('MongoDB service initialization failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    public function isConnected()
    {
        if (!$this->db) {
            Log::error('MongoDB database property is not set');
            return false;
        }
        
        try {
            $this->db->listCollections();
            return true;
        } catch (\Exception $e) {
            Log::error('MongoDB connection check failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    public function getWishlistCollection()
    {
        if (!$this->db) {
            throw new \Exception('MongoDB database not initialized');
        }
        return $this->db->selectCollection('wishlist');
    }

    public function getCartCollection()
    {
        if (!$this->db) {
            throw new \Exception('MongoDB database not initialized');
        }
        return $this->db->selectCollection('cart');
    }

    public function getProductsCollection()
    {
        if (!$this->db) {
            throw new \Exception('MongoDB database not initialized');
        }
        return $this->db->selectCollection('products');
    }

    public function getDatabase()
    {
        return $this->db;
    }
}