<?php

namespace App\Services;

use App\Models\Info;
use App\Models\Stock;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StockService
{
    /**
     * Deduct stock from inventory when an order is paid
     */
    public function deductStockFromOrder(Info $order): bool
    {
        DB::beginTransaction();
        
        try {
            Log::info('=== DEDUCTING STOCK FOR ORDER ===', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'items_count' => count($order->parsed_items)
            ]);

            // Parse order items
            $items = $order->parsed_items;
            
            if (empty($items)) {
                Log::warning('No items found in order', ['order_id' => $order->id]);
                DB::rollBack();
                return false;
            }

            // Track which stock items were updated
            $updatedStockItems = [];

            foreach ($items as $item) {
                // Extract product name, color, and size from the order item
                $productName = $item['product_name'] ?? null;
                $color = $item['color'] ?? null;
                $size = $item['size'] ?? null;
                $quantity = $item['quantity'] ?? 0;

                if (!$productName || $quantity <= 0) {
                    Log::warning('Invalid item data', [
                        'product_name' => $productName,
                        'quantity' => $quantity,
                        'item' => $item
                    ]);
                    continue;
                }

                Log::info('Processing stock deduction for item:', [
                    'product_name' => $productName,
                    'color' => $color,
                    'size' => $size,
                    'quantity' => $quantity
                ]);

                // Find matching stock entry
                $stockQuery = Stock::where('name', 'like', "%{$productName}%");
                
                // Match by color if provided
                if ($color) {
                    $stockQuery->where('color', $color);
                }
                
                // Match by size if provided
                if ($size) {
                    $stockQuery->where('size', $size);
                }

                $stockItem = $stockQuery->first();

                if (!$stockItem) {
                    Log::error('Stock item not found for:', [
                        'product_name' => $productName,
                        'color' => $color,
                        'size' => $size
                    ]);
                    DB::rollBack();
                    return false;
                }

                // Check if enough stock is available
                if ($stockItem->stock < $quantity) {
                    Log::error('Insufficient stock available', [
                        'product_id' => $stockItem->id,
                        'available' => $stockItem->stock,
                        'required' => $quantity,
                        'product_name' => $productName
                    ]);
                    DB::rollBack();
                    return false;
                }

                // Deduct the quantity
                $oldStock = $stockItem->stock;
                $newStock = $oldStock - $quantity;
                
                $stockItem->stock = $newStock;
                $stockItem->last_updated = now()->format('Y-m-d');
                $stockItem->save();

                $updatedStockItems[] = [
                    'stock_id' => $stockItem->id,
                    'product_name' => $stockItem->name,
                    'color' => $stockItem->color,
                    'size' => $stockItem->size,
                    'old_stock' => $oldStock,
                    'new_stock' => $newStock,
                    'deducted' => $quantity
                ];

                Log::info('Stock deducted successfully', [
                    'stock_id' => $stockItem->id,
                    'product' => $stockItem->name,
                    'color' => $stockItem->color,
                    'size' => $stockItem->size,
                    'old_stock' => $oldStock,
                    'new_stock' => $newStock,
                    'deducted' => $quantity
                ]);
            }

            // Mark the order as having stock updated
            $order->stock_updated = true;
            $order->stock_updated_at = now();
            
            // Also ensure payment status is marked as paid if not already
            if ($order->payment_status !== 'paid') {
                $order->payment_status = 'paid';
            }
            
            $order->save();

            Log::info('Order marked as stock updated', [
                'order_id' => $order->id,
                'stock_updated' => $order->stock_updated,
                'stock_updated_at' => $order->stock_updated_at
            ]);

            // Log all stock updates
            Log::info('=== STOCK DEDUCTION COMPLETE ===', [
                'order_id' => $order->id,
                'updated_items_count' => count($updatedStockItems),
                'updated_items' => $updatedStockItems
            ]);

            DB::commit();
            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Stock deduction failed:', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }

    /**
     * Restore stock when an order is cancelled or refunded
     */
    public function restoreStockForOrder(Info $order): bool
    {
        DB::beginTransaction();
        
        try {
            Log::info('=== RESTORING STOCK FOR ORDER ===', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'reason' => 'cancelled/refunded'
            ]);

            $items = $order->parsed_items;
            $restoredItems = [];

            foreach ($items as $item) {
                $productName = $item['product_name'] ?? null;
                $color = $item['color'] ?? null;
                $size = $item['size'] ?? null;
                $quantity = $item['quantity'] ?? 0;

                if (!$productName || $quantity <= 0) continue;

                // Find matching stock entry
                $stockQuery = Stock::where('name', 'like', "%{$productName}%");
                
                if ($color) {
                    $stockQuery->where('color', $color);
                }
                
                if ($size) {
                    $stockQuery->where('size', $size);
                }

                $stockItem = $stockQuery->first();

                if ($stockItem) {
                    $oldStock = $stockItem->stock;
                    $newStock = $oldStock + $quantity;
                    
                    $stockItem->stock = $newStock;
                    $stockItem->last_updated = now()->format('Y-m-d');
                    $stockItem->save();

                    $restoredItems[] = [
                        'stock_id' => $stockItem->id,
                        'product' => $stockItem->name,
                        'old_stock' => $oldStock,
                        'new_stock' => $newStock,
                        'restored' => $quantity
                    ];
                }
            }

            // Mark the order as not having stock updated (since we restored it)
            $order->stock_updated = false;
            $order->stock_updated_at = null;
            $order->save();

            Log::info('Stock restored successfully', [
                'order_id' => $order->id,
                'restored_items' => $restoredItems
            ]);

            DB::commit();
            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Stock restoration failed:', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Check stock availability before placing order
     */
    public function checkStockAvailability(array $items): array
    {
        $results = [];

        foreach ($items as $index => $item) {
            $productName = $item['product_name'] ?? null;
            $color = $item['color'] ?? null;
            $size = $item['size'] ?? null;
            $quantity = $item['quantity'] ?? 0;

            $stockQuery = Stock::where('name', 'like', "%{$productName}%");
            
            if ($color) {
                $stockQuery->where('color', $color);
            }
            
            if ($size) {
                $stockQuery->where('size', $size);
            }

            $stockItem = $stockQuery->first();

            $results[$index] = [
                'product_name' => $productName,
                'color' => $color,
                'size' => $size,
                'requested_quantity' => $quantity,
                'available' => $stockItem ? ($stockItem->stock >= $quantity) : false,
                'available_stock' => $stockItem ? $stockItem->stock : 0,
                'stock_item' => $stockItem ? [
                    'id' => $stockItem->id,
                    'product_id' => $stockItem->product_id,
                    'name' => $stockItem->name
                ] : null
            ];
        }

        return $results;
    }

    /**
     * Get low stock products
     */
    public function getLowStockProducts(int $threshold = 5): array
    {
        return Stock::where('stock', '>', 0)
            ->where('stock', '<=', $threshold)
            ->get()
            ->toArray();
    }

    /**
     * Get out of stock products
     */
    public function getOutOfStockProducts(): array
    {
        return Stock::where('stock', 0)
            ->get()
            ->toArray();
    }
}