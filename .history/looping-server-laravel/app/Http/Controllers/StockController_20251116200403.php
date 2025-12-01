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
     * Create new stock item
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'product_id' => 'required|string',
                'name' => 'required|string',
                'sku' => 'required|string|unique:stock_items,sku',
                'category' => 'required|string',
                'supplier' => 'required|string',
                'cost' => 'required|numeric|min:0',
                'color' => 'required|string',
                'size' => 'required|string',
                'stock' => 'required|integer|min:0',
                'reserved' => 'integer|min:0',
                'incoming' => 'integer|min:0'
            ]);

            $stock = Stock::create([
                ...$validated,
                'last_updated' => now()->format('Y-m-d'),
                'reserved' => $validated['reserved'] ?? 0,
                'incoming' => $validated['incoming'] ?? 0
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
                'message' => 'Failed to create stock item'
            ], 500);
        }
    }

    /**
     * Get low stock alerts (stock <= 5)
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