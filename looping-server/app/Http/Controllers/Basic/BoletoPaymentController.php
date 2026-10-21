<?php

namespace App\Http\Controllers\Basic;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\BoletoDetails;
use Exception;

class BoletoPaymentController extends Controller
{
    public function generateBoleto(Request $request)
    {
        try {
            $request->validate([
                'order_id' => 'required|exists:orders,id',
                'amount' => 'required|numeric',
                'payer_name' => 'required|string',
                'payer_cpf' => 'required|string',
            ]);

            $data = $request->all();
            
            // Check for existing pending boleto
            $existingBoleto = BoletoDetails::where('order_id', $data['order_id'])
                ->where('status', 'pending')
                ->first();

            if ($existingBoleto && $existingBoleto->barcode) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'barcode' => $existingBoleto->barcode,
                        'pdf_url' => $existingBoleto->pdf_url,
                        'transaction_id' => $existingBoleto->transaction_id,
                        'amount' => $existingBoleto->amount,
                        'status' => 'pending'
                    ]
                ]);
            }

            $order = Order::findOrFail($data['order_id']);
            $accessToken = env('MERCADOPAGO_ACCESS_TOKEN');

            if (!$accessToken) {
                throw new Exception('Mercado Pago credentials not configured properly.');
            }

            $cpf = preg_replace('/[^0-9]/', '', $data['payer_cpf']);
            $transactionAmount = (float) $data['amount'];

            $email = !empty($order->customer_email) && filter_var($order->customer_email, FILTER_VALIDATE_EMAIL) 
                ? $order->customer_email 
                : 'boleto@seudominio.com';
                
            $nameParts = explode(' ', trim($data['payer_name']));
            $firstName = array_shift($nameParts);
            $lastName = count($nameParts) > 0 ? implode(' ', $nameParts) : $firstName;

            // Format address
            $zipCode = preg_replace('/[^0-9]/', '', $order->shipping_zip_code ?? '01001000');
            $streetName = $order->shipping_street ?? 'Rua Teste';
            $streetNumber = $order->shipping_number ?? '123';
            $neighborhood = $order->shipping_neighborhood ?? 'Centro';
            $city = $order->shipping_city ?? 'São Paulo';
            $federalUnit = $order->shipping_state ?? 'SP';

            $response = Http::withToken($accessToken)
                ->withHeaders([
                    'X-Idempotency-Key' => 'order_boleto_' . $order->id . '_' . time()
                ])
                ->post('https://api.mercadopago.com/v1/payments', [
                    'transaction_amount' => $transactionAmount,
                    'description' => 'Pedido #' . $order->order_number,
                    'payment_method_id' => 'bolbradesco',
                    'payer' => [
                        'email' => $email,
                        'first_name' => $firstName,
                        'last_name' => $lastName,
                        'identification' => [
                            'type' => 'CPF',
                            'number' => $cpf
                        ],
                        'address' => [
                            'zip_code' => $zipCode,
                            'street_name' => $streetName,
                            'street_number' => $streetNumber,
                            'neighborhood' => $neighborhood,
                            'city' => $city,
                            'federal_unit' => $federalUnit
                        ]
                    ]
                ]);

            if (!$response->successful()) {
                $errorData = $response->json();
                Log::error('MP API Error', ['response' => $errorData]);
                throw new Exception('Failed to generate Boleto via Mercado Pago. ' . json_encode($errorData));
            }

            $mpData = $response->json();

            if (isset($mpData['status']) && $mpData['status'] === 'rejected') {
                $detail = $mpData['status_detail'] ?? 'unknown_reason';
                throw new Exception("Mercado Pago rejected the Boleto generation. Reason: {$detail}. This usually happens when the CPF is invalid or you are trying to pay yourself.");
            }

            $barcode = $mpData['barcode']['content'] ?? null;
            if (!$barcode && isset($mpData['transaction_details']['barcode']['content'])) {
                $barcode = $mpData['transaction_details']['barcode']['content'];
            }
            
            $pdfUrl = $mpData['transaction_details']['external_resource_url'] ?? null;
            $transactionId = (string) $mpData['id'];

            if (!$barcode && !$pdfUrl) {
                 Log::error('MP Response JSON: ' . json_encode($mpData));
                 throw new Exception('Mercado Pago returned a successful response but no Boleto data could be found. MP Response: ' . json_encode($mpData));
            }

            $result = [
                'barcode' => $barcode,
                'pdf_url' => $pdfUrl,
                'transaction_id' => $transactionId,
            ];

            // Save to database
            BoletoDetails::updateOrCreate(
                ['order_id' => $data['order_id']],
                [
                    'payer_name' => $data['payer_name'],
                    'payer_cpf' => $cpf,
                    'barcode' => $result['barcode'],
                    'pdf_url' => $result['pdf_url'],
                    'transaction_id' => $result['transaction_id'],
                    'amount' => $transactionAmount,
                    'status' => 'pending'
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Boleto generated successfully',
                'data' => [
                    ...$result,
                    'amount' => $transactionAmount,
                    'status' => 'pending'
                ]
            ]);

        } catch (Exception $e) {
            Log::error('Boleto Generation Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate Boleto payment: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function checkPaymentStatus($orderId)
    {
        try {
            $boletoDetail = BoletoDetails::where('order_id', $orderId)->first();

            if (!$boletoDetail) {
                return response()->json([
                    'success' => false,
                    'message' => 'No Boleto payment found for this order'
                ], 404);
            }

            if ($boletoDetail->status === 'paid') {
                return response()->json([
                    'success' => true,
                    'data' => ['status' => 'paid']
                ]);
            }

            // Let's actually check MP
            if ($boletoDetail->transaction_id && !str_contains($boletoDetail->transaction_id, 'mock')) {
                $accessToken = env('MERCADOPAGO_ACCESS_TOKEN');
                $response = Http::withToken($accessToken)
                    ->get("https://api.mercadopago.com/v1/payments/{$boletoDetail->transaction_id}");

                if ($response->successful()) {
                    $mpStatus = $response->json()['status'] ?? null;
                    
                    if ($mpStatus === 'approved') {
                        $boletoDetail->update(['status' => 'paid']);
                        $order = Order::find($orderId);
                        if ($order) {
                            $order->update(['payment_status' => 'paid', 'status' => 'processing']);
                        }
                    } elseif ($mpStatus === 'cancelled' || $mpStatus === 'rejected') {
                        $boletoDetail->update(['status' => 'expired']);
                        return response()->json([
                            'success' => true,
                            'data' => ['status' => 'expired']
                        ]);
                    }
                }
            }

            return response()->json([
                'success' => true,
                'data' => ['status' => $boletoDetail->status]
            ]);

        } catch (Exception $e) {
            Log::error('Boleto Status Check Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to check Boleto payment status'
            ], 500);
        }
    }
}
