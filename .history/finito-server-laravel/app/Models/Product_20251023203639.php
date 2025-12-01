<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Jenssegers\Mongodb\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    // MongoDB uses _id as primary key
    protected $primaryKey = '_id';
    
    // Set the key type to string for MongoDB ObjectId
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
        return $this->hasMany(Wishlist::class, 'product_id', '_id');
    }
}