<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::all();
        return response()->json($products);
    }

public function store(Request $request)
{
    $validated = $request->validate([
        'title' => 'required|string',
        'price' => 'required|numeric',
        'image' => 'required|string',
        'category' => 'nullable|string',
        'description' => 'nullable|string',
        'favorites' => 'nullable|array',
        'cart' => 'nullable|array',
    ]);

    $product = Product::create($validated);

    return response()->json($product, 201);
}


}
