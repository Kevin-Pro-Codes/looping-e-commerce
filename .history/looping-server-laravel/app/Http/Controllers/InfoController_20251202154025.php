<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Info;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Exception;
use Illuminate\Support\Collection;

class InfoController extends Controller
{
    /**
     * Display a listing of the infos.
     */
    public function index(): JsonResponse
    {
        try {
            Log::info('=== INFOS INDEX START ===');

            // Test database connection
            $dbConnected = true;
            try {
                DB::connection()->getPdo();
                Log::info('Database connection: OK');
            } catch (Exception $e) {
                Log::error('Database connection failed: ' . $e->getMessage());
                $dbConnected = false;
            }

            $tableExists = $dbConnected && Schema::hasTable('infos');
            if ($tableExists) {
                Log::info('Infos table exists: YES');
            } else {
                Log::info('Infos table exists: NO');
            }

            // Always use a Collection → safe ->count()
            $infos = collect();

            if ($tableExists) {
                try {
                    $infos = Info::select([
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
                        'metadata',
                        'created_at',
                        'updated_at'
                    ])->get();

                    Log::info('Fetched ' . $infos->count() . ' infos from database');
                } catch (Exception $e) {
                    Log::error('Failed to fetch infos: ' . $e->getMessage());
                    $infos = collect(); // Keep as Collection even on error
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Infos fetched successfully',
                'data' => $infos,
                'debug' => [
                    'server' => 'running',
                    'database_connected' => $dbConnected,
                    'infos_table_exists' => $tableExists,
                    'total_infos' => $infos->count(),
                    'timestamp' => now()->format('c')
                ]
            ]);

        } catch (Exception $e) {
            Log::error('=== INFOS INDEX ERROR ===');
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
     * Update info status and payment status
     * PUT /api/infos/{id}/status
     */
    public function updateStatus($id, Request $request): JsonResponse
    {
        try {
            Log::info('=== INFO STATUS UPDATE START ===', ['info_id' => $id]);

            // Validate input
            $validated = $request->validate([
                'status' => 'required|string|in:pending,processing,shipped,delivered,cancelled',
                'payment_status' => 'required|string|in:pending,paid,failed,refunded'
            ]);

            // Find info
            $info = Info::find($id);
            if (!$info) {
                return response()->json([
                    'success' => false,
                    'message' => 'Info not found',
                    'debug' => ['info_id' => $id]
                ], 404);
            }

            // Get old payment status for comparison
            $oldPaymentStatus = $info->payment_status;
            $newPaymentStatus = $validated['payment_status'];

            // Store the old status before update
            $oldStatus = $info->status;

            // ✅ CRITICAL FIX: Sync stock BEFORE updating the order status
            if ($oldPaymentStatus !== $newPaymentStatus) {
                if ($newPaymentStatus === 'paid') {
                    // Reduce stock when order is paid
                    $stockResult = $this->syncStockForOrder($info);
                    Log::info('Stock reduced for paid order:', $stockResult);
                    
                    // Update the response message
                    $message = 'Info status updated successfully. Stock reduced for paid order.';
                } elseif (($oldPaymentStatus === 'paid') && in_array($newPaymentStatus, ['refunded', 'cancelled'])) {
                    // Restore stock when paid order is cancelled/refunded
                    $stockResult = $this->reverseStockForOrder($info);
                    Log::info('Stock restored for cancelled order:', $stockResult);
                    
                    // Update the response message
                    $message = 'Info status updated successfully. Stock restored for cancelled order.';
                } else {
                    $message = 'Info status updated successfully';
                }
            } else {
                $message = 'Info status updated successfully';
            }

            // Also handle status changes that affect stock
            if (($oldStatus !== 'cancelled') && ($validated['status'] === 'cancelled') && ($info->payment_status === 'paid')) {
                // If changing status to cancelled and order was paid, restore stock
                $stockResult = $this->reverseStockForOrder($info);
                Log::info('Stock restored for status change to cancelled:', $stockResult);
                $message = 'Info status updated to cancelled. Stock restored.';
            }

            // Update fields
            $info->status = $validated['status'];
            $info->payment_status = $newPaymentStatus;
            $info->save();

            Log::info('Info status updated successfully', [
                'info_id' => $info->id,
                'status' => $info->status,
                'payment_status' => $info->payment_status,
                'old_payment_status' => $oldPaymentStatus,
                'old_status' => $oldStatus
            ]);

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => [
                    'info_id' => $info->id,
                    'order_number' => $info->order_number,
                    'status' => $info->status,
                    'payment_status' => $info->payment_status,
                    'stock_synced' => ($oldPaymentStatus !== $newPaymentStatus) && ($newPaymentStatus === 'paid')
                ],
                'debug' => [
                    'timestamp' => now()->format('c')
                ]
            ]);

        } catch (Exception $e) {
            Log::error('=== INFO STATUS UPDATE ERROR ===');
            Log::error('Error: ' . $e->getMessage());
            Log::error('File: ' . $e->getFile() . ':' . $e->getLine());
            Log::error('Request data: ', $request->all());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update info status',
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
     * Simple test endpoint
     */
    public function test(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'InfoController is working!',
            'timestamp' => now()->format('c'),
            'status' => 'OK'
        ]);
    }

