<?php
// app/Http/Controllers/PaymentController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Exception\ApiErrorException;
use App\Models\Order;
use App\Models\Payment;

class PaymentController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Create PIX payment intent
     */
    public function createPixPayment(Request $request)
    {
        try {
            $request->validate([
                'amount' => 'required|numeric|min:1',
                'orderId' => 'required|string',
                'customerInfo' => 'required|array'
            ]);

            $amount = $request->amount * 100; // Convert to cents
            $orderId = $request->orderId;
            $customerInfo = $request->customerInfo;

            // Create Stripe Payment Intent with PIX
            $paymentIntent = PaymentIntent::create([
                'amount' => $amount,
                'currency' => 'brl',
                'payment_method_types' => ['pix'],
                'metadata' => [
                    'order_id' => $orderId,
                    'customer_name' => $customerInfo['name'],
                    'customer_email' => $customerInfo['email'],
                    'customer_cpf' => $customerInfo['cpf'] ?? ''
                ],
                'payment_method_options' => [
                    'pix' => [
                        'expires_after_seconds' => 30 * 60 // 30 minutes
                    ]
                ]
            ]);

            // Store payment in database
            $payment = Payment::create([
                'stripe_payment_intent_id' => $paymentIntent->id,
                'order_reference' => $orderId,
                'amount' => $request->amount,
                'currency' => 'BRL',
                'payment_method' => 'pix',
                'status' => 'pending',
                'customer_name' => $customerInfo['name'],
                'customer_email' => $customerInfo['email'],
                'customer_cpf' => $customerInfo['cpf'] ?? '',
                'pix_qr_code' => $paymentIntent->next_action->pix_display_qr_code ?? null,
                'pix_code' => $this->extractPixCode($paymentIntent),
                'expires_at' => now()->addMinutes(30)
            ]);

            return response()->json([
                'success' => true,
                'id' => $paymentIntent->id,
                'client_secret' => $paymentIntent->client_secret,
                'pixQrCode' => $paymentIntent->next_action->pix_display_qr_code ?? null,
                'pixCode' => $this->extractPixCode($paymentIntent),
                'amount' => $request->amount,
                'expiresAt' => $payment->expires_at,
                'payment' => $payment
            ]);

        } catch (ApiErrorException $e) {
            Log::error('Stripe PIX Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 400);
        } catch (\Exception $e) {
            Log::error('PIX Payment Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Erro interno ao processar pagamento PIX'
            ], 500);
        }
    }

    /**
     * Extract PIX code from payment intent
     */
    private function extractPixCode($paymentIntent)
    {
        if (isset($paymentIntent->next_action->pix_display_qr_code->data)) {
            return $paymentIntent->next_action->pix_display_qr_code->data;
        }
        
        // Fallback: generate a mock PIX code (in production, this comes from Stripe)
        return $this->generateMockPixCode();
    }

    /**
     * Generate mock PIX code for testing
     */
    private function generateMockPixCode()
    {
        return '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865406100.005802BR5913Test Merchant6008Sao Paulo62070503***6304E2CA';
    }

    /**
     * Check payment status
     */
    public function checkPaymentStatus($paymentIntentId)
    {
        try {
            $paymentIntent = PaymentIntent::retrieve($paymentIntentId);
            $payment = Payment::where('stripe_payment_intent_id', $paymentIntentId)->first();

            if ($payment) {
                $payment->update([
                    'status' => $paymentIntent->status
                ]);

                // If payment succeeded, create order
                if ($paymentIntent->status === 'succeeded' && $payment->order_id === null) {
                    $order = $this->createOrderFromPayment($payment, $paymentIntent);
                    $payment->update(['order_id' => $order->id]);
                }
            }

            return response()->json([
                'status' => $paymentIntent->status,
                'orderId' => $payment->order_id ?? null,
                'paymentIntent' => [
                    'id' => $paymentIntent->id,
                    'amount' => $paymentIntent->amount / 100,
                    'status' => $paymentIntent->status
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Check Payment Status Error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erro ao verificar status do pagamento'
            ], 500);
        }
    }

    /**
     * Create order from successful payment
     */
    private function createOrderFromPayment($payment, $paymentIntent)
    {
        return Order::create([
            'order_number' => 'ORD' . now()->format('YmdHis') . rand(1000, 9999),
            'customer_name' => $payment->customer_name,
            'customer_email' => $payment->customer_email,
            'customer_cpf' => $payment->customer_cpf,
            'total_amount' => $payment->amount,
            'payment_method' => 'pix',
            'payment_status' => 'paid',
            'status' => 'confirmed',
            'stripe_payment_intent_id' => $paymentIntent->id,
            'metadata' => json_encode([
                'pix_payment' => true,
                'paid_at' => now()->toISOString(),
                'original_payment_id' => $payment->id
            ])
        ]);
    }

    /**
     * Stripe Webhook handler for PIX payments
     */
    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sig_header = $request->header('Stripe-Signature');
        $endpoint_secret = config('services.stripe.webhook_secret');

        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload, $sig_header, $endpoint_secret
            );

            if ($event->type === 'payment_intent.succeeded') {
                $paymentIntent = $event->data->object;
                $this->handleSuccessfulPayment($paymentIntent);
            }

            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            Log::error('Webhook Error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Handle successful payment
     */
    private function handleSuccessfulPayment($paymentIntent)
    {
        $payment = Payment::where('stripe_payment_intent_id', $paymentIntent->id)->first();
        
        if ($payment && $payment->status !== 'succeeded') {
            $payment->update([
                'status' => 'succeeded',
                'paid_at' => now()
            ]);

            // Create order if not exists
            if (!$payment->order_id) {
                $order = $this->createOrderFromPayment($payment, $paymentIntent);
                $payment->update(['order_id' => $order->id]);
            }

            Log::info("PIX Payment succeeded: {$paymentIntent->id}");
        }
    }
}