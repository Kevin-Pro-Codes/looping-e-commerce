<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    use HasFactory;

    protected $table = 'stocks';

    protected $fillable = [
        'product_id',
        'name',
        'sku', 
        'category',
        'supplier',
        'cost',
        'profit_margin',
        'sale_markup', 
        'sale_price',
        'profit',
        'stock_value',
        'last_updated'
    ];

    protected $casts = [
        'cost' => 'decimal:2',
        'profit_margin' => 'decimal:2',
        'sale_markup' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'profit' => 'decimal:2',
        'stock_value' => 'decimal:2',
    ];

    /**
     * Get the variants for this stock item
     */
    public function variants()
    {
        return $this->hasMany(StockVariant::class, 'stock_id');
    }

    /**
     * Calculate prices based on cost and margins
     */
    public function calculatePrices()
    {
        if ($this->cost) {
            $this->profit = $this->cost * ($this->profit_margin ?? 0.60);
            $this->sale_price = $this->cost * ($this->sale_markup ?? 1.80);
        }
        return $this;
    }
}