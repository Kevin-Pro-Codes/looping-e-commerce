<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class Order extends Model
{
    use HasFactory;

    protected $table = 'infos';

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
        'stock_updated',           // ✅ ADDED - TRACKS IF STOCK WAS DEDUCTED
        'stock_updated_at',        // ✅ ADDED - WHEN STOCK WAS DEDUCTED
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
        'stock_updated' => 'boolean',  // ✅ ADDED - Cast as boolean
        'items' => 'array',
        'pix_data' => 'array',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'stock_updated_at' => 'datetime',  // ✅ ADDED - Cast as datetime
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
     * ✅ ADDED: Check if stock needs to be updated
     */
    public function needsStockUpdate(): bool
    {
        return $this->payment_status === 'paid' && !$this->stock_updated;
    }

    /**
     * ✅ ADDED: Mark stock as updated
     */
    public function markStockAsUpdated(): void
    {
        $this->stock_updated = true;
        $this->stock_updated_at = now();
        $this->save();
    }

    /**
     * ✅ ADDED: Check if order is eligible for stock deduction
     */
    public function canDeductStock(): bool
    {
        return in_array($this->payment_status, ['paid']) 
            && !in_array($this->status, ['cancelled', 'refunded'])
            && !$this->stock_updated;
    }

    /**
     * ✅ ADDED: Get parsed items with quantities
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
}