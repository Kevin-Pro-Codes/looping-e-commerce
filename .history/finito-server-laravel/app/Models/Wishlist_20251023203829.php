<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Jenssegers\Mongodb\Eloquent\HybridRelations;

class Wishlist extends Model
{
    use HasFactory, HybridRelations;

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
     * FIX: Specify the correct MongoDB key
     */
    public function product()
    {
        return $this->belongsTo(Product::class, '_id');
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