<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class SimpleSearchController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        try {
            $query = $request->get('q', '');
            $category = $request->get('category');
            $minPrice = $request->get('min_price');
            $maxPrice = $request->get('max_price');
            $sort = $request->get('sort', 'relevance');
            $page = max(1, (int) $request->get('page', 1));
            $limit = min(50, max(1, (int) $request->get('limit', 20)));

            if (empty($query)) {
                return response()->json([
                    'hits' => [],
                    'total' => 0,
                    'page' => $page,
                    'totalPages' => 0,
                    'query' => $query,
                ]);
            }

            // Use database search for now (most reliable)
            $productsQuery = Product::where(function($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                  ->orWhere('description', 'like', "%{$query}%");
            });

            // Apply filters
            if ($category) {
                $productsQuery->where('category', $category);
            }
            if ($minPrice) {
                $productsQuery->where('price', '>=', (float) $minPrice);
            }
            if ($maxPrice) {
                $productsQuery->where('price', '<=', (float) $maxPrice);
            }

            // Apply sorting
            $sortColumn = match ($sort) {
                'price_asc', 'price_desc' => 'price',
                'name_asc', 'name_desc' => 'title',
                default => 'title',
            };
            $sortDirection = match ($sort) {
                'price_asc', 'name_asc' => 'asc',
                'price_desc', 'name_desc' => 'desc',
                default => 'asc',
            };

            $products = $productsQuery
                ->orderBy($sortColumn, $sortDirection)
                ->skip(($page - 1) * $limit)
                ->take($limit)
                ->get();

            $total = Product::where(function($q) use ($query) {
                    $q->where('title', 'like', "%{$query}%")
                      ->orWhere('description', 'like', "%{$query}%");
                })
                ->when($category, function ($query, $category) {
                    return $query->where('category', $category);
                })
                ->when($minPrice, function ($query, $minPrice) {
                    return $query->where('price', '>=', (float) $minPrice);
                })
                ->when($maxPrice, function ($query, $maxPrice) {
                    return $query->where('price', '<=', (float) $maxPrice);
                })
                ->count();

            return response()->json([
                'hits' => $products->toArray(),
                'total' => $total,
                'page' => $page,
                'totalPages' => ceil($total / $limit),
                'query' => $query,
                'using_fallback' => true,
            ]);

        } catch (\Exception $e) {
            Log::error('Search error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'error' => 'Search failed',
                'message' => $e->getMessage(),
                'debug_info' => [
                    'query' => $request->get('q'),
                    'page' => $request->get('page'),
                    'limit' => $request->get('limit'),
                    'sort' => $request->get('sort'),
                ]
            ], 500);
        }
    }

    public function suggestions(Request $request): JsonResponse
    {
        try {
            $query = $request->get('q', '');

            if (strlen($query) < 2) {
                return response()->json(['suggestions' => []]);
            }

            // Simple database query for suggestions
            $products = Product::where('title', 'like', "%{$query}%")
                ->limit(5)
                ->get(['title', '_id']);

            $suggestions = $products->map(function ($product) use ($query) {
                $title = $product->title;
                $highlighted = str_ireplace($query, "<em>{$query}</em>", $title);
                
                return [
                    'title' => $title,
                    'highlighted' => $highlighted,
                ];
            })->toArray();

            return response()->json(['suggestions' => $suggestions]);

        } catch (\Exception $e) {
            Log::error('Suggestions error: ' . $e->getMessage());
            return response()->json(['suggestions' => []]);
        }
    }

    public function categories(): JsonResponse
    {
        try {
            // Get categories from database
            $categories = Product::distinct('category')
                ->whereNotNull('category')
                ->pluck('category')
                ->countValues()
                ->toArray();

            return response()->json(['categories' => $categories]);

        } catch (\Exception $e) {
            Log::error('Categories error: ' . $e->getMessage());
            return response()->json(['categories' => []]);
        }
    }
}
