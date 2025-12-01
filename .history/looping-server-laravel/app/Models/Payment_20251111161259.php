<?php
// app/Models/Payment.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'stripe_payment_intent_id',
        'order_id',
        'order_reference',
        'amount',
        'currency',
        'payment_method',
        'status',
        'customer_name',
        'customer_email',
        'customer_cpf',
        'pix_qr_code',
        'pix_code',
        'expires_at',
        'paid_at',
        'metadata'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'expires_at' => 'datetime',
        'paid_at' => 'datetime',
        'metadata' => 'array'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function isExpired()
    {
        return $this->expires_at->isPast();
    }

    public function isPending()
    {
        return $this->status === 'pending' && !$this->isExpired();
    }
}