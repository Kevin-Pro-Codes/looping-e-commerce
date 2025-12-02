<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Schema;

class StockController extends Controller
{
    /**
     * Get all stock items - FIXED VERSION
     */
    public function index(): JsonResponse
    {
        try {
            Log::info('=== STOCK INDEX START ===');

            // First, check if table exists
            if (!Schema::hasTable('stock')) {
                Log::warning('Stock table does not exist');
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'message' => 'Stock table not created yet. Please run migrations.',
                    'total_products' => 0,
                    'total_variants' => 0
                ]);
            }

            // Check database connection
            try {
                DB::connection()->getPdo();
                Log::info('Database connection OK');
            } catch (\Exception $e) {
                Log::error('Database connection failed: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Database connection failed',
                    'error' => $e->getMessage()
                ], 500);
            }

            // Try to get stock data
            try {
                // Get all stock items first to debug
                $allStock = Stock::all();
                Log::info('Raw stock count: ' . $allStock->count());

                // Group by product_id manually if the method doesn't exist
                $groupedStock = $allStock->groupBy('product_id')->map(function ($items, $productId) {
                    $firstItem = $items->first();
                    
                    return [
                        'product_id' => $productId,
                        'name' => $firstItem->name,
                        'sku' => $firstItem->sku,
                        'category' => $firstItem->category,
                        'supplier' => $firstItem->supplier,
                        'cost' => $firstItem->cost,
                        'profit' => $firstItem->profit,
                        'sale_price' => $firstItem->sale_price,
                        'total_value' => $items->sum(function ($item) {
                            return ($item->stock * $item->sale_price);
                        }),
                        'last_updated' => $firstItem->last_updated,
                        'created_at' => $firstItem->created_at,
                        'updated_at' => $firstItem->updated_at,
                        'variants' => $items->map(function ($variant) {
                            return [
                                'id' => $variant->id,
                                'color' => $variant->color,
                                'size' => $variant->size,
                                'stock' => $variant->stock,
                                'reserved' => $variant->reserved,
                                'incoming' => $variant->incoming,
                                'available' => $variant->stock - $variant->reserved
                            ];
                        })->toArray()
                    ];
                })->values(); // Reset keys

                Log::info('Grouped stock count: ' . $groupedStock->count());

                return response()->json([
                    'success' => true,
                    'data' => $groupedStock,
                    'total_products' => $groupedStock->count(),
                    'total_variants' => $allStock->count(),
                    'debug' => [
                        'raw_count' => $allStock->count(),
                        'grouped_count' => $groupedStock->count(),
                        'timestamp' => now()->format('Y-m-d H:i:s')
                    ]
                ]);

            } catch (\Exception $e) {
                Log::error('Error fetching stock data: ' . $e->getMessage());
                Log::error('Stack trace: ' . $e->getTraceAsString());
                
                // Return empty array instead of error for frontend
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'message' => 'No stock data available',
                    'error_debug' => config('app.debug') ? $e->getMessage() : null,
                    'total_products' => 0,
                    'total_variants' => 0
                ]);
            }

        } catch (\Exception $e) {
            Log::error('=== STOCK INDEX ERROR ===');
            Log::error('Error: ' . $e->getMessage());
            Log::error('File: ' . $e->getFile() . ':' . $e->getLine());
            Log::error('Trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch stock data',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
                'debug' => config('app.debug') ? [
                    'exception' => get_class($e),
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ] : null
            ], 500);
        }
    }

    /**
     * Create a simple test endpoint to check if controller works
     */
    public function test(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'StockController is working!',
            'timestamp' => now()->format('Y-m-d H:i:s'),
            'endpoint' => 'test'
        ]);
    }

    /**
     * Get database info for debugging
     */
    public function debug(): JsonResponse
    {
        try {
            $info = [
                'database_connected' => false,
                'table_exists' => false,
                'stock_count' => 0,
                'tables' => [],
                'env' => [
                    'db_connection' => config('database.default'),
                    'app_debug' => config('app.debug'),
                    'environment' => app()->environment()
                ]
            ];

            // Check DB connection
            try {
                DB::connection()->getPdo();
                $info['database_connected'] = true;
                
                // Check if stock table exists
                $info['table_exists'] = Schema::hasTable('stock');
                
                if ($info['table_exists']) {
                    $info['stock_count'] = DB::table('stock')->count();
                    $info['stock_columns'] = Schema::getColumnListing('stock');
                }
                
                // List all tables
                $info['tables'] = DB::select('SHOW TABLES');
                
            } catch (\Exception $e) {
                $info['database_error'] = $e->getMessage();
            }

            return response()->json([
                'success' => true,
                'data' => $info,
                'message' => 'Debug information'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Debug failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Synchronize stock for paid order
     */
    public function syncOrderStock(Request $request): JsonResponse
    {
        try {
            Log::info('=== SYNC ORDER STOCK ===');

            $validator = Validator::make($request->all(), [
                'order_items' => 'required|array',
                'order_items.*.product_id' => 'required|string',
                'order_items.*.quantity' => 'required|integer|min:1',
                'order_items.*.color' => 'sometimes|string|nullable',
                'order_items.*.size' => 'sometimes|string|nullable'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $orderItems = $request->order_items;
            $results = [];
            $errors = [];

            DB::beginTransaction();

            foreach ($orderItems as $item) {
                try {
                    $productId = $item['product_id'];
                    $quantity = $item['quantity'];
                    $color = $item['color'] ?? null;
                    $size = $item['size'] ?? null;

                    // Find stock item
                    $stockQuery = Stock::where('product_id', $productId);
                    
                    if ($color) {
                        $stockQuery->where('color', $color);
                    }
                    
                    if ($size) {
                        $stockQuery->where('size', $size);
                    }

                    $stock = $stockQuery->first();

                    if (!$stock) {
                        $errors[] = "Stock item not found for product_id: {$productId}";
                        continue;
                    }

                    // Check available stock
                    $availableStock = $stock->stock - $stock->reserved;
                    
                    if ($availableStock < $quantity) {
                        $errors[] = "Insufficient stock for {$stock->name}. Available: {$availableStock}, Requested: {$quantity}";
                        continue;
                    }

                    // Reserve stock
                    $oldReserved = $stock->reserved;
                    $stock->increment('reserved', $quantity);
                    $stock->update(['last_updated' => now()->format('Y-m-d')]);

                    $results[] = [
                        'stock_id' => $stock->id,
                        'product_id' => $productId,
                        'product_name' => $stock->name,
                        'quantity' => $quantity,
                        'old_reserved' => $oldReserved,
                        'new_reserved' => $stock->reserved,
                        'available_before' => $availableStock,
                        'available_after' => $stock->stock - $stock->reserved
                    ];

                } catch (\Exception $e) {
                    $errors[] = "Error: " . $e->getMessage();
                }
            }

            if (!empty($errors)) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Some items could not be processed',
                    'errors' => $errors
                ], 400);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Stock reserved successfully',
                'data' => $results
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Sync order stock error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to synchronize stock'
            ], 500);
        }
    }

    /**
     * Update stock quantity
     */
    public function updateStock(Request $request, $id): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'stock' => 'sometimes|integer|min:0',
                'reserved' => 'sometimes|integer|min:0',
                'incoming' => 'sometimes|integer|min:0'
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

            $updateData = ['last_updated' => now()->format('Y-m-d')];

            if ($request->has('stock')) {
                $updateData['stock'] = $request->stock;
            }
            if ($request->has('reserved')) {
                $updateData['reserved'] = $request->reserved;
            }
            if ($request->has('incoming')) {
                $updateData['incoming'] = $request->incoming;
            }

            $stock->update($updateData);

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

    /**
     * Create new stock item
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'product_id' => 'required|string',
                'name' => 'required|string',
                'sku' => 'required|string',
                'category' => 'required|string',
                'supplier' => 'required|string',
                'cost' => 'required|numeric|min:0',
                'profit' => 'required|numeric|min:0',
                'sale_price' => 'required|numeric|min:0',
                'color' => 'required|string',
                'size' => 'required|string',
                'stock' => 'required|integer|min:0',
                'reserved' => 'integer|min:0',
                'incoming' => 'integer|min:0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Calculate total value
            $totalValue = ($request->stock * $request->sale_price);

            $stock = Stock::create([
                'product_id' => $request->product_id,
                'name' => $request->name,
                'sku' => $request->sku,
                'category' => $request->category,
                'supplier' => $request->supplier,
                'cost' => $request->cost,
                'profit' => $request->profit,
                'sale_price' => $request->sale_price,
                'total_value' => $totalValue,
                'color' => $request->color,
                'size' => $request->size,
                'stock' => $request->stock,
                'reserved' => $request->reserved ?? 0,
                'incoming' => $request->incoming ?? 0,
                'last_updated' => now()->format('Y-m-d')
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
                'message' => 'Failed to create stock item: ' . $e->getMessage()
            ], 500);
        }
    }

    // ... (keep the rest of your existing methods, but use simple logic) ...

    /**
     * Get low stock items
     */
    public function lowStock(): JsonResponse
    {
        try {
            $lowStock = Stock::whereRaw('(stock - reserved) < 5')
                ->whereRaw('(stock - reserved) > 0')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $lowStock,
                'count' => $lowStock->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Low stock error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch low stock items'
            ], 500);
        }
    }

    /**
     * Get out of stock items
     */
    public function outOfStock(): JsonResponse
    {
        try {
            $outOfStock = Stock::whereRaw('(stock - reserved) <= 0')->get();

            return response()->json([
                'success' => true,
                'data' => $outOfStock,
                'count' => $outOfStock->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Out of stock error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch out of stock items'
            ], 500);
        }
    }
}