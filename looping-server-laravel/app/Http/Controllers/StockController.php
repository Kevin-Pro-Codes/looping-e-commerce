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
     * Synchronize stock when an order is placed
     * Decreases current stock and increases reserved stock
     */
    public function syncOrderStock(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'order_items' => 'required|array',
                'order_items.*.variant_id' => 'required|integer|exists:stock,id',
                'order_items.*.quantity' => 'required|integer|min:1'
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
                    $variantId = $item['variant_id'];
                    $quantity = $item['quantity'];

                    $stock = Stock::find($variantId);
                    
                    if (!$stock) {
                        $errors[] = "Variant ID {$variantId} not found";
                        continue;
                    }

                    // Check if there's enough stock available
                    $availableStock = $stock->stock - $stock->reserved;
                    
                    if ($availableStock < $quantity) {
                        $errors[] = "Insufficient stock for variant {$variantId}. Available: {$availableStock}, Requested: {$quantity}";
                        continue;
                    }

                    // Update stock: decrease current stock and increase reserved
                    $stock->decrement('stock', $quantity);
                    $stock->increment('reserved', $quantity);
                    $stock->update(['last_updated' => now()->format('Y-m-d')]);

                    $results[] = [
                        'variant_id' => $variantId,
                        'quantity' => $quantity,
                        'new_stock' => $stock->stock,
                        'new_reserved' => $stock->reserved,
                        'available' => $stock->stock - $stock->reserved
                    ];

                    Log::info('Order stock synchronized', [
                        'variant_id' => $variantId,
                        'quantity' => $quantity,
                        'old_stock' => $stock->stock + $quantity,
                        'new_stock' => $stock->stock,
                        'old_reserved' => $stock->reserved - $quantity,
                        'new_reserved' => $stock->reserved
                    ]);

                } catch (\Exception $e) {
                    $errors[] = "Error processing variant {$variantId}: " . $e->getMessage();
                    Log::error('Error syncing stock for variant: ' . $variantId, [
                        'error' => $e->getMessage(),
                        'item' => $item
                    ]);
                }
            }

            if (!empty($errors)) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Some items could not be processed',
                    'errors' => $errors,
                    'processed_items' => $results
                ], 400);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Stock synchronized successfully for order',
                'data' => $results
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Sync order stock error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to synchronize stock for order'
            ], 500);
        }
    }

    /**
     * Reverse order stock (when order is cancelled)
     * Increases current stock and decreases reserved stock
     */
    public function reverseOrderStock(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'order_items' => 'required|array',
                'order_items.*.variant_id' => 'required|integer|exists:stock,id',
                'order_items.*.quantity' => 'required|integer|min:1'
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
                    $variantId = $item['variant_id'];
                    $quantity = $item['quantity'];

                    $stock = Stock::find($variantId);
                    
                    if (!$stock) {
                        $errors[] = "Variant ID {$variantId} not found";
                        continue;
                    }

                    // Check if there's enough reserved stock to reverse
                    if ($stock->reserved < $quantity) {
                        $errors[] = "Insufficient reserved stock for variant {$variantId}. Reserved: {$stock->reserved}, Requested to reverse: {$quantity}";
                        continue;
                    }

                    // Reverse stock: increase current stock and decrease reserved
                    $stock->increment('stock', $quantity);
                    $stock->decrement('reserved', $quantity);
                    $stock->update(['last_updated' => now()->format('Y-m-d')]);

                    $results[] = [
                        'variant_id' => $variantId,
                        'quantity' => $quantity,
                        'new_stock' => $stock->stock,
                        'new_reserved' => $stock->reserved,
                        'available' => $stock->stock - $stock->reserved
                    ];

                    Log::info('Order stock reversed', [
                        'variant_id' => $variantId,
                        'quantity' => $quantity,
                        'old_stock' => $stock->stock - $quantity,
                        'new_stock' => $stock->stock,
                        'old_reserved' => $stock->reserved + $quantity,
                        'new_reserved' => $stock->reserved
                    ]);

                } catch (\Exception $e) {
                    $errors[] = "Error reversing stock for variant {$variantId}: " . $e->getMessage();
                    Log::error('Error reversing stock for variant: ' . $variantId, [
                        'error' => $e->getMessage(),
                        'item' => $item
                    ]);
                }
            }

            if (!empty($errors)) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Some items could not be processed',
                    'errors' => $errors,
                    'processed_items' => $results
                ], 400);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Stock reversed successfully for cancelled order',
                'data' => $results
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Reverse order stock error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to reverse stock for order'
            ], 500);
        }
    }

    /**
     * Reset reserved stock to zero for a specific variant
     */
    public function resetReservedStock(Request $request, $id): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'reserved' => 'required|integer|min:0'
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

            // Reset reserved to 0
            $stock->update([
                'reserved' => 0, // Always set to 0 for reset
                'last_updated' => now()->format('Y-m-d')
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Reserved stock reset to zero successfully',
                'data' => $stock
            ]);

        } catch (\Exception $e) {
            Log::error('Reset reserved stock error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to reset reserved stock'
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

            // Only update fields that are provided
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
                'profit' => $request->profit,
                'sale_price' => $request->sale_price,
                'total_value' => $request->total_value,
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