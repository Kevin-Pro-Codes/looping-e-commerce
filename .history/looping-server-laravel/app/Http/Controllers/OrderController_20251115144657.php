<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Display a listing of the orders.
     */
    public function index(): JsonResponse
    {
        try {
            Log::info('Fetching orders from database');

            // Check if orders table exists
            if (!Schema::hasTable('orders')) {
                Log::warning('Orders table does not exist');
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'message' => 'Orders table not created yet. No orders found.'
                ]);
            }
            
            $orders = Order::orderBy('created_at', 'desc')->get();
            
            Log::info("Retrieved {$orders->count()} orders");
            
            return response()->json([
                'success' => true,
                'data' => $orders,
                'message' => 'Orders retrieved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching orders: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve orders: ' . $e->getMessage(),
                'data' => []
            ], 500);
        }
    }

    /**
     * Display the specified order.
     */
    public function show($id): JsonResponse
    {
        try {
            Log::info("Fetching order with ID: {$id}");

            $order = Order::find($id);
            
            if (!$order) {
                Log::warning("Order not found with ID: {$id}");
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $order,
                'message' => 'Order retrieved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching order: ' . $e->getMessage());
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
            Log::info("Updating order status for ID: {$id}", $request->all());

            $request->validate([
                'status' => 'required|string|in:pending,processing,shipped,delivered,cancelled'
            ]);

            $order = Order::find($id);
            
            if (!$order) {
                Log::warning("Order not found for status update with ID: {$id}");
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            $oldStatus = $order->status;
            $order->update(['status' => $request->status]);

            Log::info("Order status updated from {$oldStatus} to {$request->status} for order ID: {$id}");

            return response()->json([
                'success' => true,
                'data' => $order,
                'message' => 'Order status updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating order status: ' . $e->getMessage());
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
            Log::info("Deleting order with ID: {$id}");

            $order = Order::find($id);
            
            if (!$order) {
                Log::warning("Order not found for deletion with ID: {$id}");
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            $order->delete();

            Log::info("Order deleted successfully with ID: {$id}");

            return response()->json([
                'success' => true,
                'message' => 'Order deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting order: ' . $e->getMessage());
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

            DB::beginTransaction();

            foreach ($samples as $sample) {
                // Ensure required fields are present
                $orderData = array_merge([
                    'status' => 'pending',
                    'payment_status' => 'paid',
                    'shipping' => 0,
                    'discount' => 0,
                ], $sample);

                $order = Order::create($orderData);
                $createdOrders[] = $order;
            }

            DB::commit();

            Log::info("Generated " . count($createdOrders) . " sample orders");

            return response()->json([
                'success' => true,
                'data' => $createdOrders,
                'message' => 'Sample orders generated successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error generating sample orders: ' . $e->getMessage());
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
            Log::info('Clearing all orders');

            // Check if orders table exists
            if (!Schema::hasTable('orders')) {
                return response()->json([
                    'success' => true,
                    'message' => 'No orders table found - nothing to clear'
                ]);
            }

            $orderCount = Order::count();
            Order::truncate();

            Log::info("Cleared {$orderCount} orders from database");

            return response()->json([
                'success' => true,
                'message' => "All {$orderCount} orders cleared successfully"
            ]);
        } catch (\Exception $e) {
            Log::error('Error clearing orders: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear orders: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search orders by various criteria.
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $query = Order::query();

            if ($request->has('order_number')) {
                $query->where('order_number', 'like', '%' . $request->order_number . '%');
            }

            if ($request->has('customer_name')) {
                $query->where('customer_name', 'like', '%' . $request->customer_name . '%');
            }

            if ($request->has('customer_email')) {
                $query->where('customer_email', 'like', '%' . $request->customer_email . '%');
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('payment_method')) {
                $query->where('payment_method', $request->payment_method);
            }

            $orders = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $orders,
                'message' => 'Orders search completed successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error searching orders: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to search orders: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get orders statistics.
     */
    public function statistics(): JsonResponse
    {
        try {
            // Check if orders table exists
            if (!Schema::hasTable('orders')) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'total_orders' => 0,
                        'total_revenue' => 0,
                        'status_counts' => [],
                        'payment_method_counts' => []
                    ],
                    'message' => 'No orders data available'
                ]);
            }

            $totalOrders = Order::count();
            $totalRevenue = Order::sum('total');
            
            $statusCounts = Order::select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->pluck('count', 'status')
                ->toArray();

            $paymentMethodCounts = Order::select('payment_method', DB::raw('count(*) as count'))
                ->groupBy('payment_method')
                ->pluck('count', 'payment_method')
                ->toArray();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_orders' => $totalOrders,
                    'total_revenue' => (float) $totalRevenue,
                    'status_counts' => $statusCounts,
                    'payment_method_counts' => $paymentMethodCounts
                ],
                'message' => 'Statistics retrieved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting order statistics: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve statistics: ' . $e->getMessage()
            ], 500);
        }
    }
}