<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Jenssegers\Mongodb\Eloquent\Model;

class Wishlist extends Model
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'wishlist';

    protected $fillable = [
        'user_id',
        'product_id'
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