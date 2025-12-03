<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Order;
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
                    $infos = Order::select([
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
            $info = Order::find($id);
            if (!$info) {
                return response()->json([
                    'success' => false,
                    'message' => 'Info not found',
                    'debug' => ['info_id' => $id]
                ], 404);
            }

            // Update fields
            $info->status = $validated['status'];
            $info->payment_status = $validated['payment_status'];
            $info->save();

            Log::info('Info status updated successfully', [
                'info_id' => $info->id,
                'status' => $info->status,
                'payment_status' => $info->payment_status
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Info status updated successfully',
                'data' => [
                    'info_id' => $info->id,
                    'order_number' => $info->order_number,
                    'status' => $info->status,
                    'payment_status' => $info->payment_status
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
            'message' => 'OrderController is working!',
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

            // Validate required fields
            $validated = $request->validate([
                'customer_name' => 'required|string|max:255',
                'customer_email' => 'required|email',
                'customer_phone' => 'required|string',
                'customer_cpf' => 'required|string',
                'total' => 'required|numeric',
                'subtotal' => 'required|numeric',
                'shipping' => 'required|numeric',
                'discount' => 'numeric',
                'payment_method' => 'required|string',
                'payment_status' => 'required|string',
                'status' => 'required|string',
                'shipping_street' => 'required|string',
                'shipping_number' => 'required|string',
                'shipping_complement' => 'nullable|string',
                'shipping_neighborhood' => 'required|string',
                'shipping_city' => 'required|string',
                'shipping_state' => 'required|string',
                'shipping_zip_code' => 'required|string',
                'items' => 'required|array',
            ]);

            // Generate order number if not provided
            $orderNumber = $request->order_number ?? 'ORD-' . strtoupper(substr(uniqid(), -6));

            // Create the info
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
                'payment_status' => $validated['payment_status'],
                'status' => $validated['status'],
                'shipping_street' => $validated['shipping_street'],
                'shipping_number' => $validated['shipping_number'],
                'shipping_complement' => $validated['shipping_complement'] ?? null,
                'shipping_neighborhood' => $validated['shipping_neighborhood'],
                'shipping_city' => $validated['shipping_city'],
                'shipping_state' => $validated['shipping_state'],
                'shipping_zip_code' => $validated['shipping_zip_code'],
                'items' => json_encode($validated['items']),
                'pix_data' => $request->pix_data ? json_encode($request->pix_data) : null,
                'metadata' => $request->metadata ? json_encode($request->metadata) : null,
            ];

            $info = Order::create($infoData);

            Log::info('Info created successfully:', ['info_id' => $info->id, 'order_number' => $info->order_number]);

            // Automatically sync stock if payment_status is 'paid'
            if ($info->payment_status === 'paid') {
                Log::info('Auto-syncing stock for newly created paid order', [
                    'order_id' => $info->id,
                    'order_number' => $info->order_number
                ]);
                
                // Sync stock in background to avoid blocking the response
                try {
                    dispatch(function () use ($info) {
                        $controller = app(\App\Http\Controllers\OrderController::class);
                        $controller->syncStock($info->id);
                    })->afterResponse();
                } catch (\Exception $e) {
                    Log::warning('Failed to dispatch stock sync, will try direct sync: ' . $e->getMessage());
                    // Fallback: try direct sync if dispatch fails
                    try {
                        $this->syncStock($info->id);
                    } catch (\Exception $e2) {
                        Log::error('Failed to sync stock directly after order creation: ' . $e2->getMessage());
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Info created successfully',
                'data' => [
                    'info_id' => $info->id,
                    'order_number' => $info->order_number,
                    'info' => $info
                ],
                'debug' => [
                    'timestamp' => now()->format('c'),
                    'info_id' => $info->id,
                    'stock_sync_triggered' => ($info->payment_status === 'paid')
                ]
            ], 201);

        } catch (Exception $e) {
            Log::error('=== INFO STORE ERROR ===');
            Log::error('Error: ' . $e->getMessage());
            Log::error('File: ' . $e->getFile() . ':' . $e->getLine());
            Log::error('Request data: ', $request->all());

            return response()->json([
                'success' => false,
                'message' => 'Failed to create info',
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
            foreach ($sampleInfos as $data) {
                try {
                    $info = Order::create($data);
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
     * Get customers from infos table
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

            $customers = DB::table('infos')
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
     * Sync stock for ANY paid order
     * POST /api/orders/{orderId}/sync-stock
     */
    public function syncStock($orderId): JsonResponse
    {
        try {
            Log::info('=== SYNC STOCK FOR ANY ORDER ===', ['order_id' => $orderId]);

            $order = Order::find($orderId);
            
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // Check if order is already paid
            if ($order->payment_status !== 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Order is not paid',
                    'payment_status' => $order->payment_status
                ], 400);
            }

            // Check if stock already synced
            $metadata = json_decode($order->metadata ?? '{}', true) ?? [];
            if (isset($metadata['stock_synced_at'])) {
                return response()->json([
                    'success' => true,
                    'message' => 'Stock already synced for this order',
                    'already_synced' => true,
                    'synced_at' => $metadata['stock_synced_at']
                ]);
            }

            // Parse order items
            $items = json_decode($order->items, true) ?? [];
            $stockUpdates = [];

            DB::beginTransaction();

            foreach ($items as $itemIndex => $item) {
                // Extract product information from item JSON
                $productName = $item['product_name'] ?? $item['name'] ?? null;
                $quantity = isset($item['quantity']) ? (int) $item['quantity'] : 1;
                
                // Extract color - handle multiple possible field names and values
                $color = $item['color'] ?? 
                         $item['selectedColor'] ?? 
                         $item['cor'] ?? 
                         null;
                
                // Extract size - handle multiple possible field names
                $size = $item['size'] ?? 
                        $item['selectedSize'] ?? 
                        $item['tamanho'] ?? 
                        null;

                if (!$productName) {
                    Log::warning('No product name in item', [
                        'item_index' => $itemIndex,
                        'item' => $item
                    ]);
                    continue;
                }

                // Normalize color and size values
                $normalizedColor = $this->normalizeColorValue($color);
                $normalizedSize = $this->normalizeSizeValue($size);

                // Find stock item - try multiple approaches
                $stockItem = $this->findStockItem($productName, $normalizedColor, $normalizedSize);
                
                if (!$stockItem) {
                    Log::error('Stock item not found', [
                        'product' => $productName,
                        'color' => $normalizedColor,
                        'size' => $normalizedSize,
                        'original_color' => $color,
                        'original_size' => $size,
                        'item' => $item
                    ]);
                    continue;
                }

                // Check if there's enough stock (ESTOQUE ATUAL = stock column)
                if ($stockItem->stock < $quantity) {
                    throw new \Exception(
                        "Not enough stock for '{$stockItem->name}' (Color: {$stockItem->color}, Size: {$stockItem->size}). " .
                        "Available stock (ESTOQUE ATUAL): {$stockItem->stock}, Ordered: {$quantity}"
                    );
                }

                // Update stock - decrease ESTOQUE ATUAL (stock column)
                $oldStock = $stockItem->stock;
                
                $stockItem->stock = $oldStock - $quantity;
                $stockItem->last_updated = now()->format('Y-m-d');
                $stockItem->save();

                $stockUpdates[] = [
                    'product' => $stockItem->name,
                    'color' => $stockItem->color,
                    'size' => $stockItem->size,
                    'quantity' => $quantity,
                    'old_stock' => $oldStock,
                    'new_stock' => $stockItem->stock,
                    'estoque_atual' => $stockItem->stock // ESTOQUE ATUAL after update
                ];

                Log::info('Stock updated', [
                    'product' => $stockItem->name,
                    'quantity' => $quantity,
                    'payment_method' => $order->payment_method
                ]);
            }

            // Mark order as stock synced
            $metadata['stock_synced_at'] = now()->toISOString();
            $metadata['stock_updates'] = $stockUpdates;
            $metadata['payment_method'] = $order->payment_method;
            
            $order->metadata = json_encode($metadata);
            $order->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Stock synced for {$order->payment_method} payment",
                'data' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'payment_method' => $order->payment_method,
                    'items_count' => count($items),
                    'stock_updates' => $stockUpdates
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Stock sync error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync stock: ' . $e->getMessage(),
                'order_id' => $orderId
            ], 500);
        }
    }

    /**
     * Helper: Normalize color value (handle Portuguese/English variations)
     */
    private function normalizeColorValue($color)
    {
        if (!$color) {
            return null;
        }
        
        $color = trim($color);
        $colorLower = strtolower($color);
        
        // Handle "Not specified" variations
        if (in_array($colorLower, [
            'not specified', 'não especificada', 'nao especificada', 
            'não especificado', 'nao especificado', 'none', ''
        ])) {
            return null;
        }
        
        return $color;
    }
    
    /**
     * Helper: Normalize size value (handle Portuguese/English variations)
     */
    private function normalizeSizeValue($size)
    {
        if (!$size) {
            return null;
        }
        
        $size = trim($size);
        $sizeLower = strtolower($size);
        
        // Handle "Not specified" variations
        if (in_array($sizeLower, [
            'not specified', 'não especificado', 'nao especificado',
            'não especificada', 'nao especificada', 'none', ''
        ])) {
            return null;
        }
        
        return $size;
    }

    /**
     * Helper: Find stock item by product name, color, size
     */
    private function findStockItem($productName, $color, $size)
    {
        // Clean up inputs
        $cleanProductName = trim($productName);
        $cleanColor = $color ? trim($color) : null;
        $cleanSize = $size ? trim($size) : null;

        // Strategy 1: Try exact match with product name, color, and size
        if ($cleanColor && $cleanSize) {
            $query = Stock::query();
            $query->where(function($q) use ($cleanProductName) {
                $q->where('name', 'like', "%{$cleanProductName}%")
                  ->orWhere('product_id', 'like', "%{$cleanProductName}%");
            })
            ->where('color', $cleanColor)
            ->where('size', $cleanSize);
            
            $result = $query->first();
            if ($result) {
                return $result;
            }
        }
        
        // Strategy 2: Match by product name and color only
        if ($cleanColor) {
            $query = Stock::query();
            $query->where(function($q) use ($cleanProductName) {
                $q->where('name', 'like', "%{$cleanProductName}%")
                  ->orWhere('product_id', 'like', "%{$cleanProductName}%");
            })
            ->where('color', $cleanColor);
            
            $result = $query->first();
            if ($result) {
                return $result;
            }
        }
        
        // Strategy 3: Match by product name and size only
        if ($cleanSize) {
            $query = Stock::query();
            $query->where(function($q) use ($cleanProductName) {
                $q->where('name', 'like', "%{$cleanProductName}%")
                  ->orWhere('product_id', 'like', "%{$cleanProductName}%");
            })
            ->where('size', $cleanSize);
            
            $result = $query->first();
            if ($result) {
                return $result;
            }
        }
        
        // Strategy 4: Match by product name only (fallback)
        $fallbackQuery = Stock::query();
        $fallbackQuery->where(function($q) use ($cleanProductName) {
            $q->where('name', 'like', "%{$cleanProductName}%")
              ->orWhere('product_id', 'like', "%{$cleanProductName}%");
        });
        
        return $fallbackQuery->first();
    }

    /**
     * Handle payment webhook for ANY payment type
     * POST /api/webhooks/payment-confirmed
     */
    public function handlePaymentWebhook(Request $request): JsonResponse
    {
        try {
            Log::info('=== PAYMENT WEBHOOK RECEIVED ===', [
                'payment_type' => $request->input('payment_method', 'unknown'),
                'data' => $request->all()
            ]);

            // Get order info from webhook
            $orderId = $request->input('order_id') ?? 
                      $request->input('reference') ?? 
                      $request->input('external_reference');
            
            if (!$orderId) {
                return response()->json([
                    'success' => false,
                    'message' => 'No order ID in webhook'
                ], 400);
            }

            // Find order
            $order = Order::find($orderId);
            
            if (!$order) {
                // Try by order number
                $order = Order::where('order_number', $orderId)->first();
                
                if (!$order) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Order not found'
                    ], 404);
                }
            }

            // Update order payment status
            $paymentMethod = $request->input('payment_method', $order->payment_method);
            $paymentStatus = 'paid';
            
            $order->payment_status = $paymentStatus;
            $order->payment_method = $paymentMethod;
            
            // Set status based on payment
            if ($order->status === 'pending') {
                $order->status = 'processing';
            }
            
            $order->save();

            Log::info('Order payment updated', [
                'order_id' => $order->id,
                'payment_method' => $paymentMethod,
                'status' => 'paid'
            ]);

            // Auto-sync stock
            return $this->syncStock($order->id);

        } catch (\Exception $e) {
            Log::error('Payment webhook error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Payment webhook failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update order status AND sync stock if paid
     * This extends your existing updateStatus method
     */
    public function updateStatus($id, Request $request): JsonResponse
    {
        try {
            Log::info('=== ORDER STATUS UPDATE ===', ['order_id' => $id]);

            // Validate input
            $validated = $request->validate([
                'status' => 'required|string|in:pending,processing,shipped,delivered,cancelled',
                'payment_status' => 'required|string|in:pending,paid,failed,refunded'
            ]);

            // Find order
            $order = Order::find($id);
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            $oldPaymentStatus = $order->payment_status;
            $newPaymentStatus = $validated['payment_status'];

            // Update fields
            $order->status = $validated['status'];
            $order->payment_status = $newPaymentStatus;
            $order->save();

            Log::info('Order status updated', [
                'order_id' => $order->id,
                'old_payment_status' => $oldPaymentStatus,
                'new_payment_status' => $newPaymentStatus
            ]);

            // Auto-sync stock when payment status changes to "paid"
            if ($oldPaymentStatus !== 'paid' && $newPaymentStatus === 'paid') {
                Log::info('Auto-syncing stock for newly paid order', ['order_id' => $order->id]);
                
                // Call sync stock in background
                dispatch(function () use ($order) {
                    $this->syncStock($order->id);
                })->afterResponse();
            }
            
            // Reverse stock if order cancelled and was paid
            if ($validated['status'] === 'cancelled' && $oldPaymentStatus === 'paid') {
                Log::info('Reversing stock for cancelled order', ['order_id' => $order->id]);
                $this->reverseStock($order->id);
            }

            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully',
                'data' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'stock_sync_triggered' => ($newPaymentStatus === 'paid')
                ]
            ]);

        } catch (Exception $e) {
            Log::error('Order status update error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reverse stock for cancelled order
     */
    private function reverseStock($orderId): void
    {
        try {
            $order = Order::find($orderId);
            if (!$order) return;

            $metadata = json_decode($order->metadata ?? '{}', true) ?? [];
            
            if (!isset($metadata['stock_updates'])) {
                return; // No stock was synced
            }

            DB::beginTransaction();

            foreach ($metadata['stock_updates'] as $update) {
                $stockItem = Stock::where('name', 'like', "%{$update['product']}%")
                    ->where('color', $update['color'])
                    ->where('size', $update['size'])
                    ->first();

                if ($stockItem) {
                    // Reverse: add back to stock, remove from reserved
                    $stockItem->stock += $update['quantity'];
                    $stockItem->reserved -= $update['quantity'];
                    $stockItem->last_updated = now()->format('Y-m-d');
                    $stockItem->save();

                    Log::info('Stock reversed for cancelled order', [
                        'product' => $stockItem->name,
                        'quantity' => $update['quantity']
                    ]);
                }
            }

            // Update metadata
            $metadata['stock_reversed_at'] = now()->toISOString();
            $order->metadata = json_encode($metadata);
            $order->save();

            DB::commit();

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Reverse stock error: ' . $e->getMessage());
        }
    }


}