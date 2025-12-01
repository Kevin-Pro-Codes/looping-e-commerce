<?php

namespace App\Models;


use Jenssegers\Mongodb\Eloquent\Model;

class Product extends Eloquent
{
    protected $connection = 'mongodb';
    protected $collection = 'products';

    protected $fillable = [
        'title',
        'price',
        'image',
        'category',
        'description'
    ];

    // No need for casts here unless you have specific fields in the product
    protected $casts = [
        'price' => 'float' // optional, makes sure price is always a float
    ];
}
