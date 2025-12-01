<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Jenssegers\Mongodb\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'products';

    // MongoDB uses _id as primary key
    protected $primaryKey = '_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        '_id',
        'title',
        'price',
        'image',
        'description',
        'category',
        // Add any other fields from your MongoDB products collection
    ];

    /**
     * Get the wishlist items for the product
     */
    public function wishlistItems()
    {
        return $this->hasMany(Wishlist::class, 'product_id', '_id');
    }

    /**
     * Accessor for consistent id field
     */
    public function getIdAttribute()
    {
        return $this->attributes['_id'];
    }

    /**
     * Ensure price is always treated as float
     */
    public function getPriceAttribute($value)
    {
        return (float) $value;
    }
}