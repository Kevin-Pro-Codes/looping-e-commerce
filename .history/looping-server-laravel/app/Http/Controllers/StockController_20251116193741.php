<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StockController extends Controller
{
    /**
     * Get all stock items grouped by product
     */
    public function index(): JsonResponse
    {
        try {
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
                'message' => 'Failed to fetch stock data'
            ], 500);
        }
    }

    /**
     * Update stock for an item
     */
    public function updateStock(Request $request, $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'stock' => 'required|integer|min:0'
            ]);

            $stock = Stock::findOrFail($id);
            $stock->update([
                'stock' => $validated['stock'],
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
            $validated = $request->validate([
                'quantity' => 'required|integer|min:1'
            ]);

            $stock = Stock::findOrFail($id);
            $stock->increment('incoming', $validated['quantity']);

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
            $stock = Stock::findOrFail($id);
            
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
     * Create sample data
     */
    public function createSamples(): JsonResponse
    {
        try {
            // Clear existing samples
            Stock::where('product_id', 'LIKE', 'PROD-%')->delete();

            $sampleData = [
                // Product 1 - Camiseta Branca
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
                    'last_updated' => now()->format('Y-m-d')
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
                    'last_updated' => now()->format('Y-m-d')
                ],
                [
                    'product_id' => 'PROD-001',
                    'name' => 'Camiseta Looping Branca',
                    'sku' => 'CT-LOOPING-WHITE-G',
                    'category' => 'Roupas',
                    'supplier' => 'Fabricante A',
                    'cost' => 15.00,
                    'color' => 'Branco',
                    'size' => 'G',
                    'stock' => 8,
                    'reserved' => 1,
                    'incoming' => 10,
                    'last_updated' => now()->format('Y-m-d')
                ],
                [
                    'product_id' => 'PROD-001',
                    'name' => 'Camiseta Looping Branca',
                    'sku' => 'CT-LOOPING-WHITE-GG',
                    'category' => 'Roupas',
                    'supplier' => 'Fabricante A',
                    'cost' => 15.00,
                    'color' => 'Branco',
                    'size' => 'GG',
                    'stock' => 5,
                    'reserved' => 0,
                    'incoming' => 0,
                    'last_updated' => now()->format('Y-m-d')
                ],
                // Product 2 - Camiseta Preta
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
                    'last_updated' => now()->format('Y-m-d')
                ],
                [
                    'product_id' => 'PROD-002',
                    'name' => 'Camiseta Looping Preta',
                    'sku' => 'CT-LOOPING-BLACK-M',
                    'category' => 'Roupas',
                    'supplier' => 'Fabricante A',
                    'cost' => 15.00,
                    'color' => 'Preto',
                    'size' => 'M',
                    'stock' => 3,
                    'reserved' => 2,
                    'incoming' => 0,
                    'last_updated' => now()->format('Y-m-d')
                ],
                [
                    'product_id' => 'PROD-002',
                    'name' => 'Camiseta Looping Preta',
                    'sku' => 'CT-LOOPING-BLACK-G',
                    'category' => 'Roupas',
                    'supplier' => 'Fabricante A',
                    'cost' => 15.00,
                    'color' => 'Preto',
                    'size' => 'G',
                    'stock' => 7,
                    'reserved' => 1,
                    'incoming' => 0,
                    'last_updated' => now()->format('Y-m-d')
                ],
                [
                    'product_id' => 'PROD-002',
                    'name' => 'Camiseta Looping Preta',
                    'sku' => 'CT-LOOPING-BLACK-GG',
                    'category' => 'Roupas',
                    'supplier' => 'Fabricante A',
                    'cost' => 15.00,
                    'color' => 'Preto',
                    'size' => 'GG',
                    'stock' => 2,
                    'reserved' => 0,
                    'incoming' => 0,
                    'last_updated' => now()->format('Y-m-d')
                ]
            ];

            Stock::insert($sampleData);

            return response()->json([
                'success' => true,
                'message' => 'Sample stock data created successfully',
                'data' => Stock::getGroupedStock()
            ]);

        } catch (\Exception $e) {
            Log::error('Create samples error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create sample data'
            ], 500);
        }
    }

    /**
     * Get low stock alerts
     */
    public function lowStock(): JsonResponse
    {
        try {
            $lowStockItems = Stock::where('stock', '>', 0)
                ->where('stock', '<=', 5)
                ->get();

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
            $outOfStockItems = Stock::where('stock', 0)->get();

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
}