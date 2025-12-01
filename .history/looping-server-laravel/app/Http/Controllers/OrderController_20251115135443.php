<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    /**
     * Display a listing of the orders.
     */
    public function index(): JsonResponse
    {
        try {
            $orders = Order::orderBy('created_at', 'desc')->get();
            
            return response()->json([
                'success' => true,
                'data' => $orders,
                'message' => 'Orders retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve orders: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified order.
     */
    public function show($id): JsonResponse
    {
        try {
            $order = Order::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $order,
                'message' => 'Order retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found: ' . $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the order status.
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        try {
            $request->validate([
                'status' => 'required|string|in:pending,processing,shipped,delivered,cancelled'
            ]);

            $order = Order::findOrFail($id);
            $order->update(['status' => $request->status]);

            return response()->json([
                'success' => true,
                'data' => $order,
                'message' => 'Order status updated successfully'
            ]);
        } catch (\Exception $e) {
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
            $order = Order::findOrFail($id);
            $order->delete();

            return response()->json([
                'success' => true,
                'message' => 'Order deleted successfully'
            ]);
        } catch (\Exception $e) {
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
            $samples = $request->input('samples', []);
            $createdOrders = [];

            foreach ($samples as $sample) {
                $order = Order::create($sample);
                $createdOrders[] = $order;
            }

            return response()->json([
                'success' => true,
                'data' => $createdOrders,
                'message' => 'Sample orders generated successfully'
            ]);
        } catch (\Exception $e) {
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
            Order::truncate();

            return response()->json([
                'success' => true,
                'message' => 'All orders cleared successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear orders: ' . $e->getMessage()
            ], 500);
        }
    }
}