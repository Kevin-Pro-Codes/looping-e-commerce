<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PixDetails;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Exception;
use Illuminate\Support\Collection;

class OrderController extends Controller
{
    /**
     * Display a listing of the orders.
     */
    public function index(): JsonResponse
    {
        try {
            Log::info('=== ORDERS INDEX START ===');

            // Test database connection
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

            // Always use a Collection → safe ->count()
            $orders = collect();

            if ($tableExists) {
                try {
                    $orders = Order::with(['pixDetails', 'items'])
                        ->select([
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
                            'metadata',
                            'created_at',
                            'updated_at'
                        ])
                        ->latest()
                        ->get();

                    Log::info('Fetched ' . $orders->count() . ' orders from database');
                } catch (Exception $e) {
                    Log::error('Failed to fetch orders: ' . $e->getMessage());
                    $orders = collect(); // Keep as Collection even on error
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
     * Create a new order with PIX payment integration
     * POST /api/orders
     */
    public function store(Request $request): JsonResponse
    {
        DB::beginTransaction();
        
        try {
            Log::info('=== ORDER STORE START ===');
            Log::info('Order data received:', $request->all());

            // Validate required fields
            $validated = $request->validate([
                'customer_name' => 'required|string|max:255',
                'customer_email' => 'required|email',
                'customer_phone' => 'required|string',
                'customer_cpf' => 'required|string|max:14',
                'total' => 'required|numeric|min:0',
                'subtotal' => 'required|numeric|min:0',
                'shipping' => 'required|numeric|min:0',
                'discount' => 'nullable|numeric|min:0',
                'payment_method' => 'required|string|in:pix,credit_card,debit_card,boleto',
                'payment_status' => 'required|string|in:pending,paid,failed,refunded',
                'status' => 'required|string|in:pending,processing,shipped,delivered,cancelled',
                'shipping_street' => 'required|string',
                'shipping_number' => 'required|string',
                'shipping_complement' => 'nullable|string',
                'shipping_neighborhood' => 'required|string',
                'shipping_city' => 'required|string',
                'shipping_state' => 'required|string|max:2',
                'shipping_zip_code' => 'required|string|max:9',
                'items' => 'required|array|min:1',
                'items.*.product_name' => 'required|string',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.price' => 'required|numeric|min:0',
                'items.*.size' => 'nullable|string',
                'items.*.color' => 'nullable|string',
                'items.*.image' => 'nullable|string',
            ]);

            // Generate order number
            $orderNumber = 'ORD' . date('Ymd') . str_pad(Order::count() + 1, 5, '0', STR_PAD_LEFT);

            // Create the order
            $order = Order::create([
                'order_number' => $orderNumber,
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'],
                'customer_phone' => $validated['customer_phone'],
                'customer_cpf' => $validated['customer_cpf'],
                'total' => $validated['total'],
                'subtotal' => $validated['subtotal'],
                'shipping' => $validated['shipping'],
                'discount' => $validated['discount'] ?? 0,
                'payment_method' => $validated['payment_method'],
                'payment_status' => $validated['payment_status'],
                'status' => $validated['status'],
                'shipping_street' => $validated['shipping_street'],
                'shipping_number' => $validated['shipping_number'],
                'shipping_complement' => $validated['shipping_complement'] ?? null,
                'shipping_neighborhood' => $validated['shipping_neighborhood'],
                'shipping_city' => $validated['shipping_city'],
                'shipping_state' => $validated['shipping_state'],
                'shipping_zip_code' => $validated['shipping_zip_code'],
                'metadata' => $request->metadata ? json_encode($request->metadata) : null,
            ]);

            // Create order items
            foreach ($validated['items'] as $item) {
                $order->items()->create([
                    'product_id' => $item['product_id'] ?? null,
                    'product_name' => $item['product_name'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'total' => $item['price'] * $item['quantity'],
                    'size' => $item['size'] ?? null,
                    'color' => $item['color'] ?? null,
                    'image' => $item['image'] ?? null,
                    'variant_id' => $item['variant_id'] ?? null,
                    'sku' => $item['sku'] ?? null,
                ]);
            }

            // If payment method is PIX, generate PIX details
            $pixData = null;
            if ($validated['payment_method'] === 'pix') {
                $pixData = $this->generatePixDetails($order, $validated);
            }

            DB::commit();

            Log::info('Order created successfully:', [
                'order_id' => $order->id, 
                'order_number' => $order->order_number
            ]);

            $responseData = [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'order' => $order->load(['items', 'pixDetails']),
            ];

            if ($pixData) {
                $responseData['pix_payment'] = $pixData;
            }

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => $responseData,
                'debug' => [
                    'timestamp' => now()->format('c'),
                    'order_id' => $order->id
                ]
            ], 201);

        } catch (Exception $e) {
            DB::rollBack();
            
            Log::error('=== ORDER STORE ERROR ===');
            Log::error('Error: ' . $e->getMessage());
            Log::error('File: ' . $e->getFile() . ':' . $e->getLine());
            Log::error('Request data: ', $request->all());

            return response()->json([
                'success' => false,
                'message' => 'Failed to create order',
                'error' => $e->getMessage(),
                'debug' => [
                    'exception' => get_class($e),
                    'message' => $e->getMessage(),
                    'timestamp' => now()->format('c')
                ]
            ], 500);
        }
    }

    /**
     * Generate PIX payment details for an order
     */
    private function generatePixDetails(Order $order, array $data): array
    {
        try {
            $transactionId = 'PIX_' . uniqid() . '_' . time();
            $pixCode = $this->generatePixCode($data['total'], $transactionId);
            $qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" . urlencode($pixCode);

            // Create PIX details record
            $pixDetails = PixDetails::create([
                'order_id' => $order->id,
                'payer_name' => $data['customer_name'],
                'payer_cpf' => $data['customer_cpf'],
                'pix_key' => 'mock-pix-key-' . $transactionId,
                'qr_code' => $qrCodeUrl,
                'transaction_id' => $transactionId,
                'amount' => $data['total'],
                'status' => 'pending',
                'expires_at' => now()->addMinutes(30),
            ]);

            return [
                'pix_qr_code' => $qrCodeUrl,
                'pix_code' => $pixCode,
                'transaction_id' => $transactionId,
                'amount' => $data['total'],
                'expires_at' => $pixDetails->expires_at->format('c'),
            ];

        } catch (Exception $e) {
            Log::error('PIX Details Generation Error: ' . $e->getMessage());
            throw $e;
        }
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
     * Update order status and payment status
     * PUT /api/orders/{id}/status
     */
    public function updateStatus($id, Request $request): JsonResponse
    {
        DB::beginTransaction();
        
        try {
            Log::info('=== ORDER STATUS UPDATE START ===', ['order_id' => $id]);

            // Validate input
            $validated = $request->validate([
                'status' => 'required|string|in:pending,processing,shipped,delivered,cancelled',
                'payment_status' => 'required|string|in:pending,paid,failed,refunded'
            ]);

            // Find order
            $order = Order::with('pixDetails')->find($id);
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found',
                    'debug' => ['order_id' => $id]
                ], 404);
            }

            // Update order fields
            $order->status = $validated['status'];
            $order->payment_status = $validated['payment_status'];
            $order->save();

            // If payment status changed to paid and has PIX details, update PIX status
            if ($validated['payment_status'] === 'paid' && $order->pixDetails) {
                $order->pixDetails->update([
                    'status' => 'paid',
                    'updated_at' => now()
                ]);
            }

            DB::commit();

            Log::info('Order status updated successfully', [
                'order_id' => $order->id,
                'status' => $order->status,
                'payment_status' => $order->payment_status
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully',
                'data' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status
                ],
                'debug' => [
                    'timestamp' => now()->format('c')
                ]
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            
            Log::error('=== ORDER STATUS UPDATE ERROR ===');
            Log::error('Error: ' . $e->getMessage());
            Log::error('File: ' . $e->getFile() . ':' . $e->getLine());
            Log::error('Request data: ', $request->all());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status',
                'error' => $e->getMessage(),
                'debug' => [
                    'exception' => get_class($e),
                    'message' => $e->getMessage(),
                    'timestamp' => now()->format('c')
                ]
            ], 500);
        }
    }

