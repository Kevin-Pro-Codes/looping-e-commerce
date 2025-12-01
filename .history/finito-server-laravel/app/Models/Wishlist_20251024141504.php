<?php

namespace App\Models;

use App\Services\MongoDatabaseService;

class Wishlist
{
    protected static $collection;

    /**
     * Initialize the MongoDB wishlist collection
     */
    public static function init(MongoDatabaseService $mongo)
    {
        self::$collection = $mongo->getWishlistCollection();
    }

    /**
     * Check if a product is already in user's wishlist
     */
    public static function isProductInWishlist($userId, $productId)
    {
        if (!self::$collection) {
            throw new \Exception('Wishlist collection not initialized. Call Wishlist::init($mongo) first.');
        }

        $existing = self::$collection->findOne([
            'user_id' => (string)$userId,
            'product_id' => $productId,
        ]);

        return $existing !== null;
    }

    /**
     * Add a product to wishlist
     */
    public static function add($userId, $productId)
    {
        self::$collection->insertOne([
            'user_id' => (string)$userId,
            'product_id' => $productId,
            'created_at' => new \MongoDB\BSON\UTCDateTime()
        ]);
    }

    /**
     * Remove a product from wishlist
     */
    public static function remove($userId, $productId)
    {
        self::$collection->deleteOne([
            'user_id' => (string)$userId,
            'product_id' => $productId,
        ]);
    }

    /**
     * Get all wishlist items for a user
     */
    public static function getUserWishlist($userId)
    {
        return self::$collection->find(['user_id' => (string)$userId])->toArray();
    }

    /**
     * Count user's wishlist
     */
    public static function count($userId)
    {
        return self::$collection->countDocuments(['user_id' => (string)$userId]);
    }
}
