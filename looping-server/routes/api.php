<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Basic\RegisterController;
use App\Http\Controllers\Basic\LoginController;
use App\Http\Controllers\Basic\UserController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Basic\AddressController;
use App\Http\Controllers\Basic\ProfileController;
use App\Http\Controllers\Basic\ProductController;
use App\Http\Controllers\Basic\PixPaymentController;
use App\Http\Controllers\Basic\OrderInfoController;
use App\Http\Controllers\Basic\StockController;
use App\Http\Controllers\Basic\PasswordResetController;
use App\Http\Controllers\Basic\ResendVerificationController;
use App\Http\Controllers\Basic\VerifyEmail;
use App\Http\Controllers\Basic\UploadController;
use App\Http\Controllers\Basic\WishlistController;
use App\Http\Controllers\Basic\CartController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\TestController;
use App\Http\Controllers\SimpleSearchController;
use App\Http\Controllers\DebugController;

use MongoDB\Client; 
use MongoDB\BSON\ObjectId;
use App\Models\Wishlist;

// ==============================================
// ORIGINAL ROUTES (Maintained for backward compatibility)
// ==============================================


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

// Product routes (MongoDB closures)
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

// Upload routes
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

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    // MongoDB wishlist routes
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist/toggle', [WishlistController::class, 'toggle']);
    Route::delete('/wishlist/{productId}', [WishlistController::class, 'destroy']);
    Route::get('/wishlist/check/{productId}', [WishlistController::class, 'check']);
    Route::get('/wishlist/count', [WishlistController::class, 'count']);

    // Cart routes
    Route::get('/cart', [CartController::class, 'index']);
    Route::get('/cart/debug', [CartController::class, 'debug']);
    Route::get('/cart/count', [CartController::class, 'count']);
    Route::post('/cart/add', [CartController::class, 'addToCart']);
    Route::put('/cart/{productId}', [CartController::class, 'updateQuantity']);
    Route::delete('/cart/{productId}', [CartController::class, 'removeFromCart']);
    Route::delete('/cart', [CartController::class, 'clearCart']);
});

// Search routes (using SimpleSearchController as fallback)
Route::get('/search', [SimpleSearchController::class, 'search']);
Route::get('/search/suggestions', [SimpleSearchController::class, 'suggestions']);
Route::get('/search/categories', [SimpleSearchController::class, 'categories']);

// Test routes
Route::get('/test/connection', [TestController::class, 'testConnection']);
Route::get('/test/meilisearch', [TestController::class, 'testMeilisearch']);
Route::get('/debug/database', [DebugController::class, 'testDatabase']);
Route::get('/debug/search', [DebugController::class, 'testSearchQuery']);


// Info routes
Route::get('/infos', [OrderInfoController::class, 'index']);
Route::put('/infos/{id}/status', [OrderInfoController::class, 'updateStatus']);
Route::delete('/infos/{id}', [OrderInfoController::class, 'destroy']);
Route::post('/infos', [OrderInfoController::class, 'store']);
Route::post('/infos/generate-samples', [OrderInfoController::class, 'generateSamples']);
Route::delete('/admin/infos/clear', [OrderInfoController::class, 'clearAll']);
Route::get('/infos/all', [OrderInfoController::class, 'getCustomersFromOrders']); 
Route::get('/infos/stats', [OrderInfoController::class, 'getCustomerStats']); 
Route::get('/infos/{email}', [OrderInfoController::class, 'getCustomerByEmail']);
Route::get('/infos/search/customers', [OrderInfoController::class, 'searchCustomers']);

// Stock routes
Route::put('/infos/stock/sync-order', [StockController::class, 'syncOrderStock'])->name('stock.sync-order');
Route::put('/infos/stock/reverse-order', [StockController::class, 'reverseOrderStock'])->name('stock.reverse-order');
Route::put('/infos/stock/{id}/reset-reserved', [StockController::class, 'resetReservedStock'])->name('stock.reset-reserved');
Route::put('/infos/stock/product/{productId}/update-field', [StockController::class, 'updateProductField'])->name('stock.update-field');
Route::put('/infos/stock/product/{productId}/pricing', [StockController::class, 'updateProductPricing'])->name('stock.update-pricing');
Route::put('/infos/stock/{id}/update', [StockController::class, 'updateStock'])->name('stock.update');
Route::post('/infos/stock/{id}/add-incoming', [StockController::class, 'addIncoming'])->name('stock.add-incoming');
Route::post('/infos/stock/{id}/receive-incoming', [StockController::class, 'receiveIncoming'])->name('stock.receive-incoming');
Route::get('/infos/stock/low-stock', [StockController::class, 'lowStock'])->name('stock.low-stock');
Route::get('/infos/stock/out-of-stock', [StockController::class, 'outOfStock'])->name('stock.out-of-stock');
Route::get('/infos/stock/fetch', [StockController::class, 'index'])->name('stock.fetch');
Route::post('/infos/stock/samples', [StockController::class, 'store'])->name('stock.store');
Route::delete('/infos/stock/variant/{id}', [StockController::class, 'destroy'])->name('stock.destroy-variant');
Route::delete('/infos/stock/product/{productId}', [StockController::class, 'destroyByProductId'])->name('stock.destroy-product');

