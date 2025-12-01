<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Info;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Exception;
use Illuminate\Support\Collection;

class InfoController extends Controller
{
    // ← AQUI MUDOU: Lista de cores permitidas em inglês (somente essas serão aceitas)
    private const ALLOWED_COLORS = [
        'black', 'white', 'red', 'green', 'blue', 'yellow', 'pink', 'gray',
        'orange', 'purple', 'brown', 'beige', 'gold', 'silver', 'navy',
        'maroon', 'olive', 'lime', 'teal', 'cyan', 'magenta', 'indigo',
        'violet', 'turquoise', 'lavender', 'coral', 'salmon', 'khaki',
        'dark-gray', 'light-blue', 'dark-blue', 'light-gray', 'charcoal'
    ];

    /**
     * Display a listing of the infos.
     */
    public function index(): JsonResponse
    {
        try {
            Log::info('=== INFOS INDEX START ===');

            $dbConnected = true;
            try {
                DB::connection()->getPdo();
                Log::info('Database connection: OK');
            } catch (Exception $e) {
                Log::error('Database connection failed: ' . $e->getMessage());
                $dbConnected = false;
            }

            $tableExists = $dbConnected && Schema::hasTable('infos');

            $infos = collect();

            if ($tableExists) {
                try {
                    $infos = Info::select([
                        'id', 'order_number', 'customer_name', 'customer_email', 'customer_phone',
                        'customer_cpf', 'total', 'subtotal', 'shipping', 'discount',
                        'payment_method', 'payment_status', 'status', 'shipping_street',
                        'shipping_number', 'shipping_complement', 'shipping_neighborhood',
                        'shipping_city', 'shipping_state', 'shipping_zip_code',
                        'items', 'metadata', 'created_at', 'updated_at'
                    ])->get();

                    Log::info('Fetched ' . $infos->count() . ' infos from database');
                } catch (Exception $e) {
                    Log::error('Failed to fetch infos: ' . $e->getMessage());
                    $infos = collect();
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

    public function updateStatus($id, Request $request): JsonResponse
    {
        // ... (método inalterado)
        try {
            Log::info('=== INFO STATUS UPDATE START ===', ['info_id' => $id]);

            $validated = $request->validate([
                'status' => 'required|string|in:pending,processing,shipped,delivered,cancelled',
                'payment_status' => 'required|string|in:pending,paid,failed,refunded'
            ]);

            $info = Info::find($id);
            if (!$info) {
                return response()->json([
                    'success' => false,
                    'message' => 'Info not found',
                    'debug' => ['info_id' => $id]
                ], 404);
            }

            $info->status = $validated['status'];
            $info->payment_status = $validated['payment_status'];
            $info->save();

            return response()->json([
                'success' => true,
                'message' => 'Info status updated successfully',
                'data' => [
                    'info_id' => $info->id,
                    'order_number' => $info->order_number,
                    'status' => $info->status,
                    'payment_status' => $info->payment_status
                ]
            ]);

        } catch (Exception $e) {
            Log::error('=== INFO STATUS UPDATE ERROR ===');
            return response()->json([
                'success' => false,
                'message' => 'Failed to update info status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function test(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'InfoController is working!',
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

            // ← AQUI MUDOU: Validação rígida para bloquear hex e aceitar apenas cores em inglês
            $validated = $request->validate([
                'customer_name' => 'required|string|max:255',
                'customer_email' => 'required|email',
                'customer_phone' => 'required|string',
                'customer_cpf' => 'required|string',
                'total' => 'required|numeric|min:0',
                'subtotal' => 'required|numeric|min:0',
                'shipping' => 'required|numeric|min:0',
                'discount' => 'sometimes|numeric|min:0',
                'payment_method' => 'required|string|in:pix,credit,debit,boleto',
                'payment_status' => 'required|string|in:pending,paid,failed,refunded',
                'status' => 'required|string|in:pending,processing,shipped,delivered,cancelled',
                'shipping_street' => 'required|string',
                'shipping_number' => 'required|string',
                'shipping_complement' => 'nullable|string',
                'shipping_neighborhood' => 'required|string',
                'shipping_city' => 'required|string',
                'shipping_state' => 'required|string|size:2',
                'shipping_zip_code' => 'required|string',
                'items' => 'required|array|min:1',
                'items.*.product_name' => 'required|string',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.price' => 'required|numeric|min:0',
                'items.*.total' => 'required|numeric|min:0',
                'items.*.image' => 'sometimes|string|nullable',
                'items.*.size' => 'sometimes|string|nullable',

                // ← AQUI MUDOU: Bloqueia #FF0000 e aceita apenas cores em inglês da lista
                'items.*.color' => [
                    'sometimes',
                    'string',
                    'nullable',
                    'regex:/^[a-zA-Z\s-]+$/i', // só letras, espaços e hífen
                    'in:' . implode(',', self::ALLOWED_COLORS),
                ],
            ]);

            $orderNumber = $request->order_number ?? 'ORD-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));

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
                'payment_status' => $validated['payment_status'] ?? 'pending',
                'status' => $validated['status'] ?? 'pending',
                'shipping_street' => $validated['shipping_street'],
                'shipping_number' => $validated['shipping_number'],
                'shipping_complement' => $validated['shipping_complement'] ?? null,
                'shipping_neighborhood' => $validated['shipping_neighborhood'],
                'shipping_city' => $validated['shipping_city'],
                'shipping_state' => $validated['shipping_state'],
                'shipping_zip_code' => $validated['shipping_zip_code'],
                'items' => json_encode($validated['items']),
                'metadata' => $request->metadata ? json_encode($request->metadata) : null,
            ];

            $info = Info::create($infoData);

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => [
                    'order_id' => $info->id,
                    'order_number' => $info->order_number,
                    'order' => $info
                ],
                'debug' => [
                    'timestamp' => now()->format('c'),
                    'info_id' => $info->id
                ]
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            // ← AQUI MUDOU: Mensagem amigável quando alguém tentar enviar cor em hex
            $errors = $e->errors();

            if (isset($errors['items.*.color'])) {
                $errors['items.*.color'] = [
                    'Cor inválida! Use apenas nomes em inglês como: black, white, red, blue, green, yellow, pink, etc.'
                ];
            }

            return response()->json([
                'success' => false,
                'message' => 'Validação falhou',
                'errors' => $errors,
                'debug' => ['timestamp' => now()->format('c')]
            ], 422);

        } catch (Exception $e) {
            Log::error('=== INFO STORE ERROR ===', [
                'error' => $e->getMessage(),
                'file' => $e->getFile() . ':' . $e->getLine(),
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create order',
                'error' => $e->getMessage(),
                'debug' => ['timestamp' => now()->format('c')]
            ], 500);
        }
    }

    // Os métodos abaixo permanecem 100% inalterados
    public function generateSamples(): JsonResponse { /* ... */ }
    public function getCustomersFromInfos(): JsonResponse { /* ... */ }
    public function getCustomerStats(): JsonResponse { /* ... */ }
    public function getCustomerByEmail($email): JsonResponse { /* ... */ }
    public function searchCustomers(Request $request): JsonResponse { /* ... */ }
}