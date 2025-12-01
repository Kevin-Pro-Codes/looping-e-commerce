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



Route::middleware('auth:sanctum')->group(function () {
    // Wishlist routes
    Route::get('/wishlist', [MongoWishlistController::class, 'index']);
    Route::post('/wishlist/toggle', [MongoWishlistController::class, 'toggle']);
    Route::delete('/wishlist/{productId}', [MongoWishlistController::class, 'destroy']);
    Route::get('/wishlist/check/{productId}', [MongoWishlistController::class, 'check']);
    Route::get('/wishlist/count', [MongoWishlistController::class, 'count']);
    Route::get('/wishlist/debug', [MongoWishlistController::class, 'debug']);
    Route::get('/wishlist/health', [MongoWishlistController::class, 'health']);
    Route::post('/wishlist/create-indexes', [MongoWishlistController::class, 'createIndexes']);
});

{/*

Route::middleware('auth:sanctum')->group(function () {
    // Wishlist routes
    Route::get('/wishlist', [MongoWishlistController::class, 'index']);
    Route::post('/wishlist/toggle', [MongoWishlistController::class, 'toggle']);
    Route::delete('/wishlist/{productId}', [MongoWishlistController::class, 'destroy']);
    Route::get('/wishlist/check/{productId}', [MongoWishlistController::class, 'check']);
    Route::get('/wishlist/count', [MongoWishlistController::class, 'count']);
    Route::get('/wishlist/debug', [MongoWishlistController::class, 'debug']);
    Route::get('/wishlist/health', [MongoWishlistController::class, 'health']);
    Route::post('/wishlist/create-indexes', [MongoWishlistController::class, 'createIndexes']);
});

<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Models\MongoWishlist;

// ... your other routes ...

Route::middleware('auth:sanctum')->group(function () {
    // ✅ FIXED: Wishlist routes using closures instead of controller
    Route::get('/wishlist', function() {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $mongoWishlist = new MongoWishlist();
            $wishlistItems = $mongoWishlist->getUserWishlist($user->id);

            \Log::info("MongoDB Wishlist fetched:", [
                'user_id' => $user->id,
                'count' => count($wishlistItems)
            ]);

            return response()->json([
                'wishlist' => $wishlistItems,
                'count' => count($wishlistItems)
            ]);

        } catch (\Exception $e) {
            \Log::error('Wishlist fetch error:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to fetch wishlist',
                'message' => $e->getMessage()
            ], 500);
        }
    });

    Route::post('/wishlist/toggle', function(Request $request) {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $request->validate([
                'product_id' => 'required|string'
            ]);

            $mongoWishlist = new MongoWishlist();
            $result = $mongoWishlist->toggleWishlist($user->id, $request->product_id);

            if (isset($result['error'])) {
                return response()->json(['error' => $result['error']], 400);
            }

            \Log::info("Wishlist toggled:", [
                'user_id' => $user->id,
                'product_id' => $request->product_id,
                'action' => $result['action']
            ]);

            return response()->json([
                'message' => 'Product ' . $result['action'] . ' from wishlist',
                'action' => $result['action'],
                'product_id' => $result['product_id'],
                'in_wishlist' => $result['in_wishlist']
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Wishlist toggle error:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to toggle wishlist',
                'message' => $e->getMessage()
            ], 500);
        }
    });

    Route::delete('/wishlist/{productId}', function($productId) {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $mongoWishlist = new MongoWishlist();
            $result = $mongoWishlist->removeFromWishlist($user->id, $productId);

            if (isset($result['error'])) {
                return response()->json(['error' => $result['error']], 404);
            }

            return response()->json([
                'message' => 'Product removed from wishlist',
                'product_id' => $productId
            ]);

        } catch (\Exception $e) {
            \Log::error('Wishlist remove error:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to remove product from wishlist',
                'message' => $e->getMessage()
            ], 500);
        }
    });

    Route::get('/wishlist/check/{productId}', function($productId) {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $mongoWishlist = new MongoWishlist();
            $isInWishlist = $mongoWishlist->isProductInWishlist($user->id, $productId);

            return response()->json([
                'product_id' => $productId,
                'in_wishlist' => $isInWishlist
            ]);

        } catch (\Exception $e) {
            \Log::error('Wishlist check error:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to check wishlist status',
                'message' => $e->getMessage()
            ], 500);
        }
    });

    Route::get('/wishlist/count', function() {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $mongoWishlist = new MongoWishlist();
            $count = $mongoWishlist->getWishlistCount($user->id);

            return response()->json([
                'count' => $count
            ]);

        } catch (\Exception $e) {
            \Log::error('Wishlist count error:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to get wishlist count',
                'message' => $e->getMessage()
            ], 500);
        }
    });

    // Optional debug routes
    Route::get('/wishlist/debug', function() {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $mongoWishlist = new MongoWishlist();
            $wishlistItems = $mongoWishlist->getUserWishlist($user->id);
            $count = $mongoWishlist->getWishlistCount($user->id);

            // Test MongoDB connection
            $client = new \MongoDB\Client(env('MONGODB_URI', 'mongodb://localhost:27017'));
            $database = env('MONGODB_DATABASE', 'finito');
            
            $collections = $client->$database->listCollections();
            $collectionNames = [];
            foreach ($collections as $collection) {
                $collectionNames[] = $collection->getName();
            }

            // Get wishlist stats
            $stats = $mongoWishlist->getStats($user->id);

            return response()->json([
                'user_id' => $user->id,
                'mongodb_connection' => 'success',
                'database' => $database,
                'collections' => $collectionNames,
                'wishlist_count' => $count,
                'wishlist_stats' => $stats,
                'wishlist_items_sample' => array_slice($wishlistItems, 0, 3),
                'items_with_products' => count(array_filter($wishlistItems, function($item) {
                    return !is_null($item['product']);
                }))
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'mongodb_connection' => 'failed'
            ], 500);
        }
    });

    Route::get('/wishlist/health', function() {
        try {
            $client = new \MongoDB\Client(env('MONGODB_URI', 'mongodb://localhost:27017'));
            $database = env('MONGODB_DATABASE', 'finito');
            
            // Try to list databases to test connection
            $client->listDatabases();
            
            // Test wishlist collection access
            $mongoWishlist = new MongoWishlist();
            $wishlistStats = $mongoWishlist->getStats();
            
            return response()->json([
                'status' => 'healthy',
                'mongodb' => 'connected',
                'database' => $database,
                'wishlist_stats' => $wishlistStats,
                'timestamp' => now()->toISOString()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'unhealthy',
                'mongodb' => 'disconnected',
                'error' => $e->getMessage(),
                'timestamp' => now()->toISOString()
            ], 500);
        }
    });
});

/*}
    




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