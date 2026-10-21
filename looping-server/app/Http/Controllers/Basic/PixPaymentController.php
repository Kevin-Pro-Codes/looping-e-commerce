<?php

namespace App\Http\Controllers\Basic;

use App\Http\Controllers\Controller;
use App\Jobs\GeneratePixPaymentJob;
use App\Models\Order;
use App\Models\PixDetails;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Exception;

class PixPaymentController extends Controller
{
    /**
     * Generate PIX payment for an order
     * POST /api/pix/generate
     */
    public function generatePix(Request $request): JsonResponse
    {
        try {
            Log::info('=== PIX GENERATE REQUEST START ===');
            Log::info('PIX request data:', $request->all());

            // Validate input
            $validated = $request->validate([
                'order_id' => 'required|integer|exists:orders,id',
                'amount' => 'required|numeric|min:0.01',
                'payer_name' => 'required|string|max:150',
                'payer_cpf' => 'required|string|max:14',
            ]);

            // Get the order
            $order = Order::findOrFail($validated['order_id']);
            
            // Check if PIX details already exist and are not expired/failed
            $existingPix = PixDetails::where('order_id', $order->id)->first();
            if ($existingPix && !in_array($existingPix->status, ['expired', 'failed', 'cancelled'])) {
                Log::info('PIX already exists for order', ['order_id' => $order->id]);
                return response()->json([
                    'success' => true,
                    'message' => 'PIX already generated for this order',
                    'data' => $this->formatPixResponse($existingPix, $order)
                ]);
            }

            // Generate PIX synchronously for immediate response
            $job = new GeneratePixPaymentJob($validated, $order);
            $pixData = $job->generatePixData();
            
            // Create PIX details record
            $pixDetails = PixDetails::updateOrCreate(
                ['order_id' => $order->id],
                [
                    'payer_name' => $validated['payer_name'],
                    'payer_cpf' => $validated['payer_cpf'],
                    'pix_key' => $pixData['pix_key'],
                    'qr_code' => $pixData['qr_code'],
                    'transaction_id' => $pixData['transaction_id'],
                    'amount' => (float) $validated['amount'],
                    'status' => 'pending',
                ]
            );

            // Update order status
            $order->update([
                'payment_status' => 'pending',
                'status' => 'awaiting_payment'
            ]);

            Log::info('PIX generated successfully', [
                'order_id' => $order->id,
                'transaction_id' => $pixData['transaction_id']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'PIX generated successfully',
                'data' => $this->formatPixResponse($pixDetails, $order)
            ]);

        } catch (Exception $e) {
            Log::error('=== PIX GENERATE REQUEST ERROR ===');
            Log::error('Error: ' . $e->getMessage());
            Log::error('File: ' . $e->getFile() . ':' . $e->getLine());

            return response()->json([
                'success' => false,
                'message' => 'Failed to start PIX generation: ' . $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    
    /**
     * Format PIX response
     */
    private function formatPixResponse(PixDetails $pixDetails, Order $order): array
    {
        // Calculate expiration time (30 minutes from creation)
        $expiresAt = $pixDetails->created_at->addMinutes(30);
        
        return [
            'pix_qr_code' => $pixDetails->qr_code,
            'pix_code' => $pixDetails->pix_key ?? $this->extractPixCodeFromQr($pixDetails->qr_code),
            'transaction_id' => $pixDetails->transaction_id,
            'amount' => (float) $pixDetails->amount, // Ensure it's a number
            'expires_at' => $expiresAt->format('c'), // Calculate dynamically
            'order_id' => $order->id,
            'order_number' => $order->order_number,
        ];
    }

    /**
     * Extract PIX code from QR code URL if needed
     */
    private function extractPixCodeFromQr(string $qrCodeUrl): string
    {
        $parsedUrl = parse_url($qrCodeUrl);
        if (isset($parsedUrl['query'])) {
            parse_str($parsedUrl['query'], $queryParams);
            if (isset($queryParams['data'])) {
                return urldecode($queryParams['data']);
            }
        }
        
        return "";
    }

    /**
     * Check PIX payment status
     * GET /api/pix/status/{orderId}
     */
    public function checkPaymentStatus($orderId): JsonResponse
    {
        try {
            Log::info('Checking PIX status for order:', ['order_id' => $orderId]);

            $pixDetails = PixDetails::where('order_id', $orderId)->first();
            
            if (!$pixDetails) {
                return response()->json([
                    'success' => false,
                    'message' => 'PIX details not found for this order'
                ], 404);
            }

            // Real status check via Mercado Pago API
            $status = $this->checkMercadoPagoStatus($pixDetails);

            // Update status if changed
            if ($status !== $pixDetails->status) {
                $pixDetails->update(['status' => $status]);
                
                // Update order status if paid
                if ($status === 'paid') {
                    $order = Order::find($orderId);
                    if ($order) {
                        $order->update([
                            'payment_status' => 'paid',
                            'status' => 'processing'
                        ]);
                    }
                } elseif ($status === 'failed' || $status === 'expired') {
                    $order = Order::find($orderId);
                    if ($order) {
                        $order->update([
                            'payment_status' => 'failed',
                            'status' => 'cancelled'
                        ]);
                    }
                }
            }

            // Calculate expiration time dynamically
            $expiresAt = $pixDetails->created_at->addMinutes(30);

            return response()->json([
                'success' => true,
                'data' => [
                    'status' => $status,
                    'transaction_id' => $pixDetails->transaction_id,
                    'amount' => (float) $pixDetails->amount, // Ensure it's a number
                    'expires_at' => $expiresAt->format('c'),
                ]
            ]);

        } catch (Exception $e) {
            Log::error('PIX Status Check Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to check PIX status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Call Mercado Pago API to get the current status of the payment
     */
    private function checkMercadoPagoStatus(PixDetails $pixDetails): string
    {
        $accessToken = env('MERCADOPAGO_ACCESS_TOKEN');
        if (!$accessToken) {
            Log::error('Mercado Pago Access Token is not configured.');
            return $pixDetails->status;
        }

        $paymentId = $pixDetails->transaction_id;
        
        $response = Http::withToken($accessToken)
            ->get("https://api.mercadopago.com/v1/payments/{$paymentId}");

        if ($response->failed()) {
            Log::error("Failed to check Mercado Pago payment ID {$paymentId}. Error: " . $response->body());
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
                // Check if expired based on local created_at
                $expiresAt = $pixDetails->created_at->addMinutes(30);
                if (now()->greaterThan($expiresAt)) {
                    return 'expired';
                }
                return 'pending';
        }
    }

    /**
     * Test endpoint
     * GET /api/pix/test
     */
    public function test(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'PixPaymentController is working with Mercado Pago integration!',
            'timestamp' => now()->format('c'),
            'status' => 'OK'
        ]);
    }
}