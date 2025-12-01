<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Services\MongoDatabaseService;
use MongoDB\BSON\ObjectId;

class CartController extends Controller
{
    protected $mongo;

    public function __construct(MongoDatabaseService $mongo)
    {
        $this->mongo = $mongo;
    }

    /**
     * Get user's cart with product details
     */
    public function index()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                Log::warning('Unauthorized cart access attempt');
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            Log::info('Fetching cart for user:', ['user_id' => $user->id]);

            // Check if MongoDB service is properly initialized
            if (!$this->mongo || !method_exists($this->mongo, 'isConnected')) {
                Log::error('MongoDB service not properly initialized');
                return response()->json([
                    'error' => 'Database service not available',
                    'success' => false
                ], 500);
            }

            // Check MongoDB connection
            if (!$this->mongo->isConnected()) {
                Log::error('MongoDB not connected');
                return response()->json([
                    'error' => 'Database connection failed',
                    'success' => false
                ], 500);
            }

            $cartCollection = $this->mongo->getCartCollection();
            $productsCollection = $this->mongo->getProductsCollection();

            // Find cart items for user
            $cartItems = $cartCollection->find(['user_id' => (string)$user->id]);
            
            $cartWithProducts = [];
            $total = 0;
            
            foreach ($cartItems as $item) {
                try {
                    // Convert BSON document to array
                    $itemArray = json_decode(json_encode($item), true);
                    
                    // Handle product_id - it might be stored as ObjectId or string
                    $productId = $itemArray['product_id'];
                    
                    // If product_id is an array (BSON ObjectId), convert to string
                    if (is_array($productId) && isset($productId['$oid'])) {
                        $productId = $productId['$oid'];
                    }
                    
                    Log::info('Processing cart item:', [
                        'item_id' => $itemArray['_id']['$oid'] ?? $itemArray['_id'],
                        'product_id' => $productId,
                        'quantity' => $itemArray['quantity']
                    ]);

                    // Find product - handle both ObjectId and string formats
                    $product = null;
                    if (!empty($productId)) {
                        try {
                            // Try to find product by ObjectId
                            $product = $productsCollection->findOne(['_id' => new ObjectId($productId)]);
                            
                            if (!$product) {
                                // If not found, try as string
                                $product = $productsCollection->findOne(['_id' => $productId]);
                            }
                        } catch (\Exception $e) {
                            Log::warning('Error finding product:', [
                                'product_id' => $productId,
                                'error' => $e->getMessage()
                            ]);
                        }
                    }

                    // Convert product to array if found
                    $productArray = null;
                    if ($product) {
                        $productArray = json_decode(json_encode($product), true);
                        
                        // Ensure _id is converted to string
                        if (isset($productArray['_id']) && is_array($productArray['_id']) && isset($productArray['_id']['$oid'])) {
                            $productArray['id'] = $productArray['_id']['$oid'];
                        } else {
                            $productArray['id'] = (string)$productArray['_id'];
                        }
                        
                        // Ensure consistent field names
                        $productArray['name'] = $productArray['name'] ?? $productArray['title'] ?? 'Produto sem nome';
                        $productArray['price'] = floatval($productArray['price'] ?? 0);
                        $productArray['image'] = $productArray['image'] ?? $productArray['image_url'] ?? null;
                        $productArray['description'] = $productArray['description'] ?? 'Descrição não disponível';
                        $productArray['category'] = $productArray['category'] ?? 'Geral';
                        
                        // Calculate item total
                        $itemTotal = $productArray['price'] * $itemArray['quantity'];
                        $total += $itemTotal;
                    }

                    // Build the cart item with proper structure
                    $cartItem = [
                        'id' => $itemArray['_id']['$oid'] ?? (string)$itemArray['_id'],
                        'product_id' => $productId,
                        'user_id' => $itemArray['user_id'],
                        'quantity' => intval($itemArray['quantity']),
                        'created_at' => $itemArray['created_at'] ?? null,
                        'updated_at' => $itemArray['updated_at'] ?? null,
                        'product' => $productArray
                    ];

                    $cartWithProducts[] = $cartItem;
                    
                    Log::debug('Processed cart item:', $cartItem);

                } catch (\Exception $itemError) {
                    Log::error('Error processing cart item:', [
                        'item' => $item,
                        'error' => $itemError->getMessage()
                    ]);
                    continue; // Skip this item but continue with others
                }
            }

            Log::info('Successfully processed cart items:', [
                'count' => count($cartWithProducts),
                'total' => $total
            ]);

            return response()->json([
                'cart' => $cartWithProducts,
                'count' => count($cartWithProducts),
                'total' => $total,
                'success' => true
            ]);

        } catch (\Exception $e) {
            Log::error('Cart index error:', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Failed to fetch cart: ' . $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    // ... rest of your CartController methods remain the same
}