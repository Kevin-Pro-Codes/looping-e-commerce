<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Exception;
use Illuminate\Support\Collection;

class OrderController extends Controller
{
    /**
     * Display a listing of the infos.
     */
    public function index(): JsonResponse
    {
        try {
            Log::info('=== INFOS INDEX START ===');

            // Test database connection
            $dbConnected = true;
            try {
                DB::connection()->getPdo();
                Log::info('Database connection: OK');
            } catch (Exception $e) {
                Log::error('Database connection failed: ' . $e->getMessage());
                $dbConnected = false;
            }

            $tableExists = $dbConnected && Schema::hasTable('infos');
            if ($tableExists) {
                Log::info('Infos table exists: YES');
            } else {
                Log::info('Infos table exists: NO');
            }

            // Always use a Collection → safe ->count()
            $infos = collect();

            if ($tableExists) {
                try {
                    $infos = Order::select([
                        'id',
                        'order_number',
                        'customer_name',
                        'customer_email',
                        'customer_phone',
                        'customer_cpf',
                        'total',
                        'subtotal',
                        'shipping',
                        'discount',
                        'payment_method',
                        'payment_status',
                        'status',
                        'shipping_street',
                        'shipping_number',
                        'shipping_complement',
                        'shipping_neighborhood',
                        'shipping_city',
                        'shipping_state',
                        'shipping_zip_code',
                        'items',
                        'pix_data',
                        'metadata',
                        'created_at',
                        'updated_at'
                    ])->get();

                    Log::info('Fetched ' . $infos->count() . ' infos from database');
                    
                    // Log sample of items structure for debugging
                    if ($infos->count() > 0) {
                        $sampleOrder = $infos->first();
                        Log::info('Sample order items structure:', [
                            'order_id' => $sampleOrder->id,
                            'items_count' => count($sampleOrder->items ?? []),
                            'first_item' => $sampleOrder->items[0] ?? null
                        ]);
                    }
                } catch (Exception $e) {
                    Log::error('Failed to fetch infos: ' . $e->getMessage());
                    $infos = collect(); // Keep as Collection even on error
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Infos fetched successfully',
                'data' => $infos,
                'debug' => [
                    'server' => 'running',
                    'database_connected' => $dbConnected,
                    'infos_table_exists' => $tableExists,
                    'total_infos' => $infos->count(),
                    'timestamp' => now()->format('c')
                ]
            ]);

        } catch (Exception $e) {
            Log::error('=== INFOS INDEX ERROR ===');
            Log::error('Error: ' . $e->getMessage());
            Log::error('File: ' . $e->getFile() . ':' . $e->getLine());

            return response()->json([
                'success' => false,
                'message' => 'Server error occurred',
                'error' => 'Check Laravel logs for details',
                'debug' => [
                    'exception' => get_class($e),
                    'message' => $e->getMessage(),
                    'timestamp' => now()->format('c')
                ]
            ], 500);
        }
    }

    /**
     * Update info status and payment status
     * PUT /api/infos/{id}/status
     */
    public function updateStatus($id, Request $request): JsonResponse
    {
        try {
            Log::info('=== INFO STATUS UPDATE START ===', ['info_id' => $id]);

            // Validate input
            $validated = $request->validate([
                'status' => 'required|string|in:pending,processing,shipped,delivered,cancelled',
                'payment_status' => 'required|string|in:pending,paid,failed,refunded'
            ]);

            // Find info
            $info = Order::find($id);
            if (!$info) {
                return response()->json([
                    'success' => false,
                    'message' => 'Info not found',
                    'debug' => ['info_id' => $id]
                ], 404);
            }

            // Update fields
            $info->status = $validated['status'];
            $info->payment_status = $validated['payment_status'];
            $info->save();

            Log::info('Info status updated successfully', [
                'info_id' => $info->id,
                'status' => $info->status,
                'payment_status' => $info->payment_status
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Info status updated successfully',
                'data' => [
                    'info_id' => $info->id,
                    'order_number' => $info->order_number,
                    'status' => $info->status,
                    'payment_status' => $info->payment_status
                ],
                'debug' => [
                    'timestamp' => now()->format('c')
                ]
            ]);

        } catch (Exception $e) {
            Log::error('=== INFO STATUS UPDATE ERROR ===');
            Log::error('Error: ' . $e->getMessage());
            Log::error('File: ' . $e->getFile() . ':' . $e->getLine());
            Log::error('Request data: ', $request->all());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update info status',
                'error' => $e->getMessage(),
                'debug' => [
                    'exception' => get_class($e),
                    'message' => $e->getMessage(),
                    'timestamp' => now()->format('c')
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
            'timestamp' => now()->format('c'),
            'status' => 'OK'
        ]);
    }

