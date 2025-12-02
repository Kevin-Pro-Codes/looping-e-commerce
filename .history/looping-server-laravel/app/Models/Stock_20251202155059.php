<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

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

    /**
     * Get grouped stock by product_id
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
                
                $totalStock = $items->sum('stock');
                $totalReserved = $items->sum('reserved');
                $totalIncoming = $items->sum('incoming');
                $availableStock = $totalStock - $totalReserved;
                
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
                    'total_stock' => $totalStock,
                    'total_reserved' => $totalReserved,
                    'total_incoming' => $totalIncoming,
                    'total_available' => $availableStock,
                    'stock_status' => self::calculateStockStatus($totalStock, $totalReserved),
                    'variants' => $items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'color' => $item->color,
                            'size' => $item->size,
                            'stock' => $item->stock,
                            'reserved' => $item->reserved,
                            'incoming' => $item->incoming,
                            'sku' => $item->sku,
                            'available' => $item->stock - $item->reserved,
                            'stock_status' => self::calculateStockStatus($item->stock, $item->reserved)
                        ];
                    })->values()->toArray()
                ];
            })->values();
    }

    /**
     * Get low stock items (stock - reserved <= 5)
     */
    public static function getLowStock()
    {
        if (!Schema::hasTable('stock')) {
            return collect();
        }

        return self::whereRaw('(stock - reserved) <= 5')
            ->whereRaw('(stock - reserved) > 0')
            ->orderByRaw('(stock - reserved) ASC')
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

        return self::whereRaw('(stock - reserved) <= 0')
            ->orderBy('stock', 'ASC')
            ->get();
    }

    /**
     * Calculate stock status based on available quantity
     */
    public static function calculateStockStatus($stock, $reserved)
    {
        $available = $stock - $reserved;
        
        if ($available <= 0) {
            return 'out_of_stock';
        } elseif ($available <= 5) {
            return 'low_stock';
        } elseif ($available <= 10) {
            return 'medium_stock';
        } else {
            return 'in_stock';
        }
    }

    /**
     * Find stock variant by product attributes
     */
    public static function findVariant($productName, $color = null, $size = null)
    {
        if (!Schema::hasTable('stock')) {
            return null;
        }

        $query = self::where('name', 'like', '%' . $productName . '%');
        
        if ($color) {
            $query->where('color', $color);
        }
        
        if ($size) {
            $query->where('size', $size);
        }
        
        return $query->first();
    }

    /**
     * Reduce stock for a variant (when order is placed)
     */
    public function reduceStock($quantity)
    {
        if (!is_numeric($quantity) || $quantity <= 0) {
            throw new \InvalidArgumentException('Quantity must be a positive number');
        }

        // Check if there's enough stock available
        $available = $this->stock - $this->reserved;
        
        if ($available < $quantity) {
            throw new \Exception("Insufficient stock. Available: {$available}, Requested: {$quantity}");
        }

        // Use database transaction to ensure data integrity
        DB::transaction(function () use ($quantity) {
            $this->decrement('stock', $quantity);
            $this->increment('reserved', $quantity);
            $this->last_updated = now()->format('Y-m-d');
            $this->save();
        });

        return true;
    }

    /**
     * Increase stock (when order is cancelled or returned)
     */
    public function increaseStock($quantity)
    {
        if (!is_numeric($quantity) || $quantity <= 0) {
            throw new \InvalidArgumentException('Quantity must be a positive number');
        }

        // Check if there's enough reserved stock to reverse
        if ($this->reserved < $quantity) {
            throw new \Exception("Insufficient reserved stock. Reserved: {$this->reserved}, Requested to reverse: {$quantity}");
        }

        DB::transaction(function () use ($quantity) {
            $this->increment('stock', $quantity);
            $this->decrement('reserved', $quantity);
            $this->last_updated = now()->format('Y-m-d');
            $this->save();
        });

        return true;
    }

    /**
     * Get available stock quantity
     */
    public function getAvailableAttribute()
    {
        return $this->stock - $this->reserved;
    }

    /**
     * Get stock status
     */
    public function getStatusAttribute()
    {
        return self::calculateStockStatus($this->stock, $this->reserved);
    }

    /**
     * Scope for in stock items
     */
    public function scopeInStock($query)
    {
        return $query->whereRaw('(stock - reserved) > 5');
    }

    /**
     * Scope for low stock items
     */
    public function scopeLowStock($query)
    {
        return $query->whereRaw('(stock - reserved) <= 5')
                     ->whereRaw('(stock - reserved) > 0');
    }

    /**
     * Scope for out of stock items
     */
    public function scopeOutOfStock($query)
    {
        return $query->whereRaw('(stock - reserved) <= 0');
    }

    /**
     * Bulk update stock for multiple variants
     */
    public static function bulkUpdateStock($updates)
    {
        if (!Schema::hasTable('stock')) {
            return false;
        }

        DB::beginTransaction();
        
        try {
            foreach ($updates as $update) {
                $variant = self::find($update['variant_id']);
                
                if ($variant) {
                    if (isset($update['quantity']) && $update['quantity'] > 0) {
                        if ($update['action'] === 'reduce') {
                            $variant->reduceStock($update['quantity']);
                        } elseif ($update['action'] === 'increase') {
                            $variant->increaseStock($update['quantity']);
                        }
                    }
                }
            }
            
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update total value based on current stock and sale price
     */
    public function updateTotalValue()
    {
        $this->total_value = $this->stock * $this->sale_price;
        $this->save();
        
        return $this;
    }

    /**
     * Check if variant has enough stock for an order
     */
    public function hasEnoughStock($quantity)
    {
        return ($this->stock - $this->reserved) >= $quantity;
    }

    /**
     * Get variants that need restocking
     */
    public static function needsRestocking($threshold = 5)
    {
        if (!Schema::hasTable('stock')) {
            return collect();
        }

        return self::whereRaw('(stock - reserved) <= ?', [$threshold])
            ->where('incoming', 0)
            ->orderByRaw('(stock - reserved) ASC')
            ->get();
    }
}