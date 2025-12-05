<?php

namespace App\Http\Controllers\Basic;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Stock; // ADD THIS IMPORT
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

            // Check if orders table exists (assuming 'infos' table is your orders table)
            $tableExists = $dbConnected && Schema::hasTable('infos');
            if ($tableExists) {
                Log::info('Orders table exists: YES');
            } else {
                Log::info('Orders table exists: NO');
            }

            // Always use a Collection → safe ->count()
            $orders = collect();

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
                        'stock_updated',      // ✅ ADDED IF EXISTS
                        'stock_updated_at',   // ✅ ADDED IF EXISTS
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
     * Update order status and payment status
     * PUT /api/orders/{id}/status
     */
    public function updateStatus($id, Request $request): JsonResponse
    {
        try {
            Log::info('=== ORDER STATUS UPDATE START ===', ['order_id' => $id]);

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
                    'message' => 'Order not found',
                    'debug' => ['order_id' => $id]
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
                'new_payment_status' => $newPaymentStatus,
                'status' => $order->status
            ]);

            // Auto-sync stock when payment status changes to "paid"
            if ($oldPaymentStatus !== 'paid' && $newPaymentStatus === 'paid') {
                Log::info('Auto-syncing stock for newly paid order', ['order_id' => $order->id]);
                
                // Call sync stock
                $this->syncStock($order->id);
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
     * Store a newly created order (POST /api/orders)
     */
    public function store(Request $request): JsonResponse
    {
        try {
            Log::info('=== ORDER STORE START ===');
            Log::info('Order data received:', $request->all());

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
                'payment_method' => 'required|string|in:pix,credit_card,debit_card,boleto',
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
            ]);

            // Generate order number if not provided
            $orderNumber = $request->order_number ?? 'ORD-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));

            // Create the order
            $orderData = [
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

            $order = Order::create($orderData);

            Log::info('Order created successfully:', ['order_id' => $order->id, 'order_number' => $order->order_number]);

            // If payment is already paid, sync stock
            if ($validated['payment_status'] === 'paid') {
                Log::info('Auto-syncing stock for paid order', ['order_id' => $order->id]);
                $this->syncStock($order->id);
            }

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'order' => $order
                ],
                'debug' => [
                    'timestamp' => now()->format('c'),
                    'order_id' => $order->id
                ]
            ], 201);

        } catch (Exception $e) {
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
     * Show a specific order
     */
    public function show($id): JsonResponse
    {
        try {
            $order = Order::find($id);
            
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $order
            ]);

        } catch (Exception $e) {
            Log::error('Order show error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch order'
            ], 500);
        }
    }

    /**
     * Update an order
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $order = Order::find($id);
            
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // Validate update fields
            $validated = $request->validate([
                'status' => 'sometimes|string|in:pending,processing,shipped,delivered,cancelled',
                'payment_status' => 'sometimes|string|in:pending,paid,failed,refunded',
                'shipping_tracking' => 'nullable|string',
            ]);

            $oldPaymentStatus = $order->payment_status;
            
            // Update fields
            $order->fill($validated);
            $order->save();

            // Auto-sync stock when payment status changes to "paid"
            if ($oldPaymentStatus !== 'paid' && $order->payment_status === 'paid') {
                $this->syncStock($order->id);
            }

            return response()->json([
                'success' => true,
                'message' => 'Order updated successfully',
                'data' => $order
            ]);

        } catch (Exception $e) {
            Log::error('Order update error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order'
            ], 500);
        }
    }

    /**
     * Delete an order
     */
    public function destroy($id): JsonResponse
    {
        try {
            $order = Order::find($id);
            
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // If order was paid, reverse stock
            if ($order->payment_status === 'paid') {
                $this->reverseStock($order->id);
            }

            $order->delete();

            return response()->json([
                'success' => true,
                'message' => 'Order deleted successfully'
            ]);

        } catch (Exception $e) {
            Log::error('Order delete error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete order'
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
                $productName = $item['product_name'] ?? null;
                $quantity = $item['quantity'] ?? 1;
                $color = $item['color'] ?? ($item['selectedColor'] ?? null);
                $size = $item['size'] ?? ($item['selectedSize'] ?? null);

                if (!$productName) {
                    Log::warning('No product name in item', ['item_index' => $itemIndex]);
                    continue;
                }

                // Find stock item - try multiple approaches
                $stockItem = $this->findStockItem($productName, $color, $size);
                
                if (!$stockItem) {
                    Log::error('Stock item not found', [
                        'product' => $productName,
                        'color' => $color,
                        'size' => $size
                    ]);
                    continue;
                }

                // Calculate available stock
                $available = $stockItem->stock - ($stockItem->reserved ?? 0);
                
                if ($available < $quantity) {
                    throw new \Exception(
                        "Not enough stock for '{$stockItem->name}'. " .
                        "Available: {$available}, Ordered: {$quantity}"
                    );
                }

                // Update stock - reduce current stock, increase reserved
                $oldStock = $stockItem->stock;
                $oldReserved = $stockItem->reserved ?? 0;
                
                $stockItem->stock = $oldStock - $quantity;
                $stockItem->reserved = $oldReserved + $quantity;
                $stockItem->last_updated = now()->format('Y-m-d');
                $stockItem->save();

                $stockUpdates[] = [
                    'product' => $stockItem->name,
                    'color' => $stockItem->color,
                    'size' => $stockItem->size,
                    'quantity' => $quantity,
                    'old_stock' => $oldStock,
                    'new_stock' => $stockItem->stock,
                    'old_reserved' => $oldReserved,
                    'new_reserved' => $stockItem->reserved,
                    'available_now' => $stockItem->stock - ($stockItem->reserved ?? 0)
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
     * Helper: Find stock item by product name, color, size
     */
    private function findStockItem($productName, $color, $size)
    {
        // Clean up inputs
        $cleanProductName = trim($productName);
        $cleanColor = $color ? trim($color) : null;
        $cleanSize = $size ? trim($size) : null;

        // Try exact match first
        $query = Stock::query();
        
        // Search in product name
        $query->where(function($q) use ($cleanProductName) {
            $q->where('name', 'like', "%{$cleanProductName}%")
              ->orWhere('product_id', 'like', "%{$cleanProductName}%");
        });
        
        // Add color if provided and not "Não especificada"
        if ($cleanColor && !in_array(strtolower($cleanColor), ['não especificada', 'nao especificada', ''])) {
            $query->where('color', $cleanColor);
        }
        
        // Add size if provided and not "Não especificado"
        if ($cleanSize && !in_array(strtolower($cleanSize), ['não especificado', 'nao especificado', ''])) {
            $query->where('size', $cleanSize);
        }
        
        $result = $query->first();
        
        if ($result) {
            return $result;
        }

        // Fallback: Try without color/size
        if ($cleanColor || $cleanSize) {
            $fallbackQuery = Stock::query();
            $fallbackQuery->where(function($q) use ($cleanProductName) {
                $q->where('name', 'like', "%{$cleanProductName}%")
                  ->orWhere('product_id', 'like', "%{$cleanProductName}%");
            });
            
            return $fallbackQuery->first();
        }

        return null;
    }

    /**
     * Reverse stock for cancelled order
     */
    private function reverseStock($orderId): JsonResponse
    {
        try {
            $order = Order::find($orderId);
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            $metadata = json_decode($order->metadata ?? '{}', true) ?? [];
            
            if (!isset($metadata['stock_updates'])) {
                return response()->json([
                    'success' => true,
                    'message' => 'No stock to reverse for this order'
                ]);
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

            return response()->json([
                'success' => true,
                'message' => 'Stock reversed successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Reverse stock error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to reverse stock: ' . $e->getMessage()
            ], 500);
        }
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
     * Generate sample orders
     */
    public function generateSamples(): JsonResponse
    {
        try {
            if (!Schema::hasTable('infos')) {
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
                    $created[] = $order->refresh();
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