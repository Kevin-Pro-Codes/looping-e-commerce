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
     * Get all stock items grouped by product
     */
    public function index(): JsonResponse
    {
        try {
            // Check if table exists
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
     * Get low stock alerts (stock <= 5)
     */
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

    /**
     * Get out of stock items
     */
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

    /**
     * Update stock for an item
     */
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
                'last_updated' => now()->format('Y-m-d')
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

    /**
     * Add incoming stock
     */
    public function addIncoming(Request $request, $id): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'quantity' => 'required|integer|min:1'
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

            $stock->increment('incoming', $request->quantity);

            return response()->json([
                'success' => true,
                'message' => 'Incoming stock added successfully',
                'data' => $stock
            ]);

        } catch (\Exception $e) {
            Log::error('Add incoming stock error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to add incoming stock'
            ], 500);
        }
    }

    /**
     * Receive incoming stock
     */
    public function receiveIncoming($id): JsonResponse
    {
        try {
            $stock = Stock::find($id);
            
            if (!$stock) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stock item not found'
                ], 404);
            }

            DB::transaction(function () use ($stock) {
                $stock->increment('stock', $stock->incoming);
                $stock->update([
                    'incoming' => 0,
                    'last_updated' => now()->format('Y-m-d')
                ]);
            });

            return response()->json([
                'success' => true,
                'message' => 'Incoming stock received successfully',
                'data' => $stock
            ]);

        } catch (\Exception $e) {
            Log::error('Receive incoming stock error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to receive incoming stock'
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
                'sku' => 'required|string|unique:stock,sku', 
                'category' => 'required|string',
                'supplier' => 'required|string',
                'cost' => 'required|numeric|min:0',
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

            $stock = Stock::create([
                'product_id' => $request->product_id,
                'name' => $request->name,
                'sku' => $request->sku,
                'category' => $request->category,
                'supplier' => $request->supplier,
                'cost' => $request->cost,
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
                'message' => 'Failed to create stock item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create sample data for testing
     */
    public function createSamples(): JsonResponse
    {
        try {
            $samples = [
                [
                    'product_id' => 'PROD-001',
                    'name' => 'Camiseta Looping Branca',
                    'sku' => 'CT-LOOPING-WHITE-P',
                    'category' => 'Roupas',
                    'supplier' => 'Fabricante A',
                    'cost' => 15.00,
                    'color' => 'Branco',
                    'size' => 'P',
                    'stock' => 10,
                    'reserved' => 2,
                    'incoming' => 5,
                    'last_updated' => '2024-01-15'
                ],
                [
                    'product_id' => 'PROD-001',
                    'name' => 'Camiseta Looping Branca',
                    'sku' => 'CT-LOOPING-WHITE-M',
                    'category' => 'Roupas',
                    'supplier' => 'Fabricante A',
                    'cost' => 15.00,
                    'color' => 'Branco',
                    'size' => 'M',
                    'stock' => 15,
                    'reserved' => 3,
                    'incoming' => 0,
                    'last_updated' => '2024-01-15'
                ],
                [
                    'product_id' => 'PROD-002',
                    'name' => 'Camiseta Looping Preta',
                    'sku' => 'CT-LOOPING-BLACK-P',
                    'category' => 'Roupas',
                    'supplier' => 'Fabricante A',
                    'cost' => 15.00,
                    'color' => 'Preto',
                    'size' => 'P',
                    'stock' => 0,
                    'reserved' => 0,
                    'incoming' => 20,
                    'last_updated' => '2024-01-15'
                ]
            ];

            $created = [];
            foreach ($samples as $sample) {
                $created[] = Stock::create($sample);
            }

            return response()->json([
                'success' => true,
                'message' => 'Sample data created successfully',
                'data' => $created
            ], 201);

        } catch (\Exception $e) {
            Log::error('Create samples error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create sample data'
            ], 500);
        }
    }
}

