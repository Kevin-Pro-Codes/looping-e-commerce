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

    /**
     * Boot method to handle JSON encoding issues
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

        static::saving(function ($order) {
            // Ensure items are properly encoded before saving
            try {
                if ($order->items && is_array($order->items)) {
                    $order->items = $this->formatItemsWithColorAndSize($order->items);
                }
            } catch (\Exception $e) {
                Log::error('Error encoding items JSON for order ' . $order->id . ': ' . $e->getMessage());
            }
        });
    }

    /**
     * Format items array to ensure color and size are properly structured
     */
    private function formatItemsWithColorAndSize($items)
    {
        return array_map(function ($item) {
            // Ensure each item has consistent color and size fields
            return [
                'product_id' => $item['product_id'] ?? null,
                'product_name' => $item['product_name'] ?? $item['name'] ?? 'Produto',
                'quantity' => $item['quantity'] ?? 1,
                'price' => $item['price'] ?? 0,
                'total' => $item['total'] ?? ($item['price'] ?? 0) * ($item['quantity'] ?? 1),
                'image' => $item['image'] ?? $item['product_image'] ?? null,
                
                // Color fields - consolidate all possible color fields
                'color' => $item['color'] ?? $item['selectedColor'] ?? $item['cor'] ?? $item['variant_color'] ?? 
                          $item['product_variant']['color'] ?? $item['variant']['color'] ?? $item['product']['color'] ?? 
                          ($item['options']['color'] ?? $item['options']['cor'] ?? null) ??
                          $item['attributes']['color'] ?? $item['metadata']['color'] ?? 'Não especificada',
                
                // Size fields - consolidate all possible size fields
                'size' => $item['size'] ?? $item['selectedSize'] ?? $item['tamanho'] ?? $item['variant_size'] ?? 
                         $item['product_variant']['size'] ?? $item['variant']['size'] ?? $item['product']['size'] ?? 
                         ($item['options']['size'] ?? $item['options']['tamanho'] ?? null) ??
                         $item['attributes']['size'] ?? $item['metadata']['size'] ?? 'Não especificado',
                
                // Preserve other fields
                'category' => $item['category'] ?? $item['product_category'] ?? null,
                'description' => $item['description'] ?? $item['product_description'] ?? null,
                'sku' => $item['sku'] ?? $item['product_sku'] ?? null,
                
                // Store original data for reference
                'original_data' => $item
            ];
        }, $items);
    }

    /**
     * Accessor for items to ensure proper format when accessed
     */
    public function getItemsAttribute($value)
    {
        if (is_string($value)) {
            $items = json_decode($value, true);
        } else {
            $items = $value;
        }

        if (!is_array($items)) {
            return [];
        }

        // Ensure each item has the proper structure
        return array_map(function ($item) {
            return [
                'product_id' => $item['product_id'] ?? null,
                'product_name' => $item['product_name'] ?? 'Produto',
                'quantity' => $item['quantity'] ?? 1,
                'price' => floatval($item['price'] ?? 0),
                'total' => floatval($item['total'] ?? 0),
                'image' => $item['image'] ?? null,
                'color' => $item['color'] ?? 'Não especificada',
                'size' => $item['size'] ?? 'Não especificado',
                'category' => $item['category'] ?? null,
                'description' => $item['description'] ?? null,
                'sku' => $item['sku'] ?? null,
                'original_data' => $item['original_data'] ?? $item
            ];
        }, $items);
    }

    /**
     * Mutator for items to ensure proper encoding
     */
    public function setItemsAttribute($value)
    {
        if (is_array($value)) {
            $this->attributes['items'] = json_encode($this->formatItemsWithColorAndSize($value));
        } else {
            $this->attributes['items'] = $value;
        }
    }

    /**
     * Get order items with formatted color and size
     */
    public function getFormattedItems()
    {
        return $this->items;
    }

    /**
     * Check if order has items with specific color
     */
    public function hasColor($color)
    {
        return collect($this->items)->contains('color', $color);
    }

    /**
     * Check if order has items with specific size
     */
    public function hasSize($size)
    {
        return collect($this->items)->contains('size', $size);
    }

    /**
     * Get items grouped by color
     */
    public function getItemsGroupedByColor()
    {
        return collect($this->items)->groupBy('color');
    }

    /**
     * Get items grouped by size
     */
    public function getItemsGroupedBySize()
    {
        return collect($this->items)->groupBy('size');
    }
}