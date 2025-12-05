<?php

namespace App\Http\Controllers;

use App\Models\Info;
use App\Models\PixDetails;
use App\Services\StockService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class PixPaymentController extends Controller
{
    protected $stockService;

    public function __construct(StockService $stockService)
    {
        $this->stockService = $stockService;
    }

    /**
     * Generate PIX payment for an order
     */
    public function generatePix(Request $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            Log::info('=== PIX GENERATE START ===');

            // Validate input
            $validated = $request->validate([
                'order_id' => 'required|integer|exists:infos,id',
                'amount' => 'required|numeric|min:0.01',
                'payer_name' => 'required|string|max:150',
                'payer_cpf' => 'required|string|max:14',
            ]);

            // Get the order from infos table
            $order = Info::findOrFail($validated['order_id']);
            
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
                'amount' => (float) $validated['amount'],
                'status' => 'pending',
            ]);

            // Update order payment status in infos table
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
            Log::error('PIX generation error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate PIX payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check PIX payment status AND AUTOMATICALLY UPDATE STOCK WHEN PAID
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

            // Get the order
            $order = Info::find($orderId);
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // Simulate payment status (in real scenario, check with PIX provider)
            $status = $this->simulatePaymentStatus($pixDetails);

            // Update status if changed
            if ($status !== $pixDetails->status) {
                $pixDetails->update(['status' => $status]);
                
                // ✅ IMPORTANT: UPDATE STOCK WHEN PAYMENT IS CONFIRMED AS PAID
                if ($status === 'paid') {
                    Log::info('Payment confirmed as PAID, updating stock for order', [
                        'order_id' => $orderId,
                        'order_number' => $order->order_number
                    ]);
                    
                    // Update order status
                    $order->update([
                        'payment_status' => 'paid',
                        'status' => 'processing'
                    ]);
                    
                    // ✅ DEDUCT STOCK FROM INVENTORY
                    $stockUpdated = $this->stockService->deductStockFromOrder($order);
                    
                    if (!$stockUpdated) {
                        Log::error('Failed to update stock for paid order', [
                            'order_id' => $orderId
                        ]);
                        // You might want to handle this differently based on your business logic
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
                    'amount' => (float) $pixDetails->amount,
                    'expires_at' => $expiresAt->format('c'),
                    'updated_at' => $pixDetails->updated_at->format('c'),
                    'order' => [
                        'payment_status' => $order->payment_status,
                        'stock_updated' => $order->stock_updated,
                        'stock_updated_at' => $order->stock_updated_at
                    ]
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
     * Handle PIX webhook (for real PIX providers)
     */
    public function handleWebhook(Request $request): JsonResponse
    {
        try {
            Log::info('=== PIX WEBHOOK RECEIVED ===');
            Log::info('Webhook payload:', $request->all());

            // Extract transaction data from webhook
            $transactionId = $request->input('transaction_id');
            $status = $request->input('status');
            
            if (!$transactionId) {
                return response()->json(['success' => false, 'message' => 'No transaction ID'], 400);
            }

            // Find PIX details by transaction ID
            $pixDetails = PixDetails::where('transaction_id', $transactionId)->first();
            
            if (!$pixDetails) {
                return response()->json(['success' => false, 'message' => 'Transaction not found'], 404);
            }

            // Get the order
            $order = Info::find($pixDetails->order_id);
            if (!$order) {
                return response()->json(['success' => false, 'message' => 'Order not found'], 404);
            }

            // Update PIX status
            $pixDetails->status = $status;
            $pixDetails->save();

            // ✅ HANDLE PAID STATUS - UPDATE STOCK
            if ($status === 'paid' || $status === 'approved') {
                Log::info('Webhook: Payment confirmed, updating stock', [
                    'order_id' => $order->id,
                    'transaction_id' => $transactionId
                ]);
                
                // Update order status
                $order->payment_status = 'paid';
                $order->status = 'processing';
                
                // ✅ DEDUCT STOCK FROM INVENTORY
                $stockUpdated = $this->stockService->deductStockFromOrder($order);
                
                if (!$stockUpdated) {
                    Log::error('Webhook: Failed to update stock', [
                        'order_id' => $order->id
                    ]);
                }
                
                $order->save();
            }
            
            // Handle failed/expired payments
            elseif ($status === 'failed' || $status === 'expired') {
                $order->payment_status = 'failed';
                $order->save();
            }

            Log::info('Webhook processed successfully', [
                'transaction_id' => $transactionId,
                'status' => $status,
                'order_id' => $order->id
            ]);

            return response()->json(['success' => true]);

        } catch (Exception $e) {
            Log::error('Webhook error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Webhook processing failed'], 500);
        }
    }

    /**
     * Generate PIX data (mock for now)
     */
    private function generatePixData(array $data): array
    {
        $transactionId = 'PIX_' . uniqid() . '_' . time();
        
        return [
            'pix_key' => 'mock-pix-key-' . $transactionId,
            'qr_code' => "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=pix-mock-" . $transactionId,
            'pix_code' => $this->generatePixCode($data['amount'], $transactionId),
            'transaction_id' => $transactionId,
        ];
    }

    private function generatePixCode($amount, $transactionId): string
    {
        $formattedAmount = number_format((float) $amount, 2, '.', '');
        return "00020126580014br.gov.bcb.pix0136{$transactionId}520400005303986540{$formattedAmount}5802BR5913MERCADO6008SAO PAULO62070503***6304" . strtoupper(substr(md5($transactionId), 0, 4));
    }

    private function formatPixResponse(PixDetails $pixDetails, Info $order): array
    {
        $expiresAt = $pixDetails->created_at->addMinutes(30);
        
        return [
            'pix_qr_code' => $pixDetails->qr_code,
            'pix_code' => $pixDetails->pix_code ?? $this->extractPixCodeFromQr($pixDetails->qr_code),
            'transaction_id' => $pixDetails->transaction_id,
            'amount' => (float) $pixDetails->amount,
            'expires_at' => $expiresAt->format('c'),
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'stock_will_update_on_payment' => true // Inform frontend
        ];
    }

    private function extractPixCodeFromQr(string $qrCodeUrl): string
    {
        $parsedUrl = parse_url($qrCodeUrl);
        if (isset($parsedUrl['query'])) {
            parse_str($parsedUrl['query'], $queryParams);
            if (isset($queryParams['data'])) {
                return urldecode($queryParams['data']);
            }
        }
        return "00020126580014br.gov.bcb.pix0136mock_" . uniqid() . "520400005303986540100.005802BR5913TESTE6008SAO PAULO62070503***6304E2A9";
    }

    private function simulatePaymentStatus(PixDetails $pixDetails): string
    {
        // For demo: auto-confirm after 10 seconds
        if (now()->diffInSeconds($pixDetails->created_at) > 10) {
            return 'paid';
        }
        
        $expiresAt = $pixDetails->created_at->addMinutes(30);
        if (now()->greaterThan($expiresAt)) {
            return 'expired';
        }
        
        return $pixDetails->status;
    }
}