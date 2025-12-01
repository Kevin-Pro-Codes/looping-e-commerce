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

    /**
     * Add product to cart or update quantity
     */
    public function addToCart(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                Log::warning('Unauthorized cart add attempt');
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $request->validate([
                'product_id' => 'required|string',
                'quantity' => 'required|integer|min:1'
            ]);

            $productId = $request->product_id;
            $quantity = $request->quantity;

            // Check MongoDB connection
            if (!$this->mongo->isConnected()) {
                Log::error('MongoDB not connected');
                return response()->json(['error' => 'Database connection failed'], 500);
            }

            $cartCollection = $this->mongo->getCartCollection();
            $productsCollection = $this->mongo->getProductsCollection();

            // Check if product exists
            $product = $productsCollection->findOne(['_id' => new ObjectId($productId)]);
            if (!$product) {
                return response()->json(['error' => 'Product not found'], 404);
            }

            // Check if item already exists in cart
            $existingItem = $cartCollection->findOne([
                'user_id' => (string)$user->id,
                'product_id' => $productId,
            ]);

            $now = new \MongoDB\BSON\UTCDateTime(now()->getTimestamp() * 1000);

            if ($existingItem) {
                // Update quantity
                $newQuantity = $existingItem['quantity'] + $quantity;
                $cartCollection->updateOne(
                    ['_id' => $existingItem['_id']],
                    [
                        '$set' => [
                            'quantity' => $newQuantity,
                            'updated_at' => $now
                        ]
                    ]
                );

                Log::info('Cart item quantity updated:', [
                    'user_id' => $user->id,
                    'product_id' => $productId,
                    'old_quantity' => $existingItem['quantity'],
                    'new_quantity' => $newQuantity
                ]);

                return response()->json([
                    'message' => 'Cart item quantity updated',
                    'product_id' => $productId,
                    'quantity' => $newQuantity,
                    'action' => 'updated'
                ]);
            } else {
                // Add new item to cart
                $insertResult = $cartCollection->insertOne([
                    'user_id' => (string)$user->id,
                    'product_id' => $productId,
                    'quantity' => $quantity,
                    'created_at' => $now,
                    'updated_at' => $now
                ]);

                Log::info('Product added to cart:', [
                    'user_id' => $user->id,
                    'product_id' => $productId,
                    'quantity' => $quantity,
                    'cart_item_id' => (string)$insertResult->getInsertedId()
                ]);

                return response()->json([
                    'message' => 'Product added to cart',
                    'product_id' => $productId,
                    'quantity' => $quantity,
                    'action' => 'added'
                ]);
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error in addToCart', ['errors' => $e->errors()]);
            return response()->json(['error' => 'Validation failed', 'messages' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Add to cart error:', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            return response()->json(['error' => 'Failed to add product to cart: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update cart item quantity
     */
    public function updateQuantity(Request $request, $productId)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $request->validate([
                'quantity' => 'required|integer|min:1'
            ]);

            $quantity = $request->quantity;

            // Check MongoDB connection
            if (!$this->mongo->isConnected()) {
                return response()->json(['error' => 'Database connection failed'], 500);
            }

            $cartCollection = $this->mongo->getCartCollection();

            // Find and update the cart item
            $result = $cartCollection->updateOne(
                [
                    'user_id' => (string)$user->id,
                    'product_id' => $productId
                ],
                [
                    '$set' => [
                        'quantity' => $quantity,
                        'updated_at' => new \MongoDB\BSON\UTCDateTime(now()->getTimestamp() * 1000)
                    ]
                ]
            );

            if ($result->getModifiedCount() === 0) {
                return response()->json(['error' => 'Cart item not found'], 404);
            }

            Log::info('Cart quantity updated:', [
                'user_id' => $user->id,
                'product_id' => $productId,
                'quantity' => $quantity
            ]);

            return response()->json([
                'message' => 'Cart quantity updated successfully',
                'product_id' => $productId,
                'quantity' => $quantity
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => 'Validation failed', 'messages' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Update cart quantity error:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to update cart quantity'], 500);
        }
    }

    /**
     * Remove product from cart
     */
    public function removeFromCart($productId)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Check MongoDB connection
            if (!$this->mongo->isConnected()) {
                return response()->json(['error' => 'Database connection failed'], 500);
            }

            $cartCollection = $this->mongo->getCartCollection();

            $result = $cartCollection->deleteOne([
                'user_id' => (string)$user->id,
                'product_id' => $productId,
            ]);

            if ($result->getDeletedCount() === 0) {
                return response()->json(['error' => 'Cart item not found'], 404);
            }

            Log::info('Product removed from cart:', [
                'user_id' => $user->id,
                'product_id' => $productId
            ]);

            return response()->json([
                'message' => 'Product removed from cart',
                'product_id' => $productId,
            ]);

        } catch (\Exception $e) {
            Log::error('Remove from cart error:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to remove product from cart'], 500);
        }
    }

    /**
     * Clear user's entire cart
     */
    public function clearCart()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Check MongoDB connection
            if (!$this->mongo->isConnected()) {
                return response()->json(['error' => 'Database connection failed'], 500);
            }

            $cartCollection = $this->mongo->getCartCollection();

            $result = $cartCollection->deleteMany([
                'user_id' => (string)$user->id,
            ]);

            Log::info('Cart cleared:', [
                'user_id' => $user->id,
                'deleted_count' => $result->getDeletedCount()
            ]);

            return response()->json([
                'message' => 'Cart cleared successfully',
                'deleted_count' => $result->getDeletedCount()
            ]);

        } catch (\Exception $e) {
            Log::error('Clear cart error:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to clear cart'], 500);
        }
    }

    /**
     * Get cart count
     */
    public function count()
    {
        try {
            $user = Auth::user();
            if (!$user) return response()->json(['error' => 'Unauthorized'], 401);

            $cartCollection = $this->mongo->getCartCollection();
            $count = $cartCollection->countDocuments(['user_id' => (string)$user->id]);

            return response()->json(['count' => $count]);
        } catch (\Exception $e) {
            Log::error('Cart count error:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to get cart count'], 500);
        }
    }

    /**
     * Debug endpoint to check raw cart data
     */
    public function debug()
    {
        try {
            $user = Auth::user();
            if (!$user) return response()->json(['error' => 'Unauthorized'], 401);

            $cartCollection = $this->mongo->getCartCollection();
            $productsCollection = $this->mongo->getProductsCollection();

            // Get raw cart items
            $cartItems = $cartCollection->find(['user_id' => (string)$user->id])->toArray();
            $rawItems = [];
            
            foreach ($cartItems as $item) {
                $rawItems[] = json_decode(json_encode($item), true);
            }

            return response()->json([
                'cart_raw' => $rawItems,
                'user_id' => $user->id,
                'mongo_connected' => $this->mongo->isConnected()
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}