    /**
     * Store a newly created info (POST /api/infos)
     */
    public function store(Request $request): JsonResponse
    {
        try {
            Log::info('=== INFO STORE START ===');
            Log::info('Info data received:', $request->all());

            // More flexible validation with proper defaults
            $validated = $request->validate([
                'customer_name' => 'required|string|max:255',
                'customer_email' => 'required|email',
                'customer_phone' => 'required|string',
                'customer_cpf' => 'required|string',
                'total' => 'required|numeric|min:0',
                'subtotal' => 'required|numeric|min:0',
                'shipping' => 'required|numeric|min:0',
                'discount' => 'sometimes|numeric|min:0',
                'payment_method' => 'required|string|in:pix,credit,debit,boleto',
                'payment_status' => 'required|string|in:pending,paid,failed,refunded',
                'status' => 'required|string|in:pending,processing,shipped,delivered,cancelled',
                'shipping_street' => 'required|string',
                'shipping_number' => 'required|string',
                'shipping_complement' => 'nullable|string',
                'shipping_neighborhood' => 'required|string',
                'shipping_city' => 'required|string',
                'shipping_state' => 'required|string|size:2',
                'shipping_zip_code' => 'required|string',
                'items' => 'required|array|min:1',
                'items.*.product_name' => 'required|string',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.price' => 'required|numeric|min:0',
                'items.*.total' => 'required|numeric|min:0',
                'items.*.image' => 'sometimes|string|nullable',
                'items.*.color' => 'sometimes|string|nullable',
                'items.*.size' => 'sometimes|string|nullable',
            ]);

            // Generate order number if not provided
            $orderNumber = $request->order_number ?? 'ORD-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));

            // Prepare the data with defaults
            $infoData = [
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
                'payment_status' => $validated['payment_status'] ?? 'pending',
                'status' => $validated['status'] ?? 'pending',
                'shipping_street' => $validated['shipping_street'],
                'shipping_number' => $validated['shipping_number'],
                'shipping_complement' => $validated['shipping_complement'] ?? null,
                'shipping_neighborhood' => $validated['shipping_neighborhood'],
                'shipping_city' => $validated['shipping_city'],
                'shipping_state' => $validated['shipping_state'],
                'shipping_zip_code' => $validated['shipping_zip_code'],
                'items' => json_encode($validated['items']),
                'metadata' => $request->metadata ? json_encode($request->metadata) : null,
            ];

            Log::info('Creating info with data:', $infoData);

            // Create the order
            $info = Info::create($infoData);

            // ✅ NEW: Automatically sync stock if payment is paid
            if ($validated['payment_status'] === 'paid') {
                $stockSyncResult = $this->syncStockForOrder($info);
                Log::info('Stock synced for new paid order', $stockSyncResult);
            }

            Log::info('Info created successfully:', [
                'info_id' => $info->id, 
                'order_number' => $info->order_number
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => [
                    'order_id' => $info->id,
                    'order_number' => $info->order_number,
                    'order' => $info,
                    'stock_synced' => ($validated['payment_status'] === 'paid')
                ],
                'debug' => [
                    'timestamp' => now()->format('c'),
                    'info_id' => $info->id
                ]
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('=== INFO STORE VALIDATION ERROR ===');
            Log::error('Validation errors:', $e->errors());
            Log::error('Request data: ', $request->all());

            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
                'debug' => [
                    'timestamp' => now()->format('c')
                ]
            ], 422);

        } catch (Exception $e) {
            Log::error('=== INFO STORE ERROR ===');
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
     * Generate sample infos and save to database.
     */
    public function generateSamples(): JsonResponse
    {
        try {
            if (!Schema::hasTable('infos')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Infos table does not exist. Run migrations first.',
                    'debug' => ['table_missing' => true]
                ], 500);
            }

            $sampleInfos = [
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
                        [
                            'product_name' => 'Camiseta Premium', 
                            'quantity' => 2, 
                            'price' => 79.90, 
                            'total' => 159.80,
                            'image' => 'https://example.com/images/camiseta-premium.jpg',
                            'color' => 'Azul',
                            'size' => 'M'
                        ],
                        [
                            'product_name' => 'Caneca Personalizada', 
                            'quantity' => 1, 
                            'price' => 70.00, 
                            'total' => 70.00,
                            'image' => 'https://example.com/images/caneca-personalizada.jpg',
                            'color' => 'Branco',
                            'size' => 'Único'
                        ]
                    ]),
                    'metadata' => json_encode(['source' => 'sample_generator'])
                ],
                [
                    'order_number' => 'ORD-' . strtoupper(substr(uniqid(), -6)),
                    'customer_name' => 'Maria Oliveira',
                    'customer_email' => 'maria@example.com',
                    'customer_phone' => '(21) 98765-4321',
                    'customer_cpf' => '987.654.321-00',
                    'total' => 89.90,
                    'subtotal' => 89.90,
                    'shipping' => 0.00,
                    'discount' => 10.00,
                    'payment_method' => 'credit_card',
                    'payment_status' => 'pending',
                    'status' => 'pending',
                    'shipping_street' => 'Avenida Brasil',
                    'shipping_number' => '456',
                    'shipping_neighborhood' => 'Centro',
                    'shipping_city' => 'Rio de Janeiro',
                    'shipping_state' => 'RJ',
                    'shipping_zip_code' => '20000-000',
                    'items' => json_encode([
                        [
                            'product_name' => 'Camiseta Premium', 
                            'quantity' => 1, 
                            'price' => 89.90, 
                            'total' => 89.90,
                            'image' => 'https://example.com/images/camiseta-premium.jpg',
                            'color' => 'Preto',
                            'size' => 'G'
                        ]
                    ])
                ]
            ];

            $created = [];
            foreach ($sampleInfos as $data) {
                try {
                    $info = Info::create($data);
                    
                    // Sync stock for paid orders
                    if ($info->payment_status === 'paid') {
                        $this->syncStockForOrder($info);
                    }
                    
                    $created[] = $info->refresh();
                } catch (Exception $e) {
                    Log::warning('Failed to create sample info: ' . $e->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Sample infos generated and saved to database',
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

    /**
     * Get customers from infos table - FIXED VERSION
     */
    public function getCustomersFromInfos(): JsonResponse
    {
        try {
            Log::info('=== GET CUSTOMERS FROM INFOS START ===');

            if (!Schema::hasTable('infos')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Infos table does not exist',
                    'debug' => ['table_missing' => true]
                ], 500);
            }

            $customerData = DB::table('infos')
                ->select([
                    'customer_email as email',
                    'customer_name as name',
                    'customer_phone as phone',
                    'customer_cpf as cpf',
                    DB::raw('COUNT(*) as orders_count'),
                    DB::raw('SUM(total) as total_spent'),
                    DB::raw('MAX(created_at) as last_purchase'),
                    DB::raw('MIN(created_at) as first_order'),
                    DB::raw('CONCAT(shipping_street, ", ", shipping_number, " - ", shipping_neighborhood, ", ", shipping_city, "/", shipping_state) as address')
                ])
                ->whereNotNull('customer_email')
                ->groupBy('customer_email', 'customer_name', 'customer_phone', 'customer_cpf', 
                         'shipping_street', 'shipping_number', 'shipping_neighborhood', 
                         'shipping_city', 'shipping_state')
                ->get();

            // Add IDs and status manually
            $customers = $customerData->map(function($customer, $index) {
                return [
                    'id' => $index + 1, // Simple sequential ID
                    'email' => $customer->email,
                    'name' => $customer->name,
                    'phone' => $customer->phone,
                    'cpf' => $customer->cpf,
                    'orders_count' => (int) $customer->orders_count,
                    'total_spent' => floatval($customer->total_spent ?: 0),
                    'last_purchase' => $customer->last_purchase,
                    'first_order' => $customer->first_order,
                    'address' => $customer->address,
                    'status' => 'active' // Default status
                ];
            });

            Log::info('Found ' . $customers->count() . ' customers from infos');

            return response()->json([
                'success' => true,
                'message' => 'Customers fetched from infos successfully',
                'data' => $customers,
                'debug' => [
                    'total_customers' => $customers->count(),
                    'timestamp' => now()->format('c')
                ]
            ]);

        } catch (Exception $e) {
            Log::error('=== GET CUSTOMERS FROM INFOS ERROR ===');
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch customers from infos',
                'error' => $e->getMessage(),
                'debug' => ['timestamp' => now()->format('c')]
            ], 500);
        }
    }

    /**
     * Get customer statistics - FIXED VERSION
     */
    public function getCustomerStats(): JsonResponse
    {
        try {
            Log::info('=== GET CUSTOMER STATS START ===');

            $totalCustomers = DB::table('infos')
                ->distinct('customer_email')
                ->whereNotNull('customer_email')
                ->count('customer_email');
                
            $totalRevenue = DB::table('infos')
                ->where('payment_status', 'paid')
                ->sum('total');
                
            $activeCustomers = DB::table('infos')
                ->distinct('customer_email')
                ->whereNotNull('customer_email')
                ->count('customer_email');

            $newCustomers = DB::table('infos')
                ->select('customer_email')
                ->where('created_at', '>=', now()->subDays(7))
                ->distinct()
                ->count('customer_email');

            Log::info('Customer stats calculated', [
                'total_customers' => $totalCustomers,
                'total_revenue' => $totalRevenue
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'total' => $totalCustomers,
                    'active' => $activeCustomers,
                    'new_customers' => $newCustomers,
                    'total_revenue' => $totalRevenue ?: 0,
                    'timestamp' => now()->format('c')
                ]
            ]);

        } catch (Exception $e) {
            Log::error('Customer stats error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch customer statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get customer by email
     */
    public function getCustomerByEmail($email): JsonResponse
    {
        try {
            Log::info('=== GET CUSTOMER BY EMAIL START ===', ['email' => $email]);

            $customerOrders = Info::where('customer_email', $email)
                ->orderBy('created_at', 'desc')
                ->get();

            if ($customerOrders->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Customer not found'
                ], 404);
            }

            $firstOrder = $customerOrders->last();
            $lastOrder = $customerOrders->first();

            $customerData = [
                'id' => $customerOrders->first()->id,
                'email' => $email,
                'name' => $firstOrder->customer_name,
                'phone' => $firstOrder->customer_phone,
                'cpf' => $firstOrder->customer_cpf,
                'orders_count' => $customerOrders->count(),
                'total_spent' => $customerOrders->where('payment_status', 'paid')->sum('total'),
                'last_purchase' => $lastOrder->created_at,
                'first_order' => $firstOrder->created_at,
                'address' => $firstOrder->shipping_street . ', ' . $firstOrder->shipping_number . ' - ' . $firstOrder->shipping_neighborhood . ', ' . $firstOrder->shipping_city . '/' . $firstOrder->shipping_state,
                'status' => 'active'
            ];

            return response()->json([
                'success' => true,
                'data' => $customerData
            ]);

        } catch (Exception $e) {
            Log::error('Get customer by email error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch customer'
            ], 500);
        }
    }

    /**
     * Search customers
     */
    public function searchCustomers(Request $request): JsonResponse
    {
        try {
            $search = $request->get('search', '');

            $customers = DB::table('infos')
                ->select([
                    'customer_email as email',
                    'customer_name as name',
                    'customer_phone as phone',
                    DB::raw('COUNT(*) as orders_count'),
                    DB::raw('SUM(total) as total_spent'),
                    DB::raw('MAX(created_at) as last_order_date')
                ])
                ->whereNotNull('customer_email')
                ->where(function($query) use ($search) {
                    $query->where('customer_name', 'like', "%{$search}%")
                          ->orWhere('customer_email', 'like', "%{$search}%")
                          ->orWhere('customer_phone', 'like', "%{$search}%");
                })
                ->groupBy('customer_email', 'customer_name', 'customer_phone')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $customers,
                'debug' => [
                    'search_term' => $search,
                    'results_count' => $customers->count()
                ]
            ]);

        } catch (Exception $e) {
            Log::error('Search customers error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to search customers'
            ], 500);
        }
    }

    /**
     * Sync stock for a specific order when payment is made
     * This DIRECTLY UPDATES the "stock" column in the database
     * @param Info $order
     * @return array
     */
    private function syncStockForOrder(Info $order): array
    {
        DB::beginTransaction();
        
        try {
            Log::info('=== SYNC STOCK FOR ORDER START ===', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'payment_status' => $order->payment_status
            ]);

            $items = json_decode($order->items, true);
            if (!$items || !is_array($items)) {
                Log::warning('No items found in order or invalid items format');
                return ['success' => false, 'message' => 'No items to sync'];
            }

            $processedItems = [];
            $errors = [];

            foreach ($items as $itemIndex => $item) {
                try {
                    $productName = $item['product_name'] ?? 'Unknown Product';
                    $quantity = intval($item['quantity'] ?? 1);
                    $size = $item['size'] ?? null;
                    $color = $item['color'] ?? null;

                    Log::info('Processing item for stock sync:', [
                        'item_index' => $itemIndex,
                        'product' => $productName,
                        'quantity' => $quantity,
                        'size' => $size,
                        'color' => $color
                    ]);

                    // Check if we have color and size
                    if (!$color || !$size) {
                        $errors[] = "Item {$productName} missing color or size information";
                        Log::warning("Skipping item - missing color or size", ['item' => $item]);
                        continue;
                    }

                    // Normalize color names for better matching
                    $normalizedColor = $this->normalizeColor($color);
                    
                    // ✅ CRITICAL FIX: Use DB::table for direct database access
                    // Find matching stock item by PRODUCT NAME + COLOR + SIZE
                    Log::info('Searching for stock item in database:', [
                        'product' => $productName,
                        'color' => $normalizedColor,
                        'size' => $size
                    ]);

                    // First, let's see what stock items exist
                    $allStockItems = DB::table('stock')->get();
                    Log::info('All stock items in database:', ['count' => $allStockItems->count()]);

                    // Try to find the exact match
                    $stockItem = DB::table('stock')
                        ->where(function($query) use ($productName) {
                            $query->where('name', 'like', "%{$productName}%")
                                  ->orWhere('name', 'like', "%" . str_replace(' ', '%', $productName) . "%");
                        })
                        ->where(function($query) use ($normalizedColor) {
                            $query->where('color', 'like', "%{$normalizedColor}%")
                                  ->orWhere('color', 'like', "%" . ucfirst($normalizedColor) . "%");
                        })
                        ->where('size', $size)
                        ->first();

                    // If not found, try broader search
                    if (!$stockItem) {
                        $stockItem = DB::table('stock')
                            ->where('name', 'like', "%{$productName}%")
                            ->where('size', $size)
                            ->first();
                    }

                    // If still not found, try just by product name
                    if (!$stockItem) {
                        $stockItem = DB::table('stock')
                            ->where('name', 'like', "%{$productName}%")
                            ->first();
                    }

                    if ($stockItem) {
                        // Convert to array for logging
                        $stockArray = (array) $stockItem;
                        
                        Log::info('✅ Found stock item in database:', [
                            'stock_id' => $stockArray['id'],
                            'product_name' => $stockArray['name'],
                            'color' => $stockArray['color'],
                            'size' => $stockArray['size'],
                            'current_stock' => $stockArray['stock'],
                            'reserved' => $stockArray['reserved'],
                            'available' => $stockArray['stock'] - $stockArray['reserved'],
                            'needed' => $quantity
                        ]);

                        // Check if there's enough stock available
                        $availableStock = $stockArray['stock'] - $stockArray['reserved'];
                        
                        if ($availableStock >= $quantity) {
                            // ✅ CRITICAL: DIRECT DATABASE UPDATE using DB::table
                            $oldStock = $stockArray['stock'];
                            $newStock = $oldStock - $quantity;
                            
                            // Update the stock in database
                            $updated = DB::table('stock')
                                ->where('id', $stockArray['id'])
                                ->update([
                                    'stock' => $newStock,
                                    'last_updated' => now()->format('Y-m-d')
                                ]);

                            if ($updated) {
                                Log::info('✅ Database stock updated successfully:', [
                                    'stock_id' => $stockArray['id'],
                                    'product' => $stockArray['name'],
                                    'color' => $stockArray['color'],
                                    'size' => $stockArray['size'],
                                    'quantity_reduced' => $quantity,
                                    'old_stock' => $oldStock,
                                    'new_stock' => $newStock,
                                    'rows_affected' => $updated
                                ]);
                                
                                $processedItems[] = [
                                    'stock_id' => $stockArray['id'],
                                    'product_name' => $stockArray['name'],
                                    'color' => $stockArray['color'],
                                    'size' => $stockArray['size'],
                                    'quantity' => $quantity,
                                    'old_stock' => $oldStock,
                                    'new_stock' => $newStock,
                                    'database_updated' => true
                                ];
                            } else {
                                $errorMsg = "❌ Failed to update database for {$productName}";
                                $errors[] = $errorMsg;
                                Log::error($errorMsg);
                            }
                        } else {
                            $errorMsg = "❌ Insufficient stock for {$productName} ({$color}, {$size}). Available: {$availableStock}, Needed: {$quantity}";
                            $errors[] = $errorMsg;
                            Log::error($errorMsg);
                        }
                    } else {
                        $errorMsg = "❌ No stock found in database for product: {$productName}";
                        if ($color && $size) {
                            $errorMsg .= " ({$color}, {$size})";
                        }
                        $errors[] = $errorMsg;
                        Log::error($errorMsg);
                        
                        // Debug: show all stock items
                        $allItems = DB::table('stock')->get();
                        Log::info('All available stock items:', [
                            'total_items' => $allItems->count(),
                            'items' => $allItems->map(function($item) {
                                return [
                                    'id' => $item->id,
                                    'name' => $item->name,
                                    'color' => $item->color,
                                    'size' => $item->size,
                                    'stock' => $item->stock
                                ];
                            })->toArray()
                        ]);
                    }

                } catch (Exception $e) {
                    $errorMsg = "❌ Error processing item {$productName}: " . $e->getMessage();
                    $errors[] = $errorMsg;
                    Log::error($errorMsg, [
                        'item' => $item,
                        'exception' => $e->getTraceAsString()
                    ]);
                }
            }

            // Commit transaction
            DB::commit();

            $result = [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'processed_items' => $processedItems,
                'errors' => $errors,
                'success' => empty($errors) && !empty($processedItems)
            ];

            if (empty($errors) && !empty($processedItems)) {
                Log::info('✅ STOCK SYNC COMPLETED SUCCESSFULLY', $result);
            } else {
                Log::warning('⚠️ STOCK SYNC COMPLETED WITH ERRORS', $result);
            }

            return $result;

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('❌ SYNC STOCK FOR ORDER ERROR');
            Log::error('Error: ' . $e->getMessage());
            Log::error('File: ' . $e->getFile() . ':' . $e->getLine());
            
            return [
                'success' => false,
                'message' => 'Stock sync failed',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Reverse stock for cancelled/refunded order
     * DIRECTLY UPDATES the "stock" column in the database
     * @param Info $order
     * @return array
     */
    private function reverseStockForOrder(Info $order): array
    {
        DB::beginTransaction();
        
        try {
            Log::info('=== REVERSE STOCK FOR ORDER START ===', [
                'order_id' => $order->id,
                'order_number' => $order->order_number
            ]);

            $items = json_decode($order->items, true);
            if (!$items || !is_array($items)) {
                return ['success' => false, 'message' => 'No items to reverse'];
            }

            $processedItems = [];
            $errors = [];

            foreach ($items as $item) {
                try {
                    $productName = $item['product_name'] ?? 'Unknown Product';
                    $quantity = intval($item['quantity'] ?? 1);
                    $size = $item['size'] ?? null;
                    $color = $item['color'] ?? null;

                    if (!$color || !$size) {
                        $errors[] = "Item {$productName} missing color or size information";
                        continue;
                    }

                    // Normalize color
                    $normalizedColor = $this->normalizeColor($color);
                    
                    // Find matching stock item using DB::table
                    $stockItem = DB::table('stock')
                        ->where('name', 'like', "%{$productName}%")
                        ->where(function($query) use ($normalizedColor) {
                            $query->where('color', 'like', "%{$normalizedColor}%")
                                  ->orWhere('color', 'like', "%" . ucfirst($normalizedColor) . "%");
                        })
                        ->where('size', $size)
                        ->first();

                    if (!$stockItem) {
                        // Try broader search
                        $stockItem = DB::table('stock')
                            ->where('name', 'like', "%{$productName}%")
                            ->where('size', $size)
                            ->first();
                    }

                    if ($stockItem) {
                        $stockArray = (array) $stockItem;
                        
                        // ✅ CRITICAL: DIRECT DATABASE UPDATE
                        $oldStock = $stockArray['stock'];
                        $newStock = $oldStock + $quantity;
                        
                        // Update the stock in database
                        $updated = DB::table('stock')
                            ->where('id', $stockArray['id'])
                            ->update([
                                'stock' => $newStock,
                                'last_updated' => now()->format('Y-m-d')
                            ]);

                        if ($updated) {
                            Log::info('✅ Database stock restored successfully:', [
                                'stock_id' => $stockArray['id'],
                                'product' => $stockArray['name'],
                                'quantity_restored' => $quantity,
                                'old_stock' => $oldStock,
                                'new_stock' => $newStock
                            ]);
                            
                            $processedItems[] = [
                                'stock_id' => $stockArray['id'],
                                'product_name' => $stockArray['name'],
                                'color' => $stockArray['color'],
                                'size' => $stockArray['size'],
                                'quantity' => $quantity,
                                'old_stock' => $oldStock,
                                'new_stock' => $newStock,
                                'database_updated' => true
                            ];
                        } else {
                            $errors[] = "Failed to update database for {$productName}";
                        }
                    } else {
                        $errors[] = "No stock found to reverse for: {$productName} ({$color}, {$size})";
                    }

                } catch (Exception $e) {
                    $errors[] = "Error reversing stock for item {$productName}: " . $e->getMessage();
                }
            }

            // Commit transaction
            DB::commit();

            $result = [
                'order_id' => $order->id,
                'processed_items' => $processedItems,
                'errors' => $errors
            ];

            Log::info('Stock reversed for order', $result);
            return ['success' => empty($errors), 'data' => $result];

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Reverse stock for order error: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Normalize color names for better matching
     */
    private function normalizeColor(string $color): string
    {
        $color = strtolower(trim($color));
        
        $colorMap = [
            'azul' => 'azul', 'blue' => 'azul',
            'vermelho' => 'vermelho', 'red' => 'vermelho',
            'preto' => 'preto', 'black' => 'preto',
            'branco' => 'branco', 'white' => 'branco',
            'verde' => 'verde', 'green' => 'verde',
            'amarelo' => 'amarelo', 'yellow' => 'amarelo',
            'rosa' => 'rosa', 'pink' => 'rosa',
            'cinza' => 'cinza', 'gray' => 'cinza', 'grey' => 'cinza',
            'laranja' => 'laranja', 'orange' => 'laranja',
            'roxo' => 'roxo', 'purple' => 'roxo',
            'marrom' => 'marrom', 'brown' => 'marrom',
        ];

        return $colorMap[$color] ?? $color;
    }

    /**
     * Process paid order and sync stock - API endpoint
     */
    public function processPaidOrder(Request $request): JsonResponse
    {
        try {
            Log::info('=== PROCESS PAID ORDER API START ===');
            
            $validated = $request->validate([
                'order_id' => 'required|integer|exists:infos,id',
                'payment_status' => 'required|string|in:paid,refunded,cancelled'
            ]);

            $orderId = $validated['order_id'];
            $paymentStatus = $validated['payment_status'];

            $order = Info::find($orderId);
            
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            $stockResult = [];
            $message = '';
            
            if ($paymentStatus === 'paid') {
                $stockResult = $this->syncStockForOrder($order);
                $message = 'Order marked as paid and stock synced successfully';
            } elseif (in_array($paymentStatus, ['refunded', 'cancelled'])) {
                $stockResult = $this->reverseStockForOrder($order);
                $message = 'Order cancelled/refunded and stock reversed successfully';
            }

            $order->payment_status = $paymentStatus;
            if ($paymentStatus === 'cancelled') {
                $order->status = 'cancelled';
            }
            $order->save();

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => array_merge([
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'payment_status' => $order->payment_status,
                    'status' => $order->status
                ], ['stock_result' => $stockResult])
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Process paid order validation error:', $e->errors());
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            Log::error('Process paid order error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to process order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear all infos
     */
    public function clearAll(): JsonResponse
    {
        try {
            $deleted = Info::query()->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'All infos cleared successfully',
                'deleted_count' => $deleted
            ]);
        } catch (Exception $e) {
            Log::error('Clear all infos error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear infos'
            ], 500);
        }
    }

    /**
     * Delete specific info
     */
    public function destroy($id): JsonResponse
    {
        try {
            $info = Info::find($id);
            
            if (!$info) {
                return response()->json([
                    'success' => false,
                    'message' => 'Info not found'
                ], 404);
            }

            // If order was paid, restore stock first
            if ($info->payment_status === 'paid') {
                $this->reverseStockForOrder($info);
            }

            $info->delete();

            return response()->json([
                'success' => true,
                'message' => 'Info deleted successfully'
            ]);
        } catch (Exception $e) {
            Log::error('Delete info error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete info'
            ], 500);
        }
    }

    /**
     * Manual stock sync endpoint for testing
     */
    public function manualStockSync($orderId): JsonResponse
    {
        try {
            $order = Info::find($orderId);
            
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            $result = $this->syncStockForOrder($order);

            return response()->json([
                'success' => $result['success'],
                'message' => $result['success'] ? 'Stock synced manually' : 'Stock sync failed',
                'data' => $result
            ]);

        } catch (Exception $e) {
            Log::error('Manual stock sync error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Manual stock sync failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}