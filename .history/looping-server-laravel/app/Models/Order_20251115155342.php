<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    // Specify the table name
    protected $table = 'orders';

    // Primary key configuration
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';

    // Fields that can be mass assigned
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

    // Data type casting
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

    /**
     * Boot method for model events
     */
    protected static function boot()
    {
        parent::boot();

        // Generate order number if not provided
        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $order->order_number = 'ORD-' . date('Ymd') . '-' . strtoupper(uniqid());
            }
        });
    }

    /**
     * Scope a query to only include pending orders.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include processing orders.
     */
    public function scopeProcessing($query)
    {
        return $query->where('status', 'processing');
    }

    /**
     * Scope a query to only include shipped orders.
     */
    public function scopeShipped($query)
    {
        return $query->where('status', 'shipped');
    }

    /**
     * Get the formatted total attribute.
     */
    public function getFormattedTotalAttribute()
    {
        return 'R$ ' . number_format($this->total, 2, ',', '.');
    }

    /**
     * Get the formatted subtotal attribute.
     */
    public function getFormattedSubtotalAttribute()
    {
        return 'R$ ' . number_format($this->subtotal, 2, ',', '.');
    }

    /**
     * Get the formatted shipping attribute.
     */
    public function getFormattedShippingAttribute()
    {
        return 'R$ ' . number_format($this->shipping, 2, ',', '.');
    }
}