    /**
     * Store a newly created info (POST /api/infos)
     */
    public function store(Request $request): JsonResponse
    {
        try {
            Log::info('=== INFO STORE START ===');
            Log::info('Info data received:', $request->all());

            // Validate required fields
            $validated = $request->validate([
                'customer_name' => 'required|string|max:255',
                'customer_email' => 'required|email',
                'customer_phone' => 'required|string',
                'customer_cpf' => 'required|string',
                'total' => 'required|numeric',
                'subtotal' => 'required|numeric',
                'shipping' => 'required|numeric',
                'discount' => 'numeric',
                'payment_method' => 'required|string',
                'payment_status' => 'required|string',
                'status' => 'required|string',
                'shipping_street' => 'required|string',
                'shipping_number' => 'required|string',
                'shipping_complement' => 'nullable|string',
                'shipping_neighborhood' => 'required|string',
                'shipping_city' => 'required|string',
                'shipping_state' => 'required|string',
                'shipping_zip_code' => 'required|string',
                'items' => 'required|array',
            ]);

            // Generate order number if not provided
            $orderNumber = $request->order_number ?? 'ORD-' . strtoupper(substr(uniqid(), -6));

            // Process items to ensure color and size are properly formatted
            $processedItems = $this->processOrderItems($validated['items']);

            // Create the info
            $infoData = [
                'order_number' => $orderNumber,
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'],
                'customer_phone' => $validated['customer_phone'],
                'customer_cpf' => $validated['customer_cpf'],
                'total' => $validated['total'],
                'subtotal' => $validated['subtotal'],
                'shipping' => $validated['shipping'],
                'discount' => $validated['discount'] ?? 0,
                'payment_method' => $validated['payment_method'],
                'payment_status' => $validated['payment_status'],
                'status' => $validated['status'],
                'shipping_street' => $validated['shipping_street'],
                'shipping_number' => $validated['shipping_number'],
                'shipping_complement' => $validated['shipping_complement'] ?? null,
                'shipping_neighborhood' => $validated['shipping_neighborhood'],
                'shipping_city' => $validated['shipping_city'],
                'shipping_state' => $validated['shipping_state'],
                'shipping_zip_code' => $validated['shipping_zip_code'],
                'items' => $processedItems, // Use processed items with proper color/size format
                'pix_data' => $request->pix_data ? json_encode($request->pix_data) : null,
                'metadata' => $request->metadata ? json_encode($request->metadata) : null,
            ];

            $info = Order::create($infoData);

            Log::info('Info created successfully:', [
                'info_id' => $info->id, 
                'order_number' => $info->order_number,
                'items_count' => count($processedItems),
                'first_item_sample' => $processedItems[0] ?? null
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Info created successfully',
                'data' => [
                    'info_id' => $info->id,
                    'order_number' => $info->order_number,
                    'info' => $info
                ],
                'debug' => [
                    'timestamp' => now()->format('c'),
                    'info_id' => $info->id,
                    'items_processed' => count($processedItems)
                ]
            ], 201);

        } catch (Exception $e) {
            Log::error('=== INFO STORE ERROR ===');
            Log::error('Error: ' . $e->getMessage());
            Log::error('File: ' . $e->getFile() . ':' . $e->getLine());
            Log::error('Request data: ', $request->all());

            return response()->json([
                'success' => false,
                'message' => 'Failed to create info',
                'error' => $e->getMessage(),
                'debug' => [
                    'exception' => get_class($e),
                    'message' => $e->getMessage(),
                    'timestamp' => now()->format('c')
                ]
            ], 500);
        }
    }

    /**
     * Process order items to ensure consistent color and size format
     */
    private function processOrderItems(array $items): array
    {
        return array_map(function ($item) {
            return [
                'product_id' => $item['product_id'] ?? $item['id'] ?? null,
                'product_name' => $item['product_name'] ?? $item['name'] ?? $item['title'] ?? 'Produto',
                'quantity' => intval($item['quantity'] ?? 1),
                'price' => floatval($item['price'] ?? 0),
                'total' => floatval($item['total'] ?? ($item['price'] ?? 0) * ($item['quantity'] ?? 1)),
                'image' => $item['image'] ?? $item['product_image'] ?? $item['image_url'] ?? null,
                
                // Consolidated color field
                'color' => $this->extractColor($item),
                
                // Consolidated size field  
                'size' => $this->extractSize($item),
                
                // Additional fields
                'category' => $item['category'] ?? $item['product_category'] ?? null,
                'description' => $item['description'] ?? $item['product_description'] ?? null,
                'sku' => $item['sku'] ?? $item['product_sku'] ?? null,
                
                // Store original structure for reference
                'original_data' => $item
            ];
        }, $items);
    }

