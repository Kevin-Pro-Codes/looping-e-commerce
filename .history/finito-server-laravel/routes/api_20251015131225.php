<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\DB;
use MongoDB\Client; 
use MongoDB\BSON\ObjectId;


{/*
Route::get('/test', function (Request $request) {
    return response()->json([
        'message' => 'Done!',
        'data' => $request->all(),
    ]);});
*/} 


Route::post('/google-auth', [GoogleAuthController::class, 'handleGoogleCallback']);




/*

// ✅ All CRUD routes for products using MongoDB
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::post('/products', [ProductController::class, 'store']);
Route::put('/products/{id}', [ProductController::class, 'update']);
Route::delete('/products/{id}', [ProductController::class, 'destroy']);

*/


/*
Route::get('/products', function () {
    try {
        $mongo = DB::connection('mongodb');
        $products = $mongo->collection('products')->get();
        return response()->json($products);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});


Route::get('/products/{id}', function ($id) {
    try {
        $mongo = DB::connection('mongodb');
        $product = $mongo->collection('products')->find($id);
        if (!$product) return response()->json(['message' => 'Product not found'], 404);
        return response()->json($product);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});


Route::post('/products', function (Request $request) {
    try {
        $mongo = DB::connection('mongodb');
        $id = $mongo->collection('products')->insertGetId([
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'stock' => $request->stock,
        ]);
        return response()->json(['_id' => $id], 201);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});


Route::put('/products/{id}', function (Request $request, $id) {
    try {
        $mongo = DB::connection('mongodb');
        $updated = $mongo->collection('products')
            ->where('_id', new MongoDB\BSON\ObjectId($id))
            ->update($request->only(['name', 'description', 'price', 'stock']));
        return response()->json(['updated' => $updated]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});


Route::delete('/products/{id}', function ($id) {
    try {
        $mongo = DB::connection('mongodb');
        $deleted = $mongo->collection('products')
            ->where('_id', new MongoDB\BSON\ObjectId($id))
            ->delete();
        return response()->json(['deleted' => $deleted]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

*/