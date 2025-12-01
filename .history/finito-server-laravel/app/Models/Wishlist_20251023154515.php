<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Jenssegers\Mongodb\Eloquent\Model as Eloquent; // If using MongoDB

class Wishlist extends Eloquent // Change to Eloquent if using MongoDB
{
    use HasFactory;

    protected $connection = 'mongodb'; // If using MongoDB
    protected $collection = 'wishlist'; // For MongoDB

    protected $fillable = [
        'user_id',
        'product_id'
    ];

    protected $casts = [
        'product_id' => 'string',
    ];

    /**
     * Get the user that owns the wishlist item
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the product that is in wishlist
     */
    public function product()
    {
        // If using MongoDB, you might need to specify the key
        return $this->belongsTo(Product::class, 'product_id', '_id');
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
}