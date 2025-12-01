<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    // ✅ Custom collection name for MongoDB
    protected $table = 'products';

    // ✅ MongoDB uses _id as primary key
    protected $primaryKey = '_id';
    public $incrementing = false;
    protected $keyType = 'string';

    // ✅ Fillable attributes
    protected $fillable = [
        '_id', // MongoDB document ID
        'title',
        'price',
        'image',
        'description',
        'category',
        // Add any other fields you have in your products collection
    ];

    // ✅ Optional: Cast attributes if needed
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

    /**
     * Custom method to handle MongoDB queries if needed
     */
    public function scopeWhereMongoId($query, $id)
    {
        return $query->where('_id', $id);
    }
}