    /**
     * Extract color from item data using multiple possible field names
     */
    private function extractColor(array $item): string
    {
        $color = 
            $item['color'] ?? 
            $item['selectedColor'] ?? 
            $item['cor'] ?? 
            $item['variant_color'] ??
            $item['product_variant']['color'] ?? 
            $item['variant']['color'] ?? 
            $item['product']['color'] ?? 
            ($item['options']['color'] ?? $item['options']['cor'] ?? null) ??
            $item['attributes']['color'] ?? 
            $item['metadata']['color'] ?? 
            'Não especificada';

        return $this->normalizeColor($color);
    }

    /**
     * Extract size from item data using multiple possible field names
     */
    private function extractSize(array $item): string
    {
        $size = 
            $item['size'] ?? 
            $item['selectedSize'] ?? 
            $item['tamanho'] ?? 
            $item['variant_size'] ??
            $item['product_variant']['size'] ?? 
            $item['variant']['size'] ?? 
            $item['product']['size'] ?? 
            ($item['options']['size'] ?? $item['options']['tamanho'] ?? null) ??
            $item['attributes']['size'] ?? 
            $item['metadata']['size'] ?? 
            'Não especificado';

        return $this->normalizeSize($size);
    }

    /**
     * Normalize color value for consistency
     */
    private function normalizeColor(string $color): string
    {
        $color = trim($color);
        
        if (empty($color) || $color === 'undefined' || $color === 'null') {
            return 'Não especificada';
        }

        // Color mapping for consistency
        $colorMap = [
            '#000000' => 'Preto',
            '#000' => 'Preto',
            'black' => 'Preto',
            '#FFFFFF' => 'Branco', 
            '#fff' => 'Branco',
            'white' => 'Branco',
            '#1E90FF' => 'Azul',
            'blue' => 'Azul',
            '#FF69B4' => 'Rosa',
            'pink' => 'Rosa',
            '#FF0000' => 'Vermelho',
            'red' => 'Vermelho',
            '#00FF00' => 'Verde', 
            'green' => 'Verde',
            '#FFFF00' => 'Amarelo',
            'yellow' => 'Amarelo',
            '#FFA500' => 'Laranja',
            'orange' => 'Laranja',
            '#800080' => 'Roxo',
            'purple' => 'Roxo',
            '#808080' => 'Cinza',
            'gray' => 'Cinza',
            'grey' => 'Cinza'
        ];

        $normalizedColor = strtolower($color);
        return $colorMap[$color] ?? $colorMap[$normalizedColor] ?? $color;
    }

    /**
     * Normalize size value for consistency
     */
    private function normalizeSize(string $size): string
    {
        $size = trim($size);
        
        if (empty($size) || $size === 'undefined' || $size === 'null') {
            return 'Não especificado';
        }

        // Common size normalizations
        $sizeMap = [
            'p' => 'P',
            'm' => 'M', 
            'g' => 'G',
            'gg' => 'GG',
            'xg' => 'XG',
            'pp' => 'PP',
            'small' => 'P',
            'medium' => 'M',
            'large' => 'G',
            'x-large' => 'XG'
        ];

        $normalizedSize = strtolower($size);
        return $sizeMap[$size] ?? $sizeMap[$normalizedSize] ?? $size;
    }

    /**
     * Generate sample infos and save to database.
     */
    public function generateSamples(): JsonResponse
    {
        try {
            if (!Schema::hasTable('infos')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Infos table does not exist. Run migrations first.',
                    'debug' => ['table_missing' => true]
                ], 500);
            }

