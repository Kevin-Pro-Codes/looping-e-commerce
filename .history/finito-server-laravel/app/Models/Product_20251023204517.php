<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Jenssegers\Mongodb\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    // MongoDB specific configuration
    protected $connection = 'mongodb';
    protected $collection = 'products';
    
    // MongoDB uses _id as primary key
    protected $primaryKey = '_id';
    
    // Set the key type to string for MongoDB ObjectId
    protected $keyType = 'string';

    protected $fillable = [
        'title',
        'price',
        'image',
        'description',
        'category',
        'created_at',
        'updated_at'
    ];

    /**
     * Get the wishlist items for the product
     */
    public function wishlistItems()
    {
        return $this->hasMany(Wishlist::class, 'product_id', '_id');
    }

    /**
     * Scope to find products by multiple IDs
     */
    public function scopeWhereInIds($query, $ids)
    {
        return $query->whereIn('_id', $ids);
    }
}