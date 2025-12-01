<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class Stock extends Model
{
    use HasFactory;

    // ✅ Definir o nome da tabela explicitamente
    protected $table = 'stock';
    
    protected $fillable = [
        'product_id', 'name', 'sku', 'category', 'supplier', 'cost',
        'profit', 'sale_price', 'total_value', 'profit_margin', 'sale_markup',
        'color', 'size', 'stock', 'reserved', 'incoming', 'last_updated'
    ];

    protected $casts = [
        'cost' => 'decimal:2',
        'profit' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'total_value' => 'decimal:2',
        'profit_margin' => 'decimal:2',
        'sale_markup' => 'decimal:2',
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
        // Verifica se a tabela existe
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
                    'stock_value' => (float) $firstItem->total_value,
                    'profit_margin' => (float) $firstItem->profit_margin,
                    'sale_markup' => (float) $firstItem->sale_markup,
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

    /**
     * Get low stock items (stock <= 5)
     */
    public static function getLowStock()
    {
        if (!Schema::hasTable('stock')) {
            return collect();
        }

        return self::where('stock', '>', 0)
            ->where('stock', '<=', 5)
            ->get();
    }

    /**
     * Get out of stock items
     */
    public static function getOutOfStock()
    {
        if (!Schema::hasTable('stock')) {
            return collect();
        }

        return self::where('stock', 0)->get();
    }

    /**
     * Update prices for all variants of a product
     */
    public static function updateProductPrices($productId, $priceData)
    {
        if (!Schema::hasTable('stock')) {
            return false;
        }

        return self::where('product_id', $productId)->update([
            'cost' => $priceData['cost'],
            'profit' => $priceData['profit'],
            'sale_price' => $priceData['sale_price'],
            'total_value' => $priceData['total_value'],
            'last_updated' => now()->format('Y-m-d')
        ]);
    }

    /**
     * Calculate and update total value based on stock and sale price
     */
    public function updateTotalValue()
    {
        $this->total_value = $this->stock * $this->sale_price;
        $this->save();
    }

    /**
     * Calculate profit margin percentage
     */
    public function getProfitMarginPercentageAttribute()
    {
        if ($this->cost > 0) {
            return (($this->sale_price - $this->cost) / $this->cost) * 100;
        }
        return 0;
    }

    /**
     * Calculate absolute profit
     */
    public function getAbsoluteProfitAttribute()
    {
        return $this->sale_price - $this->cost;
    }

    /**
     * Scope query to search products
     */
    public function scopeSearch($query, $search)
    {
        return $query->where('name', 'like', "%{$search}%")
                    ->orWhere('product_id', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
    }

    /**
     * Scope query by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope query by supplier
     */
    public function scopeBySupplier($query, $supplier)
    {
        return $query->where('supplier', $supplier);
    }

    /**
     * Get total inventory value
     */
    public static function getTotalInventoryValue()
    {
        if (!Schema::hasTable('stock')) {
            return 0;
        }

        return self::sum(\DB::raw('stock * sale_price'));
    }

    /**
     * Get total cost value
     */
    public static function getTotalCostValue()
    {
        if (!Schema::hasTable('stock')) {
            return 0;
        }

        return self::sum(\DB::raw('stock * cost'));
    }

    /**
     * Get total profit value
     */
    public static function getTotalProfitValue()
    {
        if (!Schema::hasTable('stock')) {
            return 0;
        }

        return self::sum(\DB::raw('stock * (sale_price - cost)'));
    }

    /**
     * Get products with low stock (stock <= 5)
     */
    public static function getLowStockAlerts()
    {
        if (!Schema::hasTable('stock')) {
            return collect();
        }

        return self::where('stock', '<=', 5)
                  ->where('stock', '>', 0)
                  ->orderBy('stock', 'asc')
                  ->get();
    }

    /**
     * Get products that are out of stock
     */
    public static function getOutOfStockAlerts()
    {
        if (!Schema::hasTable('stock')) {
            return collect();
        }

        return self::where('stock', 0)
                  ->orderBy('name')
                  ->get();
    }

    /**
     * Get incoming stock items
     */
    public static function getIncomingStock()
    {
        if (!Schema::hasTable('stock')) {
            return collect();
        }

        return self::where('incoming', '>', 0)
                  ->orderBy('incoming', 'desc')
                  ->get();
    }

    /**
     * Receive incoming stock for a specific item
     */
    public function receiveIncomingStock()
    {
        if ($this->incoming > 0) {
            $this->stock += $this->incoming;
            $this->incoming = 0;
            $this->last_updated = now()->format('Y-m-d');
            $this->save();
        }
    }

    /**
     * Add incoming stock
     */
    public function addIncomingStock($quantity)
    {
        $this->incoming += $quantity;
        $this->last_updated = now()->format('Y-m-d');
        $this->save();
    }

    /**
     * Update stock quantity
     */
    public function updateStock($newStock)
    {
        $this->stock = max(0, $newStock);
        $this->last_updated = now()->format('Y-m-d');
        $this->save();
    }

    /**
     * Reserve stock
     */
    public function reserveStock($quantity)
    {
        $available = $this->stock - $this->reserved;
        if ($available >= $quantity) {
            $this->reserved += $quantity;
            $this->save();
            return true;
        }
        return false;
    }

    /**
     * Release reserved stock
     */
    public function releaseReservedStock($quantity)
    {
        $this->reserved = max(0, $this->reserved - $quantity);
        $this->save();
    }

    /**
     * Get available stock (stock - reserved)
     */
    public function getAvailableStockAttribute()
    {
        return $this->stock - $this->reserved;
    }

    /**
     * Check if product is in stock
     */
    public function getIsInStockAttribute()
    {
        return $this->available_stock > 0;
    }

    /**
     * Check if product is low stock
     */
    public function getIsLowStockAttribute()
    {
        return $this->stock > 0 && $this->stock <= 5;
    }

    /**
     * Check if product has incoming stock
     */
    public function getHasIncomingStockAttribute()
    {
        return $this->incoming > 0;
    }

    /**
     * Get stock status
     */
    public function getStockStatusAttribute()
    {
        if ($this->stock === 0 && $this->incoming === 0) {
            return 'Sem Estoque';
        } elseif ($this->stock === 0 && $this->incoming > 0) {
            return 'Estoque em Chegada';
        } elseif ($this->stock > 0 && $this->stock <= 5) {
            return 'Baixo Estoque';
        } else {
            return 'Em Estoque';
        }
    }

    /**
     * Get stock status color
     */
    public function getStockStatusColorAttribute()
    {
        switch ($this->stock_status) {
            case 'Em Estoque':
                return 'green';
            case 'Baixo Estoque':
                return 'yellow';
            case 'Estoque em Chegada':
                return 'blue';
            case 'Sem Estoque':
                return 'red';
            default:
                return 'gray';
        }
    }
}