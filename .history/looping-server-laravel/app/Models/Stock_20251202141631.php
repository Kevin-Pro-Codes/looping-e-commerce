<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Stock extends Model
{
    use HasFactory;

    protected $table = 'stock';
    
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
        try {
            // Check if JSON_ARRAYAGG is supported (MySQL 5.7.22+)
            $mysqlVersion = DB::select('SELECT VERSION() as version')[0]->version;
            $supportsJson = version_compare($mysqlVersion, '5.7.22', '>=');
            
            if ($supportsJson) {
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
            } else {
                // Fallback for older MySQL
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
                    ->groupBy('product_id')
                    ->get()
                    ->map(function ($item) {
                        $item->variants = self::where('product_id', $item->product_id)
                            ->get()
                            ->map(function ($variant) {
                                return [
                                    'id' => $variant->id,
                                    'color' => $variant->color,
                                    'size' => $variant->size,
                                    'stock' => $variant->stock,
                                    'reserved' => $variant->reserved,
                                    'incoming' => $variant->incoming,
                                    'available' => $variant->stock - $variant->reserved
                                ];
                            })->toArray();
                        return $item;
                    });
            }
        } catch (\Exception $e) {
            // If anything fails, return simple grouped data
            return self::all()->groupBy('product_id')->map(function ($items, $productId) {
                $firstItem = $items->first();
                return (object) [
                    'product_id' => $productId,
                    'name' => $firstItem->name,
                    'sku' => $firstItem->sku,
                    'category' => $firstItem->category,
                    'supplier' => $firstItem->supplier,
                    'cost' => $firstItem->cost,
                    'profit' => $firstItem->profit,
                    'sale_price' => $firstItem->sale_price,
                    'total_value' => $items->sum('total_value'),
                    'last_updated' => $firstItem->last_updated,
                    'created_at' => $firstItem->created_at,
                    'updated_at' => $firstItem->updated_at,
                    'variants' => $items->map(function ($variant) {
                        return [
                            'id' => $variant->id,
                            'color' => $variant->color,
                            'size' => $variant->size,
                            'stock' => $variant->stock,
                            'reserved' => $variant->reserved,
                            'incoming' => $variant->incoming,
                            'available' => $variant->stock - $variant->reserved
                        ];
                    })->toArray()
                ];
            })->values();
        }
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
     * Get available stock (computed attribute)
     */
    public function getAvailableAttribute()
    {
        return $this->stock - $this->reserved;
    }
}