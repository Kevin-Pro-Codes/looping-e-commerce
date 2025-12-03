<?php

namespace App\Services;

use App\Models\Stock;
use App\Models\Info;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StockService
{
    /**
     * Deduct stock for an order
     */
    public function deductStockFromOrder(Info $order): bool
    {
        try {
            // If stock already updated, return true
            if ($order->stock_updated) {
                Log::info('Stock already deducted for order:', ['order_id' => $order->id]);
                return true;
            }

            // Only deduct stock for paid orders
            if ($order->payment_status !== 'paid') {
                Log::warning('Cannot deduct stock for unpaid order:', [
                    'order_id' => $order->id,
                    'payment_status' => $order->payment_status
                ]);
                return false;
            }

            $items = $order->items;
            if (empty($items)) {
                Log::warning('No items in order:', ['order_id' => $order->id]);
                return false;
            }

            DB::beginTransaction();

            foreach ($items as $item) {
                $this->deductItemStock($item);
            }

            // Mark the order as having stock deducted
            $order->stock_updated = true;
            $order->stock_updated_at = now();
            $order->save();

            DB::commit();

            Log::info('Stock deducted successfully for order:', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'items_count' => count($items)
            ]);

            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to deduct stock for order:', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }

    /**
     * Deduct stock for a single item
     */
    private function deductItemStock(array $item): void
    {
        // Get product details from the item
        $productName = $item['product_name'] ?? null;
        $quantity = $item['quantity'] ?? 0;
        $color = $item['color'] ?? null;
        $size = $item['size'] ?? null;

        if (!$productName || $quantity <= 0) {
            Log::warning('Invalid item data for stock deduction:', $item);
            return;
        }

        // Find the stock record based on product name, color, and size
        $stock = Stock::where('name', $productName)
            ->when($color && $color !== 'Não especificada', function($query) use ($color) {
                return $query->where('color', $color);
            })
            ->when($size && $size !== 'Não especificado', function($query) use ($size) {
                return $query->where('size', $size);
            })
            ->first();

        if (!$stock) {
            // Try to find without color/size if they're null or unspecified
            $stock = Stock::where('name', $productName)->first();
            
            if (!$stock) {
                Log::warning('Stock record not found for product:', [
                    'product_name' => $productName,
                    'color' => $color,
                    'size' => $size
                ]);
                return;
            }
        }

        // Check if enough stock is available
        $availableStock = $stock->stock - $stock->reserved;
        
        if ($availableStock < $quantity) {
            throw new \Exception("Insufficient stock for product: {$productName}. Available: {$availableStock}, Requested: {$quantity}");
        }

        // Update the stock
        $stock->decrement('stock', $quantity);
        $stock->last_updated = now()->format('Y-m-d');
        $stock->save();

        Log::info('Stock deducted for item:', [
            'product_name' => $productName,
            'quantity' => $quantity,
            'color' => $color,
            'size' => $size,
            'remaining_stock' => $stock->stock,
            'stock_id' => $stock->id
        ]);
    }

    /**
     * Restore stock (for cancelled orders or refunds)
     */
    public function restoreStockForOrder(Info $order): bool
    {
        try {
            // Only restore stock if it was previously deducted
            if (!$order->stock_updated) {
                return true;
            }

            $items = $order->items;
            if (empty($items)) {
                return false;
            }

            DB::beginTransaction();

            foreach ($items as $item) {
                $this->restoreItemStock($item);
            }

            // Mark the order as having stock restored
            $order->stock_updated = false;
            $order->stock_updated_at = null;
            $order->save();

            DB::commit();

            Log::info('Stock restored for order:', [
                'order_id' => $order->id,
                'order_number' => $order->order_number
            ]);

            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to restore stock for order:', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Restore stock for a single item
     */
    private function restoreItemStock(array $item): void
    {
        $productName = $item['product_name'] ?? null;
        $quantity = $item['quantity'] ?? 0;
        $color = $item['color'] ?? null;
        $size = $item['size'] ?? null;

        if (!$productName || $quantity <= 0) {
            return;
        }

        $stock = Stock::where('name', $productName)
            ->when($color && $color !== 'Não especificada', function($query) use ($color) {
                return $query->where('color', $color);
            })
            ->when($size && $size !== 'Não especificado', function($query) use ($size) {
                return $query->where('size', $size);
            })
            ->first();

        if (!$stock) {
            $stock = Stock::where('name', $productName)->first();
            
            if (!$stock) {
                return;
            }
        }

        // Restore the stock
        $stock->increment('stock', $quantity);
        $stock->last_updated = now()->format('Y-m-d');
        $stock->save();

        Log::info('Stock restored for item:', [
            'product_name' => $productName,
            'quantity' => $quantity,
            'stock_id' => $stock->id
        ]);
    }

    /**
     * Check stock availability before placing order
     */
    public function checkStockAvailability(array $items): array
    {
        $results = [];
        
        foreach ($items as $key => $item) {
            $productName = $item['product_name'] ?? null;
            $quantity = $item['quantity'] ?? 0;
            $color = $item['color'] ?? null;
            $size = $item['size'] ?? null;

            if (!$productName || $quantity <= 0) {
                $results[$key] = [
                    'available' => false,
                    'message' => 'Invalid item data'
                ];
                continue;
            }

            $stock = Stock::where('name', $productName)
                ->when($color && $color !== 'Não especificada', function($query) use ($color) {
                    return $query->where('color', $color);
                })
                ->when($size && $size !== 'Não especificado', function($query) use ($size) {
                    return $query->where('size', $size);
                })
                ->first();

            if (!$stock) {
                $stock = Stock::where('name', $productName)->first();
            }

            if (!$stock) {
                $results[$key] = [
                    'available' => false,
                    'message' => 'Product not found in stock'
                ];
                continue;
            }

            $availableStock = $stock->stock - $stock->reserved;
            
            $results[$key] = [
                'available' => $availableStock >= $quantity,
                'available_stock' => $availableStock,
                'requested' => $quantity,
                'product_name' => $productName,
                'stock_id' => $stock->id,
                'color' => $stock->color,
                'size' => $stock->size
            ];
        }

        return $results;
    }
}