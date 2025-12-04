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
use App\Services\StockService;

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
                        'stock_updated',      // ✅ ADDED
                        'stock_updated_at',   // ✅ ADDED
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
     * Update info status and payment status WITH STOCK SYNC
     * PUT /api/infos/{id}/status
     */
    public function updateStatus($id, Request $request, StockService $stockService): JsonResponse
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

            $oldPaymentStatus = $info->payment_status;
            $oldStatus = $info->status;

            Log::info('Status change detected', [
                'old_payment_status' => $oldPaymentStatus,
                'new_payment_status' => $validated['payment_status'],
                'old_status' => $oldStatus,
                'new_status' => $validated['status']
            ]);

            // ✅ HANDLE STOCK DEDUCTION FOR NEW PAID ORDERS
            if ($oldPaymentStatus !== 'paid' && $validated['payment_status'] === 'paid') {
                Log::info('Payment changed to PAID - deducting stock');
                
                $stockUpdated = $stockService->deductStockFromOrder($info);
                
                if (!$stockUpdated) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to update stock. Insufficient stock available.',
                        'debug' => [
                            'info_id' => $info->id,
                            'order_number' => $info->order_number
                        ]
                    ], 400);
                }
                
                Log::info('Stock deducted successfully');
            }
            
            // ✅ HANDLE STOCK RESTORATION FOR CANCELLATIONS/REFUNDS
            if (($oldPaymentStatus === 'paid' && $validated['payment_status'] === 'refunded') ||
                ($oldStatus !== 'cancelled' && $validated['status'] === 'cancelled')) {
                Log::info('Order refunded/cancelled - restoring stock');
                
                $stockService->restoreStockForOrder($info);
            }

            // Update fields
            $info->status = $validated['status'];
            $info->payment_status = $validated['payment_status'];
            $info->save();

            Log::info('Info status updated successfully', [
                'info_id' => $info->id,
                'status' => $info->status,
                'payment_status' => $info->payment_status,
                'stock_updated' => $info->stock_updated,
                'stock_updated_at' => $info->stock_updated_at
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Info status updated successfully',
                'data' => [
                    'info_id' => $info->id,
                    'order_number' => $info->order_number,
                    'status' => $info->status,
                    'payment_status' => $info->payment_status,
                    'stock_updated' => $info->stock_updated,
                    'stock_updated_at' => $info->stock_updated_at
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
     * Store a newly created info (POST /api/infos) WITH STOCK CHECK
     */
    public function store(Request $request, StockService $stockService): JsonResponse
    {
        try {
            Log::info('=== INFO STORE START ===');

            // Validation
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
                'items.*.quantity' => 'required|integer|min:1', // ✅ ORDER QUANTITY
                'items.*.price' => 'required|numeric|min:0',
                'items.*.total' => 'required|numeric|min:0',
                'items.*.image' => 'sometimes|string|nullable',
                'items.*.color' => 'sometimes|string|nullable',
                'items.*.size' => 'sometimes|string|nullable',
            ]);

            // ✅ OPTIONAL: Check stock before creating order
            if ($request->has('check_stock') && $request->check_stock == true) {
                $stockCheck = $stockService->checkStockAvailability($validated['items']);
                $unavailableItems = array_filter($stockCheck, function($result) {
                    return $result['available'] === false;
                });
                
                if (!empty($unavailableItems)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Some items are out of stock',
                        'stock_check' => $stockCheck,
                        'unavailable_items' => $unavailableItems
                    ], 400);
                }
            }

            // Generate order number
            $orderNumber = $request->order_number ?? 'ORD-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));

            // Prepare the data
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
                'stock_updated' => false,  // ✅ Default false
                'stock_updated_at' => null, // ✅ Default null
                'status' => $validated['status'],
                'shipping_street' => $validated['shipping_street'],
                'shipping_number' => $validated['shipping_number'],
                'shipping_complement' => $validated['shipping_complement'] ?? null,
                'shipping_neighborhood' => $validated['shipping_neighborhood'],
                'shipping_city' => $validated['shipping_city'],
                'shipping_state' => $validated['shipping_state'],
                'shipping_zip_code' => $validated['shipping_zip_code'],
                'items' => json_encode($validated['items']), // ✅ Contains quantities
                'metadata' => $request->metadata ? json_encode($request->metadata) : null,
            ];

            Log::info('Creating order', [
                'order_number' => $orderNumber,
                'payment_status' => $validated['payment_status'],
                'items_count' => count($validated['items'])
            ]);

            $info = Info::create($infoData);

            // ✅ If payment is already marked as paid, deduct stock immediately
            if ($validated['payment_status'] === 'paid') {
                $stockUpdated = $stockService->deductStockFromOrder($info);
                if (!$stockUpdated) {
                    // If stock deduction fails, delete the order
                    $info->delete();
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to create order. Insufficient stock available.',
                        'order_number' => $orderNumber
                    ], 400);
                }
                Log::info('Stock deducted immediately for paid order', [
                    'info_id' => $info->id,
                    'order_number' => $info->order_number
                ]);
            }

            Log::info('Order created successfully', [
                'info_id' => $info->id, 
                'order_number' => $info->order_number,
                'stock_updated' => $info->stock_updated
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => [
                    'order_id' => $info->id,
                    'order_number' => $info->order_number,
                    'order' => $info,
                    'stock_updated' => $info->stock_updated
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
     * ✅ Confirm payment and update stock
     * POST /api/infos/{id}/confirm-payment
     */
    public function confirmPayment($id, Request $request, StockService $stockService): JsonResponse
    {
        try {
            Log::info('=== CONFIRM PAYMENT START ===', ['info_id' => $id]);

            // Find the order
            $info = Info::find($id);
            if (!$info) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // Check if payment is already confirmed
            if ($info->payment_status === 'paid' && $info->stock_updated) {
                return response()->json([
                    'success' => true,
                    'message' => 'Payment already confirmed and stock updated',
                    'data' => [
                        'order_id' => $info->id,
                        'order_number' => $info->order_number,
                        'payment_status' => $info->payment_status,
                        'stock_updated' => $info->stock_updated,
                        'stock_updated_at' => $info->stock_updated_at
                    ]
                ]);
            }

            // Update payment status
            $info->payment_status = 'paid';
            $info->status = 'processing';
            
            // Deduct stock
            $stockUpdated = $stockService->deductStockFromOrder($info);
            
            if (!$stockUpdated) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update stock. Please check stock availability.'
                ], 400);
            }

            $info->save();

            Log::info('Payment confirmed and stock updated', [
                'info_id' => $info->id,
                'order_number' => $info->order_number,
                'stock_updated' => $info->stock_updated,
                'stock_updated_at' => $info->stock_updated_at
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment confirmed and stock updated successfully',
                'data' => [
                    'order_id' => $info->id,
                    'order_number' => $info->order_number,
                    'payment_status' => $info->payment_status,
                    'status' => $info->status,
                    'stock_updated' => $info->stock_updated,
                    'stock_updated_at' => $info->stock_updated_at
                ]
            ]);

        } catch (Exception $e) {
            Log::error('Confirm payment error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to confirm payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✅ Check stock availability before placing order
     * POST /api/infos/check-stock
     */
    public function checkStock(Request $request, StockService $stockService): JsonResponse
    {
        try {
            $validated = $request->validate([
                'items' => 'required|array|min:1',
                'items.*.product_name' => 'required|string',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.color' => 'sometimes|string|nullable',
                'items.*.size' => 'sometimes|string|nullable',
            ]);

            $stockCheck = $stockService->checkStockAvailability($validated['items']);
            
            $allAvailable = true;
            $messages = [];
            $unavailableItems = [];
            
            foreach ($stockCheck as $key => $result) {
                if (!$result['available']) {
                    $allAvailable = false;
                    $item = $validated['items'][$key];
                    $messages[] = "Estoque insuficiente para {$item['product_name']}: Disponível {$result['available_stock']}, Solicitado {$item['quantity']}";
                    $unavailableItems[] = [
                        'product_name' => $item['product_name'],
                        'requested_quantity' => $item['quantity'],
                        'available_stock' => $result['available_stock'],
                        'color' => $item['color'] ?? null,
                        'size' => $item['size'] ?? null
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'all_available' => $allAvailable,
                'stock_check' => $stockCheck,
                'messages' => $messages,
                'unavailable_items' => $unavailableItems,
                'debug' => [
                    'items_count' => count($validated['items']),
                    'timestamp' => now()->format('c')
                ]
            ]);

        } catch (Exception $e) {
            Log::error('Check stock error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to check stock',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✅ Manual stock sync for an order
     * POST /api/infos/{id}/sync-stock
     */
    public function syncStock($id, StockService $stockService): JsonResponse
    {
        try {
            Log::info('=== MANUAL STOCK SYNC START ===', ['info_id' => $id]);

            $info = Info::find($id);
            if (!$info) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // Check if order is eligible for stock deduction
            if (!$info->canDeductStock()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order is not eligible for stock deduction',
                    'details' => [
                        'payment_status' => $info->payment_status,
                        'status' => $info->status,
                        'stock_updated' => $info->stock_updated
                    ]
                ], 400);
            }

            $stockUpdated = $stockService->deductStockFromOrder($info);
            
            if (!$stockUpdated) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to sync stock'
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Stock synced successfully',
                'data' => [
                    'order_id' => $info->id,
                    'order_number' => $info->order_number,
                    'stock_updated' => $info->stock_updated,
                    'stock_updated_at' => $info->stock_updated_at
                ]
            ]);

        } catch (Exception $e) {
            Log::error('Manual stock sync error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync stock',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✅ Get orders that need stock update
     * GET /api/infos/needs-stock-update
     */
    public function getOrdersNeedingStockUpdate(): JsonResponse
    {
        try {
            $orders = Info::needsStockUpdate()
                ->select(['id', 'order_number', 'customer_name', 'customer_email', 'total', 'items', 'created_at'])
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Orders needing stock update',
                'data' => $orders,
                'count' => $orders->count()
            ]);

        } catch (Exception $e) {
            Log::error('Get orders needing stock update error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch orders'
            ], 500);
        }
    }

    /**
     * ✅ DEBUG: Test stock deduction manually
     * POST /api/infos/{id}/test-stock-deduction
     */
    public function testStockDeduction($id, StockService $stockService): JsonResponse
    {
        try {
            $info = Info::find($id);
            if (!$info) {
                return response()->json(['success' => false, 'message' => 'Order not found'], 404);
            }

            Log::info('=== TEST STOCK DEDUCTION START ===', [
                'order_id' => $info->id,
                'order_number' => $info->order_number,
                'payment_status' => $info->payment_status,
                'stock_updated_before' => $info->stock_updated,
                'stock_updated_at_before' => $info->stock_updated_at
            ]);

            // Test stock deduction
            $result = $stockService->deductStockFromOrder($info);
            
            // Refresh the model to get updated values
            $info->refresh();

            Log::info('=== TEST STOCK DEDUCTION RESULT ===', [
                'success' => $result,
                'stock_updated_after' => $info->stock_updated,
                'stock_updated_at_after' => $info->stock_updated_at
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Test completed',
                'data' => [
                    'stock_deduction_success' => $result,
                    'order' => [
                        'id' => $info->id,
                        'order_number' => $info->order_number,
                        'payment_status' => $info->payment_status,
                        'stock_updated' => $info->stock_updated,
                        'stock_updated_at' => $info->stock_updated_at,
                        'items' => $info->parsed_items
                    ]
                ]
            ]);

        } catch (Exception $e) {
            Log::error('Test stock deduction error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Test failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✅ DEBUG: Check database fields
     * GET /api/infos/check-database-fields
     */
    public function checkDatabaseFields(): JsonResponse
    {
        try {
            // Check if the columns exist
            $hasStockUpdated = Schema::hasColumn('infos', 'stock_updated');
            $hasStockUpdatedAt = Schema::hasColumn('infos', 'stock_updated_at');

            // Get sample data
            $sampleOrder = Info::first();
            
            return response()->json([
                'success' => true,
                'database_check' => [
                    'stock_updated_column_exists' => $hasStockUpdated,
                    'stock_updated_at_column_exists' => $hasStockUpdatedAt,
                    'sample_order' => $sampleOrder ? [
                        'id' => $sampleOrder->id,
                        'order_number' => $sampleOrder->order_number,
                        'payment_status' => $sampleOrder->payment_status,
                        'stock_updated' => $sampleOrder->stock_updated,
                        'stock_updated_at' => $sampleOrder->stock_updated_at
                    ] : 'No orders found'
                ]
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Database check failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✅ DEBUG: Check stock table structure
     * GET /api/debug/stock-structure
     */
    public function checkStockStructure(): JsonResponse
    {
        try {
            $tableExists = Schema::hasTable('stock');
            
            if (!$tableExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stock table does not exist'
                ], 404);
            }
            
            $columns = Schema::getColumnListing('stock');
            $firstRecord = Stock::first();
            
            return response()->json([
                'success' => true,
                'table_exists' => $tableExists,
                'columns' => $columns,
                'sample_record' => $firstRecord,
                'total_records' => Stock::count()
            ]);
            
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error checking stock structure',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate sample infos and save to database.
     */
    public function generateSamples(StockService $stockService): JsonResponse
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
                    'stock_updated' => false,  // ✅ ADDED
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
                            'quantity' => 2, // ✅ ORDER QUANTITY
                            'price' => 79.90, 
                            'total' => 159.80,
                            'image' => 'https://example.com/images/camiseta-premium.jpg',
                            'color' => 'Azul',
                            'size' => 'M'
                        ],
                        [
                            'product_name' => 'Caneca Personalizada', 
                            'quantity' => 1, // ✅ ORDER QUANTITY
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
                    'total' => 89.90,
                    'subtotal' => 89.90,
                    'shipping' => 0.00,
                    'discount' => 10.00,
                    'payment_method' => 'credit_card',
                    'payment_status' => 'pending', // ❌ NOT PAID YET
                    'stock_updated' => false,  // ✅ ADDED
                    'status' => 'pending',
                    'items' => json_encode([
                        [
                            'product_name' => 'Livro Laravel Avançado', 
                            'quantity' => 1, // ✅ ORDER QUANTITY
                            'price' => 89.90, 
                            'total' => 89.90,
                            'image' => 'https://example.com/images/livro-laravel.jpg',
                            'color' => 'Não especificada',
                            'size' => 'Não especificado'
                        ]
                    ])
                ]
            ];

            $created = [];
            foreach ($sampleInfos as $data) {
                try {
                    $info = Info::create($data);
                    
                    // ✅ Auto-deduct stock for paid sample orders
                    if ($info->payment_status === 'paid') {
                        $stockService->deductStockFromOrder($info);
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
     * ✅ Get stock status report
     * GET /api/infos/stock-report
     */
    public function getStockReport(StockService $stockService): JsonResponse
    {
        try {
            $ordersNeedingUpdate = Info::needsStockUpdate()->count();
            $ordersWithStockUpdated = Info::where('stock_updated', true)->count();
            $totalPaidOrders = Info::where('payment_status', 'paid')->count();
            
            $lowStockProducts = $stockService->getLowStockProducts();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'orders_needing_stock_update' => $ordersNeedingUpdate,
                    'orders_with_stock_updated' => $ordersWithStockUpdated,
                    'total_paid_orders' => $totalPaidOrders,
                    'low_stock_products' => $lowStockProducts,
                    'low_stock_count' => count($lowStockProducts),
                    'report_time' => now()->format('Y-m-d H:i:s')
                ]
            ]);

        } catch (Exception $e) {
            Log::error('Get stock report error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate stock report'
            ], 500);
        }
    }
}