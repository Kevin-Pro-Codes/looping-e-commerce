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
            Log::info('Fetching orders from database');
            
            // Test database connection first
            DB::connection()->getPdo();
            Log::info('Database connection successful');
            
            $orders = Order::orderBy('created_at', 'desc')->get();
            
            Log::info('Successfully retrieved ' . $orders->count() . ' orders');
            
            return response()->json([
                'success' => true,
                'data' => $orders,
                'message' => 'Orders retrieved successfully',
                'count' => $orders->count()
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to retrieve orders: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve orders: ' . $e->getMessage(),
                'error_details' => 'Check Laravel logs for more information'
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