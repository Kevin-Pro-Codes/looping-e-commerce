import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SearchBar = forwardRef(({ 
  onSearch, 
  placeholder = "Search products...", 
  className = "", 
  initialQuery = "", 
  onSearchSubmit,
  debounceDelay = 1000, // 1 second delay before triggering search
  disableAutoNavigation = false, // Disable auto-nav when on search page
  onQueryChange,
  onFocus,
  onBlur
}, ref) => {
  const [query, setQuery] = useState(initialQuery);

  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // Sincroniza a query caso venha uma initialQuery via URL/Props
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Fecha as sugestões ao clicar fora do componente
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        // No more suggestions to close
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    if (onQueryChange) {
      onQueryChange(newQuery);
    }
    
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Removed automatic search on typing - search now only triggered by clicking magnifier or pressing Enter
  };

  const handleClear = () => {
    setQuery('');
    // Clear any pending search timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  };

  const triggerSearch = () => {
    const currentValue = inputRef.current ? inputRef.current.value : query;
    if (currentValue.trim()) {
      onSearch(currentValue.trim());
    }
  };

  // Expõe os métodos para o componente pai (Navbar, etc)
  React.useImperativeHandle(ref, () => ({
    triggerSearch,
    focusInput: () => {
      if (inputRef.current) {
        inputRef.current.focus();
        // Set cursor to the end of the text
        const length = inputRef.current.value.length;
        inputRef.current.setSelectionRange(length, length);
      }
    },
    getCurrentQuery: () => {
      return inputRef.current ? inputRef.current.value : query;
    }
  }));

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <button
              type="button"
              onClick={triggerSearch}
              className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-600" aria-hidden="true" />
            </button>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={onFocus}
            onBlur={onBlur}
            className="block w-full pl-10 pr-10 py-4 h-11 border border-black rounded-md leading-5 bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-black focus:border-black sm:text-sm"
            placeholder={placeholder}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" aria-hidden="true" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;