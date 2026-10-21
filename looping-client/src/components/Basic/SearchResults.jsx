import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const SearchResults = ({ query, onProductSelect, onSearchSubmit }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    min_price: '',
    max_price: '',
    sort: 'relevance'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 0,
    total: 0
  });
  const [cartLoading, setCartLoading] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState({});

  // Non-blocking toast notification function
  const showCartToast = (message) => {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
    toast.textContent = message;

    // Add to DOM
    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full');
      toast.classList.add('translate-x-0');
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };

  useEffect(() => {
    if (query) {
      searchProducts();
    }
  }, [query, currentPage]);

  useEffect(() => {
    fetchCategories();
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchWishlist();
    } else {
      setFavorites([]);
    }
  }, [isLoggedIn]);

  const fetchWishlist = async () => {
    if (!isLoggedIn) return;
    try {
      await fetch("/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });
      const res = await fetch("/api/wishlist", {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });
      if (res.ok) {
        const data = await res.json();
        const favoriteIds = data.wishlist.map(item => item.product_id);
        setFavorites(favoriteIds);
      }
    } catch (err) {
      console.log("⚠️ Could not fetch wishlist:", err);
    }
  };

  const toggleWishlist = async (productId) => {
    if (!isLoggedIn) {
      alert("Please log in to add items to your wishlist");
      window.location.href = '/login';
      return;
    }
    try {
      setWishlistLoading(prev => ({ ...prev, [productId]: true }));
      await fetch("/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });
      const getCsrfToken = () => {
        return document.cookie
          .split('; ')
          .find(row => row.startsWith('XSRF-TOKEN='))
          ?.split('=')[1];
      }
      const csrfToken = getCsrfToken();
      if (!csrfToken) return;
      const res = await fetch("/api/wishlist/toggle", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ product_id: productId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.in_wishlist) {
          setFavorites(prev => [...prev, productId]);
        } else {
          setFavorites(prev => prev.filter(id => id !== productId));
        }
      }
    } catch (err) {
      console.error("❌ Error toggling favorite:", err);
    } finally {
      setWishlistLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/search/categories');
      const data = await response.json();
      setCategories(data.categories || {});
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const checkAuthStatus = () => {
    const loggedIn = localStorage.getItem('loggedIn');
    const userData = localStorage.getItem('user');
    const isAuthenticated = !!(loggedIn && userData);
    setIsLoggedIn(isAuthenticated);
    return isAuthenticated;
  };

  const searchProducts = async (currentFilters = filters, page = currentPage) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page,
        limit: 12,
        ...currentFilters
      });

      // Only add query parameter if it's not empty
      if (query && query.trim()) {
        params.set('q', query.trim());
      }

      // Remove empty filters
      Object.keys(currentFilters).forEach(key => {
        if (!currentFilters[key]) {
          params.delete(key);
        }
      });

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();

      if (response.ok) {
        const normalizedHits = (data.hits || []).map(p => {
          // Aggressive ID lookup
          const productId = p._id?.$oid || p._id || p.id || p.objectID || p.uid;

          return {
            ...p,
            _id: productId,
            image: (p.image || "").replace('http://localhost:8000', 'http://localhost:8888'),
            id: productId, // Redundant for safety
            price: p.price || 0,
            title: p.title || 'No title'
          };
        });
        // Client-side boost for title matches
        let finalResults = normalizedHits;
        if (query && query.trim()) {
          const lowerQuery = query.toLowerCase().trim();
          finalResults = [...normalizedHits].sort((a, b) => {
            const aTitle = (a.title || '').toLowerCase();
            const bTitle = (b.title || '').toLowerCase();

            const aHasInTitle = aTitle.includes(lowerQuery);
            const bHasInTitle = bTitle.includes(lowerQuery);

            // Prioritize those that have the query in the title
            if (aHasInTitle && !bHasInTitle) return -1;
            if (!aHasInTitle && bHasInTitle) return 1;

            // If both have it in the title, prioritize those that START with the query
            const aStarts = aTitle.startsWith(lowerQuery);
            const bStarts = bTitle.startsWith(lowerQuery);
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;

            // Keep original relevance from API for other cases
            return 0;
          });
        }

        setResults(finalResults);
        setPagination({
          page: data.page || 1,
          totalPages: data.totalPages || 0,
          total: data.total || 0
        });
      } else {
        setError(data.error || 'Search failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    searchProducts(newFilters, 1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchSubmit = () => {
    console.log('SearchResults handleSearchSubmit called'); // Debug log
    setCurrentPage(1); // Reset to first page
    // Call the parent's search submit handler if available
    if (onSearchSubmit) {
      onSearchSubmit();
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const highlightText = (text, highlights) => {
    if (!highlights) return text;
    return <span dangerouslySetInnerHTML={{ __html: highlights }} />;
  };

  const addToCart = async (productId, productTitle) => {
    if (!isLoggedIn) {
      alert('Please log in to add items to your cart');
      window.location.href = '/login';
      return;
    }

    try {
      setCartLoading(prev => ({ ...prev, [productId]: true }));

      await fetch('/sanctum/csrf-cookie', {
        method: 'GET',
        credentials: 'include',
      });

      const getCsrfToken = () => {
        return document.cookie
          .split('; ')
          .find(row => row.startsWith('XSRF-TOKEN='))
          ?.split('=')[1];
      };

      const csrfToken = getCsrfToken();

      if (!csrfToken) {
        console.error('CSRF token not found');
        alert('Authentication error. Please try logging in again.');
        return;
      }

      const res = await fetch('/api/cart/add', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': decodeURIComponent(csrfToken),
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1,
          size: 'M',
          color: '#000000'
        }),
      });

      if (res.status === 401) {
        setIsLoggedIn(false);
        localStorage.removeItem('user');
        localStorage.removeItem('loggedIn');
        alert('Your session has expired. Please log in again.');
        window.location.href = '/login';
        return;
      }

      if (res.ok) {
        const data = await res.json();

        // Dispatch cart update event to notify Navbar FIRST for instant feedback
        window.dispatchEvent(new CustomEvent('cartUpdated', {
          detail: {
            action: 'add',
            product: { id: productId, title: productTitle }
          }
        }));
      } else {
        const errorData = await res.json();
        if (res.status === 404) {
          alert('Product not found. Please try again.');
        } else {
          alert('Failed to add product to cart. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setCartLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-">
      {/* Search Header */}
      <div className="mb-6" style={{ fontFamily: 'Calibri, Candara, Segoe, "Segoe UI", Optima, Arial, sans-serif' }}>
        <h2 className="text-2xl font-bold text-gray-900">
          {query ? `Resultados de pesquisa para "${query}"` : "Todos os produtos"}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {pagination.total} produtos encontrados
        </p>
      </div>

      {/* Filters Header */}
      <div className="flex items-center mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <AdjustmentsHorizontalIcon className="h-5 w-5" />
          <span>Filtrar</span>
        </button>


      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Todas Categorias</option>
                {Object.entries(categories).map(([category, count]) => (
                  <option key={category} value={category}>
                    {category} ({count})
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço Mínimo
              </label>
              <input
                type="number"
                value={filters.min_price}
                onChange={(e) => handleFilterChange('min_price', e.target.value)}
                placeholder="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço Máximo
              </label>
              <input
                type="number"
                value={filters.max_price}
                onChange={(e) => handleFilterChange('max_price', e.target.value)}
                placeholder="1000"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordenar Por
              </label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="relevance">Relevância</option>
                <option value="price_asc">Preço: Menor para o Maior</option>
                <option value="price_desc">Preço: Maior para o Menor</option>
                <option value="name_asc">Nome: A a Z</option>
                <option value="name_desc">Nome: Z a A</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-500">Searching...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Results Grid */}
      {!loading && !error && (
        <>
          {results.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {results.map((product) => (
                  <div
                    key={product._id}
                    className="relative bg-white rounded-2xl shadow-xl flex flex-col items-center p-4 border-1 border-black duration-300 hover:shadow-2xl transition-all group"
                  >
                    {/* Image container */}
                    <div className="relative w-full mb-3 overflow-hidden rounded-xl group mt-2">
                      <Link to={product._id ? `/product/${product._id}` : "#"} className="block w-full">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-[500px] h-auto max-h-[390px] object-contain transition-transform duration-300 scale-90 group-hover:scale-99 cursor-pointer"
                          />
                        ) : (
                          <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                      </Link>
                    </div>

                    <Link
                      to={product._id ? `/product/${product._id}` : "#"}
                      className="w-full text-center hover:text-orange-600 transition-colors"
                    >
                      <p
                        className="text-xl sm:text-2xl font-bold mb-1 text-black hover:text-orange-600 transition-colors cursor-pointer truncate px-2"
                        style={{ fontFamily: "'Calibri', 'sans-serif'" }}
                        title={product.title}
                      >
                        {highlightText(product.title, product._formatted?.title)}
                      </p>

                      {/* Updated Price Display with +33% */}
                      <div className="w-full text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* +33% Calculation in Gray */}
                          <span
                            className="text-2xl text-gray-500 line-through"
                            style={{ fontFamily: "'Calibri', 'sans-serif'" }}
                          >
                            ${Math.floor(parseFloat(product.price) + parseFloat(product.price) * 0.4968 + 0.20)}.99
                          </span>

                          {/* Current Price */}
                          <p
                            className="text-xl sm:text-2xl font-bold hover:text-orange-600 text-black"
                            style={{ fontFamily: "'Calibri', 'sans-serif'" }}
                          >
                            ${product.price}
                          </p>
                        </div>
                      </div>
                    </Link>

                    {/* ✅ ADDED: Add to Cart Button */}
                    <div className="w-full flex justify-center mt-3 pt-3">
                      <button
                        className={`flex items-center justify-center px-3 py-2 rounded-lg border-2 transition-all duration-200 shadow-md ${cartLoading[product._id]
                          ? 'bg-gray-400 text-white border-gray-600 cursor-not-allowed'
                          : 'bg-red-500 text-white border-black hover:bg-red-600 hover:scale-105'
                          }`}
                        style={{ fontFamily: "'Georgia', 'Times New Roman', 'Palatino', serif" }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addToCart(product._id, product.title);
                        }}
                        disabled={cartLoading[product._id]}
                      >
                        {cartLoading[product._id] ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <FiShoppingCart className="text-xl" />
                        )}
                        {cartLoading[product._id] ? 'Adding...' : ''}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>

                  <span className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum resultado encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                Tente ajustar seus termos de busca ou filtros.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResults;
