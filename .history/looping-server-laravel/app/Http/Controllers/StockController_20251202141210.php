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
            if (!Schema::hasTable('stock')) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'message' => 'Stock table not created yet'
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
                'message' => 'Failed to fetch stock data'
            ], 500);
        }
    }

    /**
     * Synchronize stock for paid order
     * INCREASES reserved stock when order is paid
     */
    public function syncOrderStock(Request $request): JsonResponse
    {
        try {
            Log::info('=== SYNC ORDER STOCK (PAID ORDER) ===');

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

                    // Reserve stock (increase reserved)
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

                    Log::info('Stock reserved for order:', [
                        'product_id' => $productId,
                        'quantity' => $quantity,
                        'new_reserved' => $stock->reserved
                    ]);

                } catch (\Exception $e) {
                    $errors[] = "Error processing item: " . $e->getMessage();
                    Log::error('Stock sync error:', [
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
                'message' => 'Stock reserved successfully for paid order',
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
     * Reduce stock for shipped order
     * DECREASES actual stock and reserved stock when order is shipped
     */
    public function shipOrderStock(Request $request): JsonResponse
    {
        try {
            Log::info('=== SHIP ORDER STOCK ===');

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

                    $stock = Stock::where('product_id', $productId)
                        ->when($color, fn($q) => $q->where('color', $color))
                        ->when($size, fn($q) => $q->where('size', $size))
                        ->first();

                    if (!$stock) {
                        $errors[] = "Stock item not found for product_id: {$productId}";
                        continue;
                    }

                    // Check if there's enough reserved stock
                    if ($stock->reserved < $quantity) {
                        $errors[] = "Insufficient reserved stock for {$stock->name}. Reserved: {$stock->reserved}, Requested: {$quantity}";
                        continue;
                    }

                    // Reduce actual stock AND reserved stock
                    $oldStock = $stock->stock;
                    $oldReserved = $stock->reserved;
                    
                    $stock->decrement('stock', $quantity);
                    $stock->decrement('reserved', $quantity);
                    $stock->update(['last_updated' => now()->format('Y-m-d')]);

                    $results[] = [
                        'stock_id' => $stock->id,
                        'product_id' => $productId,
                        'product_name' => $stock->name,
                        'quantity' => $quantity,
                        'old_stock' => $oldStock,
                        'new_stock' => $stock->stock,
                        'old_reserved' => $oldReserved,
                        'new_reserved' => $stock->reserved
                    ];

                    Log::info('Stock reduced for shipment:', [
                        'product_id' => $productId,
                        'quantity' => $quantity,
                        'new_stock' => $stock->stock,
                        'new_reserved' => $stock->reserved
                    ]);

                } catch (\Exception $e) {
                    $errors[] = "Error shipping item: " . $e->getMessage();
                    Log::error('Ship stock error:', [
                        'error' => $e->getMessage(),
                        'item' => $item
                    ]);
                }
            }

            if (!empty($errors)) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Some items could not be shipped',
                    'errors' => $errors
                ], 400);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Stock reduced for shipped order',
                'data' => $results
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Ship order stock error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to reduce stock for shipped order'
            ], 500);
        }
    }

    /**
     * Restore stock for cancelled/refunded order
     * DECREASES reserved stock when order is cancelled
     */
    public function reverseOrderStock(Request $request): JsonResponse
    {
        try {
            Log::info('=== REVERSE ORDER STOCK (CANCELLED/REFUNDED) ===');

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

                    $stock = Stock::where('product_id', $productId)
                        ->when($color, fn($q) => $q->where('color', $color))
                        ->when($size, fn($q) => $q->where('size', $size))
                        ->first();

                    if (!$stock) {
                        $errors[] = "Stock item not found for product_id: {$productId}";
                        continue;
                    }

                    // Check if there's enough reserved stock to reverse
                    if ($stock->reserved < $quantity) {
                        Log::warning('Cannot reverse more than reserved:', [
                            'product_id' => $productId,
                            'requested' => $quantity,
                            'reserved' => $stock->reserved
                        ]);
                        $quantity = $stock->reserved; // Reverse only what's reserved
                    }

                    // Reverse reserved stock (decrease reserved)
                    $oldReserved = $stock->reserved;
                    $stock->decrement('reserved', $quantity);
                    $stock->update(['last_updated' => now()->format('Y-m-d')]);

                    $results[] = [
                        'stock_id' => $stock->id,
                        'product_id' => $productId,
                        'product_name' => $stock->name,
                        'quantity' => $quantity,
                        'old_reserved' => $oldReserved,
                        'new_reserved' => $stock->reserved,
                        'available' => $stock->stock - $stock->reserved
                    ];

                    Log::info('Stock reversed for cancelled order:', [
                        'product_id' => $productId,
                        'quantity' => $quantity,
                        'new_reserved' => $stock->reserved
                    ]);

                } catch (\Exception $e) {
                    $errors[] = "Error reversing stock: " . $e->getMessage();
                    Log::error('Reverse stock error:', [
                        'error' => $e->getMessage(),
                        'item' => $item
                    ]);
                }
            }

            if (!empty($errors)) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Some items could not be reversed',
                    'errors' => $errors
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
     * Reset reserved stock to zero
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

            $stock->update([
                'reserved' => 0,
                'last_updated' => now()->format('Y-m-d')
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Reserved stock reset to zero',
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
     * Update product fields
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
                    'message' => 'Nenhum produto encontrado'
                ], 404);
            }

            $updateData = ['last_updated' => now()->format('Y-m-d')];

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
                'message' => 'Campo atualizado com sucesso',
                'updated_count' => $updated,
                'updated_fields' => array_keys($updateData)
            ]);

        } catch (\Exception $e) {
            Log::error('Update product field error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar campo'
            ], 500);
        }
    }

    /**
     * Get low stock items
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
     * Update product pricing
     */
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
                    'message' => 'Nenhum produto encontrado'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Preços atualizados com sucesso',
                'updated_count' => $updated
            ]);

        } catch (\Exception $e) {
            Log::error('Update pricing error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar preços'
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
                'message' => 'Failed to create stock item'
            ], 500);
        }
    }

    /**
     * Delete stock variant
     */
    public function destroy($id): JsonResponse
    {
        try {
            Log::info("Deleting stock item ID: {$id}");

            $stock = Stock::find($id);
            
            if (!$stock) {
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

            Log::info("Stock item deleted", $productInfo);

            return response()->json([
                'success' => true,
                'message' => 'Variante excluída com sucesso',
                'deleted_item' => $productInfo
            ]);

        } catch (\Exception $e) {
            Log::error('Delete stock item error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao excluir variante'
            ], 500);
        }
    }

    /**
     * Delete all variants of a product
     */
    public function destroyByProductId($productId): JsonResponse
    {
        try {
            Log::info("Deleting all stock for product_id: {$productId}");

            $existingItems = Stock::where('product_id', $productId)->get();
            
            if ($existingItems->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nenhum produto encontrado'
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

            Log::info("Product and variants deleted", [
                'product_id' => $productId,
                'deleted_count' => $deletedCount
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Produto e todas as variantes excluídos com sucesso',
                'deleted_count' => $deletedCount,
                'deleted_items' => $itemsInfo
            ]);

        } catch (\Exception $e) {
            Log::error('Delete product error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao excluir produto'
            ], 500);
        }
    }
}