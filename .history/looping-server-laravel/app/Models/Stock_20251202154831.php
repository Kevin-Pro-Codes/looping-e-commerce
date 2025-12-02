<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
     * Get grouped stock by product_id
     */
    public static function getGroupedStock()
    {
        return self::select('product_id')
            ->selectRaw('MAX(name) as name')
            ->selectRaw('MAX(sku) as sku')
            ->selectRaw('MAX(category) as category')
            ->selectRaw('MAX(supplier) as supplier')
            ->selectRaw('AVG(cost) as cost')
            ->selectRaw('AVG(profit) as profit')
            ->selectRaw('AVG(sale_price) as sale_price')
            ->selectRaw('SUM(stock) as total_stock')
            ->selectRaw('SUM(reserved) as total_reserved')
            ->selectRaw('SUM(incoming) as total_incoming')
            ->selectRaw('SUM(total_value) as total_value')
            ->selectRaw('MAX(last_updated) as last_updated')
            ->groupBy('product_id')
            ->get();
    }

    /**
     * Get variants for a product
     */
    public static function getVariantsByProductId($productId)
    {
        return self::where('product_id', $productId)->get();
    }

    /**
     * Get low stock items (less than 10 available)
     */
    public static function getLowStock()
    {
        return self::whereRaw('(stock - reserved) < 10')
            ->whereRaw('(stock - reserved) > 0')
            ->get();
    }

    /**
     * Get out of stock items
     */
    public static function getOutOfStock()
    {
        return self::whereRaw('(stock - reserved) <= 0')
            ->where('incoming', '<=', 0)
            ->get();
    }
}