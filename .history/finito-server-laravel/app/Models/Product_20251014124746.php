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
        'description'
        
    ];

    protected $casts = [
        'favorites' => 'boolean',
        'cart' => 'boolean'
    ];
}