    /**
     * Check PIX payment status
     * GET /api/orders/{id}/pix-status
     */
    public function checkPixStatus($id): JsonResponse
    {
        try {
            $order = Order::with('pixDetails')->find($id);
            
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            if ($order->payment_method !== 'pix') {
                return response()->json([
                    'success' => false,
                    'message' => 'Order is not a PIX payment'
                ], 400);
            }

            if (!$order->pixDetails) {
                return response()->json([
                    'success' => false,
                    'message' => 'PIX details not found for this order'
                ], 404);
            }

            // Simulate payment status check (in real scenario, integrate with PIX provider)
            $pixStatus = $this->simulatePixStatus($order->pixDetails);

            return response()->json([
                'success' => true,
                'data' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'pix_status' => $pixStatus,
                    'payment_status' => $order->payment_status,
                    'transaction_id' => $order->pixDetails->transaction_id,
                    'amount' => $order->pixDetails->amount,
                    'expires_at' => $order->pixDetails->expires_at,
                    'updated_at' => $order->pixDetails->updated_at,
                ]
            ]);

        } catch (Exception $e) {
            Log::error('PIX Status Check Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to check PIX status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Simulate PIX status for demo purposes
     */
    private function simulatePixStatus($pixDetails): string
    {
        // For demo: auto-confirm if created more than 10 seconds ago
        if (now()->diffInSeconds($pixDetails->created_at) > 10) {
            return 'paid';
        }
        
        // Check if expired
        if (now()->greaterThan($pixDetails->expires_at)) {
            return 'expired';
        }
        
        return $pixDetails->status;
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
        DB::beginTransaction();
        
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
                    'order_number' => 'ORD' . date('Ymd') . '0001',
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
                    'items' => [
                        [
                            'product_name' => 'Camiseta Premium', 
                            'quantity' => 1, 
                            'price' => 79.90, 
                            'total' => 79.90,
                            'size' => 'M',
                            'color' => 'Azul'
                        ],
                        [
                            'product_name' => 'Caneca Personalizada', 
                            'quantity' => 1, 
                            'price' => 70.00, 
                            'total' => 70.00
                        ]
                    ]
                ],
                [
                    'order_number' => 'ORD' . date('Ymd') . '0002',
                    'customer_name' => 'Maria Oliveira',
                    'customer_email' => 'maria@example.com',
                    'customer_phone' => '(11) 91234-5678',
                    'customer_cpf' => '987.654.321-00',
                    'total' => 89.90,
                    'subtotal' => 89.90,
                    'shipping' => 0.00,
                    'discount' => 10.00,
                    'payment_method' => 'credit_card',
                    'payment_status' => 'paid',
                    'status' => 'shipped',
                    'shipping_street' => 'Avenida Principal',
                    'shipping_number' => '456',
                    'shipping_complement' => null,
                    'shipping_neighborhood' => 'Centro',
                    'shipping_city' => 'Rio de Janeiro',
                    'shipping_state' => 'RJ',
                    'shipping_zip_code' => '20000-000',
                    'items' => [
                        [
                            'product_name' => 'Livro Laravel Avançado', 
                            'quantity' => 1, 
                            'price' => 89.90, 
                            'total' => 89.90
                        ]
                    ]
                ]
            ];

            $created = [];
            foreach ($sampleOrders as $data) {
                try {
                    // Create order
                    $order = Order::create([
                        'order_number' => $data['order_number'],
                        'customer_name' => $data['customer_name'],
                        'customer_email' => $data['customer_email'],
                        'customer_phone' => $data['customer_phone'],
                        'customer_cpf' => $data['customer_cpf'],
                        'total' => $data['total'],
                        'subtotal' => $data['subtotal'],
                        'shipping' => $data['shipping'],
                        'discount' => $data['discount'],
                        'payment_method' => $data['payment_method'],
                        'payment_status' => $data['payment_status'],
                        'status' => $data['status'],
                        'shipping_street' => $data['shipping_street'],
                        'shipping_number' => $data['shipping_number'],
                        'shipping_complement' => $data['shipping_complement'],
                        'shipping_neighborhood' => $data['shipping_neighborhood'],
                        'shipping_city' => $data['shipping_city'],
                        'shipping_state' => $data['shipping_state'],
                        'shipping_zip_code' => $data['shipping_zip_code'],
                    ]);

                    // Create order items
                    foreach ($data['items'] as $item) {
                        $order->items()->create($item);
                    }

                    // Create PIX details if payment method is PIX
                    if ($data['payment_method'] === 'pix') {
                        $this->generatePixDetails($order, $data);
                    }

                    $created[] = $order->load(['items', 'pixDetails']);
                } catch (Exception $e) {
                    Log::warning('Failed to create sample order: ' . $e->getMessage());
                }
            }

            DB::commit();

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
            DB::rollBack();
            
            Log::error('Generate samples error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate samples',
                'error' => $e->getMessage(),
                'debug' => ['timestamp' => now()->format('c')]
            ], 500);
        }
    }

    /**
     * Get customers from orders table
     */
    public function getCustomers(): JsonResponse
    {
        try {
            Log::info('=== GET CUSTOMERS FROM ORDERS START ===');

            if (!Schema::hasTable('orders')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Orders table does not exist',
                    'debug' => ['table_missing' => true]
                ], 500);
            }

            $customers = DB::table('orders')
                ->select([
                    'customer_email as email',
                    'customer_name as name',
                    'customer_phone as phone',
                    'customer_cpf as cpf',
                    DB::raw('COUNT(*) as orders_count'),
                    DB::raw('SUM(total) as total_spent'),
                    DB::raw('MAX(created_at) as last_purchase'),
                    DB::raw('MIN(created_at) as first_order'),
                    DB::raw('CONCAT(shipping_street, ", ", shipping_number, " - ", shipping_city, ", ", shipping_state) as address')
                ])
                ->whereNotNull('customer_email')
                ->groupBy('customer_email', 'customer_name', 'customer_phone', 'customer_cpf', 'shipping_street', 'shipping_number', 'shipping_city', 'shipping_state')
                ->get()
                ->map(function($customer) {
                    return [
                        'email' => $customer->email,
                        'name' => $customer->name,
                        'phone' => $customer->phone,
                        'cpf' => $customer->cpf,
                        'orders_count' => $customer->orders_count,
                        'total_spent' => $customer->total_spent ?: 0,
                        'last_purchase' => $customer->last_purchase,
                        'first_order' => $customer->first_order,
                        'address' => $customer->address,
                        'status' => 'active'
                    ];
                });

            Log::info('Found ' . $customers->count() . ' customers from orders');

            return response()->json([
                'success' => true,
                'message' => 'Customers fetched from orders successfully',
                'data' => $customers,
                'debug' => [
                    'total_customers' => $customers->count(),
                    'timestamp' => now()->format('c')
                ]
            ]);

        } catch (Exception $e) {
            Log::error('=== GET CUSTOMERS FROM ORDERS ERROR ===');
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch customers from orders',
                'error' => $e->getMessage(),
                'debug' => ['timestamp' => now()->format('c')]
            ], 500);
        }
    }
}