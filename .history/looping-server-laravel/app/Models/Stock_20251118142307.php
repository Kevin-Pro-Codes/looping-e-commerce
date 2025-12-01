<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class Stock extends Model
{
    use HasFactory;

    protected $table = 'stock'; // Tabela de estoque
    
    protected $fillable = [
        'product_id', 'name', 'sku', 'category', 'supplier', 'cost',
        'color', 'size', 'stock', 'reserved', 'incoming', 'last_updated'
        // Adicionando 'sale_price' e 'profit' aqui se você adicionar essas colunas na DB
    ];

    protected $casts = [
        'cost' => 'decimal:2',
        'stock' => 'integer',
        'reserved' => 'integer',
        'incoming' => 'integer',
        'last_updated' => 'date'
    ];

    /**
     * Get all stock items grouped by product
     */
    public static function getGroupedStock()
    {
        if (!Schema::hasTable('stock')) {
            return collect();
        }

        return self::orderBy('product_id')
            ->orderBy('color')
            ->orderBy('size')
            ->get()
            ->groupBy('product_id')
            ->map(function ($items, $productId) {
                $firstItem = $items->first();
                
                // Mapeia o campo 'cost' do DB para 'price' no frontend, e calcula profit/sale_price
                $productCost = (float) $firstItem->cost;
                $productProfit = $productCost * 0.6; // Exemplo de cálculo, ajuste conforme sua lógica
                $productSalePrice = $productCost * 1.8; // Exemplo de cálculo, ajuste conforme sua lógica

                return [
                    'id' => $firstItem->id,
                    'product_id' => $productId,
                    'name' => $firstItem->name,
                    'category' => $firstItem->category,
                    'supplier' => $firstItem->supplier,
                    'price' => $productCost, // Mapeado de 'cost'
                    'profit' => $productProfit,
                    'sale_price' => $productSalePrice,
                    'last_updated' => $firstItem->last_updated,
                    'created_at' => $firstItem->created_at?->format('Y-m-d H:i:s'),
                    'updated_at' => $firstItem->updated_at?->format('Y-m-d H:i:s'),
                    'variants' => $items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'color' => $item->color,
                            'size' => $item->size,
                            'stock' => $item->stock,
                            'reserved' => $item->reserved,
                            'incoming' => $item->incoming,
                            'sku' => $item->sku,
                            'available' => $item->stock - $item->reserved
                        ];
                    })->values()->toArray()
                ];
            })->values();
    }

    /**
     * Get low stock items (stock <= 5)
     */
    public static function getLowStock()
    {
        if (!Schema::hasTable('stock')) {
            return collect();
        }

        return self::where('stock', '>', 0)
            ->where('stock', '<=', 5)
            ->get();
    }

    /**
     * Get out of stock items
     */
    public static function getOutOfStock()
    {
        if (!Schema::hasTable('stock')) {
            return collect();
        }

        return self::where('stock', 0)->get();
    }
}