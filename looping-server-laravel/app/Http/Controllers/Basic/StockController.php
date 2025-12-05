<?php

namespace App\Http\Controllers\Basic;

use App\Http\Controllers\Controller;

use App\Models\Stock;
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

            // Check if any stock items exist with this product_id
            $existingItems = Stock::where('product_id', $productId)->get();
            
            if ($existingItems->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nenhum produto encontrado com esse product_id'
                ], 404);
            }

            $updateData = ['last_updated' => now()->format('Y-m-d')];

            // Only update fields that are provided
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
                    'last_updated' => now()->format('Y-m-d')
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
     * Delete a specific stock item (variant)
     */
    public function destroy($id): JsonResponse
    {
        try {
            Log::info("Attempting to delete stock item with ID: {$id}");

            $stock = Stock::find($id);
            
            if (!$stock) {
                Log::warning("Stock item not found with ID: {$id}");
                return response()->json([
                    'success' => false,
                    'message' => 'Item de estoque não encontrado'
                ], 404);
            }

            // Store info for logging before deletion
            $productInfo = [
                'id' => $stock->id,
                'product_id' => $stock->product_id,
                'name' => $stock->name,
                'color' => $stock->color,
                'size' => $stock->size
            ];

            $stock->delete();

            Log::info("Stock item deleted successfully", $productInfo);

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

    /**
     * Delete all variants of a product by product_id
     */
    public function destroyByProductId($productId): JsonResponse
    {
        try {
            Log::info("Attempting to delete all stock items for product_id: {$productId}");

            // First, check if any items exist with this product_id
            $existingItems = Stock::where('product_id', $productId)->get();
            
            if ($existingItems->isEmpty()) {
                Log::warning("No stock items found for product_id: {$productId}");
                return response()->json([
                    'success' => false,
                    'message' => 'Nenhum produto encontrado com este ID'
                ], 404);
            }

            // Store info for logging before deletion
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

            Log::info("Product and all variants deleted successfully", [
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
}