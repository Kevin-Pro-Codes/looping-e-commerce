<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class Stock extends Model
{
    use HasFactory;

    protected $table = 'stock_items';
    
    protected $fillable = [
        'product_id', 'name', 'sku', 'category', 'supplier', 'cost',
        'color', 'size', 'stock', 'reserved', 'incoming', 'last_updated'
    ];

    protected $casts = [
        'cost' => 'decimal:2',
        'stock' => 'integer',
        'reserved' => 'integer',
        'incoming' => 'integer',
        'last_updated' => 'date'
    ];

    /**
     * Get all stock items grouped by product
     */
    public static function getGroupedStock()
    {
        // Check if table exists
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
                    'cost' => $firstItem->cost,
                    'last_updated' => $firstItem->last_updated,
                    'created_at' => $firstItem->created_at,
                    'updated_at' => $firstItem->updated_at,
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

    /**
     * Get low stock items (stock <= 5)
     */
    public static function getLowStock()
    {
        return self::where('stock', '>', 0)
            ->where('stock', '<=', 5)
            ->get();
    }

    /**
     * Get out of stock items
     */
    public static function getOutOfStock()
    {
        return self::where('stock', 0)->get();
    }
}