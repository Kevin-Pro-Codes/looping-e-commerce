<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class Stock extends Model
{
    use HasFactory;

    protected $table = 'stock';
    
    // Remove this line to enable Laravel's default timestamps
    // public $timestamps = false;
    
    protected $fillable = [
        'product_id', 
        'name', 
        'sku', 
        'category', 
        'supplier',
        'cost', 
        'profit', 
        'sale_price', 
        'total_value',
        'color', 
        'size', 
        'stock',           // ✅ AVAILABLE QUANTITY
        'last_updated'
    ];

    protected $casts = [
        'cost' => 'decimal:2',
        'profit' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'total_value' => 'decimal:2',
        'stock' => 'integer',      // ✅ Cast as integer
        'last_updated' => 'datetime'  // ✅ Change from 'date' to 'datetime'
    ];

    /**
     * Get grouped stock by product
     */
    public static function getGroupedStock()
    {
        if (!Schema::hasTable('stock')) {
            return collect();
        }

        return self::orderBy('product_id')
            ->orderBy('color')
            ->orderBy('size')
            ->get()
            ->groupBy('product_id')
            ->map(function ($items, $productId) {
                $firstItem = $items->first();
                
                return [
                    'id' => $firstItem->id,
                    'product_id' => $productId,
                    'name' => $firstItem->name,
                    'category' => $firstItem->category,
                    'supplier' => $firstItem->supplier,
                    'cost' => (float) $firstItem->cost,
                    'profit' => (float) $firstItem->profit,
                    'sale_price' => (float) $firstItem->sale_price,
                    'total_value' => (float) $firstItem->total_value,
                    'last_updated' => $firstItem->last_updated ? $firstItem->last_updated->format('Y-m-d H:i:s') : null,                 
                    'variants' => $items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'color' => $item->color,
                            'size' => $item->size,
                            'stock' => $item->stock, // ✅ AVAILABLE QUANTITY
                            'sku' => $item->sku,
                            'last_updated' => $item->last_updated ? $item->last_updated->format('Y-m-d H:i:s') : null,
                            'last_updated_raw' => $item->last_updated
                        ];
                    })->values()->toArray()
                ];
            })->values();
    }

    public static function getLowStock()
    {
        if (!Schema::hasTable('stock')) {
            return collect();
        }

        return self::where('stock', '>', 0)
            ->where('stock', '<=', 5)
            ->get();
    }

    public static function getOutOfStock()
    {
        if (!Schema::hasTable('stock')) {
            return collect();
        }

        return self::where('stock', 0)->get();
    }
}