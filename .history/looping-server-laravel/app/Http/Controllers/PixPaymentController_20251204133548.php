<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\PixDetails;
use App\Models\Info; // ✅ ADDED
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;
use App\Services\StockService; // ✅ ADDED FOR STOCK MANAGEMENT

class PixPaymentController extends Controller
{
    protected $stockService;

    /**
     * Constructor with dependency injection
     */
    public function __construct(StockService $stockService)
    {
        $this->stockService = $stockService;
    }

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

            // Validate input - use 'infos' table instead of 'orders'
            $validated = $request->validate([
                'order_id' => 'required|integer|exists:infos,id',
                'amount' => 'required|numeric|min:0.01',
                'payer_name' => 'required|string|max:150',
                'payer_cpf' => 'required|string|max:14',
            ]);

            // Get the order from infos table
            $order = Info::findOrFail($validated['order_id']); // ✅ CHANGED FROM Order:: TO Info::
            
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
            
            // Create PIX details record - ONLY include fields that exist in your table
            $pixDetails = PixDetails::create([
                'order_id' => $order->id,
                'payer_name' => $validated['payer_name'],
                'payer_cpf' => $validated['payer_cpf'],
                'pix_key' => $pixData['pix_key'],
                'qr_code' => $pixData['qr_code'],
                'transaction_id' => $pixData['transaction_id'],
                'amount' => (float) $validated['amount'], // Ensure it's a float
                'status' => 'pending',
                // NO expires_at field - your table doesn't have it
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
        $formattedAmount = number_format((float) $amount, 2, '.', '');
        
        // Simplified PIX code structure (BR Code)
        return "00020126580014br.gov.bcb.pix0136{$transactionId}520400005303986540{$formattedAmount}5802BR5913MERCADO TESTE6008SAO PAULO62070503***6304" . strtoupper(substr(md5($transactionId), 0, 4));
    }

    /**
     * Format PIX response
     */
    private function formatPixResponse(PixDetails $pixDetails, Info $order): array // ✅ CHANGED PARAMETER TYPE
    {
        // Calculate expiration time (30 minutes from creation)
        $expiresAt = $pixDetails->created_at->addMinutes(30);
        
        return [
            'pix_qr_code' => $pixDetails->qr_code,
            'pix_code' => $pixDetails->pix_code ?? $this->extractPixCodeFromQr($pixDetails->qr_code),
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
        
        // Fallback: generate a simple code
        return "00020126580014br.gov.bcb.pix0136mock_" . uniqid() . "520400005303986540100.005802BR5913TESTE6008SAO PAULO62070503***6304E2A9";
    }

    /**
     * Check PIX payment status
     * GET /api/pix/status/{orderId}
     */
    public function checkPaymentStatus($orderId): JsonResponse
    {
        DB::beginTransaction(); // ✅ ADDED TRANSACTION
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
                    $order = Info::find($orderId); // ✅ CHANGED FROM Order:: TO Info::
                    if ($order) {
                        // Update payment status and general status
                        $order->update([
                            'payment_status' => 'paid',
                            'status' => 'processing'
                        ]);
                        
                        Log::info('PIX payment confirmed as paid', [
                            'order_id' => $order->id,
                            'payment_status' => 'paid'
                        ]);
                        
                        // ✅ DEDUCT STOCK AND UPDATE STOCK FIELDS
                        $this->handleStockUpdateForPaidOrder($order);
                    }
                }
            }

            DB::commit(); // ✅ COMMIT TRANSACTION

            // Calculate expiration time dynamically
            $expiresAt = $pixDetails->created_at->addMinutes(30);

            return response()->json([
                'success' => true,
                'data' => [
                    'status' => $status,
                    'transaction_id' => $pixDetails->transaction_id,
                    'amount' => (float) $pixDetails->amount, // Ensure it's a number
                    'expires_at' => $expiresAt->format('c'),
                    'updated_at' => $pixDetails->updated_at->format('c'),
                ]
            ]);

        } catch (Exception $e) {
            DB::rollBack(); // ✅ ROLLBACK ON ERROR
            Log::error('PIX Status Check Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to check PIX status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✅ NEW METHOD: Handle stock update for paid orders
     */
    private function handleStockUpdateForPaidOrder(Info $order): void
    {
        try {
            Log::info('=== HANDLING STOCK UPDATE FOR PAID ORDER ===', [
                'order_id' => $order->id,
                'order_number' => $order->order_number
            ]);

            // Check if stock already updated
            if ($order->stock_updated) {
                Log::info('Stock already updated for this order', [
                    'order_id' => $order->id,
                    'stock_updated_at' => $order->stock_updated_at
                ]);
                return;
            }

            // Check if order can deduct stock
            if (!$order->canDeductStock()) {
                Log::warning('Order cannot deduct stock', [
                    'order_id' => $order->id,
                    'payment_status' => $order->payment_status,
                    'status' => $order->status,
                    'stock_updated' => $order->stock_updated
                ]);
                return;
            }

            // Deduct stock using StockService
            $stockUpdated = $this->stockService->deductStockFromOrder($order);
            
            if ($stockUpdated) {
                Log::info('Stock deducted successfully via PIX payment', [
                    'order_id' => $order->id,
                    'stock_updated' => $order->fresh()->stock_updated,
                    'stock_updated_at' => $order->fresh()->stock_updated_at
                ]);
            } else {
                Log::error('Failed to deduct stock via PIX payment', [
                    'order_id' => $order->id
                ]);
                // You might want to handle this differently - maybe retry or send notification
            }

        } catch (Exception $e) {
            Log::error('Error handling stock update for paid order: ' . $e->getMessage(), [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Simulate payment status for demo
     */
    private function simulatePaymentStatus(PixDetails $pixDetails): string
    {
        // Calculate expiration time (30 minutes from creation)
        $expiresAt = $pixDetails->created_at->addMinutes(30);
        
        // Auto-confirm if created more than 10 seconds ago (for demo)
        if (now()->diffInSeconds($pixDetails->created_at) > 10) {
            return 'paid';
        }
        
        // Check if expired (using calculated expiration)
        if (now()->greaterThan($expiresAt)) {
            return 'expired';
        }
        
        return $pixDetails->status;
    }

    /**
     * ✅ NEW METHOD: Confirm PIX payment and update stock manually
     * POST /api/pix/confirm-payment/{orderId}
     */
    public function confirmPaymentManually($orderId): JsonResponse
    {
        DB::beginTransaction();
        try {
            Log::info('=== MANUAL PIX PAYMENT CONFIRMATION START ===', ['order_id' => $orderId]);

            $pixDetails = PixDetails::where('order_id', $orderId)->first();
            
            if (!$pixDetails) {
                return response()->json([
                    'success' => false,
                    'message' => 'PIX details not found for this order'
                ], 404);
            }

            $order = Info::find($orderId);
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // Update PIX status
            $pixDetails->update(['status' => 'paid']);

            // Update order status
            $order->update([
                'payment_status' => 'paid',
                'status' => 'processing'
            ]);

            // ✅ DEDUCT STOCK AND UPDATE STOCK FIELDS
            $this->handleStockUpdateForPaidOrder($order);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'PIX payment confirmed and stock updated successfully',
                'data' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'payment_status' => $order->payment_status,
                    'status' => $order->status,
                    'stock_updated' => $order->fresh()->stock_updated,
                    'stock_updated_at' => $order->fresh()->stock_updated_at,
                    'pix_status' => 'paid'
                ]
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Manual PIX confirmation error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to confirm PIX payment: ' . $e->getMessage()
            ], 500);
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
            'message' => 'PixPaymentController is working!',
            'timestamp' => now()->format('c'),
            'status' => 'OK'
        ]);
    }
    
}