<?php

namespace App\Services;

use App\Models\Stock;
use App\Models\Info;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StockService
{
    /**
     * ✅ Deduct stock for a paid order
     */
    public function deductStockFromOrder(Info $order): bool
    {
        try {
            Log::info('=== DEDUCT STOCK FROM ORDER START ===', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'payment_status' => $order->payment_status,
                'stock_updated_before' => $order->stock_updated
            ]);

            // If stock already updated, return true
            if ($order->stock_updated) {
                Log::info('Stock already deducted for order');
                return true;
            }

            // Only deduct stock for paid orders
            if ($order->payment_status !== 'paid') {
                Log::warning('Cannot deduct stock for unpaid order');
                return false;
            }

            $items = $order->parsed_items;
            if (empty($items)) {
                Log::warning('No items in order');
                return false;
            }

            DB::beginTransaction();

            // Check all items have enough stock first
            foreach ($items as $item) {
                if (!$this->checkItemStockAvailability($item)) {
                    throw new \Exception("Insufficient stock for: " . ($item['product_name'] ?? 'Unknown'));
                }
            }

            // Deduct stock for each item
            foreach ($items as $item) {
                $this->deductItemStock($item);
            }

            // Mark order as having stock deducted
            $order->stock_updated = true;
            $order->stock_updated_at = now();
            $order->save();

            DB::commit();

            Log::info('=== STOCK DEDUCTION COMPLETE ===', [
                'order_id' => $order->id,
                'items_count' => count($items),
                'stock_updated' => $order->stock_updated,
                'stock_updated_at' => $order->stock_updated_at
            ]);

            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('=== STOCK DEDUCTION FAILED ===', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }

    /**
     * ✅ Check if item has enough stock
     */
    private function checkItemStockAvailability(array $item): bool
    {
        $productName = $item['product_name'] ?? null;
        $quantity = $item['quantity'] ?? 0;
        $color = $item['color'] ?? null;
        $size = $item['size'] ?? null;

        if (!$productName || $quantity <= 0) {
            return false;
        }

        $stock = $this->findStockItem($productName, $color, $size);
        
        if (!$stock) {
            Log::warning('Stock item not found', [
                'product_name' => $productName,
                'color' => $color,
                'size' => $size
            ]);
            return false;
        }

        $available = $stock->stock >= $quantity;
        
        if (!$available) {
            Log::warning('Insufficient stock', [
                'product_name' => $productName,
                'required' => $quantity,
                'available' => $stock->stock
            ]);
        }

        return $available;
    }

    /**
     * ✅ Deduct stock for a single item
     */
    private function deductItemStock(array $item): void
    {
        $productName = $item['product_name'] ?? null;
        $quantity = $item['quantity'] ?? 0;
        $color = $item['color'] ?? null;
        $size = $item['size'] ?? null;

        if (!$productName || $quantity <= 0) {
            return;
        }

        $stock = $this->findStockItem($productName, $color, $size);
        
        if (!$stock) {
            throw new \Exception("Stock not found for product: {$productName}");
        }

        // Deduct from available stock
        $stock->decrement('stock', $quantity);
        $stock->last_updated = now()->format('Y-m-d');
        $stock->save();

        Log::info('Stock deducted for item', [
            'stock_id' => $stock->id,
            'product_name' => $productName,
            'quantity' => $quantity,
            'remaining_stock' => $stock->stock,
            'color' => $color,
            'size' => $size
        ]);
    }
    
    /**
     * ✅ Restore stock for cancelled/refunded orders
     */
    public function restoreStockForOrder(Info $order): bool
    {
        try {
            Log::info('=== RESTORE STOCK FOR ORDER START ===', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'payment_status' => $order->payment_status,
                'stock_updated_before' => $order->stock_updated
            ]);

            // Only restore if stock was previously deducted
            if (!$order->stock_updated) {
                Log::info('Stock was not deducted for this order, nothing to restore');
                return true;
            }

            $items = $order->parsed_items;
            if (empty($items)) {
                return false;
            }

            DB::beginTransaction();

            // Restore stock for each item
            foreach ($items as $item) {
                $this->restoreItemStock($item);
            }

            // Mark order as having stock restored
            $order->stock_updated = false;
            $order->stock_updated_at = null;
            $order->save();

            DB::commit();

            Log::info('=== STOCK RESTORATION COMPLETE ===', [
                'order_id' => $order->id,
                'items_count' => count($items),
                'stock_updated' => $order->stock_updated
            ]);

            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('=== STOCK RESTORATION FAILED ===', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * ✅ Restore stock for a single item
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

        $stock = $this->findStockItem($productName, $color, $size);
        
        if (!$stock) {
            Log::warning('Stock item not found when restoring', [
                'product_name' => $productName,
                'color' => $color,
                'size' => $size
            ]);
            return;
        }

        // Restore to available stock
        $stock->increment('stock', $quantity);
        $stock->last_updated = now()->format('Y-m-d');
        $stock->save();

        Log::info('Stock restored for item', [
            'stock_id' => $stock->id,
            'product_name' => $productName,
            'quantity' => $quantity,
            'new_stock' => $stock->stock
        ]);
    }

    /**
     * ✅ Find stock item by name, color, and size
     */
    private function findStockItem(string $productName, ?string $color, ?string $size): ?Stock
    {
        $stock = Stock::where('name', $productName)
            ->when($color && $color !== 'Não especificada', function($query) use ($color) {
                return $query->where('color', $color);
            })
            ->when($size && $size !== 'Não especificado', function($query) use ($size) {
                return $query->where('size', $size);
            })
            ->first();

        // Fallback: Try without color/size
        if (!$stock) {
            $stock = Stock::where('name', $productName)->first();
        }

        return $stock;
    }

    /**
     * ✅ Check stock availability for multiple items
     */
    public function checkStockAvailability(array $items): array
    {
        $results = [];

        foreach ($items as $key => $item) {
            $productName = $item['product_name'] ?? null;
            $quantity = $item['quantity'] ?? 0;
            $color = $item['color'] ?? null;
            $size = $item['size'] ?? null;

            $result = [
                'product_name' => $productName,
                'requested_quantity' => $quantity,
                'color' => $color,
                'size' => $size,
                'available' => false,
                'available_stock' => 0,
                'message' => ''
            ];

            if (!$productName || $quantity <= 0) {
                $result['message'] = 'Invalid product data';
                $results[$key] = $result;
                continue;
            }

            $stock = $this->findStockItem($productName, $color, $size);

            if (!$stock) {
                $result['message'] = 'Product not found in stock';
            } else {
                $result['available_stock'] = $stock->stock;
                $result['available'] = $stock->stock >= $quantity;
                $result['message'] = $result['available'] 
                    ? 'Stock available' 
                    : "Insufficient stock. Available: {$stock->stock}, Requested: {$quantity}";
                $result['stock_id'] = $stock->id;
            }

            $results[$key] = $result;
        }

        return $results;
    }

    /**
     * ✅ Get all products with low stock
     */
    public function getLowStockProducts(int $threshold = 5): array
    {
        return Stock::where('stock', '>', 0)
            ->where('stock', '<=', $threshold)
            ->get()
            ->map(function ($stock) {
                return [
                    'id' => $stock->id,
                    'name' => $stock->name,
                    'color' => $stock->color,
                    'size' => $stock->size,
                    'stock' => $stock->stock,
                    'sale_price' => $stock->sale_price
                ];
            })
            ->toArray();
    }
}