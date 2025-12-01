<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\PixDetails;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
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
        DB::beginTransaction();

        try {
            Log::info('=== PIX GENERATE START ===');
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
            
            // Check if PIX details already exist
            $existingPix = PixDetails::where('order_id', $order->id)->first();
            if ($existingPix) {
                return response()->json([
                    'success' => true,
                    'message' => 'PIX already generated for this order',
                    'data' => $this->formatPixResponse($existingPix, $order)
                ]);
            }

            // Generate PIX data
            $pixData = $this->generatePixData($validated);
            
            // Create PIX details record
            $pixDetails = PixDetails::create([
                'order_id' => $order->id,
                'payer_name' => $validated['payer_name'],
                'payer_cpf' => $validated['payer_cpf'],
                'pix_key' => $pixData['pix_key'],
                'qr_code' => $pixData['qr_code'],
                'transaction_id' => $pixData['transaction_id'],
                'amount' => $validated['amount'],
                'status' => 'pending',
                'expires_at' => now()->addMinutes(30),
            ]);

            // Update order payment status
            $order->update([
                'payment_status' => 'pending',
                'status' => 'awaiting_payment'
            ]);

            DB::commit();

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
            DB::rollBack();
            
            Log::error('=== PIX GENERATE ERROR ===');
            Log::error('Error: ' . $e->getMessage());
            Log::error('File: ' . $e->getFile() . ':' . $e->getLine());
            Log::error('Trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate PIX payment: ' . $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Generate PIX data
     */
    private function generatePixData(array $data): array
    {
        $transactionId = 'PIX_' . uniqid() . '_' . time();
        $pixCode = $this->generatePixCode($data['amount'], $transactionId);
        
        return [
            'pix_key' => 'mock-pix-key-' . $transactionId,
            'qr_code' => "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" . urlencode($pixCode),
            'pix_code' => $pixCode,
            'transaction_id' => $transactionId,
        ];
    }

    /**
     * Generate PIX code in standard format
     */
    private function generatePixCode($amount, $transactionId): string
    {
        $formattedAmount = number_format($amount, 2, '.', '');
        
        // Simplified PIX code structure (BR Code)
        return "00020126580014br.gov.bcb.pix0136{$transactionId}520400005303986540{$formattedAmount}5802BR5913MERCADO TESTE6008SAO PAULO62070503***6304" . strtoupper(substr(md5($transactionId), 0, 4));
    }

    /**
     * Format PIX response
     */
    private function formatPixResponse(PixDetails $pixDetails, Order $order): array
    {
        return [
            'pix_qr_code' => $pixDetails->qr_code,
            'pix_code' => $pixDetails->pix_code ?? $this->extractPixCodeFromQr($pixDetails->qr_code),
            'transaction_id' => $pixDetails->transaction_id,
            'amount' => $pixDetails->amount,
            'expires_at' => $pixDetails->expires_at->format('c'),
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
        
        // Fallback: generate a simple code
        return "00020126580014br.gov.bcb.pix0136mock_" . uniqid() . "520400005303986540100.005802BR5913TESTE6008SAO PAULO62070503***6304E2A9";
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

            // Simulate payment status (in real scenario, check with PIX provider)
            $status = $this->simulatePaymentStatus($pixDetails);

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
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'status' => $status,
                    'transaction_id' => $pixDetails->transaction_id,
                    'amount' => $pixDetails->amount,
                    'expires_at' => $pixDetails->expires_at->format('c'),
                    'updated_at' => $pixDetails->updated_at->format('c'),
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
     * Simulate payment status for demo
     */
    private function simulatePaymentStatus(PixDetails $pixDetails): string
    {
        // Auto-confirm if created more than 10 seconds ago (for demo)
        if (now()->diffInSeconds($pixDetails->created_at) > 10) {
            return 'paid';
        }
        
        // Check if expired
        if (now()->greaterThan($pixDetails->expires_at)) {
            return 'expired';
        }
        
        return $pixDetails->status;
    }
}