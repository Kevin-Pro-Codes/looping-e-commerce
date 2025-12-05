<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    /**
     * The application's global HTTP middleware stack.
     */
    protected $middleware = [
        // \App\Http\Middleware\TrustHosts::class,
        \App\Http\Middleware\TrustProxies::class,
        \App\Http\Middleware\PreventRequestsDuringMaintenance::class,
        \Illuminate\Foundation\Http\Middleware\ValidatePostSize::class,
        \App\Http\Middleware\TrimStrings::class,
        \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
        \App\Http\Middleware\Cors::class, 
        \Fruitcake\Cors\HandleCors::class, 
     
    ];

    /**
     * The application's route middleware groups.
     */
    protected $middlewareGroups = [
        'web' => [
            \App\Http\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \App\Http\Middleware\VerifyCsrfToken::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],

        'api' => [
            // Sanctum para SPAs (React)
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            'throttle:api',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],
    ];

    /**
     * The application's route middleware.
     */
    protected $routeMiddleware = [
        'auth' => \App\Http\Middleware\Authenticate::class,
        'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
        'auth.session' => \Illuminate\Session\Middleware\AuthenticateSession::class,
        'cache.headers' => \Illuminate\Http\Middleware\SetCacheHeaders::class,
        'can' => \Illuminate\Auth\Middleware\Authorize::class,
        'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
        'password.confirm' => \Illuminate\Auth\Middleware\RequirePassword::class,
        'signed' => \Illuminate\Routing\Middleware\ValidateSignature::class,
        'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
        'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,
    ];


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