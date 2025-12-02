<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class Stock extends Model
{
    use HasFactory;

    protected $table = 'stock';
    
    protected $fillable = [
        'product_id', 'name', 'sku', 'category', 'supplier',
        'cost', 'profit', 'sale_price', 'total_value',
        'color', 'size', 'stock', 'reserved', 'incoming', 'last_updated'
    ];

    protected $casts = [
        'cost' => 'decimal:2',
        'profit' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'total_value' => 'decimal:2',
        'stock' => 'integer',
        'reserved' => 'integer',
        'incoming' => 'integer',
        'last_updated' => 'date'
    ];

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
                    'last_updated' => $firstItem->last_updated,
                    'created_at' => $firstItem->created_at?->format('Y-m-d H:i:s'),
                    'updated_at' => $firstItem->updated_at?->format('Y-m-d H:i:s'),
                    'variants' => $items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'color' => $item->color,
                            'size' => $item->size,
                            'stock' => $item->stock,
                            'reserved' => $item->reserved,
                            'incoming' => $item->incoming,
                            'sku' => $item->sku,
                            'available' => $item->stock - $item->reserved
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