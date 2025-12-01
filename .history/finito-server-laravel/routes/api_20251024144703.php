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
use App\Models\Wishlist;




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

Route::get('/test-mongodb', function() {
    try {
        // Test MongoDB connection
        $mongo = DB::connection('mongodb');
        $status = $mongo->getMongoClient()->listDatabases();
        echo "MongoDB Connection: ✅ WORKING<br>";
        
        // Test collections
        $collections = $mongo->getCollection('wishlist');
        echo "Wishlist collection: ✅ ACCESSIBLE<br>";
        
        // Test Product model
        $productCount = \App\Models\Product::count();
        echo "Products in database: " . $productCount . "<br>";
        
        // Test Wishlist model
        $wishlistCount = \App\Models\Wishlist::count();
        echo "Wishlist items: " . $wishlistCount . "<br>";
        
    } catch (\Exception $e) {
        echo "❌ MongoDB Error: " . $e->getMessage() . "<br>";
        echo "File: " . $e->getFile() . " Line: " . $e->getLine() . "<br>";
    }
});


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


Route::get('/test-auth', function () {
    $user = Auth::user();
    
    return response()->json([
        'authenticated' => Auth::check(),
        'user' => $user ? [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email
        ] : null,
        'session' => session()->all()
    ]);
});

Route::middleware('auth:sanctum')->group(function () {

    // Get all wishlist items
    Route::get('/wishlist', function () {
        try {
            $user = Auth::user();
            if (!$user) return response()->json(['error' => 'Unauthorized'], 401);

            $wishlistItems = Wishlist::where('user_id', $user->id)->get();

            return response()->json([
                'wishlist' => $wishlistItems,
                'count' => $wishlistItems->count(),
            ]);
        } catch (\Exception $e) {
            Log::error('Wishlist fetch error', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to fetch wishlist'], 500);
        }
    });

    // Toggle wishlist (add/remove)
    Route::post('/wishlist/toggle', function (Request $request) {
        try {
            $user = Auth::user();
            if (!$user) return response()->json(['error' => 'Unauthorized'], 401);

            $request->validate([
                'product_id' => 'required|string',
            ]);

            $existing = Wishlist::where('user_id', $user->id)
                ->where('product_id', $request->product_id)
                ->first();

            if ($existing) {
                $existing->delete();
                return response()->json([
                    'message' => 'Product removed from wishlist',
                    'action' => 'removed',
                    'product_id' => $request->product_id,
                    'in_wishlist' => false,
                ]);
            }

            Wishlist::create([
                'user_id' => $user->id,
                'product_id' => $request->product_id,
            ]);

            return response()->json([
                'message' => 'Product added to wishlist',
                'action' => 'added',
                'product_id' => $request->product_id,
                'in_wishlist' => true,
            ]);
        } catch (\Exception $e) {
            Log::error('Wishlist toggle error', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to toggle wishlist'], 500);
        }
    });

    // Remove a product from wishlist
    Route::delete('/wishlist/{productId}', function ($productId) {
        try {
            $user = Auth::user();
            if (!$user) return response()->json(['error' => 'Unauthorized'], 401);

            $deleted = Wishlist::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->delete();

            if (!$deleted) {
                return response()->json(['error' => 'Product not found in wishlist'], 404);
            }

            return response()->json([
                'message' => 'Product removed from wishlist',
                'product_id' => $productId,
            ]);
        } catch (\Exception $e) {
            Log::error('Wishlist remove error', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to remove from wishlist'], 500);
        }
    });

    // Check if a product is in wishlist
    Route::get('/wishlist/check/{productId}', function ($productId) {
        try {
            $user = Auth::user();
            if (!$user) return response()->json(['error' => 'Unauthorized'], 401);

            $isInWishlist = Wishlist::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->exists();

            return response()->json([
                'product_id' => $productId,
                'in_wishlist' => $isInWishlist,
            ]);
        } catch (\Exception $e) {
            Log::error('Wishlist check error', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to check wishlist'], 500);
        }
    });

    // Get wishlist count
    Route::get('/wishlist/count', function () {
        try {
            $user = Auth::user();
            if (!$user) return response()->json(['error' => 'Unauthorized'], 401);

            $count = Wishlist::where('user_id', $user->id)->count();

            return response()->json(['count' => $count]);
        } catch (\Exception $e) {
            Log::error('Wishlist count error', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to get count'], 500);
        }
    });
});








// Test MongoProduct directly
Route::middleware('auth:sanctum')->get('/debug/mongo-product/{productId?}', function($productId = null) {
    try {
        $mongoProduct = new \App\Models\MongoProduct();
        
        if ($productId) {
            $product = $mongoProduct->find($productId);
            return response()->json([
                'product' => $product,
                'product_id' => $productId
            ]);
        } else {
            // Get some product IDs from wishlist to test
            $user = Auth::user();
            $client = new \MongoDB\Client(env('MONGODB_URI', 'mongodb://localhost:27017'));
            $database = env('MONGODB_DATABASE', 'finito');
            $wishlistCollection = $client->$database->wishlists;
            
            $wishlistItems = $wishlistCollection->find(['user_id' => (int)$user->id])->toArray();
            $productIds = array_map(function($item) {
                return $item['product_id'];
            }, $wishlistItems);
            
            $products = $mongoProduct->getByIds($productIds);
            
            return response()->json([
                'product_ids_from_wishlist' => $productIds,
                'products_found' => $products
            ]);
        }
        
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// In api.php
Route::middleware('auth:sanctum')->get('/wishlist/debug-detailed', function() {
    try {
        $user = Auth::user();
        
        // Test MongoDB connection
        $client = new \MongoDB\Client(env('MONGODB_URI', 'mongodb://localhost:27017'));
        $database = env('MONGODB_DATABASE', 'finito');
        
        // Check collections
        $collections = iterator_to_array($client->$database->listCollections());
        $collectionNames = array_map(function($col) { return $col->getName(); }, $collections);
        
        // Check wishlist data
        $wishlistCollection = $client->$database->wishlists;
        $userWishlist = $wishlistCollection->find(['user_id' => (int)$user->id])->toArray();
        
        // Check products collection
        $productsCollection = $client->$database->products;
        $productCount = $productsCollection->countDocuments();
        
        return response()->json([
            'user_id' => $user->id,
            'mongodb_connected' => true,
            'database' => $database,
            'collections' => $collectionNames,
            'wishlist_items_raw' => $userWishlist,
            'wishlist_count' => count($userWishlist),
            'products_count' => $productCount,
            'env_mongodb_uri' => env('MONGODB_URI'),
            'env_mongodb_database' => env('MONGODB_DATABASE')
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

Route::post('/wishlist/debug', function(Request $request) {
    \Log::info('=== WISHLIST DEBUG START ===');
    
    // Check authentication
    $user = Auth::user();
    \Log::info('User status:', ['user' => $user ? $user->id : 'null']);
    
    // Check request data
    \Log::info('Request data:', $request->all());
    \Log::info('Headers:', $request->headers->all());
    
    // Check database connection
    try {
        \Log::info('MongoDB connection:', ['status' => 'testing']);
        $test = DB::connection('mongodb')->getMongoClient()->listDatabases();
        \Log::info('MongoDB connection successful');
    } catch (\Exception $e) {
        \Log::error('MongoDB connection failed:', ['error' => $e->getMessage()]);
    }
    
    // Check if Wishlist model works
    try {
        if ($user) {
            $count = \App\Models\Wishlist::where('user_id', $user->id)->count();
            \Log::info('Wishlist count:', ['count' => $count]);
        }
    } catch (\Exception $e) {
        \Log::error('Wishlist model error:', ['error' => $e->getMessage()]);
    }
    
    \Log::info('=== WISHLIST DEBUG END ===');
    
    return response()->json([
        'authenticated' => (bool)$user,
        'user_id' => $user ? $user->id : null,
        'message' => 'Debug completed'
    ]);
});