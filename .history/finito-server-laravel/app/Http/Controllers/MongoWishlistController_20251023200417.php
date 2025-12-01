Route::middleware('auth:sanctum')->group(function () {
    // Use the MongoDB version
    Route::get('/wishlist', [MongoWishlistController::class, 'index']);
    Route::post('/wishlist/toggle', [MongoWishlistController::class, 'toggle']);
    Route::delete('/wishlist/{productId}', [MongoWishlistController::class, 'destroy']);
    Route::get('/wishlist/debug', [MongoWishlistController::class, 'debug']);
    
    // Keep the old routes for compatibility, but they might not work
    Route::get('/wishlist/check/{productId}', [WishlistController::class, 'check']);
});