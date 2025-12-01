<?php

namespace App\Models;

use Jenssegers\Mongodb\Eloquent\Model as Eloquent;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Eloquent
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'products';

    protected $fillable = [
        'title',
        'price', 
        'description',
        'image',
        'category'
    ];

    protected $casts = [
        'price' => 'float'
    ];

    /**
     * Get the wishlist items for this product
     */
    public function wishlists()
    {
        return $this->hasMany(Wishlist::class, 'product_id', '_id');
    }
}