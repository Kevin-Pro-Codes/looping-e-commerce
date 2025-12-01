<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PixDetails extends Model
{
    use HasFactory;

    protected $table = 'pix_details';

    // Only include fields that exist in your table
    protected $fillable = [
        'order_id',
        'payer_name',
        'payer_cpf',
        'pix_key',
        'qr_code',
        'transaction_id',
        'amount',
        'status',
        // NO expires_at here
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the order that owns the PIX details.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }
}