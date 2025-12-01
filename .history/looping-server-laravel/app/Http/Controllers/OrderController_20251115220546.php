<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Exception;

class OrderController extends Controller
{
    /**
     * Display a listing of the orders.
     */
    public function index(): JsonResponse
    {
        try {
            Log::info('=== ORDERS INDEX START ===');

            // Teste de conexão com o banco
            $dbConnected = true;
            try {
                DB::connection()->getPdo();
                Log::info('Database connection: OK');
            } catch (Exception $e) {
                Log::error('Database connection failed: ' . $e->getMessage());
                $dbConnected = false;
            }

            $tableExists = $dbConnected && Schema::hasTable('orders');
            if ($tableExists) {
                Log::info('Orders table exists: YES');
            } else {
                Log::info('Orders table exists: NO');
            }

            // Buscar pedidos reais
            $orders = [];
            if ($tableExists) {
                try {
                    $orders = Order::select([
                        'id',
                        'order_number',
                        'customer_name',
                        'customer_email',
                        'customer_phone',
                        'customer_cpf',
                        'total',
                        'subtotal',
                        'shipping',
                        'discount',
                        'payment_method',
                        'payment_status',
                        'status',
                        'shipping_street',
                        'shipping_number',
                        'shipping_complement',
                        'shipping_neighborhood',
                        'shipping_city',
                        'shipping_state',
                        'shipping_zip_code',
                        'items',
                        'pix_data',
                        'metadata',
                        'created_at',
                        'updated_at'
                    ])->get();

                    Log::info('Fetched ' . $orders->count() . ' orders from database');
                } catch (Exception $e) {
                    Log::error('Failed to fetch orders: ' . $e->getMessage());
                    // Continuar com array vazio
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Orders fetched successfully',
                'data' => $orders,
                'debug' => [
                    'server' => 'running',
                    'database_connected' => $dbConnected,
                    'orders_table_exists' => $tableExists,
                    'total_orders' => $orders->count(),
                    'timestamp' => now()->format('c') // ISO 8601 válido
                ]
            ]);

        } catch (Exception $e) {
            Log::error('=== ORDERS INDEX ERROR ===');
            Log::error('Error: ' . $e->getMessage());
            Log::error('File: ' . $e->getFile() . ':' . $e->getLine());

            return response()->json([
                'success' => false,
                'message' => 'Server error occurred',
                'error' => 'Check Laravel logs for details',
                'debug' => [
                    'exception' => get_class($e),
                    'message' => $e->getMessage(),
                    'timestamp' => now()->format('c')
                ]
            ], 500);
        }
    }

    /**
     * Simple test endpoint
     */
    public function test(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'OrderController is working!',
            'timestamp' => now()->format('c'),
            'status' => 'OK'
        ]);
    }

    /**
     * Generate sample orders and save to database.
     */
    public function generateSamples(): JsonResponse
    {
        try {
            if (!Schema::hasTable('orders')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Orders table does not exist. Run migrations first.',
                    'debug' => ['table_missing' => true]
                ], 500);
            }

            $sampleOrders = [
                [
                    'order_number' => 'ORD-' . strtoupper(substr(uniqid(), -6)),
                    'customer_name' => 'João Silva',
                    'customer_email' => 'joao@example.com',
                    'customer_phone' => '(11) 98765-4321',
                    'customer_cpf' => '123.456.789-00',
                    'total' => 159.90,
                    'subtotal' => 149.90,
                    'shipping' => 10.00,
                    'discount' => 0.00,
                    'payment_method' => 'pix',
                    'payment_status' => 'paid',
                    'status' => 'processing',
                    'shipping_street' => 'Rua das Flores',
                    'shipping_number' => '123',
                    'shipping_complement' => 'Apto 45',
                    'shipping_neighborhood' => 'Jardim Primavera',
                    'shipping_city' => 'São Paulo',
                    'shipping_state' => 'SP',
                    'shipping_zip_code' => '01234-567',
                    'items' => json_encode([
                        ['product_name' => 'Camiseta Premium', 'quantity' => 1, 'price' => 79.90, 'total' => 79.90],
                        ['product_name' => 'Caneca Personalizada', 'quantity' => 1, 'price' => 70.00, 'total' => 70.00]
                    ]),
                    'pix_data' => json_encode(['txid' => 'PIX123456789', 'qr_code' => '000201...']),
                    'metadata' => json_encode(['source' => 'sample_generator'])
                ],
                [
                    'order_number' => 'ORD-' . strtoupper(substr(uniqid(), -6)),
                    'customer_name' => 'Maria Oliveira',
                    'customer_email' => 'maria@example.com',
                    'total' => 89.90,
                    'subtotal' => 89.90,
                    'shipping' => 0.00,
                    'discount' => 10.00,
                    'payment_method' => 'credit_card',
                    'payment_status' => 'paid',
                    'status' => 'shipped',
                    'items' => json_encode([
                        ['product_name' => 'Livro Laravel Avançado', 'quantity' => 1, 'price' => 89.90, 'total' => 89.90]
                    ])
                ]
            ];

            $created = [];
            foreach ($sampleOrders as $data) {
                try {
                    $order = Order::create($data);
                    $created[] = $order->refresh(); // Recarrega com dados do banco
                } catch (Exception $e) {
                    Log::warning('Failed to create sample order: ' . $e->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Sample orders generated and saved to database',
                'data' => $created,
                'debug' => [
                    'sample_count' => count($created),
                    'timestamp' => now()->format('c')
                ]
            ]);

        } catch (Exception $e) {
            Log::error('Generate samples error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate samples',
                'error' => $e->getMessage(),
                'debug' => ['timestamp' => now()->format('c')]
            ], 500);
        }
    }
}