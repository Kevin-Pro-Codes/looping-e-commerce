<?php

namespace App\Services;

use App\Models\Stock;
use App\Models\Info;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StockService
{
    public function deductStockFromOrder(Info $order): bool
    {
        Log::info('🔄 DEDUCTING STOCK FOR ORDER: ' . $order->id);
        
        try {
            // Skip if already updated
            if ($order->stock_updated) {
                Log::info('Order already has stock deducted');
                return true;
            }
            
            // Only process paid orders
            if ($order->payment_status !== 'paid') {
                Log::warning('Order not paid, skipping');
                return false;
            }
            
            // Parse items
            $items = $order->items;
            if (is_string($items)) {
                $items = json_decode($items, true);
            }
            
            if (empty($items)) {
                Log::error('No items in order');
                return false;
            }
            
            DB::beginTransaction();
            
            foreach ($items as $item) {
                $this->processItem($item);
            }
            
            // Mark order as updated
            $order->stock_updated = true;
            $order->stock_updated_at = now();
            $order->save();
            
            DB::commit();
            
            Log::info('✅ STOCK DEDUCTED SUCCESSFULLY');
            return true;
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('❌ STOCK DEDUCTION FAILED: ' . $e->getMessage());
            return false;
        }
    }
    
    private function processItem(array $item): void
    {
        $productName = $item['product_name'] ?? $item['name'] ?? null;
        $quantity = $item['quantity'] ?? 0;
        $color = $item['color'] ?? null;
        $size = $item['size'] ?? null;
        
        Log::info('Processing item:', [
            'product' => $productName,
            'qty' => $quantity,
            'color' => $color,
            'size' => $size
        ]);
        
        if (!$productName || $quantity <= 0) {
            Log::warning('Invalid item data');
            return;
        }
        
        // Find matching stock
        $stock = $this->findStock($productName, $color, $size);
        
        if (!$stock) {
            throw new \Exception("Product not found in stock: {$productName}");
        }
        
        if ($stock->stock < $quantity) {
            throw new \Exception("Insufficient stock: {$productName}. Available: {$stock->stock}, Needed: {$quantity}");
        }
        
        // Deduct stock
        $stock->stock -= $quantity;
        $stock->last_updated = now()->format('Y-m-d');
        $stock->save();
        
        Log::info('Stock updated:', [
            'product' => $productName,
            'deducted' => $quantity,
            'remaining' => $stock->stock
        ]);
    }
    
    private function findStock(string $productName, ?string $color, ?string $size)
    {
        // Try exact match first
        $query = Stock::where('name', $productName);
        
        if ($color && $color !== 'Não especificada') {
            $query->where('color', $color);
        }
        
        if ($size && $size !== 'Não especificado') {
            $query->where('size', $size);
        }
        
        $stock = $query->first();
        
        // If not found, try without color/size
        if (!$stock) {
            $stock = Stock::where('name', $productName)->first();
        }
        
        return $stock;
    }
}