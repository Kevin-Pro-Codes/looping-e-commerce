<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use App\Services\ProductService;

class ProductController extends Controller
{
    protected $products;

    public function __construct(ProductService $products)
    {
        $this->products = $products;
    }

    public function index()
    {
        try {
            $data = $this->products->all();
            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}