// PIX routes
Route::post('/pix/generate', [PixPaymentController::class, 'generatePix']);
Route::get('/pix/status/{orderId}', [PixPaymentController::class, 'checkPaymentStatus']);
Route::post('/pix/webhook', [PixPaymentController::class, 'handleWebhook']);

// Password reset routes
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);
Route::post('/check-reset-token', [PasswordResetController::class, 'checkToken']);

// Email verification
Route::post('/email/verification-resend', function (Request $request) {
    $request->validate(['email' => 'required|email']);
    
    $user = \App\Models\User::where('email', $request->email)->first();
    
    if (!$user) {
        return response()->json(['message' => 'Usuário não encontrado.'], 404);
    }
    
    if ($user->hasVerifiedEmail()) {
        return response()->json(['message' => 'Email já verificado.'], 400);
    }
    
    $user->sendEmailVerificationNotification();
    
    return response()->json(['message' => 'Email de verificação reenviado!']);
});

// ==============================================
// BASIC ROUTES (New routes with /basic prefix)
// ==============================================

Route::prefix('basic')->group(function () {
    // Authentication routes
    Route::post('/register', [RegisterController::class, 'register']);
    Route::post('/login', [LoginController::class, 'login']);
    Route::post('/logout', [LoginController::class, 'logout']);
    
    // User routes
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
    
    // Address routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/addresses', [AddressController::class, 'index']);
        Route::post('/addresses', [AddressController::class, 'store']);
        Route::put('/addresses/{id}', [AddressController::class, 'update']);
        Route::delete('/addresses/{id}', [AddressController::class, 'destroy']);
    });
    
    // Wishlist routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/wishlist', [WishlistController::class, 'index']);
        Route::post('/wishlist/toggle', [WishlistController::class, 'toggle']);
        Route::delete('/wishlist/{productId}', [WishlistController::class, 'destroy']);
        Route::get('/wishlist/check/{productId}', [WishlistController::class, 'check']);
        Route::get('/wishlist/count', [WishlistController::class, 'count']);
    });
    
    // Cart routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/cart', [CartController::class, 'index']);
        Route::get('/cart/debug', [CartController::class, 'debug']);
        Route::get('/cart/count', [CartController::class, 'count']);
        Route::post('/cart/add', [CartController::class, 'addToCart']);
        Route::put('/cart/{productId}', [CartController::class, 'updateQuantity']);
        Route::delete('/cart/{productId}', [CartController::class, 'removeFromCart']);
        Route::delete('/cart', [CartController::class, 'clearCart']);
    });
    

    
    // Stock routes
    Route::put('/stock/sync-order', [StockController::class, 'syncOrderStock'])->name('stock.sync-order');
    Route::put('/stock/reverse-order', [StockController::class, 'reverseOrderStock'])->name('stock.reverse-order');
    Route::put('/stock/{id}/reset-reserved', [StockController::class, 'resetReservedStock'])->name('stock.reset-reserved');
    Route::put('/stock/product/{productId}/update-field', [StockController::class, 'updateProductField'])->name('stock.update-field');
    Route::put('/stock/product/{productId}/pricing', [StockController::class, 'updateProductPricing'])->name('stock.update-pricing');
    Route::put('/stock/{id}/update', [StockController::class, 'updateStock'])->name('stock.update');
    Route::post('/stock/{id}/add-incoming', [StockController::class, 'addIncoming'])->name('stock.add-incoming');
    Route::post('/stock/{id}/receive-incoming', [StockController::class, 'receiveIncoming'])->name('stock.receive-incoming');
    Route::get('/stock/low-stock', [StockController::class, 'lowStock'])->name('stock.low-stock');
    Route::get('/stock/out-of-stock', [StockController::class, 'outOfStock'])->name('stock.out-of-stock');
    Route::get('/stock/fetch', [StockController::class, 'index'])->name('stock.fetch');
    Route::post('/stock/samples', [StockController::class, 'store'])->name('stock.store');
    Route::delete('/stock/variant/{id}', [StockController::class, 'destroy'])->name('stock.destroy-variant');
    Route::delete('/stock/product/{productId}', [StockController::class, 'destroyByProductId'])->name('stock.destroy-product');
    
    // PIX routes
    Route::post('/pix/generate', [PixPaymentController::class, 'generatePix']);
    Route::get('/pix/status/{orderId}', [PixPaymentController::class, 'checkPaymentStatus']);
    Route::post('/pix/webhook', [PixPaymentController::class, 'handleWebhook']);
    
    // Password reset routes
    Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);
    Route::post('/check-reset-token', [PasswordResetController::class, 'checkToken']);
    
    // Upload routes
    Route::post('/upload', [UploadController::class, 'store']);
     
});



