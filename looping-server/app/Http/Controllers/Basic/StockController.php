<?php

namespace App\Http\Controllers\Basic;

use App\Http\Controllers\Controller;
use App\Models\Stock;
use App\Models\Order;
use App\Services\OrderStockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Schema;

class StockController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            if (!Schema::hasTable('stock')) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'message' => 'Stock table not created yet',
                    'total_products' => 0,
                    'total_variants' => 0
                ]);
            }
    
            $stockData = Stock::getGroupedStock();
            
            return response()->json([
                'success' => true,
                'data' => $stockData,
                'total_products' => $stockData->count(),
                'total_variants' => Stock::count()
            ]);
            
        } catch (\Exception $e) {
            Log::error('Stock index error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch stock data',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Update specific field for a product (supplier, category, etc.)
     */
    public function updateProductField(Request $request, $productId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'product_id' => 'sometimes|string',
                'name' => 'sometimes|string',
                'sku' => 'sometimes|string',
                'category' => 'sometimes|string',
                'supplier' => 'sometimes|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $existingItems = Stock::where('product_id', $productId)->get();
            
            if ($existingItems->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nenhum produto encontrado com esse product_id'
                ], 404);
            }

            $updateData = ['last_updated' => now()];  
        
            if ($request->has('product_id')) {
                $updateData['product_id'] = $request->product_id;
            }
            if ($request->has('name')) {
                $updateData['name'] = $request->name;
            }
            if ($request->has('sku')) {
                $updateData['sku'] = $request->sku;
            }
            if ($request->has('category')) {
                $updateData['category'] = $request->category;
            }
            if ($request->has('supplier')) {
                $updateData['supplier'] = $request->supplier;
            }

            $updated = Stock::where('product_id', $productId)->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Campo atualizado com sucesso em todas as variantes',
                'updated_count' => $updated,
                'updated_fields' => array_keys($updateData)
            ]);

        } catch (\Exception $e) {
            Log::error('Update product field error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar campo: ' . $e->getMessage()
            ], 500);
        }
    }

    public function lowStock(): JsonResponse
    {
        try {
            $lowStockItems = Stock::getLowStock();

            return response()->json([
                'success' => true,
                'data' => $lowStockItems,
                'count' => $lowStockItems->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Low stock error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch low stock items'
            ], 500);
        }
    }

    public function outOfStock(): JsonResponse
    {
        try {
            $outOfStockItems = Stock::getOutOfStock();

            return response()->json([
                'success' => true,
                'data' => $outOfStockItems,
                'count' => $outOfStockItems->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Out of stock error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch out of stock items'
            ], 500);
        }
    }

    public function updateProductPricing(Request $request, $productId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'cost' => 'required|numeric|min:0',
                'profit' => 'required|numeric|min:0',
                'sale_price' => 'required|numeric|min:0',
                'total_value' => 'sometimes|numeric|min:0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updated = Stock::where('product_id', $productId)
                ->update([
                    'cost' => $request->cost,
                    'profit' => $request->profit,
                    'sale_price' => $request->sale_price,
                    'total_value' => $request->total_value ?? DB::raw('stock * sale_price'),
                    'last_updated' => now()
                ]);

            if ($updated === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nenhum produto encontrado com esse product_id'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Preços atualizados com sucesso em todas as variantes',
                'updated_count' => $updated
            ]);

        } catch (\Exception $e) {
            Log::error('Update pricing error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar preços: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateStock(Request $request, $id): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'stock' => 'required|integer|min:0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $stock = Stock::find($id);
            
            if (!$stock) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stock item not found'
                ], 404);
            }

            $stock->update([
                'stock' => $request->stock,
                'last_updated' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Stock updated successfully',
                'data' => $stock
            ]);

        } catch (\Exception $e) {
            Log::error('Update stock error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update stock'
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'product_id' => 'required|string',
                'name' => 'required|string',
                'sku' => 'required|string|unique:stock,sku',
                'category' => 'required|string',
                'supplier' => 'required|string',
                'cost' => 'required|numeric|min:0',
                'profit' => 'required|numeric|min:0',
                'sale_price' => 'required|numeric|min:0',
                'total_value' => 'required|numeric|min:0',
                'color' => 'required|string',
                'size' => 'required|string',
                'stock' => 'required|integer|min:0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $stock = Stock::create([
                'product_id' => $request->product_id,
                'name' => $request->name,
                'sku' => $request->sku,
                'category' => $request->category,
                'supplier' => $request->supplier,
                'cost' => $request->cost,
                'profit' => $request->profit,
                'sale_price' => $request->sale_price,
                'total_value' => $request->total_value,
                'color' => $request->color,
                'size' => $request->size,
                'stock' => $request->stock,
                'last_updated' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Stock item created successfully',
                'data' => $stock
            ], 201);

        } catch (\Exception $e) {
            Log::error('Create stock item error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create stock item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id): JsonResponse
    {
        try {
            Log::order("Attempting to delete stock item with ID: {$id}");

            $stock = Stock::find($id);
            
            if (!$stock) {
                Log::warning("Stock item not found with ID: {$id}");
                return response()->json([
                    'success' => false,
                    'message' => 'Item de estoque não encontrado'
                ], 404);
            }

            $productInfo = [
                'id' => $stock->id,
                'product_id' => $stock->product_id,
                'name' => $stock->name,
                'color' => $stock->color,
                'size' => $stock->size
            ];

            $stock->delete();

            Log::order("Stock item deleted successfully", $productInfo);

            return response()->json([
                'success' => true,
                'message' => 'Variante excluída com sucesso',
                'deleted_item' => $productInfo
            ]);

        } catch (\Exception $e) {
            Log::error('Delete stock item error: ' . $e->getMessage(), [
                'stock_id' => $id,
                'exception' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao excluir variante: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroyByProductId($productId): JsonResponse
    {
        try {
            Log::order("Attempting to delete all stock items for product_id: {$productId}");

            $existingItems = Stock::where('product_id', $productId)->get();
            
            if ($existingItems->isEmpty()) {
                Log::warning("No stock items found for product_id: {$productId}");
                return response()->json([
                    'success' => false,
                    'message' => 'Nenhum produto encontrado com este ID'
                ], 404);
            }

            $itemsInfo = $existingItems->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'name' => $item->name,
                    'color' => $item->color,
                    'size' => $item->size
                ];
            })->toArray();

            $deletedCount = Stock::where('product_id', $productId)->delete();

            Log::order("Product and all variants deleted successfully", [
                'product_id' => $productId,
                'deleted_count' => $deletedCount,
                'deleted_items' => $itemsInfo
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Produto e todas as variantes excluídos com sucesso',
                'deleted_count' => $deletedCount,
                'deleted_items' => $itemsInfo
            ]);

        } catch (\Exception $e) {
            Log::error('Delete product error: ' . $e->getMessage(), [
                'product_id' => $productId,
                'exception' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao excluir produto: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test stock deduction functionality
     */
    public function testStockDeduction(): JsonResponse
    {
        try {
            $output = [];
            
            // 1. Check database structure
            $output['database']['orders_table_exists'] = Schema::hasTable('orders');
            $output['database']['stock_table_exists'] = Schema::hasTable('stock');
            $output['database']['stock_updated_column'] = Schema::hasColumn('orders', 'stock_updated');
            
            // 2. Run migration if needed
            if (!$output['database']['stock_updated_column']) {
                \Artisan::call('migrate', ['--force' => true]);
                $output['migration_output'] = \Artisan::output();
                
                // Re-check after migration
                $output['database']['stock_updated_column'] = Schema::hasColumn('orders', 'stock_updated');
            }
            
            // 3. Count records
            $output['counts']['orders'] = Order::count();
            $output['counts']['stock'] = Stock::count();
            $output['counts']['paid_orders'] = Order::where('payment_status', 'paid')->count();
            
            // 4. Find a test order
            $testOrder = Order::where('payment_status', 'paid')
                               ->where(function($query) {
                                   $query->whereNull('stock_updated')
                                         ->orWhere('stock_updated', false);
                               })
                               ->first();
            
            if ($testOrder) {
                $output['test_order']['id'] = $testOrder->id;
                $output['test_order']['order_number'] = $testOrder->order_number;
                $output['test_order']['payment_status'] = $testOrder->payment_status;
                $output['test_order']['stock_updated'] = $testOrder->stock_updated;
                $output['test_order']['items'] = $testOrder->items;
                
                // Test stock deduction
                $stockService = new OrderStockService();
                
                // Check availability first
                $items = $testOrder->parsed_items;
                $output['stock_check'] = $stockService->checkStockAvailability($items);
                
                // Show stock before deduction
                $output['stock_before'] = [];
                foreach ($items as $item) {
                    $stock = Stock::where('name', $item['product_name'] ?? '')
                                 ->when($item['color'] ?? null, function($query, $color) {
                                     if ($color !== 'Não especificada') {
                                         return $query->where('color', $color);
                                     }
                                 })
                                 ->when($item['size'] ?? null, function($query, $size) {
                                     if ($size !== 'Não especificado') {
                                         return $query->where('size', $size);
                                     }
                                 })
                                 ->first();
                    
                    if ($stock) {
                        $output['stock_before'][] = [
                            'product_name' => $item['product_name'] ?? '',
                            'color' => $item['color'] ?? '',
                            'size' => $item['size'] ?? '',
                            'stock' => $stock->stock,
                            'stock_id' => $stock->id
                        ];
                    }
                }
                
                // Try to deduct
                $result = $stockService->deductStockFromOrder($testOrder);
                $output['deduction_result'] = $result;
                
                if ($result) {
                    $output['message'] = "Stock deduction successful!";
                    
                    // Show updated stock
                    $output['stock_after'] = [];
                    foreach ($items as $item) {
                        $stock = Stock::where('name', $item['product_name'] ?? '')
                                     ->when($item['color'] ?? null, function($query, $color) {
                                         if ($color !== 'Não especificada') {
                                             return $query->where('color', $color);
                                         }
                                     })
                                     ->when($item['size'] ?? null, function($query, $size) {
                                         if ($size !== 'Não especificado') {
                                             return $query->where('size', $size);
                                         }
                                     })
                                     ->first();
                        
                        if ($stock) {
                            $output['stock_after'][] = [
                                'product_name' => $item['product_name'] ?? '',
                                'color' => $item['color'] ?? '',
                                'size' => $item['size'] ?? '',
                                'stock' => $stock->stock,
                                'stock_id' => $stock->id
                            ];
                        }
                    }
                    
                    // Calculate differences
                    $output['stock_changes'] = [];
                    foreach ($output['stock_before'] as $index => $before) {
                        if (isset($output['stock_after'][$index])) {
                            $after = $output['stock_after'][$index];
                            $output['stock_changes'][] = [
                                'product_name' => $before['product_name'],
                                'before' => $before['stock'],
                                'after' => $after['stock'],
                                'reduced_by' => $before['stock'] - $after['stock']
                            ];
                        }
                    }
                } else {
                    $output['message'] = "Stock deduction failed!";
                }
            } else {
                $output['message'] = "No suitable order found for testing";
                
                // Try to find any paid order and reset it
                $anyPaidOrder = Order::where('payment_status', 'paid')->first();
                if ($anyPaidOrder) {
                    $output['reset_order'] = [
                        'id' => $anyPaidOrder->id,
                        'message' => 'Found paid order, you can reset stock_updated to false to test'
                    ];
                }
            }
            
            return response()->json($output, 200, [], JSON_PRETTY_PRINT);
            
        } catch (\Exception $e) {
            Log::error('Stock deduction test error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Test failed',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    /**
     * Debug stock table contents
     */
    public function debugStockTable(): JsonResponse
    {
        try {
            // Get all stock items with all fields
            $stockItems = Stock::all()->toArray();
            
            // Get sample order items
            $sampleOrder = Order::where('payment_status', 'paid')->first();
            $orderItems = $sampleOrder ? $sampleOrder->parsed_items : [];
            
            // Test matching for each order item
            $matchingTests = [];
            foreach ($orderItems as $item) {
                $productId = $item['product_id'] ?? null;
                $productName = $item['product_name'] ?? null;
                
                $test = [
                    'order_product_id' => $productId,
                    'order_product_name' => $productName,
                    'exact_match' => null,
                    'partial_matches' => []
                ];
                
                // Test exact match by product_id
                if ($productId) {
                    $exactMatch = Stock::where('product_id', $productId)->first();
                    $test['exact_match'] = $exactMatch ? [
                        'id' => $exactMatch->id,
                        'product_id' => $exactMatch->product_id,
                        'name' => $exactMatch->name,
                        'stock' => $exactMatch->stock
                    ] : null;
                    
                    // Test partial matches
                    $partialMatches = Stock::where('product_id', 'LIKE', "%{$productId}%")->get();
                    $test['partial_matches'] = $partialMatches->toArray();
                }
                
                $matchingTests[] = $test;
            }
            
            return response()->json([
                'stock_items' => $stockItems,
                'sample_order_items' => $orderItems,
                'matching_tests' => $matchingTests,
                'stock_count' => count($stockItems),
                'message' => 'Stock table contents for debugging'
            ], 200, [], JSON_PRETTY_PRINT);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    /**
     * Create test order with matching products
     */
    public function createTestOrder(): JsonResponse
    {
        try {
            // Create a test order with products that exist in stock
            $testOrder = [
                'order_number' => 'TEST-ORDER-' . time(),
                'customer_name' => 'Test Customer',
                'customer_email' => 'test@example.com',
                'customer_phone' => '1234567890',
                'customer_cpf' => '12345678901',
                'total' => 120.00,
                'subtotal' => 120.00,
                'shipping' => 0.00,
                'discount' => 0.00,
                'payment_method' => 'test',
                'payment_status' => 'paid',
                'status' => 'processing',
                'shipping_street' => 'Test Street',
                'shipping_number' => '123',
                'shipping_complement' => '',
                'shipping_neighborhood' => 'Test Neighborhood',
                'shipping_city' => 'Test City',
                'shipping_state' => 'TS',
                'shipping_zip_code' => '12345678',
                'items' => json_encode([
                    [
                        'product_id' => 'PROD-001',
                        'product_name' => 'Camiseta Looping Branca',
                        'quantity' => 1,
                        'color' => 'Branco',
                        'size' => 'M',
                        'price' => 60.00,
                        'total' => 60.00
                    ],
                    [
                        'product_id' => 'PROD-002',
                        'product_name' => 'Camiseta Looping Preta',
                        'quantity' => 1,
                        'color' => 'Preto',
                        'size' => 'G',
                        'price' => 60.00,
                        'total' => 60.00
                    ]
                ]),
                'stock_updated' => false
            ];

            $order = Order::create($testOrder);
            
            // Test stock deduction
            $service = new OrderStockService();
            
            // Check availability first
            $items = $order->parsed_items;
            $availability = $service->checkStockAvailability($items);
            
            // Show stock before deduction
            $stockBefore = [];
            foreach ($items as $item) {
                $stock = Stock::where('product_id', $item['product_id'])
                                     ->where('color', $item['color'])
                                     ->where('size', $item['size'])
                                     ->first();
                
                if ($stock) {
                    $stockBefore[] = [
                        'product_name' => $item['product_name'],
                        'color' => $item['color'],
                        'size' => $item['size'],
                        'stock_before' => $stock->stock
                    ];
                }
            }
            
            // Deduct stock
            try {
                $result = $service->deductStockFromOrder($order);
            } catch (\Exception $e) {
                $result = false;
                $debugInfo['deduction_exception'] = [
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString()
                ];
            }
            
            // Add debugging info
            $debugInfo = [];
            if (!$result) {
                // Check why deduction failed
                $order->refresh();
                $debugInfo['order_after_attempt'] = [
                    'stock_updated' => $order->stock_updated,
                    'payment_status' => $order->payment_status,
                    'can_deduct_stock' => $order->canDeductStock(),
                    'needs_stock_update' => $order->needsStockUpdate()
                ];
                
                // Try manual deduction to see what fails
                try {
                    $manualTest = [];
                    foreach ($items as $item) {
                        $stock = Stock::where('product_id', $item['product_id'])
                                     ->where('color', $item['color'])
                                     ->where('size', $item['size'])
                                     ->first();
                        
                        $manualTest[] = [
                            'product_name' => $item['product_name'],
                            'found_stock' => $stock ? 'YES' : 'NO',
                            'stock_id' => $stock ? $stock->id : null,
                            'current_stock' => $stock ? $stock->stock : null,
                            'quantity_requested' => $item['quantity']
                        ];
                    }
                    $debugInfo['manual_stock_check'] = $manualTest;
                } catch (\Exception $e) {
                    $debugInfo['manual_check_error'] = $e->getMessage();
                }
            }
            
            // Show stock after deduction
            $stockAfter = [];
            if ($result) {
                foreach ($items as $item) {
                    $stock = Stock::where('product_id', $item['product_id'])
                                         ->where('color', $item['color'])
                                         ->where('size', $item['size'])
                                         ->first();
                    
                    if ($stock) {
                        $stockAfter[] = [
                            'product_name' => $item['product_name'],
                            'color' => $item['color'],
                            'size' => $item['size'],
                            'stock_after' => $stock->stock
                        ];
                    }
                }
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Test order created and stock deduction tested',
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'stock_availability' => $availability,
                'stock_before' => $stockBefore,
                'stock_after' => $stockAfter,
                'deduction_result' => $result,
                'order_items' => $items,
                'debug_info' => $debugInfo
            ], 200, [], JSON_PRETTY_PRINT);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create test order',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }
}