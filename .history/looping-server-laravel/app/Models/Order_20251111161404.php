<?php
// app/Models/Order.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'customer_name',
        'customer_email',
        'customer_cpf',
        'total_amount',
        'payment_method',
        'payment_status',
        'status',
        'stripe_payment_intent_id',
        'metadata'
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'metadata' => 'array'
    ];

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }
}