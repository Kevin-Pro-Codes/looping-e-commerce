<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\Stock;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class SyncStockForOrderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [5, 15, 30];
    public $timeout = 120;

    /**
     * Create a new job instance.
     */
    public function __construct(
        private Order $order
    ) {
        $this->onQueue('stock.sync');
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('=== STOCK SYNC JOB START ===', [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'job_id' => $this->job?->getJobId()
        ]);

        try {
            // Check if order is paid
            if ($this->order->payment_status !== 'paid') {
                Log::warning('Order is not paid, skipping stock sync', [
                    'order_id' => $this->order->id,
                    'payment_status' => $this->order->payment_status
                ]);
                return;
            }

            // Check if stock already synced
            $metadata = json_decode($this->order->metadata ?? '{}', true) ?? [];
            if (isset($metadata['stock_synced_at'])) {
                Log::info('Stock already synced for this order', [
                    'order_id' => $this->order->id,
                    'synced_at' => $metadata['stock_synced_at']
                ]);
                return;
            }

            // Parse order items
            $items = json_decode($this->order->items, true) ?? [];
            $stockUpdates = [];

            DB::beginTransaction();

            foreach ($items as $itemIndex => $item) {
                $productName = $item['product_name'] ?? null;
                $quantity = $item['quantity'] ?? 1;
                $color = $item['color'] ?? ($item['selectedColor'] ?? null);
                $size = $item['size'] ?? ($item['selectedSize'] ?? null);

                if (!$productName) {
                    Log::warning('No product name in item', [
                        'order_id' => $this->order->id,
                        'item_index' => $itemIndex
                    ]);
                    continue;
                }

                // Find stock item
                $stockItem = $this->findStockItem($productName, $color, $size);
                
                if (!$stockItem) {
                    Log::error('Stock item not found', [
                        'order_id' => $this->order->id,
                        'product' => $productName,
                        'color' => $color,
                        'size' => $size
                    ]);
                    continue;
                }

                // Calculate available stock
                $available = $stockItem->stock - ($stockItem->reserved ?? 0);
                
                if ($available < $quantity) {
                    DB::rollBack();
                    throw new Exception(
                        "Not enough stock for '{$stockItem->name}'. " .
                        "Available: {$available}, Ordered: {$quantity}"
                    );
                }

                // Update stock - reduce current stock, increase reserved
                $oldStock = $stockItem->stock;
                $oldReserved = $stockItem->reserved ?? 0;
                
                $stockItem->stock = $oldStock - $quantity;
                $stockItem->reserved = $oldReserved + $quantity;
                $stockItem->last_updated = now()->format('Y-m-d');
                $stockItem->save();

                $stockUpdates[] = [
                    'product' => $stockItem->name,
                    'color' => $stockItem->color,
                    'size' => $stockItem->size,
                    'quantity' => $quantity,
                    'old_stock' => $oldStock,
                    'new_stock' => $stockItem->stock,
                    'old_reserved' => $oldReserved,
                    'new_reserved' => $stockItem->reserved,
                    'available_now' => $stockItem->stock - ($stockItem->reserved ?? 0)
                ];

                Log::info('Stock updated via job', [
                    'order_id' => $this->order->id,
                    'product' => $stockItem->name,
                    'quantity' => $quantity,
                    'payment_method' => $this->order->payment_method
                ]);
            }

            // Mark order as stock synced
            $metadata['stock_synced_at'] = now()->toISOString();
            $metadata['stock_updates'] = $stockUpdates;
            $metadata['payment_method'] = $this->order->payment_method;
            
            $this->order->metadata = json_encode($metadata);
            $this->order->save();

            DB::commit();

            Log::info('Stock sync completed successfully', [
                'order_id' => $this->order->id,
                'items_processed' => count($stockUpdates),
                'job_id' => $this->job?->getJobId()
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            
            Log::error('Stock sync job error', [
                'order_id' => $this->order->id,
                'error' => $e->getMessage(),
                'job_id' => $this->job?->getJobId()
            ]);

            $this->fail($e);
        }
    }

    /**
     * Helper: Find stock item by product name, color, size
     */
    private function findStockItem($productName, $color, $size)
    {
        // Clean up inputs
        $cleanProductName = trim($productName);
        $cleanColor = $color ? trim($color) : null;
        $cleanSize = $size ? trim($size) : null;

        // Try exact match first
        $query = Stock::query();
        
        // Search in product name
        $query->where(function($q) use ($cleanProductName) {
            $q->where('name', 'like', "%{$cleanProductName}%")
              ->orWhere('product_id', 'like', "%{$cleanProductName}%");
        });
        
        // Add color if provided and not "Não especificada"
        if ($cleanColor && !in_array(strtolower($cleanColor), ['não especificada', 'nao especificada', ''])) {
            $query->where('color', $cleanColor);
        }
        
        // Add size if provided and not "Não especificado"
        if ($cleanSize && !in_array(strtolower($cleanSize), ['não especificado', 'nao especificado', ''])) {
            $query->where('size', $cleanSize);
        }
        
        $result = $query->first();
        
        if ($result) {
            return $result;
        }

        // Fallback: Try without color/size
        if ($cleanColor || $cleanSize) {
            $fallbackQuery = Stock::query();
            $fallbackQuery->where(function($q) use ($cleanProductName) {
                $q->where('name', 'like', "%{$cleanProductName}%")
                  ->orWhere('product_id', 'like', "%{$cleanProductName}%");
            });
            
            return $fallbackQuery->first();
        }

        return null;
    }

    /**
     * The job failed to process.
     */
    public function failed(Exception $exception): void
    {
        Log::error('Stock Sync Job failed permanently', [
            'order_id' => $this->order->id,
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts()
        ]);

        // Could add notification to admin here
    }
}
