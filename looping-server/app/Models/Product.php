<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model; // Use MongoDB Eloquent instead of default
use App\Services\MeilisearchService;

class Product extends Model
{
    use HasFactory;

    // Use MongoDB connection
    protected $connection = 'mongodb';

    // If you're using MongoDB or non-integer IDs, disable auto-incrementing
    public $incrementing = false;
    
    // Set the key type to string if using UUIDs or string IDs
    protected $keyType = 'string';

    protected $fillable = [
        '_id',
        'title',
        'price',
        'image',
        'description',
        'category',
    ];

    protected $searchable = [
        'title',
        'description',
        'category',
    ];

    /**
     * Get the wishlist items for the product
     */
    public function wishlistItems()
    {
        return $this->hasMany(Wishlist::class, '_id');
    }

    /**
     * Index product in Meilisearch
     */
    public static function indexInMeilisearch()
    {
        $meilisearch = app(MeilisearchService::class);
        
        try {
            // Create index if it doesn't exist
            $meilisearch->createIndex('products', ['primaryKey' => '_id']);
            
            // Configure searchable attributes and ranking rules
            $meilisearch->updateIndexSettings('products', [
                'searchableAttributes' => ['title', 'description', 'category'],
                'rankingRules' => [
                    'words',
                    'typo',
                    'proximity',
                    'attribute',
                    'sort',
                    'exactness',
                ],
                'displayedAttributes' => ['*'],
                'filterableAttributes' => ['category', 'price'],
                'sortableAttributes' => ['price', 'title'],
            ]);
        } catch (\Exception $e) {
            // Index might already exist, continue
        }

        // Get all products and index them
        $products = self::all()->toArray();
        return $meilisearch->indexDocuments('products', $products, '_id');
    }

    /**
     * Search products using Meilisearch
     */
    public static function searchProducts(string $query, array $options = [])
    {
        $meilisearch = app(MeilisearchService::class);
        
        $defaultOptions = [
            'limit' => 20,
            'attributesToHighlight' => ['title', 'description'],
        ];

        $options = array_merge($defaultOptions, $options);

        return $meilisearch->search('products', $query, $options);
    }

    /**
     * Add/update single product in Meilisearch
     */
    public function indexSingleProduct()
    {
        $meilisearch = app(MeilisearchService::class);
        return $meilisearch->indexDocuments('products', [$this->toArray()], '_id');
    }

    /**
     * Remove product from Meilisearch
     */
    public function removeFromMeilisearch()
    {
        $meilisearch = app(MeilisearchService::class);
        $index = $meilisearch->getClient()->index('products');
        return $index->deleteDocument($this->_id);
    }

    /**
     * Boot method to handle Meilisearch indexing
     */
    protected static function boot()
    {
        parent::boot();

        static::saved(function ($product) {
            if (class_exists(\MeiliSearch\Client::class)) {
                $product->indexSingleProduct();
            }
        });

        static::deleted(function ($product) {
            if (class_exists(\MeiliSearch\Client::class)) {
                $product->removeFromMeilisearch();
            }
        });
    }
}