            $sampleInfos = [
                [
                    'order_number' => 'ORD-' . strtoupper(substr(uniqid(), -6)),
                    'customer_name' => 'João Silva',
                    'customer_email' => 'joao@example.com',
                    'customer_phone' => '(11) 98765-4321',
                    'customer_cpf' => '123.456.789-00',
                    'total' => 159.90,
                    'subtotal' => 149.90,
                    'shipping' => 10.00,
                    'discount' => 0.00,
                    'payment_method' => 'pix',
                    'payment_status' => 'paid',
                    'status' => 'processing',
                    'shipping_street' => 'Rua das Flores',
                    'shipping_number' => '123',
                    'shipping_complement' => 'Apto 45',
                    'shipping_neighborhood' => 'Jardim Primavera',
                    'shipping_city' => 'São Paulo',
                    'shipping_state' => 'SP',
                    'shipping_zip_code' => '01234-567',
                    'items' => [
                        [
                            'product_id' => '1',
                            'product_name' => 'Camiseta Premium',
                            'quantity' => 1,
                            'price' => 79.90,
                            'total' => 79.90,
                            'color' => 'Preto',
                            'size' => 'M',
                            'image' => '/images/camiseta-preta.jpg'
                        ],
                        [
                            'product_id' => '2', 
                            'product_name' => 'Caneca Personalizada',
                            'quantity' => 1,
                            'price' => 70.00,
                            'total' => 70.00,
                            'color' => 'Branco',
                            'size' => 'Único',
                            'image' => '/images/caneca-branca.jpg'
                        ]
                    ],
                    'pix_data' => ['txid' => 'PIX123456789', 'qr_code' => '000201...'],
                    'metadata' => ['source' => 'sample_generator']
                ],
                [
                    'order_number' => 'ORD-' . strtoupper(substr(uniqid(), -6)),
                    'customer_name' => 'Maria Oliveira',
                    'customer_email' => 'maria@example.com',
                    'customer_phone' => '(11) 91234-5678',
                    'customer_cpf' => '987.654.321-00',
                    'total' => 89.90,
                    'subtotal' => 89.90,
                    'shipping' => 0.00,
                    'discount' => 10.00,
                    'payment_method' => 'credit_card',
                    'payment_status' => 'paid',
                    'status' => 'shipped',
                    'shipping_street' => 'Avenida Principal',
                    'shipping_number' => '456',
                    'shipping_neighborhood' => 'Centro',
                    'shipping_city' => 'Rio de Janeiro',
                    'shipping_state' => 'RJ',
                    'shipping_zip_code' => '20000-000',
                    'items' => [
                        [
                            'product_id' => '3',
                            'product_name' => 'Livro Laravel Avançado',
                            'quantity' => 1,
                            'price' => 89.90,
                            'total' => 89.90,
                            'color' => 'Azul',
                            'size' => 'Único',
                            'image' => '/images/livro-azul.jpg'
                        ]
                    ],
                    'metadata' => ['source' => 'sample_generator']
                ]
            ];

            $created = [];
            foreach ($sampleInfos as $data) {
                try {
                    $info = Order::create($data);
                    $created[] = $info->refresh();
                    
                    Log::info('Sample order created:', [
                        'order_id' => $info->id,
                        'order_number' => $info->order_number,
                        'items_count' => count($info->items)
                    ]);
                } catch (Exception $e) {
                    Log::warning('Failed to create sample info: ' . $e->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Sample infos generated and saved to database',
                'data' => $created,
                'debug' => [
                    'sample_count' => count($created),
                    'timestamp' => now()->format('c')
                ]
            ]);

        } catch (Exception $e) {
            Log::error('Generate samples error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate samples',
                'error' => $e->getMessage(),
                'debug' => ['timestamp' => now()->format('c')]
            ], 500);
        }
    }

    /**
     * Get customers from infos table
     */
    public function getCustomersFromInfos(): JsonResponse
    {
        try {
            Log::info('=== GET CUSTOMERS FROM INFOS START ===');

            if (!Schema::hasTable('infos')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Infos table does not exist',
                    'debug' => ['table_missing' => true]
                ], 500);
            }

            $customers = DB::table('infos')
                ->select([
                    'customer_email as email',
                    'customer_name as name',
                    'customer_phone as phone',
                    'customer_cpf as cpf',
                    DB::raw('COUNT(*) as orders_count'),
                    DB::raw('SUM(total) as total_spent'),
                    DB::raw('MAX(created_at) as last_purchase'),
                    DB::raw('MIN(created_at) as first_order'),
                    DB::raw('CONCAT(shipping_street, ", ", shipping_number, " - ", shipping_city, ", ", shipping_state) as address')
                ])
                ->whereNotNull('customer_email')
                ->groupBy('customer_email', 'customer_name', 'customer_phone', 'customer_cpf', 'shipping_street', 'shipping_number', 'shipping_city', 'shipping_state')
                ->get()
                ->map(function($customer) {
                    return [
                        'email' => $customer->email,
                        'name' => $customer->name,
                        'phone' => $customer->phone,
                        'cpf' => $customer->cpf,
                        'orders_count' => $customer->orders_count,
                        'total_spent' => $customer->total_spent ?: 0,
                        'last_purchase' => $customer->last_purchase,
                        'first_order' => $customer->first_order,
                        'address' => $customer->address,
                        'status' => 'active'
                    ];
                });

            Log::info('Found ' . $customers->count() . ' customers from infos');

            return response()->json([
                'success' => true,
                'message' => 'Customers fetched from infos successfully',
                'data' => $customers,
                'debug' => [
                    'total_customers' => $customers->count(),
                    'timestamp' => now()->format('c')
                ]
            ]);

        } catch (Exception $e) {
            Log::error('=== GET CUSTOMERS FROM INFOS ERROR ===');
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch customers from infos',
                'error' => $e->getMessage(),
                'debug' => ['timestamp' => now()->format('c')]
            ], 500);
        }
    }

    /**
     * Debug endpoint to check order items structure
     */
    public function debugItems($orderId): JsonResponse
    {
        try {
            $order = Order::find($orderId);
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'items_count' => count($order->items),
                'items' => $order->items,
                'raw_items' => $order->getRawOriginal('items')
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}