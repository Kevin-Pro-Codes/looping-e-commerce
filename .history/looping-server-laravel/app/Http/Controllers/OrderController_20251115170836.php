<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
   /**
 * Display a listing of the orders.
 */
public function index(): JsonResponse
{
    try {
        Log::info('=== ORDERS INDEX START ===');
        
        // Test database connection
        DB::connection()->getPdo();
        Log::info('Database connection: OK');
        
        // Check if orders table exists
        if (!Schema::hasTable('orders')) {
            Log::error('Orders table does not exist');
            return response()->json([
                'success' => false,
                'message' => 'Orders table does not exist in database',
                'error_details' => 'Run migrations: php artisan migrate'
            ], 500);
        }
        
        Log::info('Orders table exists: YES');
        
        // Test raw DB query first
        $rawCount = DB::table('orders')->count();
        Log::info('Raw DB orders count: ' . $rawCount);
        
        // Try to get orders with error handling for each field
        $orders = Order::orderBy('created_at', 'desc')->get();
        
        Log::info('Eloquent orders retrieved: ' . $orders->count());
        
        // Transform orders to ensure JSON serialization works
        $transformedOrders = $orders->map(function ($order) {
            return [
                'id' => $order->id,
                'order_number' => $order->order_number ?? null,
                'customer_name' => $order->customer_name ?? null,
                'customer_email' => $order->customer_email ?? null,
                'customer_phone' => $order->customer_phone ?? null,
                'customer_cpf' => $order->customer_cpf ?? null,
                'total' => $order->total ? (float) $order->total : 0,
                'subtotal' => $order->subtotal ? (float) $order->subtotal : 0,
                'shipping' => $order->shipping ? (float) $order->shipping : 0,
                'discount' => $order->discount ? (float) $order->discount : 0,
                'payment_method' => $order->payment_method ?? null,
                'payment_status' => $order->payment_status ?? null,
                'status' => $order->status ?? 'pending',
                'shipping_street' => $order->shipping_street ?? null,
                'shipping_number' => $order->shipping_number ?? null,
                'shipping_complement' => $order->shipping_complement ?? null,
                'shipping_neighborhood' => $order->shipping_neighborhood ?? null,
                'shipping_city' => $order->shipping_city ?? null,
                'shipping_state' => $order->shipping_state ?? null,
                'shipping_zip_code' => $order->shipping_zip_code ?? null,
                'items' => $order->items ? (is_string($order->items) ? json_decode($order->items, true) : $order->items) : [],
                'pix_data' => $order->pix_data ? (is_string($order->pix_data) ? json_decode($order->pix_data, true) : $order->pix_data) : null,
                'metadata' => $order->metadata ? (is_string($order->metadata) ? json_decode($order->metadata, true) : $order->metadata) : null,
                'created_at' => $order->created_at ? $order->created_at->toISOString() : null,
                'updated_at' => $order->updated_at ? $order->updated_at->toISOString() : null,
            ];
        });

        Log::info('=== ORDERS INDEX SUCCESS ===');
        
        return response()->json([
            'success' => true,
            'data' => $transformedOrders,
            'message' => 'Orders retrieved successfully',
            'count' => $transformedOrders->count()
        ]);
        
    } catch (\Exception $e) {
        Log::error('=== ORDERS INDEX ERROR ===');
        Log::error('Error message: ' . $e->getMessage());
        Log::error('Error file: ' . $e->getFile());
        Log::error('Error line: ' . $e->getLine());
        Log::error('Stack trace: ' . $e->getTraceAsString());
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to retrieve orders',
            'error' => $e->getMessage(),
            'error_details' => 'Check Laravel logs for complete error details'
        ], 500);
    }
}

    /**
     * Display the specified order.
     */
    public function show($id): JsonResponse
    {
        try {
            Log::info('Fetching order with ID: ' . $id);
            
            $order = Order::find($id);
            
            if (!$order) {
                Log::warning('Order not found with ID: ' . $id);
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }
            
            Log::info('Order found: ' . $order->order_number);
            
            return response()->json([
                'success' => true,
                'data' => $order,
                'message' => 'Order retrieved successfully'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to retrieve order: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the order status.
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        try {
            Log::info('Updating order status for ID: ' . $id);
            
            $validator = Validator::make($request->all(), [
                'status' => 'required|string|in:pending,processing,shipped,delivered,cancelled'
            ]);

            if ($validator->fails()) {
                Log::warning('Status validation failed: ' . json_encode($validator->errors()));
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $order = Order::find($id);
            
            if (!$order) {
                Log::warning('Order not found for status update: ' . $id);
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            $oldStatus = $order->status;
            $order->status = $request->status;
            $order->save();

            Log::info("Order status updated from {$oldStatus} to {$request->status} for order: " . $order->order_number);

            return response()->json([
                'success' => true,
                'data' => $order,
                'message' => 'Order status updated successfully'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to update order status: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified order.
     */
    public function destroy($id): JsonResponse
    {
        try {
            Log::info('Deleting order with ID: ' . $id);
            
            $order = Order::find($id);
            
            if (!$order) {
                Log::warning('Order not found for deletion: ' . $id);
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            $orderNumber = $order->order_number;
            $order->delete();

            Log::info('Order deleted successfully: ' . $orderNumber);

            return response()->json([
                'success' => true,
                'message' => 'Order deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to delete order: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate sample orders for testing.
     */
    public function generateSamples(Request $request): JsonResponse
    {
        try {
            Log::info('Generating sample orders');
            
            $samples = $request->input('samples', []);
            $createdOrders = [];

            Log::info('Number of samples to create: ' . count($samples));

            foreach ($samples as $index => $sample) {
                try {
                    // Generate order number if not provided
                    if (empty($sample['order_number'])) {
                        $sample['order_number'] = 'ORD-' . date('Ymd') . '-' . strtoupper(uniqid());
                    }
                    
                    $order = Order::create($sample);
                    $createdOrders[] = $order;
                    Log::info('Created sample order: ' . $order->order_number);
                } catch (\Exception $e) {
                    Log::error("Failed to create sample order at index {$index}: " . $e->getMessage());
                    throw $e;
                }
            }

            Log::info('Successfully created ' . count($createdOrders) . ' sample orders');

            return response()->json([
                'success' => true,
                'data' => $createdOrders,
                'message' => 'Sample orders generated successfully'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to generate sample orders: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate sample orders: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear all orders (admin function).
     */
    public function clearAll(): JsonResponse
    {
        try {
            Log::info('Clearing all orders from database');
            
            $orderCount = Order::count();
            Order::truncate();

            Log::info("Cleared {$orderCount} orders from database");

            return response()->json([
                'success' => true,
                'message' => 'All orders cleared successfully',
                'cleared_count' => $orderCount
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to clear orders: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear orders: ' . $e->getMessage()
            ], 500);
        }
    }
}