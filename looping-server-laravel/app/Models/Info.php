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
    }
}