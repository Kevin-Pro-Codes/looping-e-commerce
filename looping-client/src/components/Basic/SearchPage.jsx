import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchInputRef = useRef(null);

  useEffect(() => {
    // Get query from URL parameters
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  // Auto-focus search bar when component mounts or when navigating to search page
  useEffect(() => {
    const focusSearchInput = () => {
      if (searchInputRef.current) {
        searchInputRef.current.focusInput();
      } else {
        // Fallback: try to find and focus any search input
        const searchInput = document.querySelector('input[placeholder*="Search"]') || 
                            document.querySelector('input[placeholder*="products"]') ||
                            document.querySelector('input[type="text"]');
        if (searchInput) {
          searchInput.focus();
          const length = searchInput.value.length;
          searchInput.setSelectionRange(length, length);
        }
      }
    };

    // Multiple attempts with different timing strategies
    focusSearchInput(); // Immediate attempt
    setTimeout(focusSearchInput, 50); // After 50ms
    setTimeout(focusSearchInput, 200); // After 200ms
    requestAnimationFrame(focusSearchInput); // Next frame
    requestAnimationFrame(() => setTimeout(focusSearchInput, 0)); // Next frame with delay
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Update URL with new search query
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set('q', query.trim());
    }
    navigate(`/search?${params.toString()}`);
  };

  const handleSearchSubmit = () => {
    // Get current value from search input - try multiple selectors
    const searchInput = document.querySelector('input[placeholder*="Search"]') || 
                         document.querySelector('input[placeholder*="products"]') ||
                         document.querySelector('input[type="text"]');
    const currentQuery = searchInput ? searchInput.value : searchQuery;
    
    // Trigger search with current query by updating URL
    const params = new URLSearchParams();
    if (currentQuery.trim()) {
      params.set('q', currentQuery.trim());
    }
    navigate(`/search?${params.toString()}`);
  };

  const handleProductSelect = (product) => {
    // Navigate to product detail page
    navigate(`/product/${product._id}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <ArrowLeftIcon className="h-6 w-6" aria-hidden="true" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Search Products</h1>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="pb-4">
            <SearchBar 
              onSearch={handleSearch}
              placeholder="Search for products..."
              className="max-w-2xl mx-auto"
              initialQuery={searchQuery}
              disableAutoNavigation={true}
            />
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="py-6">
        <SearchResults 
          query={searchQuery}
          onProductSelect={handleProductSelect}
          onSearchSubmit={handleSearchSubmit}
        />
      </div>
    </div>
  );
};

export default SearchPage;
