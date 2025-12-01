<?php

namespace App\Http\Controllers;

use App\Models\MongoProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MongoProductController extends Controller
{
    protected $mongoProduct;

    public function __construct()
    {
        $this->mongoProduct = new MongoProduct();
    }

    /**
     * List all products
     */
    public function index(Request $request)
    {
        try {
            $orderBy = $request->get('orderBy', 'created_at');
            $direction = $request->get('direction', 'desc');
            
            $products = $this->mongoProduct->getAll($orderBy, $direction);

            return response()->json($products);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch products',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new product with file upload
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'category' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:1000',
        ]);

        try {
            $product = $this->mongoProduct->create($validated);

            if (!$product) {
                return response()->json([
                    'error' => 'Failed to create product'
                ], 500);
            }

            return response()->json($product, 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to create product',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show a single product by ID
     */
    public function show($id)
    {
        try {
            $product = $this->mongoProduct->find($id);

            if (!$product) {
                return response()->json([
                    'error' => 'Product not found'
                ], 404);
            }

            return response()->json($product);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch product',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a product
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'price' => 'sometimes|required|numeric|min:0',
            'image' => 'sometimes|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'category' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:1000',
        ]);

        try {
            $product = $this->mongoProduct->update($id, $validated);

            if (!$product) {
                return response()->json([
                    'error' => 'Product not found or no changes made'
                ], 404);
            }

            return response()->json($product);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update product',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a product
     */
    public function destroy($id)
    {
        try {
            $success = $this->mongoProduct->delete($id);

            if (!$success) {
                return response()->json([
                    'error' => 'Product not found'
                ], 404);
            }

            return response()->json([
                'message' => 'Product deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete product',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search products
     */
    public function search(Request $request)
    {
        try {
            $query = $request->get('q', '');
            
            if (empty($query)) {
                return response()->json([]);
            }

            $products = $this->mongoProduct->search($query);

            return response()->json($products);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to search products',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get products by category
     */
    public function byCategory($category)
    {
        try {
            $products = $this->mongoProduct->getByCategory($category);

            return response()->json($products);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch products by category',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get product count
     */
    public function count()
    {
        try {
            $count = $this->mongoProduct->count();

            return response()->json([
                'count' => $count
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to get product count',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create indexes for products (run once)
     */
    public function createIndexes()
    {
        try {
            $result = $this->mongoProduct->createIndexes();
            
            if (isset($result['error'])) {
                return response()->json(['error' => $result['error']], 500);
            }

            return response()->json([
                'message' => 'Product indexes created successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Debug endpoint
     */
    public function debug()
    {
        try {
            $count = $this->mongoProduct->count();
            $sampleProducts = array_slice($this->mongoProduct->getAll(), 0, 3);

            return response()->json([
                'product_count' => $count,
                'sample_products' => $sampleProducts,
                'mongodb_connection' => 'success'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'mongodb_connection' => 'failed'
            ], 500);
        }
    }
}