<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Info;
use App\Models\Stock;
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

            $dbConnected = true;
            try {
                DB::connection()->getPdo();
                Log::info('Database connection: OK');
            } catch (Exception $e) {
                Log::error('Database connection failed: ' . $e->getMessage());
                $dbConnected = false;
            }

            $tableExists = $dbConnected && Schema::hasTable('infos');
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
                    $infos = collect();
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
     * Store a newly created order (POST /api/infos)
     * WITH AUTOMATIC STOCK SYNC - FIXED VERSION
     */
    public function store(Request $request): JsonResponse
    {
        try {
            Log::info('=== ORDER STORE WITH STOCK SYNC START ===');

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
                'items.*.product_id' => 'required|string', // REQUIRED for stock sync
                'items.*.product_name' => 'required|string',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.price' => 'required|numeric|min:0',
                'items.*.total' => 'required|numeric|min:0',
                'items.*.image' => 'sometimes|string|nullable',
                'items.*.color' => 'sometimes|string|nullable',
                'items.*.size' => 'sometimes|string|nullable',
            ]);

            $orderNumber = $request->order_number ?? 'ORD-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));

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

            Log::info('Creating order with data:', $infoData);

            DB::beginTransaction();

            try {
                $info = Info::create($infoData);

                // SYNC STOCK IF ORDER IS PAID
                if ($validated['payment_status'] === 'paid') {
                    $this->syncStockFromOrder($validated['items'], $info->id);
                }

                DB::commit();

                Log::info('Order created with stock sync:', [
                    'order_id' => $info->id,
                    'order_number' => $info->order_number,
                    'payment_status' => $info->payment_status
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Order created successfully',
                    'data' => [
                        'order_id' => $info->id,
                        'order_number' => $info->order_number,
                        'order' => $info
                    ],
                    'debug' => [
                        'timestamp' => now()->format('c'),
                        'info_id' => $info->id
                    ]
                ], 201);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('=== ORDER STORE VALIDATION ERROR ===');
            Log::error('Validation errors:', $e->errors());

            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (Exception $e) {
            Log::error('=== ORDER STORE ERROR ===');
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to create order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Synchronize stock from order items - FIXED VERSION
     */
    private function syncStockFromOrder(array $items, int $orderId): void
    {
        Log::info('=== SYNC STOCK FROM ORDER START ===', [
            'order_id' => $orderId,
            'item_count' => count($items)
        ]);

        foreach ($items as $item) {
            try {
                $productId = $item['product_id'];
                $quantity = $item['quantity'];
                $color = $item['color'] ?? null;
                $size = $item['size'] ?? null;
                $productName = $item['product_name'] ?? 'Unknown Product';

                Log::info('Processing stock sync:', [
                    'product_id' => $productId,
                    'product_name' => $productName,
                    'quantity' => $quantity,
                    'color' => $color,
                    'size' => $size
                ]);

                // Find stock entry by product_id, color, and size
                $stockQuery = Stock::where('product_id', $productId);

                if ($color) {
                    $stockQuery->where('color', $color);
                }
                
                if ($size) {
                    $stockQuery->where('size', $size);
                }

                $stock = $stockQuery->first();

                if (!$stock) {
                    $errorMsg = "Stock entry not found for product_id: {$productId}";
                    if ($color) $errorMsg .= ", color: {$color}";
                    if ($size) $errorMsg .= ", size: {$size}";
                    
                    Log::error($errorMsg);
                    throw new \Exception("Product variant not found in stock database");
                }

                // Check available stock (stock - reserved)
                $availableStock = $stock->stock - $stock->reserved;
                
                if ($availableStock < $quantity) {
                    $errorMsg = "Insufficient stock for {$productName}. Available: {$availableStock}, Requested: {$quantity}";
                    Log::error($errorMsg);
                    throw new \Exception($errorMsg);
                }

                // RESERVE THE STOCK (increase reserved column)
                $oldReserved = $stock->reserved;
                $stock->increment('reserved', $quantity);
                $stock->update(['last_updated' => now()->format('Y-m-d')]);

                Log::info('✅ STOCK RESERVED:', [
                    'order_id' => $orderId,
                    'stock_id' => $stock->id, // THIS IS THE VARIANT ID FROM STOCK TABLE
                    'product_id' => $productId,
                    'product_name' => $stock->name,
                    'quantity' => $quantity,
                    'color' => $color,
                    'size' => $size,
                    'old_reserved' => $oldReserved,
                    'new_reserved' => $stock->reserved,
                    'old_available' => $availableStock,
                    'new_available' => $stock->stock - $stock->reserved
                ]);

            } catch (\Exception $e) {
                Log::error('❌ Stock sync error for item:', [
                    'item' => $item,
                    'error' => $e->getMessage()
                ]);
                throw $e;
            }
        }

        Log::info('=== SYNC STOCK FROM ORDER COMPLETE ===', ['order_id' => $orderId]);
    }

    /**
     * Update order status with stock handling - FIXED VERSION
     */
    public function updateStatus($id, Request $request): JsonResponse
    {
        try {
            Log::info('=== ORDER STATUS UPDATE START ===', ['order_id' => $id]);

            $validated = $request->validate([
                'status' => 'required|string|in:pending,processing,shipped,delivered,cancelled',
                'payment_status' => 'required|string|in:pending,paid,failed,refunded'
            ]);

            $info = Info::find($id);
            if (!$info) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            $oldStatus = $info->status;
            $oldPaymentStatus = $info->payment_status;

            DB::beginTransaction();

            try {
                $info->status = $validated['status'];
                $info->payment_status = $validated['payment_status'];
                $info->save();

                // Handle stock based on status changes
                $items = json_decode($info->items, true) ?? [];

                Log::info('Processing stock for status change:', [
                    'order_id' => $id,
                    'old_status' => $oldStatus,
                    'new_status' => $validated['status'],
                    'old_payment_status' => $oldPaymentStatus,
                    'new_payment_status' => $validated['payment_status'],
                    'item_count' => count($items)
                ]);

                // SHIPPED: Reduce actual stock AND reserved stock
                if ($validated['status'] === 'shipped' && $oldStatus !== 'shipped') {
                    Log::info('🔄 Order shipped - reducing actual stock');
                    foreach ($items as $item) {
                        $this->reduceStockForShippedItem($item, $info->id);
                    }
                }
                
                // CANCELLED: Decrease reserved stock (restore available stock)
                elseif ($validated['status'] === 'cancelled' && $oldStatus !== 'cancelled') {
                    Log::info('🔄 Order cancelled - restoring reserved stock');
                    foreach ($items as $item) {
                        $this->restoreStockForCancelledItem($item, $info->id);
                    }
                }
                
                // PAYMENT BECOMES PAID: Increase reserved stock
                elseif ($validated['payment_status'] === 'paid' && $oldPaymentStatus !== 'paid') {
                    Log::info('🔄 Payment paid - reserving stock');
                    $this->syncStockFromOrder($items, $info->id);
                }
                
                // PAYMENT REFUNDED: Decrease reserved stock
                elseif ($validated['payment_status'] === 'refunded' && $oldPaymentStatus !== 'refunded') {
                    Log::info('🔄 Payment refunded - restoring stock');
                    foreach ($items as $item) {
                        $this->restoreStockForCancelledItem($item, $info->id);
                    }
                }

                DB::commit();

                Log::info('✅ Order status updated successfully:', [
                    'order_id' => $info->id,
                    'old_status' => $oldStatus,
                    'new_status' => $info->status,
                    'old_payment_status' => $oldPaymentStatus,
                    'new_payment_status' => $info->payment_status
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Order status updated successfully',
                    'data' => $info
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('❌ Transaction failed:', ['error' => $e->getMessage()]);
                throw $e;
            }

        } catch (Exception $e) {
            Log::error('❌ Order status update error:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reduce actual stock when item is shipped - FIXED VERSION
     */
    private function reduceStockForShippedItem(array $item, int $orderId): void
    {
        $productId = $item['product_id'];
        $quantity = $item['quantity'];
        $color = $item['color'] ?? null;
        $size = $item['size'] ?? null;

        // Find the stock entry using product_id, color, size
        $stock = Stock::where('product_id', $productId)
            ->when($color, fn($q) => $q->where('color', $color))
            ->when($size, fn($q) => $q->where('size', $size))
            ->first();

        if (!$stock) {
            Log::error('❌ Stock not found for shipping:', [
                'order_id' => $orderId,
                'product_id' => $productId,
                'color' => $color,
                'size' => $size
            ]);
            throw new \Exception("Stock entry not found for shipping");
        }

        // Check if there's enough reserved stock
        if ($stock->reserved < $quantity) {
            Log::error('❌ Insufficient reserved stock for shipping:', [
                'order_id' => $orderId,
                'stock_id' => $stock->id,
                'product_name' => $stock->name,
                'requested' => $quantity,
                'reserved' => $stock->reserved
            ]);
            throw new \Exception("Insufficient reserved stock for shipping");
        }

        // REDUCE BOTH ACTUAL STOCK AND RESERVED STOCK
        $oldStock = $stock->stock;
        $oldReserved = $stock->reserved;
        $oldAvailable = $stock->stock - $stock->reserved;
        
        $stock->decrement('stock', $quantity); // ACTUAL STOCK REDUCED
        $stock->decrement('reserved', $quantity); // RESERVED STOCK REDUCED
        $stock->update(['last_updated' => now()->format('Y-m-d')]);

        $newAvailable = $stock->stock - $stock->reserved;

        Log::info('✅ STOCK REDUCED FOR SHIPPING:', [
            'order_id' => $orderId,
            'stock_id' => $stock->id, // VARIANT ID FROM STOCK TABLE
            'product_id' => $productId,
            'product_name' => $stock->name,
            'quantity_shipped' => $quantity,
            'old_stock' => $oldStock,
            'new_stock' => $stock->stock,
            'old_reserved' => $oldReserved,
            'new_reserved' => $stock->reserved,
            'old_available' => $oldAvailable,
            'new_available' => $newAvailable,
            'color' => $color,
            'size' => $size
        ]);
    }

    /**
     * Restore stock when order is cancelled or refunded - FIXED VERSION
     */
    private function restoreStockForCancelledItem(array $item, int $orderId): void
    {
        $productId = $item['product_id'];
        $quantity = $item['quantity'];
        $color = $item['color'] ?? null;
        $size = $item['size'] ?? null;

        // Find the stock entry
        $stock = Stock::where('product_id', $productId)
            ->when($color, fn($q) => $q->where('color', $color))
            ->when($size, fn($q) => $q->where('size', $size))
            ->first();

        if (!$stock) {
            Log::error('❌ Stock not found for restoration:', [
                'order_id' => $orderId,
                'product_id' => $productId,
                'color' => $color,
                'size' => $size
            ]);
            throw new \Exception("Stock entry not found for restoration");
        }

        // Check if there's enough reserved stock to restore
        if ($stock->reserved < $quantity) {
            Log::warning('⚠️ Cannot restore more than reserved:', [
                'order_id' => $orderId,
                'stock_id' => $stock->id,
                'product_name' => $stock->name,
                'requested_restore' => $quantity,
                'current_reserved' => $stock->reserved
            ]);
            $quantity = $stock->reserved; // Restore only what's reserved
        }

        if ($quantity > 0) {
            // DECREASE RESERVED STOCK (restores to available stock)
            $oldReserved = $stock->reserved;
            $oldAvailable = $stock->stock - $stock->reserved;
            
            $stock->decrement('reserved', $quantity);
            $stock->update(['last_updated' => now()->format('Y-m-d')]);

            $newAvailable = $stock->stock - $stock->reserved;

            Log::info('✅ STOCK RESTORED FOR CANCELLATION/REFUND:', [
                'order_id' => $orderId,
                'stock_id' => $stock->id, // VARIANT ID FROM STOCK TABLE
                'product_id' => $productId,
                'product_name' => $stock->name,
                'quantity_restored' => $quantity,
                'old_reserved' => $oldReserved,
                'new_reserved' => $stock->reserved,
                'old_available' => $oldAvailable,
                'new_available' => $newAvailable,
                'color' => $color,
                'size' => $size
            ]);
        }
    }

    /**
     * Generate sample orders with stock sync
     */
    public function generateSamples(): JsonResponse
    {
        try {
            if (!Schema::hasTable('infos')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Infos table does not exist.'
                ], 500);
            }

            // Get some real products from stock table to use as samples
            $sampleProducts = Stock::limit(3)->get();
            
            if ($sampleProducts->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No products found in stock table. Add products first.'
                ], 400);
            }

            $sampleOrders = [];

            foreach ($sampleProducts as $index => $product) {
                $orderNumber = 'SAMPLE-' . strtoupper(substr(uniqid(), -8));
                
                $sampleOrders[] = [
                    'order_number' => $orderNumber,
                    'customer_name' => 'Cliente Exemplo ' . ($index + 1),
                    'customer_email' => 'cliente' . ($index + 1) . '@exemplo.com',
                    'customer_phone' => '(11) 99999-999' . $index,
                    'customer_cpf' => '123.456.789-0' . $index,
                    'total' => ($product->sale_price * 2) + 10.00,
                    'subtotal' => $product->sale_price * 2,
                    'shipping' => 10.00,
                    'discount' => 0.00,
                    'payment_method' => 'pix',
                    'payment_status' => 'paid', // PAID - will trigger stock sync
                    'status' => 'processing',
                    'shipping_street' => 'Rua Exemplo',
                    'shipping_number' => '123',
                    'shipping_neighborhood' => 'Centro',
                    'shipping_city' => 'São Paulo',
                    'shipping_state' => 'SP',
                    'shipping_zip_code' => '01001-000',
                    'items' => json_encode([
                        [
                            'product_id' => $product->product_id,
                            'product_name' => $product->name,
                            'quantity' => 2,
                            'price' => $product->sale_price,
                            'total' => $product->sale_price * 2,
                            'color' => $product->color,
                            'size' => $product->size
                        ]
                    ]),
                    'metadata' => json_encode(['sample' => true, 'stock_product_id' => $product->id])
                ];
            }

            $created = [];
            foreach ($sampleOrders as $data) {
                try {
                    $order = Info::create($data);
                    
                    // Manually trigger stock sync since we're not using the store method
                    $items = json_decode($data['items'], true);
                    $this->syncStockFromOrder($items, $order->id);
                    
                    $created[] = $order->refresh();
                } catch (Exception $e) {
                    Log::warning('Failed to create sample order: ' . $e->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Sample orders created with stock sync',
                'data' => $created,
                'stock_impact' => 'Stock has been reserved for these paid orders'
            ]);

        } catch (Exception $e) {
            Log::error('Generate samples error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate samples: ' . $e->getMessage()
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
                    'message' => 'Infos table does not exist'
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

            $customers = $customerData->map(function($customer, $index) {
                return [
                    'id' => $index + 1,
                    'email' => $customer->email,
                    'name' => $customer->name,
                    'phone' => $customer->phone,
                    'cpf' => $customer->cpf,
                    'orders_count' => (int) $customer->orders_count,
                    'total_spent' => floatval($customer->total_spent ?: 0),
                    'last_purchase' => $customer->last_purchase,
                    'first_order' => $customer->first_order,
                    'address' => $customer->address,
                    'status' => 'active'
                ];
            });

            Log::info('Found ' . $customers->count() . ' customers from infos');

            return response()->json([
                'success' => true,
                'message' => 'Customers fetched successfully',
                'data' => $customers,
                'debug' => [
                    'total_customers' => $customers->count()
                ]
            ]);

        } catch (Exception $e) {
            Log::error('Get customers error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch customers'
            ], 500);
        }
    }

    /**
     * Get customer statistics
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

            Log::info('Customer stats calculated');

            return response()->json([
                'success' => true,
                'data' => [
                    'total' => $totalCustomers,
                    'active' => $activeCustomers,
                    'new_customers' => $newCustomers,
                    'total_revenue' => $totalRevenue ?: 0
                ]
            ]);

        } catch (Exception $e) {
            Log::error('Customer stats error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch customer statistics'
            ], 500);
        }
    }

    /**
     * Get customer by email
     */
    public function getCustomerByEmail($email): JsonResponse
    {
        try {
            Log::info('Get customer by email:', ['email' => $email]);

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
     * Delete all orders
     */
    public function clearAll(): JsonResponse
    {
        try {
            $count = Info::count();
            Info::truncate();
            
            Log::info('All orders cleared', ['count' => $count]);
            
            return response()->json([
                'success' => true,
                'message' => 'All orders cleared',
                'cleared_count' => $count
            ]);
            
        } catch (Exception $e) {
            Log::error('Clear orders error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear orders'
            ], 500);
        }
    }

    /**
     * Delete specific order
     */
    public function destroy($id): JsonResponse
    {
        try {
            $info = Info::find($id);
            
            if (!$info) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }
            
            // If order is paid, restore stock before deletion
            if ($info->payment_status === 'paid') {
                $items = json_decode($info->items, true) ?? [];
                foreach ($items as $item) {
                    $this->restoreStockForCancelledItem($item, $info->id);
                }
            }
            
            $info->delete();
            
            Log::info('Order deleted with stock restoration', ['order_id' => $id]);
            
            return response()->json([
                'success' => true,
                'message' => 'Order deleted successfully'
            ]);
            
        } catch (Exception $e) {
            Log::error('Delete order error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete order'
            ], 500);
        }
    }

    /**
     * Test endpoint
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
}