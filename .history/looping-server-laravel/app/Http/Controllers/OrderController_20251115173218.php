<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class OrderController extends Controller
{
    /**
     * Display a listing of the orders.
     */
    public function index(): JsonResponse
    {
        try {
            Log::info('=== ORDERS INDEX START ===');
            
            // Test basic server functionality
            Log::info('Server is running');
            
            // Test database connection
            try {
                DB::connection()->getPdo();
                Log::info('Database connection: OK');
                $dbConnected = true;
            } catch (\Exception $e) {
                Log::error('Database connection failed: ' . $e->getMessage());
                $dbConnected = false;
            }
            
            // Check if orders table exists
            $tableExists = false;
            if ($dbConnected) {
                $tableExists = Schema::hasTable('orders');
                Log::info('Orders table exists: ' . ($tableExists ? 'YES' : 'NO'));
            }
            
            // Return simple success response first
            $response = [
                'success' => true,
                'message' => 'API is working',
                'data' => [],
                'debug' => [
                    'server' => 'running',
                    'database_connected' => $dbConnected,
                    'orders_table_exists' => $tableExists,
                    'timestamp' => now()->toISOString()
                ]
            ];
            
            Log::info('=== ORDERS INDEX SUCCESS ===');
            
            return response()->json($response);
            
        } catch (\Exception $e) {
            Log::error('=== ORDERS INDEX ERROR ===');
            Log::error('Error: ' . $e->getMessage());
            Log::error('File: ' . $e->getFile());
            Log::error('Line: ' . $e->getLine());
            
            return response()->json([
                'success' => false,
                'message' => 'Server error occurred',
                'error' => 'Check Laravel logs for details',
                'debug' => [
                    'exception' => get_class($e),
                    'message' => $e->getMessage()
                ]
            ], 500);
        }
    }

    /**
     * Simple test endpoint
     */
    public function test(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'OrderController is working!',
            'timestamp' => now()->toISOString(),
            'status' => 'OK'
        ]);
    }

    /**
     * Generate sample orders for testing.
     */
    public function generateSamples(): JsonResponse
    {
        try {
            // Simple sample order
            $sampleOrder = [
                'order_number' => 'TEST-' . time(),
                'customer_name' => 'Test Customer',
                'customer_email' => 'test@example.com',
                'total' => 99.99,
                'status' => 'pending',
                'payment_method' => 'pix',
                'created_at' => now()->toISOString(),
                'updated_at' => now()->toISOString(),
            ];

            return response()->json([
                'success' => true,
                'message' => 'Sample order generated',
                'data' => [$sampleOrder],
                'debug' => [
                    'sample_count' => 1,
                    'timestamp' => now()->toISOString()
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Generate samples error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate samples',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}