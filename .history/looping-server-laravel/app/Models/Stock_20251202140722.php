<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Stock extends Model
{
    use HasFactory;

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
        'stock',
        'reserved',
        'incoming',
        'last_updated'
    ];

    protected $casts = [
        'cost' => 'decimal:2',
        'profit' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'total_value' => 'decimal:2',
        'stock' => 'integer',
        'reserved' => 'integer',
        'incoming' => 'integer'
    ];

    /**
     * Get stock grouped by product
     */
    public static function getGroupedStock()
    {
        return self::select('product_id')
            ->selectRaw('MAX(name) as name')
            ->selectRaw('MAX(sku) as sku')
            ->selectRaw('MAX(category) as category')
            ->selectRaw('MAX(supplier) as supplier')
            ->selectRaw('MAX(cost) as cost')
            ->selectRaw('MAX(profit) as profit')
            ->selectRaw('MAX(sale_price) as sale_price')
            ->selectRaw('SUM(total_value) as total_value')
            ->selectRaw('MAX(last_updated) as last_updated')
            ->selectRaw('MAX(created_at) as created_at')
            ->selectRaw('MAX(updated_at) as updated_at')
            ->selectRaw('JSON_ARRAYAGG(JSON_OBJECT(
                "id", id,
                "color", color,
                "size", size,
                "stock", stock,
                "reserved", reserved,
                "incoming", incoming,
                "available", stock - reserved
            )) as variants')
            ->groupBy('product_id')
            ->get()
            ->map(function ($item) {
                $item->variants = json_decode($item->variants, true);
                return $item;
            });
    }

    /**
     * Get low stock items (stock - reserved < 5)
     */
    public static function getLowStock()
    {
        return self::whereRaw('(stock - reserved) < 5')
            ->whereRaw('(stock - reserved) > 0')
            ->get();
    }

    /**
     * Get out of stock items (stock - reserved <= 0)
     */
    public static function getOutOfStock()
    {
        return self::whereRaw('(stock - reserved) <= 0')
            ->get();
    }

    /**
     * Get available stock
     */
    public function getAvailableAttribute()
    {
        return $this->stock - $this->reserved;
    }
}