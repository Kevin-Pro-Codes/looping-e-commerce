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


//Route::post('/google-auth', [GoogleAuthController::class, 'handleGoogleCallback']);


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

/*
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [ProfileController::class, 'show']);   // get current user's profile
    Route::put('/profile', [ProfileController::class, 'update']); // update current user's profile

    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::put('/addresses/{address}', [AddressController::class, 'update']);
    Route::delete('/addresses/{address}', [AddressController::class, 'destroy']);
       
});
*/

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




Route::get('/products', function () {
    try {
        $client = new MongoDB\Client(env('MONGO_URI'));
        $db = $client->selectDatabase(env('MONGO_DB'));
        $products = $db->products->find()->toArray();
        return response()->json($products);
    } catch (\Exception $e) {
        dd($e->getMessage(), $e->getTraceAsString()); 
    }
});



// Get single product by ID
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

// Create a new product
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

// Update a product
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

// Delete a product
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