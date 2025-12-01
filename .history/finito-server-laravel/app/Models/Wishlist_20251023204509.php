<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Jenssegers\Mongodb\Eloquent\Model;

class Wishlist extends Model
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'wishlists';
    
    // MongoDB uses _id as primary key
    protected $primaryKey = '_id';
    
    // Set the key type to string for MongoDB ObjectId
    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'product_id',
        'created_at',
        'updated_at'
    ];

    protected $casts = [
        'user_id' => 'integer', // Since users are still in MySQL
        'product_id' => 'string',
    ];

    /**
     * Get the product that is in wishlist
     */
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', '_id');
    }

    /**
     * Get the user that owns the wishlist item
     * Note: This is a cross-database relationship (MongoDB -> MySQL)
     */
    public function user()
    {
        // Since users are in MySQL, we need to handle this differently
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Check if product is already in wishlist
     */
    public static function isProductInWishlist($userId, $productId)
    {
        return static::where('user_id', $userId)
                    ->where('product_id', $productId)
                    ->exists();
    }

    /**
     * Get user's wishlist with product details
     */
    public static function getUserWishlist($userId)
    {
        return static::where('user_id', $userId)
                    ->with('product')
                    ->get();
    }
}