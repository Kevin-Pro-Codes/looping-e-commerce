import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

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

  useEffect(() => {
    if (query) {
      searchProducts();
    }
  }, [query, currentPage]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/search/categories');
      const data = await response.json();
      setCategories(data.categories || {});
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const searchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        ...filters
      });

      // Only add query parameter if it's not empty
      if (query && query.trim()) {
        params.set('q', query.trim());
      }

      // Remove empty filters
      Object.keys(filters).forEach(key => {
        if (!filters[key]) {
          params.delete(key);
        }
      });

      const response = await fetch(`http://localhost:8000/api/search?${params}`);
      const data = await response.json();

      if (response.ok) {
        setResults(data.hits || []);
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
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
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
                    onClick={() => onProductSelect && onProductSelect(product)}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-100">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-64 object-contain object-center bg-white"
                        />
                      ) : (
                        <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 text-center" style={{ fontFamily: "Calibri, sans-serif" }}>
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {highlightText(product.title, product._formatted?.title)}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {highlightText(product.description, product._formatted?.description)}
                      </p>
                      <div className="mt-2 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                       
                      </div>
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
