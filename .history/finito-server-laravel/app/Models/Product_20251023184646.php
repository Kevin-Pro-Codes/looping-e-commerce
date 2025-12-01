<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

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

    /**
     * Get the wishlist items for the product
     */
    public function wishlistItems()
    {
        return $this->hasMany(Wishlist::class, 'product_id');
    }
}