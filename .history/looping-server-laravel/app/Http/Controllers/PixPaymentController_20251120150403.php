<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Order;
use App\Models\PixDetails;

class PixPaymentController extends Controller
{
    /**
     * Generate PIX payment
     */
    public function generatePix(Request $request)
    {
        $request->validate([
            'order_id' => 'required|integer|exists:orders,id',
            'amount' => 'required|numeric|min:0.01',
            'payer_name' => 'required|string|max:150',
            'payer_cpf' => 'required|string|max:14',
        ]);

        try {
            DB::beginTransaction();

            // Get order
            $order = Order::findOrFail($request->order_id);
            
            // Generate mock PIX data (in real scenario, integrate with PIX provider)
            $pixData = $this->generateMockPixData($request->all());
            
            // Create PIX details record
            $pixDetails = PixDetails::create([
                'order_id' => $request->order_id,
                'payer_name' => $request->payer_name,
                'payer_cpf' => $request->payer_cpf,
                'pix_key' => $pixData['pix_key'],
                'qr_code' => $pixData['qr_code'],
                'transaction_id' => $pixData['transaction_id'],
                'amount' => $request->amount,
                'status' => 'pending',
                'expires_at' => now()->addMinutes(30), // PIX expires in 30 minutes
            ]);

            // Update order status
            $order->update([
                'payment_status' => 'pending',
                'status' => 'awaiting_payment'
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => [
                    'pix_qr_code' => $pixData['qr_code'],
                    'pix_code' => $pixData['pix_code'],
                    'transaction_id' => $pixData['transaction_id'],
                    'amount' => $request->amount,
                    'expires_at' => $pixDetails->expires_at,
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('PIX Generation Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate PIX payment'
            ], 500);
        }
    }

    /**
     * Check PIX payment status
     */
    public function checkPaymentStatus($orderId)
    {
        try {
            $pixDetails = PixDetails::where('order_id', $orderId)->firstOrFail();
            
            // In real scenario, check with PIX provider
            // For mock, simulate payment confirmation after some time
            $status = $this->simulatePaymentStatus($pixDetails);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'status' => $status,
                    'transaction_id' => $pixDetails->transaction_id,
                    'amount' => $pixDetails->amount,
                    'updated_at' => $pixDetails->updated_at,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'PIX details not found'
            ], 404);
        }
    }

    /**
     * Handle PIX webhook (for real PIX providers)
     */
    public function handleWebhook(Request $request)
    {
        Log::info('PIX Webhook Received:', $request->all());

        // Validate webhook signature (implementation depends on PIX provider)
        $isValid = $this->validateWebhookSignature($request);
        
        if (!$isValid) {
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        try {
            DB::beginTransaction();

            $transactionId = $request->input('transaction_id');
            $status = $request->input('status');
            
            // Find PIX details
            $pixDetails = PixDetails::where('transaction_id', $transactionId)->first();
            
            if ($pixDetails) {
                // Update PIX status
                $pixDetails->update([
                    'status' => $status,
                    'updated_at' => now()
                ]);

                // Update order status
                $order = $pixDetails->order;
                if ($status === 'paid') {
                    $order->update([
                        'payment_status' => 'paid',
                        'status' => 'processing'
                    ]);
                } elseif ($status === 'expired') {
                    $order->update([
                        'payment_status' => 'expired',
                        'status' => 'cancelled'
                    ]);
                }

                DB::commit();
                
                Log::info("PIX Webhook processed: Transaction {$transactionId} -> {$status}");
            }

            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('PIX Webhook Error: ' . $e->getMessage());
            return response()->json(['error' => 'Processing failed'], 500);
        }
    }

    /**
     * Generate mock PIX data
     */
    private function generateMockPixData($data)
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
    private function generatePixCode($amount, $transactionId)
    {
        $formattedAmount = number_format($amount, 2, '.', '');
        
        // Simplified PIX code structure (BR Code)
        return "00020126580014br.gov.bcb.pix0136{$transactionId}520400005303986540{$formattedAmount}5802BR5913MERCADO TESTE6008SAO PAULO62070503***6304" . strtoupper(substr(md5($transactionId), 0, 4));
    }

    /**
     * Simulate payment status for mock purposes
     */
    private function simulatePaymentStatus($pixDetails)
    {
        // For demo: auto-confirm after 2 minutes or if expired
        if (now()->greaterThan($pixDetails->expires_at)) {
            return 'expired';
        }
        
        // Auto-confirm if created more than 10 seconds ago (for demo)
        if (now()->diffInSeconds($pixDetails->created_at) > 10) {
            return 'paid';
        }
        
        return $pixDetails->status;
    }

    /**
     * Validate webhook signature (implementation depends on PIX provider)
     */
    private function validateWebhookSignature(Request $request)
    {
        // Implement signature validation based on your PIX provider
        // This is a mock implementation
        return true;
    }
}