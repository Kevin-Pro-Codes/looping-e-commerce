<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Models\Info;
use App\Services\StockService;
use Illuminate\Support\Facades\Log;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // ✅ Auto-sync stock for paid orders every 5 minutes
        $schedule->call(function () {
            Log::info('=== STARTING SCHEDULED STOCK SYNC ===');
            
            $stockService = app(StockService::class);
            
            // Get all paid orders where stock hasn't been updated yet
            $orders = Info::where('payment_status', 'paid')
                ->where('stock_updated', false)
                ->whereNotIn('status', ['cancelled', 'refunded'])
                ->get();
            
            Log::info('Found ' . $orders->count() . ' orders needing stock sync');
            
            $successCount = 0;
            $failCount = 0;
            
            foreach ($orders as $order) {
                try {
                    Log::info('Processing order for stock sync:', [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number
                    ]);
                    
                    $stockUpdated = $stockService->deductStockFromOrder($order);
                    
                    if ($stockUpdated) {
                        $successCount++;
                        Log::info('Successfully synced stock for order ' . $order->order_number);
                    } else {
                        $failCount++;
                        Log::warning('Failed to sync stock for order ' . $order->order_number);
                    }
                } catch (\Exception $e) {
                    $failCount++;
                    Log::error('Error syncing stock for order ' . $order->order_number . ': ' . $e->getMessage());
                }
            }
            
            Log::info('=== SCHEDULED STOCK SYNC COMPLETE ===', [
                'total_orders' => $orders->count(),
                'successful' => $successCount,
                'failed' => $failCount
            ]);
            
        })->everyFiveMinutes()->name('auto-stock-sync')->withoutOverlapping();
        
        // ✅ Clean up old pending orders (optional)
        $schedule->call(function () {
            // Mark expired PIX payments as failed
            \App\Models\PixDetails::where('status', 'pending')
                ->where('created_at', '<', now()->subHours(24))
                ->update(['status' => 'expired']);
                
        })->daily()->name('cleanup-expired-payments');
        
        // ✅ Send low stock alerts (optional)
        $schedule->call(function () {
            $stockService = app(StockService::class);
            $lowStockProducts = $stockService->getLowStockProducts(3); // Threshold: 3 items
            
            if (count($lowStockProducts) > 0) {
                Log::warning('Low stock alert:', [
                    'count' => count($lowStockProducts),
                    'products' => array_map(function($product) {
                        return $product['name'] . ' (' . $product['color'] . '/' . $product['size'] . '): ' . $product['stock'] . ' left';
                    }, $lowStockProducts)
                ]);
                
                // Here you could add email notifications or other alerts
            }
        })->dailyAt('09:00')->name('low-stock-alerts');
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}