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
        'items' => 'array',
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

        // Store original payment_status before saving
        static::updating(function ($info) {
            $info->originalPaymentStatus = $info->getOriginal('payment_status');
        });

        // Auto-sync stock after order is saved/updated with payment_status='paid'
        static::saved(function ($info) {
            // Only sync if payment_status is 'paid'
            if ($info->payment_status === 'paid') {
                // Parse metadata to check if already synced
                $metadata = is_array($info->metadata) 
                    ? $info->metadata 
                    : (json_decode($info->metadata ?? '{}', true) ?? []);
                
                // Check if already synced
                if (!isset($metadata['stock_synced_at'])) {
                    // Check if payment_status just changed to 'paid' or was created as 'paid'
                    $oldStatus = $info->originalPaymentStatus ?? null;
                    $statusChanged = ($oldStatus !== 'paid');
                    $wasCreated = $info->wasRecentlyCreated;
                    
                    if ($statusChanged || $wasCreated) {
                        Log::info('Auto-syncing stock for paid order (Info model)', [
                            'info_id' => $info->id,
                            'order_number' => $info->order_number,
                            'payment_method' => $info->payment_method,
                            'status_changed' => $statusChanged,
                            'was_created' => $wasCreated
                        ]);
                        
                        // Sync stock asynchronously to avoid blocking
                        try {
                            // Use afterResponse to run after HTTP response is sent
                            dispatch(function () use ($info) {
                                $controller = app(\App\Http\Controllers\OrderController::class);
                                $controller->syncStock($info->id);
                            })->afterResponse();
                        } catch (\Exception $e) {
                            Log::warning('Failed to dispatch stock sync (Info model): ' . $e->getMessage());
                        }
                    }
                }
            }
        });
    }
}