<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Jenssegers\Mongodb\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    // ✅ MongoDB Configuration
    protected $connection = 'mongodb';
    protected $collection = 'products';

    // ✅ MongoDB uses _id as primary key
    protected $primaryKey = '_id';
    public $incrementing = false;
    protected $keyType = 'string';

    // ✅ Fillable attributes
    protected $fillable = [
        '_id',
        'title',
        'price',
        'image',
        'description',
        'category',
    ];

    protected $casts = [
        'price' => 'float',
    ];

    /**
     * Get the wishlist items for the product
     */
    public function wishlistItems()
    {
        return $this->hasMany(Wishlist::class, 'product_id', '_id');
    }
}