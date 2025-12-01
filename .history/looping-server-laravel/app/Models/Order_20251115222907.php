<?php

// app/Models/Order.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'order_id', 'customer_name', 'customer_email', 'customer_phone', 'customer_cpf',
        'status', 'payment_method', 'payment_status',
        'subtotal', 'shipping_cost', 'discount', 'total',
        'shipping_street', 'shipping_number', 'shipping_complement',
        'shipping_hood', 'shipping_city', 'shipping_state', 'shipping_cep',
        'shipping_method', 'shipping_company', 'shipping_price',
        'items', 'raw_data'
    ];

    protected $casts = [
        'items' => 'array',
        'raw_data' => 'array',
    ];
}