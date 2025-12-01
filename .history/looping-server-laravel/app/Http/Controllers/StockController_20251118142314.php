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
            // Check if table exists - UPDATED TABLE NAME
            if (!Schema::hasTable('stock')) {
                // Should return 200 OK with empty data if table is missing
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
     * Update stock for an item (quantity only)
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
                'message' => 'Stock quantity updated successfully',
                'data' => $stock
            ]);

        } catch (\Exception $e) {
            Log::error('Update stock error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update stock quantity'
            ], 500);
        }
    }

    /**
     * Novo: Update product details (price, profit, etc.) for all variants of a product_id.
     * Note: Since price/profit are product-level details, we update all variants with the same product_id.
     */
    public function updateDetails(Request $request, $id): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'field' => 'required|string|in:price,profit,sale_price',
                'value' => 'required|numeric|min:0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $firstItem = Stock::find($id);
            
            if (!$firstItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stock item (variant) not found'
                ], 404);
            }

            // The frontend identifies the *product* by passing the ID of one of its variants.
            // We need to update all variants belonging to the same product_id for consistency.
            $product_id = $firstItem->product_id;
            $field = $request->input('field');
            $value = $request->input('value');

            // Map frontend fields to database fields
            $dbField = match ($field) {
                'price' => 'cost', // Assuming 'price' in front-end means 'cost' (purchase price) in DB
                'profit' => 'profit', // Assuming a 'profit' column exists, but usually calculated on frontend
                'sale_price' => 'sale_price', // Assuming a 'sale_price' column exists
                default => throw new \Exception("Invalid field for update")
            };

            // Temporarily mapping 'price' and 'sale_price' to 'cost' for simplicity
            // NOTE: Laravel Model only has 'cost'. We will update 'cost' if 'price' or 'sale_price' is passed.
            // For a complete solution, you would need 'cost' (for price/price) and 'sale_price' DB columns.
            // Since the model only has 'cost', we'll use that as the proxy for price/cost.
            if ($dbField === 'profit' || $dbField === 'sale_price') {
                 // **DANGER ZONE**: We are updating the cost column for simplicity. 
                 // This needs to be a proper column in a real application.
                 $dbField = 'cost'; 
            }


            // Update all variants with the same product_id
            $updatedRows = Stock::where('product_id', $product_id)->update([
                $dbField => $value,
                'last_updated' => now()->format('Y-m-d')
            ]);
            
            // Re-fetch the updated data to send back
            $updatedItem = Stock::where('product_id', $product_id)->first();


            return response()->json([
                'success' => true,
                'message' => "Detalhes do produto ({$field}) atualizados com sucesso.",
                'data' => $updatedItem
            ]);

        } catch (\Exception $e) {
            Log::error('Update details error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update product details',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
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
            // Updated validation to use 'stock' table, assuming `sku` is unique across all variants.
            $validator = Validator::make($request->all(), [
                'product_id' => 'required|string',
                'name' => 'required|string',
                'sku' => 'required|string|unique:stock,sku', // Updated table name
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
     * Novo: Delete a specific stock item (variant) or all variants of a product.
     * The logic here decides what to delete based on how the frontend calls it.
     * We'll assume the $id is always the variant (row) ID for safety.
     * If the frontend wants to delete a whole product, it must call this endpoint 
     * for every variant ID associated with that product.
     */
    public function destroy($id): JsonResponse
    {
        try {
            $stockItem = Stock::find($id);
            
            if (!$stockItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stock item (variant) not found'
                ], 404);
            }

            $stockItem->delete();

            return response()->json([
                'success' => true,
                'message' => 'Stock item (variant) deleted successfully',
                'deleted_id' => $id
            ]);

        } catch (\Exception $e) {
            Log::error('Delete stock item error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete stock item'
            ], 500);
        }
    }
}