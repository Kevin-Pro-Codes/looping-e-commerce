/**
 * Get user's wishlist with product details - FIXED VERSION
 */
public function index()
{
    try {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Get wishlist items with manual product loading
        $wishlistItems = Wishlist::where('user_id', $user->id)->get();
        
        // Manually load product data for each item
        $wishlistWithProducts = $wishlistItems->map(function ($item) {
            // Get product from MongoDB
            $product = Product::where('_id', $item->product_id)->first();
            
            $productData = $product ? [
                'id' => $product->_id,
                'title' => $product->title,
                'price' => $product->price,
                'description' => $product->description,
                'image' => $product->image,
                'category' => $product->category,
            ] : [
                'id' => $item->product_id,
                'title' => 'Product Not Found',
                'price' => 0,
                'description' => 'This product may have been removed',
                'image' => null,
                'category' => 'Unknown'
            ];

            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product' => $productData
            ];
        });

        \Log::info("Wishlist loaded successfully", [
            'user_id' => $user->id,
            'items_count' => $wishlistWithProducts->count()
        ]);

        return response()->json([
            'wishlist' => $wishlistWithProducts,
            'count' => $wishlistWithProducts->count()
        ]);

    } catch (\Exception $e) {
        Log::error('Wishlist index error:', ['error' => $e->getMessage()]);
        return response()->json([
            'error' => 'Failed to fetch wishlist',
            'message' => $e->getMessage()
        ], 500);
    }
}