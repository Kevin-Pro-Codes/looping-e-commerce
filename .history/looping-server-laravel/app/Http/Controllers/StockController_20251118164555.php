<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockController extends Controller
{
    /**
     * Fetch all stock with variants
     */
    public function fetchStock()
    {
        try {
            // Get all stock items with their variants
            $stockItems = Stock::with(['variants' => function($query) {
                $query->select(['id', 'stock_id', 'color', 'size', 'stock', 'reserved', 'incoming', 'sku']);
            }])->get();

            return response()->json([
                'success' => true,
                'data' => $stockItems,
                'message' => 'Stock data fetched successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => [],
                'message' => 'Error fetching stock: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update stock quantity for a variant
     */
    public function updateStock($variantId, Request $request)
    {
        try {
            $request->validate([
                'stock' => 'required|integer|min:0'
            ]);

            $variant = DB::table('stock_variants')->where('id', $variantId)->first();
            
            if (!$variant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Variant not found'
                ], 404);
            }

            DB::table('stock_variants')
                ->where('id', $variantId)
                ->update([
                    'stock' => $request->stock,
                    'updated_at' => now()
                ]);

            // Update the main stock updated_at
            DB::table('stocks')
                ->where('id', $variant->stock_id)
                ->update(['updated_at' => now()]);

            return response()->json([
                'success' => true,
                'message' => 'Stock updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating stock: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add incoming stock
     */
    public function addIncomingStock($variantId, Request $request)
    {
        try {
            $request->validate([
                'quantity' => 'required|integer|min:1'
            ]);

            $variant = DB::table('stock_variants')->where('id', $variantId)->first();
            
            if (!$variant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Variant not found'
                ], 404);
            }

            DB::table('stock_variants')
                ->where('id', $variantId)
                ->update([
                    'incoming' => DB::raw('incoming + ' . $request->quantity),
                    'updated_at' => now()
                ]);

            return response()->json([
                'success' => true,
                'message' => 'Incoming stock added successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error adding incoming stock: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Receive incoming stock
     */
    public function receiveIncomingStock($variantId)
    {
        try {
            $variant = DB::table('stock_variants')->where('id', $variantId)->first();
            
            if (!$variant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Variant not found'
                ], 404);
            }

            DB::table('stock_variants')
                ->where('id', $variantId)
                ->update([
                    'stock' => DB::raw('stock + incoming'),
                    'incoming' => 0,
                    'updated_at' => now()
                ]);

            // Update the main stock updated_at
            DB::table('stocks')
                ->where('id', $variant->stock_id)
                ->update(['updated_at' => now()]);

            return response()->json([
                'success' => true,
                'message' => 'Incoming stock received successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error receiving incoming stock: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new stock item
     */
    public function createStock(Request $request)
    {
        try {
            $request->validate([
                'product_id' => 'required|string',
                'name' => 'required|string',
                'sku' => 'required|string',
                'category' => 'required|string',
                'supplier' => 'required|string',
                'cost' => 'required|numeric|min:0',
                'profit_margin' => 'nullable|numeric|min:0',
                'sale_markup' => 'nullable|numeric|min:0',
                'sale_price' => 'nullable|numeric|min:0',
                'profit' => 'nullable|numeric|min:0',
                'color' => 'required|string',
                'size' => 'required|string',
                'stock' => 'nullable|integer|min:0',
                'reserved' => 'nullable|integer|min:0',
                'incoming' => 'nullable|integer|min:0'
            ]);

            // Use provided values or calculate defaults
            $profitMargin = $request->profit_margin ?? 0.60;
            $saleMarkup = $request->sale_markup ?? 1.80;
            $cost = $request->cost;

            $stockId = DB::table('stocks')->insertGetId([
                'product_id' => $request->product_id,
                'name' => $request->name,
                'sku' => $request->sku,
                'category' => $request->category,
                'supplier' => $request->supplier,
                'cost' => $cost,
                'profit_margin' => $profitMargin,
                'sale_markup' => $saleMarkup,
                'sale_price' => $request->sale_price ?? ($cost * $saleMarkup),
                'profit' => $request->profit ?? ($cost * $profitMargin),
                'stock_value' => 0, // Will be calculated based on variants
                'last_updated' => now(),
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Create variant
            DB::table('stock_variants')->insert([
                'stock_id' => $stockId,
                'color' => $request->color,
                'size' => $request->size,
                'stock' => $request->stock ?? 0,
                'reserved' => $request->reserved ?? 0,
                'incoming' => $request->incoming ?? 0,
                'sku' => $request->sku . '-' . $request->color . '-' . $request->size,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Calculate initial stock value
            $this->calculateStockValue($stockId);

            $newStock = Stock::with('variants')->find($stockId);

            return response()->json([
                'success' => true,
                'data' => $newStock,
                'message' => 'Stock item created successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating stock item: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculate and update stock value
     */
    private function calculateStockValue($stockId)
    {
        $stock = DB::table('stocks')->where('id', $stockId)->first();
        $variants = DB::table('stock_variants')->where('stock_id', $stockId)->get();

        $totalStock = $variants->sum('stock');
        $totalValue = $totalStock * $stock->sale_price;

        DB::table('stocks')
            ->where('id', $stockId)
            ->update(['stock_value' => $totalValue]);

        return $totalValue;
    }
}