<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use MongoDB\Laravel\Eloquent\Model as Eloquent; // If using MongoDB package

class Product extends Model
{
    use HasFactory;

    // For MongoDB compatibility
    protected $connection = 'mongodb'; // If using MongoDB
    protected $collection = 'products'; // MongoDB collection name
    
    // If you're using MongoDB, disable auto-incrementing
    public $incrementing = false;
    
    // Set the key type to string for MongoDB ObjectId
    protected $keyType = 'string';

    protected $fillable = [
        '_id', // MongoDB uses _id as primary key
        'title',
        'price',
        'image',
        'description',
        'category',
    ];

    /**
     * Get the wishlist items for the product
     */
    public function wishlistItems()
    {
        return $this->hasMany(Wishlist::class, 'product_id', '_id');
    }
}