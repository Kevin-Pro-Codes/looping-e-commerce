<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Exception\ApiErrorException;

class PaymentController extends Controller
{
    public function __construct()
    {
        // Set your Stripe secret key
        Stripe::setApiKey(env('STRIPE_SECRET_KEY'));
    }

    public function createPixPayment(Request $request)
    {
        try {
            $request->validate([
                'amount' => 'required|numeric|min:0.5', // Minimum R$ 0.50
                'orderId' => 'required|string',
                'customerInfo' => 'required|array',
                'customerInfo.name' => 'required|string',
                'customerInfo.email' => 'required|email',
                'customerInfo.cpf' => 'required|string',
            ]);

            $amount = $request->input('amount');
            $orderId = $request->input('orderId');
            $customerInfo = $request->input('customerInfo');

            // Calculate amount in cents (Stripe requires integer)
            $amountInCents = (int) round($amount * 100);

            // Validate minimum amount for Pix (R$ 0.50)
            if ($amountInCents < 50) {
                return response()->json([
                    'error' => 'O valor mínimo para PIX é R$ 0,50'
                ], 400);
            }

            // Create Stripe Payment Intent
            $paymentIntent = PaymentIntent::create([
                'amount' => $amountInCents,
                'currency' => 'brl',
                'payment_method_types' => ['pix'],
                'metadata' => [
                    'order_id' => $orderId,
                    'customer_email' => $customerInfo['email'],
                    'customer_name' => $customerInfo['name'],
                    'customer_cpf' => $customerInfo['cpf']
                ]
            ]);

            Log::info('Pix Payment Intent created', [
                'payment_intent_id' => $paymentIntent->id,
                'order_id' => $orderId,
                'amount' => $amount
            ]);

            return response()->json([
                'success' => true,
                'clientSecret' => $paymentIntent->client_secret,
                'id' => $paymentIntent->id,
                'pixQrCode' => $paymentIntent->next_action->pix_display_qr_code->data ?? null,
                'pixCode' => $paymentIntent->next_action->pix_display_qr_code->code ?? null,
                'expiresAt' => $paymentIntent->next_action->pix_display_qr_code->expires_at ?? null,
                'amount' => $amount
            ]);

        } catch (ApiErrorException $e) {
            Log::error('Stripe API Error creating Pix payment', [
                'error' => $e->getMessage(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'error' => 'Erro ao criar pagamento PIX: ' . $e->getMessage()
            ], 500);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Dados inválidos: ' . implode(', ', $e->errors())
            ], 400);

        } catch (\Exception $e) {
            Log::error('Unexpected error creating Pix payment', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Erro interno do servidor'
            ], 500);
        }
    }

    public function getPaymentStatus($paymentIntentId)
    {
        try {
            $paymentIntent = PaymentIntent::retrieve($paymentIntentId);

            return response()->json([
                'status' => $paymentIntent->status,
                'orderId' => $paymentIntent->metadata->order_id ?? null,
                'amount' => $paymentIntent->amount / 100,
                'currency' => $paymentIntent->currency
            ]);

        } catch (ApiErrorException $e) {
            Log::error('Error retrieving payment status', [
                'payment_intent_id' => $paymentIntentId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Erro ao verificar status do pagamento'
            ], 500);
        }
    }

    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = env('STRIPE_WEBHOOK_SECRET');

        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload, $sigHeader, $endpointSecret
            );

        } catch (\UnexpectedValueException $e) {
            // Invalid payload
            Log::error('Invalid Stripe webhook payload', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            // Invalid signature
            Log::error('Invalid Stripe webhook signature', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Handle the event
        switch ($event->type) {
            case 'payment_intent.succeeded':
                $paymentIntent = $event->data->object;
                $this->handleSuccessfulPayment($paymentIntent);
                break;
            case 'payment_intent.payment_failed':
                $paymentIntent = $event->data->object;
                $this->handleFailedPayment($paymentIntent);
                break;
            default:
                Log::info('Received unhandled event type', ['type' => $event->type]);
        }

        return response()->json(['success' => true]);
    }

    private function handleSuccessfulPayment($paymentIntent)
    {
        Log::info('Payment succeeded', [
            'payment_intent_id' => $paymentIntent->id,
            'order_id' => $paymentIntent->metadata->order_id ?? 'unknown'
        ]);

        // TODO: Update your order status in database
        // Order::where('order_id', $paymentIntent->metadata->order_id)->update(['status' => 'paid']);
        
        // TODO: Send confirmation email, update inventory, etc.
    }

    private function handleFailedPayment($paymentIntent)
    {
        Log::warning('Payment failed', [
            'payment_intent_id' => $paymentIntent->id,
            'order_id' => $paymentIntent->metadata->order_id ?? 'unknown',
            'last_payment_error' => $paymentIntent->last_payment_error ?? null
        ]);

        // TODO: Update order status to failed
        // Order::where('order_id', $paymentIntent->metadata->order_id)->update(['status' => 'failed']);
    }
}