<?php

namespace App\Observers;

use App\Models\Info;
use App\Services\OrderStockService;

class OrderObserver
{
    /**
     * Handle the Info "created" event.
     */
    public function created(Info $order): void
    {
        // Only deduct stock if order is created as paid AND stock_updated is false
        // This avoids conflicts with OrderInfoController
        if ($order->payment_status === 'paid' && !($order->stock_updated ?? false)) {
            $this->deductStockSafely($order, 'created');
        }
    }

    /**
     * Handle the Info "updated" event.
     */
    public function updated(Info $order): void
    {
        // Only deduct stock when payment status changes TO paid
        // This handles the most common scenario: pending → paid
        if ($order->wasChanged('payment_status') && $order->payment_status === 'paid') {
            if (!($order->stock_updated ?? false)) {
                $this->deductStockSafely($order, 'payment_status_changed');
            }
        }
        
        // Restore stock if order is cancelled/refunded and stock was deducted
        if (($order->wasChanged('status') && in_array($order->status, ['cancelled', 'refunded'])) ||
            ($order->wasChanged('payment_status') && $order->payment_status === 'refunded')) {
            
            if ($order->stock_updated ?? false) {
                $this->restoreStockSafely($order, 'order_cancelled');
            }
        }
    }
    
    /**
     * Safely deduct stock with error handling
     */
    private function deductStockSafely(Info $order, string $trigger): void
    {
        try {
            $stockService = new OrderStockService();
            $result = $stockService->deductStockFromOrder($order);
            
            if ($result) {
                \Log::info('Stock deducted automatically', [
                    'trigger' => $trigger,
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'payment_status' => $order->payment_status
                ]);
            } else {
                \Log::warning('Stock deduction failed', [
                    'trigger' => $trigger,
                    'order_id' => $order->id,
                    'order_number' => $order->order_number
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Stock deduction error', [
                'trigger' => $trigger,
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Safely restore stock with error handling
     */
    private function restoreStockSafely(Info $order, string $trigger): void
    {
        try {
            $stockService = new OrderStockService();
            $result = $stockService->restoreStockForOrder($order);
            
            if ($result) {
                \Log::info('Stock restored automatically', [
                    'trigger' => $trigger,
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Stock restoration error', [
                'trigger' => $trigger,
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
        }
    }
}
