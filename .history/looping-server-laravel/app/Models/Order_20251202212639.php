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
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Store original payment_status to detect changes
    protected $originalPaymentStatus;

    /**
     * Boot method to handle JSON encoding issues and auto-sync stock
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

        // Store original payment_status before saving
        static::updating(function ($order) {
            $order->originalPaymentStatus = $order->getOriginal('payment_status');
        });

        // Auto-sync stock after order is saved/updated with payment_status='paid'
        static::saved(function ($order) {
            // Only sync if payment_status is 'paid' and wasn't already synced
            if ($order->payment_status === 'paid') {
                $metadata = is_array($order->metadata) ? $order->metadata : (json_decode($order->metadata ?? '{}', true) ?? []);
                
                // Check if already synced
                if (!isset($metadata['stock_synced_at'])) {
                    // Check if payment_status just changed to 'paid'
                    $shouldSync = false;
                    
                    if ($order->originalPaymentStatus !== 'paid') {
                        // Payment status changed to 'paid'
                        $shouldSync = true;
                    } elseif (!$order->exists || $order->wasRecentlyCreated) {
                        // New order created with payment_status='paid'
                        $shouldSync = true;
                    }
                    
                    if ($shouldSync) {
                        Log::info('Auto-syncing stock for paid order', [
                            'order_id' => $order->id,
                            'order_number' => $order->order_number,
                            'payment_method' => $order->payment_method
                        ]);
                        
                        // Dispatch stock sync (non-blocking)
                        try {
                            dispatch(function () use ($order) {
                                app(\App\Http\Controllers\OrderController::class)->syncStock($order->id);
                            })->afterResponse();
                        } catch (\Exception $e) {
                            Log::error('Failed to dispatch stock sync: ' . $e->getMessage());
                            // Fallback: try direct sync if dispatch fails
                            try {
                                app(\App\Http\Controllers\OrderController::class)->syncStock($order->id);
                            } catch (\Exception $e2) {
                                Log::error('Failed to sync stock directly: ' . $e2->getMessage());
                            }
                        }
                    }
                }
            }
        });
    }
}