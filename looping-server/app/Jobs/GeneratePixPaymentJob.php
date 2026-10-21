<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\PixDetails;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class GeneratePixPaymentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [5, 10, 20];
    public $timeout = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(
        private array $validatedData,
        private Order $order
    ) {
        $this->onQueue('payments.normal_priority');
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('=== PIX GENERATION JOB START ===', [
            'order_id' => $this->order->id,
            'job_id' => $this->job?->getJobId()
        ]);

        DB::beginTransaction();

        try {
            // Check if PIX details already exist
            $existingPix = PixDetails::where('order_id', $this->order->id)->first();
            if ($existingPix && !in_array($existingPix->status, ['expired', 'failed', 'cancelled'])) {
                Log::info('PIX already exists for order', ['order_id' => $this->order->id]);
                DB::commit();
                return;
            }

            // Generate PIX data via Mercado Pago
            $pixData = $this->generatePixData();
            
            // Create or update PIX details record
            $pixDetails = PixDetails::updateOrCreate(
                ['order_id' => $this->order->id],
                [
                    'payer_name' => $this->validatedData['payer_name'],
                    'payer_cpf' => $this->validatedData['payer_cpf'],
                    'pix_key' => $pixData['pix_key'],
                    'qr_code' => $pixData['qr_code'],
                    'transaction_id' => $pixData['transaction_id'],
                    'amount' => (float) $this->validatedData['amount'],
                    'status' => 'pending',
                ]
            );

            // Update order payment status
            $this->order->update([
                'payment_status' => 'pending',
                'status' => 'awaiting_payment'
            ]);

            DB::commit();

            Log::info('PIX generated successfully via job', [
                'order_id' => $this->order->id,
                'transaction_id' => $pixData['transaction_id'],
                'job_id' => $this->job?->getJobId()
            ]);

            // Dispatch status check job for later
            CheckPixStatusJob::dispatch($this->order->id)
                ->delay(now()->addMinutes(12))
                ->onQueue('payments.low_priority');

        } catch (Exception $e) {
            DB::rollBack();
            
            Log::error('=== PIX GENERATION JOB ERROR ===', [
                'order_id' => $this->order->id,
                'error' => $e->getMessage(),
                'job_id' => $this->job?->getJobId()
            ]);

            $this->fail($e);
        }
    }

    /**
     * Generate PIX data via Mercado Pago API
     */
    public function generatePixData(): array
    {
        $accessToken = env('MERCADOPAGO_ACCESS_TOKEN');
        if (!$accessToken) {
            throw new Exception('Mercado Pago Access Token is not configured');
        }

        $cpf = preg_replace('/[^0-9]/', '', $this->validatedData['payer_cpf']);
        $transactionAmount = (float) $this->validatedData['amount'];
        
        $email = !empty($this->order->customer_email) && filter_var($this->order->customer_email, FILTER_VALIDATE_EMAIL) 
            ? $this->order->customer_email 
            : 'pix@seudominio.com';
            
        $firstName = $this->validatedData['payer_name'];

        $response = Http::withToken($accessToken)
            ->withHeaders([
                'X-Idempotency-Key' => 'order_' . $this->order->id . '_' . time()
            ])
            ->post('https://api.mercadopago.com/v1/payments', [
                'transaction_amount' => $transactionAmount,
                'description' => 'Pedido #' . $this->order->order_number,
                'payment_method_id' => 'pix',
                'payer' => [
                    'email' => $email,
                    'first_name' => $firstName,
                    'identification' => [
                        'type' => 'CPF',
                        'number' => $cpf
                    ]
                ]
            ]);

        if ($response->failed()) {
            $errorBody = $response->body();
            Log::error('Mercado Pago API error in job: ' . $errorBody);
            throw new Exception('Failed to generate PIX via Mercado Pago. ' . $errorBody);
        }

        $mpData = $response->json();
        $pixCode = $mpData['point_of_interaction']['transaction_data']['qr_code'] ?? '';
        $transactionId = (string) $mpData['id'];

        // Use a QR code generator API to prevent saving large Base64 images in DB
        $qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" . urlencode($pixCode);

        return [
            'pix_key' => $pixCode,
            'qr_code' => $qrCodeUrl,
            'pix_code' => $pixCode,
            'transaction_id' => $transactionId,
        ];
    }

    /**
     * The job failed to process.
     */
    public function failed(Exception $exception): void
    {
        Log::error('PIX Generation Job failed permanently', [
            'order_id' => $this->order->id,
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts()
        ]);

        // Update order status to failed
        $this->order->update([
            'payment_status' => 'failed',
            'status' => 'payment_failed'
        ]);
    }
}
