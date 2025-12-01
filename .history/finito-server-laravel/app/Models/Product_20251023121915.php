<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;



class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', // Make sure this matches what you're using
        'price',
        'description', 
        'image',
        'category'
    ];

    // Add this to ensure proper JSON serialization
    protected $casts = [
        'price' => 'decimal:2',
    ];
}