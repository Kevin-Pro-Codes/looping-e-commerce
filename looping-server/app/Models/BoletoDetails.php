<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BoletoDetails extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'payer_name',
        'payer_cpf',
        'barcode',
        'pdf_url',
        'transaction_id',
        'amount',
        'status',
    ];

    /**
     * Get the order that owns the boleto details.
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
