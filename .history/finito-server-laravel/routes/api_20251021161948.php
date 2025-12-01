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
use App\Http\Controllers\UploadController;
use App\Http\Controllers\WishlistController;





{/*
Route::get('/test', function (Request $request) {
    return response()->json([
        'message' => 'Done!',
        'data' => $request->all(),
    ]);});


Route::get('/test-mongodb-connection', function () {
    try {
        // Test MongoDB connection specifically
        $mongo = DB::connection('mongodb');
        $mongo->getMongoClient()->listDatabases();
        
        return response()->json([
            'success' => true,
            'message' => 'MongoDB connection successful',
            'database' => config('database.connections.mongodb.database')
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'MongoDB connection failed',
            'error' => $e->getMessage()
        ], 500);
    }
});

Route::get('/test-mongo', function() {
    try {
        $client = new MongoDB\Client(env('MONGO_URI'));
        $db = $client->selectDatabase(env('MONGO_DB'));
        return response()->json(['collections' => $db->listCollections()]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

*/} 



Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return response()->json($request->user());
});


Route::middleware('auth:sanctum')->put('/user/{id}', function (Request $request, $id) {
   
    if ($request->user()->id != $id) {
        return response()->json(['error' => 'Unauthorized'], 403);
    }
  
    $request->user()->update($request->only([
        'nome',
        'email',
        'telefone',
        'cpf',
        'data_nascimento',
        'avatar',
        'receber_marketing',
    ]));

    return response()->json($request->user());
});




Route::get('/products', function () {
    try {
        $client = new MongoDB\Client(env('MONGO_URI'));
        $db = $client->selectDatabase(env('MONGO_DB'));
        $products = $db->products->find()->toArray();
        return response()->json($products);
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Failed to fetch products',
            'message' => $e->getMessage()
        ], 500);
    }
});


Route::get('/products/{id}', function ($id) {
    try {
        $client = new Client(env('MONGO_URI'));
        $db = $client->selectDatabase(env('MONGO_DB'));
        $product = $db->products->findOne(['_id' => new ObjectId($id)]);
        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }
        return response()->json($product);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});


Route::post('/products', function (Request $request) {
    try {
        $client = new Client(env('MONGO_URI'));
        $db = $client->selectDatabase(env('MONGO_DB'));

        $data = $request->only(['title', 'price', 'description', 'image', 'category']);
        $result = $db->products->insertOne($data);

        $newProduct = $db->products->findOne(['_id' => $result->getInsertedId()]);
        $newProduct['_id'] = (string) $newProduct['_id'];

        return response()->json($newProduct, 201);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});


Route::put('/products/{id}', function (Request $request, $id) {
    try {
        $client = new Client(env('MONGO_URI'));
        $db = $client->selectDatabase(env('MONGO_DB'));

        $data = $request->only(['title', 'price', 'description', 'image', 'category']);

        $result = $db->products->updateOne(
            ['_id' => new ObjectId($id)],
            ['$set' => $data]
        );

        if ($result->getModifiedCount() === 0) {
            return response()->json(['error' => 'Product not found or nothing changed'], 404);
        }

        $updatedProduct = $db->products->findOne(['_id' => new ObjectId($id)]);
        return response()->json($updatedProduct);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});


Route::delete('/products/{id}', function ($id) {
    try {
        $client = new Client(env('MONGO_URI'));
        $db = $client->selectDatabase(env('MONGO_DB'));

        $result = $db->products->deleteOne(['_id' => new ObjectId($id)]);
        if ($result->getDeletedCount() === 0) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        return response()->json(['message' => 'Product deleted successfully']);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});


Route::middleware(['auth:sanctum', 'admin'])->get('/admin/products', function () { 
    try {
        $client = new MongoDB\Client(env('MONGO_URI'));
        $db = $client->selectDatabase(env('MONGO_DB'));
        $products = $db->products->find()->toArray();
        return response()->json($products);
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Failed to fetch products',
            'message' => $e->getMessage()
        ], 500);
    }
});

Route::post('/upload', [UploadController::class, 'store']);

Route::post('/debug-upload', function (Request $request) {
    Log::info('=== DEBUG UPLOAD START ===');
    Log::info('Request method: ' . $request->method());
    Log::info('Request headers:', $request->headers->all());
    Log::info('Has file: ' . ($request->hasFile('image') ? 'YES' : 'NO'));
    Log::info('All files:', $request->allFiles());
    Log::info('All input:', $request->all());
    
    if ($request->hasFile('image')) {
        $file = $request->file('image');
        Log::info('File details:', [
            'name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
            'mime' => $file->getMimeType(),
            'extension' => $file->getClientOriginalExtension(),
        ]);
    }
    
    Log::info('=== DEBUG UPLOAD END ===');
    
    return response()->json([
        'success' => true,
        'message' => 'Debug endpoint working',
        'has_file' => $request->hasFile('image'),
        'file_count' => count($request->allFiles()),
    ]);
});


// Wishlist routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist', [WishlistController::class, 'store']);
    Route::delete('/wishlist/{productId}', [WishlistController::class, 'destroy']);
    Route::get('/wishlist/check/{productId}', [WishlistController::class, 'check']);
    Route::post('/wishlist/toggle', [WishlistController::class, 'toggle']);
});
