<?php

namespace App\Models;

use Jenssegers\Mongodb\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Wishlist extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'wishlist';

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
        return $this->belongsTo(Product::class, 'product_id');
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