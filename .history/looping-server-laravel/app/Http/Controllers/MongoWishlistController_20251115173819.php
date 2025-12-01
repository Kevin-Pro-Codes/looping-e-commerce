<?php

namespace App\Http\Controllers;

use App\Models\MongoWishlist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class MongoWishlistController extends Controller
{
    protected $mongoWishlist;

    public function __construct()
    {
        $this->mongoWishlist = new MongoWishlist();
    }

    /**
     * Get user's wishlist with product details
     */
    public function index()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $wishlistItems = $this->mongoWishlist->getUserWishlist($user->id);

            Log::info("MongoDB Wishlist fetched:", [
                'user_id' => $user->id,
                'count' => count($wishlistItems)
            ]);

            return response()->json([
                'wishlist' => $wishlistItems,
                'count' => count($wishlistItems)
            ]);

        } catch (\Exception $e) {
            Log::error('MongoWishlist index error:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to fetch wishlist',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle product in wishlist (add/remove)
     */
    public function toggle(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $request->validate([
                'product_id' => 'required|string'
            ]);

            $productId = $request->product_id;

            $result = $this->mongoWishlist->toggleWishlist($user->id, $productId);

            if (isset($result['error'])) {
                return response()->json(['error' => $result['error']], 400);
            }

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
            Log::error('MongoWishlist toggle error:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to toggle wishlist',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if product is in wishlist
     */
    public function check($productId)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $isInWishlist = $this->mongoWishlist->isProductInWishlist($user->id, $productId);

            return response()->json([
                'product_id' => $productId,
                'in_wishlist' => $isInWishlist
            ]);

        } catch (\Exception $e) {
            Log::error('MongoWishlist check error:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to check wishlist status',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove product from wishlist
     */
    public function destroy($productId)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $result = $this->mongoWishlist->removeFromWishlist($user->id, $productId);

            if (isset($result['error'])) {
                return response()->json(['error' => $result['error']], 404);
            }

            return response()->json([
                'message' => 'Product removed from wishlist',
                'product_id' => $productId
            ]);

        } catch (\Exception $e) {
            Log::error('MongoWishlist destroy error:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to remove product from wishlist',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get wishlist count
     */
    public function count()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $count = $this->mongoWishlist->getWishlistCount($user->id);

            return response()->json([
                'count' => $count
            ]);

        } catch (\Exception $e) {
            Log::error('MongoWishlist count error:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to get wishlist count',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create indexes (run once manually)
     */
    public function createIndexes()
    {
        try {
            $result = $this->mongoWishlist->createIndexes();
            
            if (isset($result['error'])) {
                return response()->json(['error' => $result['error']], 500);
            }

            return response()->json([
                'message' => 'MongoDB wishlist indexes created successfully!'
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Debug endpoint to check MongoDB connection and data
     */
    public function debug()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $wishlistItems = $this->mongoWishlist->getUserWishlist($user->id);
            $count = $this->mongoWishlist->getWishlistCount($user->id);

            // Test MongoDB connection
            $client = new \MongoDB\Client(env('MONGODB_URI', 'mongodb://localhost:27017'));
            $database = env('MONGODB_DATABASE', 'finito');
            
            $collections = $client->$database->listCollections();
            $collectionNames = [];
            foreach ($collections as $collection) {
                $collectionNames[] = $collection->getName();
            }

            // Get wishlist stats
            $stats = $this->mongoWishlist->getStats($user->id);

            return response()->json([
                'user_id' => $user->id,
                'mongodb_connection' => 'success',
                'database' => $database,
                'collections' => $collectionNames,
                'wishlist_count' => $count,
                'wishlist_stats' => $stats,
                'wishlist_items_sample' => array_slice($wishlistItems, 0, 3), // First 3 items
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
    }

    /**
     * Health check - simple endpoint to test if MongoDB is working
     */
    public function health()
    {
        try {
            $client = new \MongoDB\Client(env('MONGODB_URI', 'mongodb://localhost:27017'));
            $database = env('MONGODB_DATABASE', 'finito');
            
            // Try to list databases to test connection
            $client->listDatabases();
            
            // Test wishlist collection access
            $wishlistStats = $this->mongoWishlist->getStats();
            
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
    }

    /**
     * Get wishlist items with pagination
     */
    public function paginated(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 20);

            $result = $this->mongoWishlist->getWishlistPaginated($user->id, $page, $perPage);

            return response()->json($result);

        } catch (\Exception $e) {
            Log::error('MongoWishlist paginated error:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to fetch paginated wishlist',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check multiple products in wishlist
     */
    public function checkMultiple(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $request->validate([
                'product_ids' => 'required|array',
                'product_ids.*' => 'required|string'
            ]);

            $productIds = $request->product_ids;
            $result = $this->mongoWishlist->checkMultipleProducts($user->id, $productIds);

            return response()->json([
                'products' => $result
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('MongoWishlist checkMultiple error:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to check multiple products',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get popular wishlisted products
     */
    public function popular(Request $request)
    {
        try {
            $limit = $request->get('limit', 10);
            $popularProducts = $this->mongoWishlist->getPopularProducts($limit);

            return response()->json([
                'popular_products' => $popularProducts
            ]);

        } catch (\Exception $e) {
            Log::error('MongoWishlist popular error:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to fetch popular products',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear entire wishlist for user
     */
    public function clear()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $result = $this->mongoWishlist->clearWishlist($user->id);

            if (isset($result['error'])) {
                return response()->json(['error' => $result['error']], 500);
            }

            return response()->json([
                'message' => 'Wishlist cleared successfully',
                'deleted_count' => $result['deleted_count']
            ]);

        } catch (\Exception $e) {
            Log::error('MongoWishlist clear error:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to clear wishlist',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get wishlist statistics
     */
    public function stats()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $userStats = $this->mongoWishlist->getStats($user->id);
            $globalStats = $this->mongoWishlist->getStats();

            return response()->json([
                'user_stats' => $userStats,
                'global_stats' => $globalStats
            ]);

        } catch (\Exception $e) {
            Log::error('MongoWishlist stats error:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to get wishlist statistics',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Migrate from MySQL to MongoDB (one-time use)
     */
    public function migrateFromMySQL()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Check if user is admin or has migration privileges
            // You might want to add additional authorization here

            // Get MySQL wishlist items (you'll need to adjust this based on your MySQL model)
            // $mysqlWishlistItems = \App\Models\Wishlist::where('user_id', $user->id)->get();
            
            // For now, return instruction
            return response()->json([
                'message' => 'Migration endpoint ready',
                'instruction' => 'Uncomment the migration code in the controller and adjust based on your MySQL Wishlist model'
            ]);

            // Uncomment when ready to migrate:
            // $result = $this->mongoWishlist->migrateFromMySQL($mysqlWishlistItems);
            // 
            // if (isset($result['error'])) {
            //     return response()->json(['error' => $result['error']], 500);
            // }
            // 
            // return response()->json([
            //     'message' => 'Migration completed successfully',
            //     'migrated_count' => $result['inserted_count']
            // ]);

        } catch (\Exception $e) {
            Log::error('MongoWishlist migrateFromMySQL error:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Migration failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}