<?php

namespace App\Models;

use Jenssegers\Mongodb\Eloquent\Model as Eloquent;

class Product extends Eloquent
{
    protected $connection = 'mongodb';
    protected $collection = 'products';

    protected $fillable = [
        'title',
        'price',
        'image',
        'category',
        'description',
        'favorites',
        'in_cart'
    ];

    protected $casts = [
        'favorites' => 'boolean',
        'in_cart' => 'boolean'
    ];
}
