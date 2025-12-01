<?php

namespace App\Http\Controllers\Api; // MUDEI AQUI

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

            $dbConnected = true;
            try {
                DB::connection()->getPdo();
                Log::info('Database connection: OK');
            } catch (Exception $e) {
                Log::error('Database connection failed: ' . $e->getMessage());
                $dbConnected = false;
            }

            $tableExists = $dbConnected && Schema::hasTable('orders');
            Log::info('Orders table exists: ' . ($tableExists ? 'YES' : 'NO'));

            $orders = [];
            if ($tableExists) {
                try {
                    $orders = Order::select([
                        'id',
                        'order_id', // novo campo
                        'customer_name',
                        'customer_email',
                        'customer_phone',
                        'customer_cpf',
                        'total',
                        'subtotal',
                        'shipping_cost', // renomeado
                        'discount',
                        'payment_method',
                        'payment_status',
                        'status',
                        'shipping_street',
                        'shipping_number',
                        'shipping_complement',
                        'shipping_hood', // renomeado
                        'shipping_city',
                        'shipping_state',
                        'shipping_cep', // renomeado
                        'shipping_method',
                        'shipping_company',
                        'shipping_price',
                        'items',
                        'raw_data', // backup completo
                        'created_at',
                        'updated_at'
                    ])->get();

                    Log::info('Fetched ' . $orders->count() . ' orders from database');
                } catch (Exception $e) {
                    Log::error('Failed to fetch orders: ' . $e->getMessage());
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
                    'timestamp' => now()->format('c')
                ]
            ]);

        } catch (Exception $e) {
            Log::error('=== ORDERS INDEX ERROR ===', [
                'error' => $e->getMessage(),
                'file' => $e->getFile() . ':' . $e->getLine()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Server error occurred',
                'error' => 'Check Laravel logs',
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
     * Generate sample orders
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
                    'order_id' => 'ORD-' . strtoupper(substr(uniqid(), -6)),
                    'customer_name' => 'João Silva',
                    'customer_email' => 'joao@example.com',
                    'customer_phone' => '(11) 98765-4321',
                    'customer_cpf' => '123.456.789-00',
                    'total' => 159.90,
                    'subtotal' => 149.90,
                    'shipping_cost' => 10.00,
                    'discount' => 0.00,
                    'payment_method' => 'pix',
                    'payment_status' => 'paid',
                    'status' => 'processing',
                    'shipping_street' => 'Rua das Flores',
                    'shipping_number' => '123',
                    'shipping_complement' => 'Apto 45',
                    'shipping_hood' => 'Jardim Primavera',
                    'shipping_city' => 'São Paulo',
                    'shipping_state' => 'SP',
                    'shipping_cep' => '01234-567',
                    'items' => json_encode([
                        ['product_name' => 'Camiseta Premium', 'quantity' => 1, 'price' => 79.90, 'total' => 79.90],
                        ['product_name' => 'Caneca Personalizada', 'quantity' => 1, 'price' => 70.00, 'total' => 70.00]
                    ]),
                    'raw_data' => json_encode(['source' => 'sample_generator'])
                ],
             
            ];

            $created = [];
            foreach ($sampleOrders as $data) {
                try {
                    $order = Order::create($data);
                    $created[] = $order->refresh();
                } catch (Exception $e) {
                    Log::warning('Failed to create sample order: ' . $e->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Sample orders generated',
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
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * STORE ORDER FROM CHECKOUT (NOVA FUNÇÃO)
     */
    public function store(Request $request): JsonResponse
    {
        Log::info('=== ORDER STORE START ===');
        Log::info('Request data:', $request->all());

        try {
            $data = $request->json()->all();

            // Validação
            $request->validate([
                'order.id' => 'required|string',
                'order.customer.name' => 'required|string',
                'order.customer.email' => 'required|email',
                'order.shipping_address.zip_code' => 'required|string',
                'order.items' => 'required|array|min:1',
            ]);

            $orderData = $data['order'];

            $order = Order::create([
                'order_id' => $orderData['id'],
                'customer_name' => $orderData['customer']['name'],
                'customer_email' => $orderData['customer']['email'],
                'customer_phone' => $orderData['customer']['phone'] ?? null,
                'customer_cpf' => $orderData['customer']['cpf'] ?? null,
                'status' => $orderData['status'] ?? 'pending',
                'payment_method' => $orderData['payment']['method'],
                'payment_status' => $orderData['payment']['status'] ?? 'pending',
                'subtotal' => $orderData['totals']['subtotal'],
                'shipping_cost' => $orderData['totals']['shipping'],
                'discount' => $orderData['totals']['discount'],
                'total' => $orderData['totals']['total'],

                'shipping_street' => $orderData['shipping_address']['street'],
                'shipping_number' => $orderData['shipping_address']['number'],
                'shipping_complement' => $orderData['shipping_address']['complement'] ?? null,
                'shipping_hood' => $orderData['shipping_address']['neighborhood'],
                'shipping_city' => $orderData['shipping_address']['city'],
                'shipping_state' => $orderData['shipping_address']['state'],
                'shipping_cep' => $orderData['shipping_address']['zip_code'],

                'shipping_method' => $orderData['shipping_method']['name'] ?? null,
                'shipping_company' => $orderData['shipping_method']['company'] ?? null,
                'shipping_price' => $orderData['shipping_method']['price'] ?? null,

                'items' => json_encode($orderData['items']),
                'raw_data' => json_encode($orderData), // backup completo
            ]);

            Log::info('Order saved successfully', ['order_id' => $order->order_id]);

            return response()->json([
                'success' => true,
                'message' => 'Pedido salvo com sucesso!',
                'order_id' => $order->id,
                'order_ref' => $order->order_id,
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed', $e->errors());
            return response()->json([
                'success' => false,
                'message' => 'Dados inválidos',
                'errors' => $e->errors()
            ], 422);

        } catch (Exception $e) {
            Log::error('Order store error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro ao salvar pedido',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}