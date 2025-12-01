<?php

namespace App\Models;

use Jenssegers\Mongodb\Eloquent\Model;

class Like extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'likes';

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