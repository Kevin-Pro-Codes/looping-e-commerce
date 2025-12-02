<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Info;
use App\Models\Stock; // Add Stock model
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

            // Get the previous payment status
            $previousPaymentStatus = $info->payment_status;
            
            // Update fields
            $info->status = $validated['status'];
            $info->payment_status = $validated['payment_status'];
            $info->save();

            Log::info('Info status updated successfully', [
                'info_id' => $info->id,
                'status' => $info->status,
                'payment_status' => $info->payment_status,
                'previous_payment_status' => $previousPaymentStatus
            ]);

            // *** STOCK SYNC LOGIC ***
            // Check if payment status changed to 'paid'
            if ($validated['payment_status'] === 'paid' && $previousPaymentStatus !== 'paid') {
                Log::info('Order marked as paid, syncing stock...', ['info_id' => $info->id]);
                
                try {
                    // Decode items from JSON
                    $items = json_decode($info->items, true);
                    
                    if (is_array($items) && count($items) > 0) {
                        $this->syncStockForOrder($items, $info->id);
                    } else {
                        Log::warning('No items found in order for stock sync', ['info_id' => $info->id]);
                    }
                } catch (\Exception $e) {
                    Log::error('Failed to sync stock for paid order', [
                        'info_id' => $info->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }
            
            // Check if payment status changed from 'paid' to something else (like refunded or cancelled)
            if ($previousPaymentStatus === 'paid' && $validated['payment_status'] !== 'paid') {
                Log::info('Order payment status changed from paid, potentially reversing stock...', [
                    'info_id' => $info->id,
                    'new_status' => $validated['payment_status']
                ]);
                
                // Optionally reverse stock if order is cancelled or refunded
                if (in_array($validated['payment_status'], ['refunded', 'failed'])) {
                    $this->reverseStockForOrder($info->id);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Info status updated successfully',
                'data' => [
                    'info_id' => $info->id,
                    'order_number' => $info->order_number,
                    'status' => $info->status,
                    'payment_status' => $info->payment_status,
                    'stock_synced' => ($validated['payment_status'] === 'paid' && $previousPaymentStatus !== 'paid')
                ],
                'debug' => [
                    'timestamp' => now()->format('c')
                ]
            ]);

        } catch (Exception $e) {
            Log::error('=== INFO STATUS UPDATE ERROR ===');
            Log::error('Error: ' . $e->getMessage());
            Log::error('File: ' . $e->getFile() . ':' . $e->getLine());

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
     * Helper method to sync stock for a paid order
     */
    private function syncStockForOrder(array $items, int $orderId): void
    {
        DB::beginTransaction();
        
        try {
            Log::info('Starting stock sync for order', ['order_id' => $orderId, 'item_count' => count($items)]);
            
            foreach ($items as $item) {
                // Extract product information from item
                $productName = $item['product_name'] ?? null;
                $color = $item['color'] ?? null;
                $size = $item['size'] ?? null;
                $quantity = $item['quantity'] ?? 0;
                
                if (!$productName || $quantity <= 0) {
                    Log::warning('Skipping item due to missing data', [
                        'product_name' => $productName,
                        'quantity' => $quantity
                    ]);
                    continue;
                }
                
                Log::info('Processing item for stock reduction', [
                    'product' => $productName,
                    'color' => $color,
                    'size' => $size,
                    'quantity' => $quantity
                ]);
                
                // Find the stock entry based on product name, color, and size
                $stockQuery = Stock::where('name', $productName);
                
                if ($color && $color !== 'Não especificada' && $color !== 'Não especificado') {
                    $stockQuery->where('color', $color);
                }
                
                if ($size && $size !== 'Não especificado') {
                    $stockQuery->where('size', $size);
                }
                
                $stockItem = $stockQuery->first();
                
                if (!$stockItem) {
                    Log::warning('Stock item not found for product', [
                        'product' => $productName,
                        'color' => $color,
                        'size' => $size
                    ]);
                    continue;
                }
                
                // Check if enough stock is available
                $availableStock = $stockItem->stock - $stockItem->reserved;
                
                if ($availableStock < $quantity) {
                    Log::error('Insufficient stock for product', [
                        'product' => $productName,
                        'available' => $availableStock,
                        'required' => $quantity,
                        'stock_id' => $stockItem->id
                    ]);
                    
                    throw new \Exception("Insufficient stock for {$productName}. Available: {$availableStock}, Required: {$quantity}");
                }
                
                // Update stock: reduce current stock and increase reserved stock
                $stockItem->decrement('stock', $quantity);
                $stockItem->increment('reserved', $quantity);
                $stockItem->update(['last_updated' => now()->format('Y-m-d')]);
                
                Log::info('Stock updated successfully', [
                    'stock_id' => $stockItem->id,
                    'product' => $productName,
                    'color' => $color,
                    'size' => $size,
                    'quantity_reduced' => $quantity,
                    'new_stock' => $stockItem->stock,
                    'new_reserved' => $stockItem->reserved
                ]);
            }
            
            DB::commit();
            Log::info('Stock sync completed successfully for order', ['order_id' => $orderId]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Stock sync failed for order', [
                'order_id' => $orderId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            throw $e; // Re-throw to be caught by the caller
        }
    }

    /**
     * Helper method to reverse stock for a cancelled/refunded order
     */
    private function reverseStockForOrder(int $orderId): void
    {
        // This method would reverse the stock if an order is cancelled or refunded
        // You would need to track which items were reduced for this order
        // For now, we'll just log that this would happen
        Log::info('Stock reversal triggered for order', ['order_id' => $orderId]);
        
        // In a full implementation, you would:
        // 1. Query a order_stock_movements table to see what was reduced
        // 2. Reverse those reductions (increase stock, decrease reserved)
        // 3. Update the movement records
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

            // Start transaction for order creation and stock sync
            DB::beginTransaction();
            
            $info = Info::create($infoData);

            // *** AUTOMATIC STOCK SYNC FOR PAID ORDERS ***
            if ($info->payment_status === 'paid') {
                Log::info('Order created as paid, syncing stock immediately...', [
                    'info_id' => $info->id,
                    'order_number' => $info->order_number
                ]);
                
                try {
                    $items = $validated['items'];
                    $this->syncStockForOrder($items, $info->id);
                    
                    Log::info('Stock synced for new paid order', [
                        'info_id' => $info->id,
                        'order_number' => $info->order_number
                    ]);
                } catch (\Exception $e) {
                    // If stock sync fails, rollback the entire order creation
                    DB::rollBack();
                    
                    Log::error('Failed to sync stock for new order, rolling back', [
                        'error' => $e->getMessage(),
                        'order_data' => $infoData
                    ]);
                    
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to create order due to stock synchronization error: ' . $e->getMessage(),
                        'debug' => [
                            'timestamp' => now()->format('c'),
                            'stock_error' => true
                        ]
                    ], 400);
                }
            }

            DB::commit();

            Log::info('Info created successfully:', [
                'info_id' => $info->id, 
                'order_number' => $info->order_number,
                'stock_synced' => ($info->payment_status === 'paid')
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully' . ($info->payment_status === 'paid' ? ' (stock synchronized)' : ''),
                'data' => [
                    'order_id' => $info->id,
                    'order_number' => $info->order_number,
                    'order' => $info,
                    'stock_synced' => ($info->payment_status === 'paid')
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
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }
            
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
                            'quantity' => 1, 
                            'price' => 79.90, 
                            'total' => 79.90,
                            // ✅ ADDED: Sample image, color, and size data
                            'image' => 'https://example.com/images/camiseta-premium.jpg',
                            'color' => 'Azul',
                            'size' => 'M'
                        ],
                        [
                            'product_name' => 'Caneca Personalizada', 
                            'quantity' => 1, 
                            'price' => 70.00, 
                            'total' => 70.00,
                            // ✅ ADDED: Sample image, color, and size data
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
                    'payment_status' => 'paid',
                    'status' => 'shipped',
                    'items' => json_encode([
                        [
                            'product_name' => 'Livro Laravel Avançado', 
                            'quantity' => 1, 
                            'price' => 89.90, 
                            'total' => 89.90,
                            // ✅ ADDED: Sample image, color, and size data
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
     * Clear all infos (admin only)
     */
    public function clearAll(): JsonResponse
    {
        try {
            $count = Info::count();
            
            if ($count > 0) {
                Info::truncate();
                Log::info('All infos cleared from database', ['records_deleted' => $count]);
            }

            return response()->json([
                'success' => true,
                'message' => 'All infos cleared successfully',
                'debug' => [
                    'records_deleted' => $count,
                    'timestamp' => now()->format('c')
                ]
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
     * Show a single info
     */
    public function show($id): JsonResponse
    {
        try {
            $info = Info::find($id);
            
            if (!$info) {
                return response()->json([
                    'success' => false,
                    'message' => 'Info not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $info
            ]);

        } catch (Exception $e) {
            Log::error('Show info error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch info'
            ], 500);
        }
    }

    /**
     * Delete an info
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

            $info->delete();

            return response()->json([
                'success' => true,
                'message' => 'Info deleted successfully'
            ]);

        } catch (Exception $e) {
            Log::error('Destroy info error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete info'
            ], 500);
        }
    }
}