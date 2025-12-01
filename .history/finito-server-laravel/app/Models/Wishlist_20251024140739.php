<?php

namespace App\Models;



class Wishlist extends Eloquent
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'wishlist';   // collection name in MongoDB

    protected $fillable = [
        'user_id',
        'product_id',
    ];

    protected $casts = [
        'user_id' => 'string',
        'product_id' => 'string',
    ];

    /**
     * Define relationship to user
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Define relationship to product (if you store products in MongoDB too)
     */
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', '_id');
    }
}
