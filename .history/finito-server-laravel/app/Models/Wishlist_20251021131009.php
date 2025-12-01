<?php

namespace App\Models;

use Jenssegers\Mongodb\Eloquent\Model;

class Wishlist extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'wishlist';

    protected $fillable = [
        'user_id',
        'product_id'
    ];

    protected $casts = [
        'user_id' => 'string',
        'product_id' => 'string'
    ];

    /**
     * Get the user that owns the like
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the product that is liked
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}