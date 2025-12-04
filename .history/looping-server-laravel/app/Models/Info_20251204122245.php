<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class Info extends Model
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
        'stock_updated',           // ✅ ADDED
        'stock_updated_at',        // ✅ ADDED
        'status',
        'shipping_street',
        'shipping_number',
        'shipping_complement',
        'shipping_neighborhood',
        'shipping_city',
        'shipping_state',
        'shipping_zip_code',
        'items',       
        'metadata'
    ];

    protected $casts = [
        'total' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'shipping' => 'decimal:2',
        'discount' => 'decimal:2',
        'stock_updated' => 'boolean',  // ✅ ADDED
        'stock_updated_at' => 'datetime',  // ✅ ADDED
        'items' => 'array',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
       
    ];

    /**
     * Boot method to handle JSON encoding issues
     */
    protected static function boot()
    {
        parent::boot();

        static::retrieved(function ($info) {
            // Ensure JSON fields are properly handled
            try {
                if ($info->items && is_string($info->items)) {
                    $info->items = json_decode($info->items, true);
                }
            
                if ($info->metadata && is_string($info->metadata)) {
                    $info->metadata = json_decode($info->metadata, true);
                }
            } catch (\Exception $e) {
                Log::error('Error decoding JSON fields for info ' . $info->id . ': ' . $e->getMessage());
            }
        });

        // ✅ OPTIONAL: Add this to automatically update stock when payment status changes
        static::updated(function ($info) {
            // You can add stock synchronization logic here if you want
            // but it's better to handle it in the controller or service
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
     * ✅ ADDED: Scope for orders that need stock update
     */
    public function scopeNeedsStockUpdate($query)
    {
        return $query->where('payment_status', 'paid')
                     ->where('stock_updated', false);
    }

    /**
     * ✅ ADDED: Scope for paid orders
     */
    public function scopePaid($query)
    {
        return $query->where('payment_status', 'paid');
    }

    /**
     * ✅ ADDED: Get items array with proper parsing
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