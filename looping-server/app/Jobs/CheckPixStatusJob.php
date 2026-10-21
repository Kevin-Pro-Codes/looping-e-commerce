<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\PixDetails;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class CheckPixStatusJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 5;
    public $backoff = [30, 60, 120, 300, 600];
    public $timeout = 30;

    /**
     * Create a new job instance.
     */
    public function __construct(
        private int $orderId
    ) {
        $this->onQueue('payments.low_priority');
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('=== PIX STATUS CHECK JOB START ===', [
            'order_id' => $this->orderId,
            'job_id' => $this->job?->getJobId(),
            'attempt' => $this->attempts()
        ]);

        try {
            $pixDetails = PixDetails::where('order_id', $this->orderId)->first();
            
            if (!$pixDetails) {
                Log::warning('PIX details not found for status check', ['order_id' => $this->orderId]);
                return;
            }

            // Check if already paid
            if ($pixDetails->status === 'paid') {
                Log::info('PIX already paid, skipping check', ['order_id' => $this->orderId]);
                return;
            }

            // Real status check via Mercado Pago API
            $status = $this->checkMercadoPagoStatus($pixDetails);

            // Update status if changed
            if ($status !== $pixDetails->status) {
                $pixDetails->update(['status' => $status]);
                
                Log::info('PIX status updated', [
                    'order_id' => $this->orderId,
                    'old_status' => $pixDetails->status,
                    'new_status' => $status
                ]);

                // Update order status and dispatch stock sync if paid
                if ($status === 'paid') {
                    $order = Order::find($this->orderId);
                    if ($order) {
                        $order->update([
                            'payment_status' => 'paid',
                            'status' => 'processing'
                        ]);

                        // Dispatch stock sync job
                        SyncStockForOrderJob::dispatch($order)
                            ->onQueue('stock.sync');

                        // Dispatch notification job
                        SendPaymentConfirmationJob::dispatch($order)
                            ->onQueue('notifications.email');
                    }
                } elseif ($status === 'failed' || $status === 'expired') {
                    $order = Order::find($this->orderId);
                    if ($order) {
                        $order->update([
                            'payment_status' => 'failed',
                            'status' => 'cancelled'
                        ]);
                    }
                }
            }

            // If still pending, schedule another check
            if ($status === 'pending' && $this->attempts() < $this->tries) {
                $nextCheckDelay = min($this->attempts() * 720, 1800); // Max 30 minutes, min 12 minutes
                
                CheckPixStatusJob::dispatch($this->orderId)
                    ->delay(now()->addSeconds($nextCheckDelay))
                    ->onQueue('payments.low_priority');
                    
                Log::info('Scheduled next PIX status check', [
                    'order_id' => $this->orderId,
                    'delay_seconds' => $nextCheckDelay
                ]);
            }

        } catch (Exception $e) {
            Log::error('PIX Status Check Job error', [
                'order_id' => $this->orderId,
                'error' => $e->getMessage(),
                'attempt' => $this->attempts()
            ]);

            // Re-throw to trigger retry mechanism
            throw $e;
        }
    }

    /**
     * Call Mercado Pago API to get the current status of the payment
     */
    private function checkMercadoPagoStatus(PixDetails $pixDetails): string
    {
        $accessToken = env('MERCADOPAGO_ACCESS_TOKEN');
        if (!$accessToken) {
            Log::error('Mercado Pago Access Token is not configured');
            return $pixDetails->status;
        }

        $paymentId = $pixDetails->transaction_id;
        
        $response = Http::withToken($accessToken)
            ->timeout(10)
            ->get("https://api.mercadopago.com/v1/payments/{$paymentId}");

        if ($response->failed()) {
            Log::error("Failed to check Mercado Pago payment ID {$paymentId}", [
                'error' => $response->body(),
                'order_id' => $this->orderId
            ]);
            return $pixDetails->status;
        }

        $mpData = $response->json();
        $mpStatus = $mpData['status'] ?? '';

        // Map Mercado Pago statuses to local statuses
        switch ($mpStatus) {
            case 'approved':
                return 'paid';
            case 'cancelled':
            case 'rejected':
                return 'failed';
            case 'refunded':
            case 'charged_back':
                return 'refunded';
            case 'pending':
            case 'in_process':
            default:
                // Check if expired based on local created_at (30 minutes)
                $expiresAt = $pixDetails->created_at->addMinutes(30);
                if (now()->greaterThan($expiresAt)) {
                    return 'expired';
                }
                return 'pending';
        }
    }

    /**
     * The job failed to process.
     */
    public function failed(Exception $exception): void
    {
        Log::error('PIX Status Check Job failed permanently', [
            'order_id' => $this->orderId,
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts()
        ]);
    }
}
