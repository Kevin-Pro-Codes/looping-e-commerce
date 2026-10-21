<?php

namespace App\Jobs;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Exception;

class SendPaymentConfirmationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [10, 30, 60];
    public $timeout = 30;

    /**
     * Create a new job instance.
     */
    public function __construct(
        private Order $order
    ) {
        $this->onQueue('notifications.email');
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('=== PAYMENT CONFIRMATION EMAIL JOB START ===', [
            'order_id' => $this->order->id,
            'customer_email' => $this->order->customer_email,
            'job_id' => $this->job?->getJobId()
        ]);

        try {
            if (!$this->order->customer_email) {
                Log::warning('No customer email for payment confirmation', [
                    'order_id' => $this->order->id
                ]);
                return;
            }

            // Here you would send the actual email
            // For now, we'll just log it
            Log::info('Payment confirmation email sent', [
                'order_id' => $this->order->id,
                'order_number' => $this->order->order_number,
                'customer_email' => $this->order->customer_email,
                'payment_method' => $this->order->payment_method,
                'total' => $this->order->total
            ]);

            // Example of how you would send an email:
            /*
            Mail::to($this->order->customer_email)->send(
                new PaymentConfirmationMail($this->order)
            );
            */

        } catch (Exception $e) {
            Log::error('Payment confirmation email job error', [
                'order_id' => $this->order->id,
                'error' => $e->getMessage(),
                'job_id' => $this->job?->getJobId()
            ]);

            $this->fail($e);
        }
    }

    /**
     * The job failed to process.
     */
    public function failed(Exception $exception): void
    {
        Log::error('Payment Confirmation Email Job failed permanently', [
            'order_id' => $this->order->id,
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts()
        ]);
    }
}
