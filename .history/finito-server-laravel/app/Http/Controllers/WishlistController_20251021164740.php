<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WishlistController extends Controller
{
    public function index()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // For now, return empty array until we set up MongoDB
            return response()->json([
                'wishlist' => [],
                'count' => 0,
                'message' => 'Wishlist endpoint is working (no items yet)'
            ]);

        } catch (\Exception $e) {
            \Log::error('Wishlist error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

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

            // For now, just return success without saving to database
            // We'll add MongoDB functionality later
            return response()->json([
                'message' => 'Wishlist toggle working (not saved to DB yet)',
                'action' => 'simulated',
                'product_id' => $productId,
                'in_wishlist' => true // Simulate adding for now
            ]);

        } catch (\Exception $e) {
            \Log::error('Wishlist toggle error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to toggle wishlist',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}