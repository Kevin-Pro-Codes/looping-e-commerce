<?php

namespace App\Services;

use App\Models\Stock;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderStockService
{
    /**
     * Deduct stock for a paid order
     */
    public function deductStockFromOrder($order): bool
    {
        try {
            Log::info('=== DEDUCT STOCK FROM ORDER START ===', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'payment_status' => $order->payment_status,
                'stock_updated' => $order->stock_updated ?? false,
                'order_type' => get_class($order)
            ]);

            // If stock already updated, return true
            if ($order->stock_updated ?? false) {
                Log::info('Stock already deducted for order');
                return true;
            }

            // Only deduct stock for paid orders
            if ($order->payment_status !== 'paid') {
                Log::warning('Cannot deduct stock for unpaid order');
                return false;
            }

            $items = $this->getOrderItems($order);
            Log::info('Order items retrieved', ['items_count' => count($items), 'items' => $items]);
            
            if (empty($items)) {
                Log::warning('No items in order');
                return false;
            }

            DB::beginTransaction();

            // Check all items have enough stock first
            foreach ($items as $index => $item) {
                Log::info("Checking item {$index}", $item);
                if (!$this->checkItemStockAvailability($item)) {
                    throw new \Exception("Insufficient stock for: " . ($item['product_name'] ?? 'Unknown'));
                }
            }

            // Deduct stock for each item
            foreach ($items as $index => $item) {
                Log::info("Deducting item {$index}", $item);
                $this->deductItemStock($item);
            }

            // Mark order as having stock deducted
            $order->stock_updated = true;
            $order->save();

            DB::commit();

            Log::info('=== STOCK DEDUCTION COMPLETE ===', [
                'order_id' => $order->id,
                'items_count' => count($items),
                'stock_updated' => $order->stock_updated
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
     * Restore stock for cancelled/refunded orders
     */
    public function restoreStockForOrder($order): bool
    {
        try {
            Log::info('=== RESTORE STOCK FOR ORDER START ===', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'payment_status' => $order->payment_status,
                'stock_updated' => $order->stock_updated ?? false
            ]);

            // Only restore if stock was previously deducted
            if (!($order->stock_updated ?? false)) {
                Log::info('Stock was not deducted for this order, nothing to restore');
                return true;
            }

            $items = $this->getOrderItems($order);
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
     * Get order items from JSON column
     */
    private function getOrderItems($order): array
    {
        $items = $order->items;
        
        if (is_string($items)) {
            $items = json_decode($items, true);
        }
        
        return is_array($items) ? $items : [];
    }

    /**
     * Check if item has enough stock
     */
    private function checkItemStockAvailability(array $item): bool
    {
        $productName = $item['product_name'] ?? null;
        $productId = $item['product_id'] ?? null;
        $quantity = $item['quantity'] ?? 0;
        $color = $item['color'] ?? null;
        $size = $item['size'] ?? null;

        if (!$productName || $quantity <= 0) {
            return false;
        }

        $stock = $this->findStockItem($productName, $color, $size, $productId);
        
        if (!$stock) {
            Log::warning('Stock item not found', [
                'product_name' => $productName,
                'product_id' => $productId,
                'color' => $color,
                'size' => $size
            ]);
            return false;
        }

        $available = $stock->stock >= $quantity;
        
        if (!$available) {
            Log::warning('Insufficient stock', [
                'product_name' => $productName,
                'product_id' => $productId,
                'required' => $quantity,
                'available' => $stock->stock
            ]);
        }

        return $available;
    }

    /**
     * Deduct stock for a single item
     */
    private function deductItemStock(array $item): void
    {
        $productName = $item['product_name'] ?? null;
        $productId = $item['product_id'] ?? null;
        $quantity = $item['quantity'] ?? 0;
        $color = $item['color'] ?? null;
        $size = $item['size'] ?? null;

        if (!$productName || $quantity <= 0) {
            return;
        }

        $stock = $this->findStockItem($productName, $color, $size, $productId);
        
        if (!$stock) {
            throw new \Exception("Stock not found for product: {$productName} (ID: {$productId})");
        }

        // Deduct from available stock
        $stock->decrement('stock', $quantity);
        $stock->last_updated = now();
        $stock->save();

        Log::info('Stock deducted for item', [
            'stock_id' => $stock->id,
            'product_name' => $productName,
            'product_id' => $productId,
            'quantity' => $quantity,
            'remaining_stock' => $stock->stock,
            'color' => $color,
            'size' => $size
        ]);
    }

    /**
     * Restore stock for a single item
     */
    private function restoreItemStock(array $item): void
    {
        $productName = $item['product_name'] ?? null;
        $productId = $item['product_id'] ?? null;
        $quantity = $item['quantity'] ?? 0;
        $color = $item['color'] ?? null;
        $size = $item['size'] ?? null;

        if (!$productName || $quantity <= 0) {
            return;
        }

        $stock = $this->findStockItem($productName, $color, $size, $productId);
        
        if (!$stock) {
            Log::warning('Stock item not found when restoring', [
                'product_name' => $productName,
                'product_id' => $productId,
                'color' => $color,
                'size' => $size
            ]);
            return;
        }

        // Restore to available stock
        $stock->increment('stock', $quantity);
        $stock->last_updated = now();
        $stock->save();

        Log::info('Stock restored for item', [
            'stock_id' => $stock->id,
            'product_name' => $productName,
            'product_id' => $productId,
            'quantity' => $quantity,
            'new_stock' => $stock->stock
        ]);
    }

    /**
     * Find stock item by color and size only (name and product_id are irrelevant)
     */
    private function findStockItem(string $productName, ?string $color, ?string $size, ?string $productId = null): ?Stock
    {
        // Convert English color names to Portuguese
        if ($color) {
            $colorMap = [
                'White' => 'Branco',
                'Black' => 'Preto',
                'Red' => 'Vermelho',
                'Blue' => 'Azul',
                'Green' => 'Verde'
            ];
            $color = $colorMap[$color] ?? $color;
        }
        
        // Match by color + size (ignore name and product_id completely)
        // This will find "Camiseta Looping Preta" or "Camiseta Looping Branca" etc.
        $stock = Stock::when($color && $color !== 'Não especificada', function($query) use ($color) {
                return $query->where('color', $color);
            })
            ->when($size && $size !== 'Não especificado', function($query) use ($size) {
                return $query->where('size', $size);
            })
            ->first();

        // Log what we found
        Log::info('Stock search result', [
            'color' => $color,
            'size' => $size,
            'found' => $stock ? 'YES' : 'NO',
            'stock_id' => $stock->id ?? null,
            'stock_name' => $stock->name ?? null,
            'stock_quantity' => $stock->stock ?? null
        ]);

        return $stock;
    }

    /**
     * Check stock availability for multiple items
     */
    public function checkStockAvailability(array $items): array
    {
        $results = [];

        foreach ($items as $key => $item) {
            $productName = $item['product_name'] ?? null;
            $productId = $item['product_id'] ?? null;
            $quantity = $item['quantity'] ?? 0;
            $color = $item['color'] ?? null;
            $size = $item['size'] ?? null;

            $result = [
                'product_name' => $productName,
                'product_id' => $productId,
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

            $stock = $this->findStockItem($productName, $color, $size, $productId);

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
     * Process multiple orders that need stock deduction
     */
    public function processPendingOrders(): array
    {
        $orders = Order::where('payment_status', 'paid')
            ->where(function($query) {
                $query->whereNull('stock_updated')
                      ->orWhere('stock_updated', false);
            })
            ->get();

        $results = [];
        foreach ($orders as $order) {
            $results[$order->id] = $this->deductStockFromOrder($order);
        }

        return $results;
    }
}
