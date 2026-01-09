<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class Order extends Model
{
    use HasFactory;

    protected $table = 'orders';

    protected $fillable = [
        'order_number',
        'customer_name',
        'customer_email',
        'customer_phone',
        'customer_cpf',
        'total',
        'subtotal',
        'shipping',
        'discount',
        'payment_method',
        'payment_status',
        'stock_updated',           // ✅ TRACKS IF STOCK WAS DEDUCTED
        'status',
        'shipping_street',
        'shipping_number',
        'shipping_complement',
        'shipping_neighborhood',
        'shipping_city',
        'shipping_state',
        'shipping_zip_code',
        'items',
        'pix_data',
        'metadata'
    ];

    protected $casts = [
        'total' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'shipping' => 'decimal:2',
        'discount' => 'decimal:2',
        'items' => 'array',
        'pix_data' => 'array',
        'metadata' => 'array',
        'stock_updated' => 'boolean',  // ✅ Cast as boolean
        'created_at' => 'datetime',
    ];

    /**
     * Boot method to handle JSON encoding issues
     */
    protected static function boot()
    {
        parent::boot();

        static::retrieved(function ($order) {
            // Ensure JSON fields are properly handled
            try {
                if ($order->items && is_string($order->items)) {
                    $order->items = json_decode($order->items, true);
                }
                if ($order->pix_data && is_string($order->pix_data)) {
                    $order->pix_data = json_decode($order->pix_data, true);
                }
                if ($order->metadata && is_string($order->metadata)) {
                    $order->metadata = json_decode($order->metadata, true);
                }
            } catch (\Exception $e) {
                Log::error('Error decoding JSON fields for order ' . $order->id . ': ' . $e->getMessage());
            }
        });
    }

    /**
     * ✅ Check if stock needs to be updated
     */
    public function needsStockUpdate(): bool
    {
        return $this->payment_status === 'paid' && !($this->stock_updated ?? false);
    }

    /**
     * ✅ Check if order is eligible for stock deduction
     */
    public function canDeductStock(): bool
    {
        return in_array($this->payment_status, ['paid']) 
            && !in_array($this->status, ['cancelled', 'refunded'])
            && !($this->stock_updated ?? false);
    }

    /**
     * ✅ Check if order should restore stock
     */
    public function shouldRestoreStock(): bool
    {
        return ($this->payment_status === 'refunded' || $this->status === 'cancelled')
            && ($this->stock_updated ?? false);
    }

    /**
     * ✅ Scope for orders that need stock update
     */
    public function scopeNeedsStockUpdate($query)
    {
        return $query->where('payment_status', 'paid')
                     ->where(function($query) {
                         $query->whereNull('stock_updated')
                               ->orWhere('stock_updated', false);
                     });
    }

    /**
     * ✅ Scope for paid orders
     */
    public function scopePaid($query)
    {
        return $query->where('payment_status', 'paid');
    }

    /**
     * ✅ Get parsed items with quantities
     */
    public function getParsedItemsAttribute(): array
    {
        if (is_array($this->items)) {
            return $this->items;
        }

        if (is_string($this->items)) {
            return json_decode($this->items, true) ?? [];
        }

        return [];
    }

    /**
     * ✅ Get total quantity of items in order
     */
    public function getTotalQuantityAttribute(): int
    {
        $total = 0;
        foreach ($this->parsed_items as $item) {
            $total += $item['quantity'] ?? 0;
        }
        return $total;
    }

    /**
     * ✅ Deduct stock using OrderStockService
     */
    public function deductStock(): bool
    {
        $stockService = new \App\Services\OrderStockService();
        return $stockService->deductStockFromOrder($this);
    }

    /**
     * ✅ Restore stock using OrderStockService
     */
    public function restoreStock(): bool
    {
        $stockService = new \App\Services\OrderStockService();
        return $stockService->restoreStockForOrder($this);
    }
}