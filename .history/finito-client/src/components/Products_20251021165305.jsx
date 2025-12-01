import React, { useState, useEffect } from "react";
import { FiHeart, FiShoppingCart, FiPlus, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { IoIosArrowRoundForward, IoIosArrowRoundBack } from "react-icons/io";
import { Link } from "react-router-dom";

const SaleProducts = () => {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState({});
  
  const [newProduct, setNewProduct] = useState({
    title: "",
    price: "",
    description: "",
    image: "",    
    category: "",
    size: [], 
    color: [],     
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/products", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const normalized = Array.isArray(data)
        ? data.map((p) => ({
            _id: p._id?.$oid || p._id || Math.random().toString(),
            title: p.title || "No title",
            price: p.price || 0,
            description: p.description || "",
            image: p.image || "",
            category: p.category || "",
            // Frontend-only sizes and colors
            size: p.size || ["P", "M", "G"], // Default sizes
            color: p.color || "#000000", // Default color
          }))
        : [];
      setProducts(normalized);
    } catch (error) {
      console.error("Error loading products:", error);
    }
    setLoading(false);
  };

  // ✅ ADDED: Fetch user's wishlist to sync favorites
  const fetchWishlist = async () => {
    try {
      // Get CSRF cookie first
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const res = await fetch("http://localhost:8000/api/wishlist", {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (res.ok) {
        const data = await res.json();
        // Extract product IDs from wishlist
        const favoriteIds = data.wishlist.map(item => item.product_id);
        setFavorites(favoriteIds);
        console.log("✅ Favorites loaded:", favoriteIds);
      } else if (res.status === 500) {
        console.log("⚠️ Wishlist endpoint not ready yet - using local favorites only");
      }
    } catch (err) {
      console.log("⚠️ Could not fetch wishlist - using local favorites only");
    }
  };

  // ✅ ADDED: Toggle product in wishlist with database integration
  const toggleFavorite = async (productId) => {
    try {
      setWishlistLoading(prev => ({ ...prev, [productId]: true }));

      // Get CSRF cookie first
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      // Extract CSRF token
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      if (!csrfToken) {
        console.error("CSRF token not found");
        return;
      }

      // Toggle wishlist
      const res = await fetch("http://localhost:8000/api/wishlist/toggle", {
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
        console.log("✅ Wishlist toggled:", data);
        
        // Update local favorites state based on backend response
        if (data.in_wishlist) {
          setFavorites(prev => [...prev, productId]);
        } else {
          setFavorites(prev => prev.filter(id => id !== productId));
        }
      } else {
        console.error("Failed to toggle wishlist");
        // Fallback: toggle locally
        setFavorites(prev => 
          prev.includes(productId) 
            ? prev.filter(id => id !== productId)
            : [...prev, productId]
        );
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      // Fallback: toggle locally
      setFavorites(prev => 
        prev.includes(productId) 
          ? prev.filter(id => id !== productId)
          : [...prev, productId]
      );
    } finally {
      setWishlistLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  // ✅ ADDED: Check if product is in wishlist
  const checkWishlistStatus = async (productId) => {
    try {
      // Get CSRF cookie first
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const res = await fetch(`http://localhost:8000/api/wishlist/check/${productId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
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
      console.log("Could not check wishlist status for product:", productId);
    }
  };

  // Fetch products and wishlist when component mounts
  useEffect(() => {
    loadProducts();
    fetchWishlist();
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  // Add product - FRONTEND ONLY
  const addProduct = () => {
    const newProductWithId = {
      _id: Math.random().toString(),
      title: newProduct.title,
      price: parseFloat(newProduct.price),
      description: newProduct.description,
      image: newProduct.image,
      category: newProduct.category,
      // Store sizes and colors in frontend state
      size: newProduct.size || [],
      color: newProduct.color || "#000000",
    };

    console.log("Adding product (frontend only):", newProductWithId);
    
    // Add to local state only
    setProducts([newProductWithId, ...products]);
    setAdding(false);
    setNewProduct({ 
      title: "", 
      price: "", 
      description: "", 
      image: "", 
      category: "",
      size: [], 
      color: "" 
    });
  };

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  return (
    <div className="max-w-[1400px] mx-auto my-4 flex flex-col items-center p-5">
 
     {/* Products grid */}
{loading && <p className="text-black mt-2">Loading...</p>}
{!loading && products.length === 0 && <p className="text-black mt-2">No products loaded.</p>}

{/* Products Count and Page Info */}
{!loading && products.length > 0 && (
 <div className="w-full mb-4 flex justify-between items-center">
 <p
   className="text-black text-lg"
   style={{ fontFamily: "'Calibri', 'sans-serif'" }}
 >
   Mostrando {indexOfFirstProduct + 1}-
   {Math.min(indexOfLastProduct, products.length)} de {products.length} produtos
 </p>
 <p
   className="text-black text-lg"
   style={{ fontFamily: "'Calibri', 'sans-serif'" }}
 >
   Página {currentPage} de {totalPages}
 </p>
</div>
)}

<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
  {currentProducts.map((product) => {
    const isFavorited = favorites.includes(product._id);
    const isLoading = wishlistLoading[product._id];
    
    return (
      <div key={product._id} className="relative bg-white rounded-2xl shadow-xl flex flex-col items-center p-4 border-1 border-black duration-300 hover:shadow-2xl transition-all group">
        
        {/* ✅ UPDATED: Like button with proper z-index and loading state */}
        <button 
          className="absolute top-3 right-3 z-20 transition-all duration-300 hover:scale-110 bg-white rounded-full p-1 shadow-md"
          onClick={() => toggleFavorite(product._id)}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <FiHeart 
              size={20} 
              className={`transition-colors duration-300 ${
                isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-600'
              }`}
            />
          )}
        </button>

        {/* ✅ UPDATED: Image container with proper stacking context */}
        <div className="relative w-full mb-3 overflow-hidden rounded-xl group">
          <Link to={`/product/${product._id}`} className="block w-full">
            {product.image && (
              <img 
                src={product.image} 
                alt={product.title} 
                className="w-full h-auto max-h-[220px] object-contain transition-transform duration-300 group-hover:scale-105 cursor-pointer" 
              />
            )}
          </Link>
          
        
        </div>

        <Link to={`/product/${product._id}`} className="w-full text-center group/title">
          <p
            className="text-xl sm:text-2xl font-bold mb-1 text-black group-hover/title:text-red-600 transition-colors cursor-pointer truncate"
            style={{ fontFamily: "'Calibri', 'sans-serif'" }}
            title={product.title}
          >
            {product.title}
          </p>
        </Link>

        <div className="w-full text-center">
          <p
            className="text-xl sm:text-2xl font-bold mb-1 text-black transition-colors"
            style={{ fontFamily: "'Calibri', 'sans-serif'" }}
          >
            ${product.price}
          </p>
        </div>

        {/* ✅ UPDATED: Add to Cart Button with better spacing */}
        <div className="w-full flex justify-center mt-3 pt-3 border-t border-gray-200">
          <button 
            className="flex items-center justify-center bg-red-500 text-white px-6 py-2 rounded-lg border-2 border-red-600 hover:bg-red-600 hover:scale-105 transition-all duration-200 shadow-md"
            style={{ fontFamily: "'Georgia', 'Times New Roman', 'Palatino', serif" }}
          >
            <FiShoppingCart className="text-xl " />
           
          </button>
        </div>
      </div>
    );
  })}
</div>


      {/* Pagination Controls */}
      {!loading && products.length > productsPerPage && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 text-2xl font-extrabold transition-all duration-200 ${
              currentPage === 1
                ? 'bg-gray-200 text-gray-500 border-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-900 border-black hover:bg-gray-100 hover:scale-105'
            }`}
          >
            <IoIosArrowRoundBack size={26} />
          </button>

          <div className="flex space-x-2">
            {getPageNumbers().map((number, index) => (
              <button
                key={index}
                onClick={() => typeof number === 'number' && paginate(number)}
                className={`
                  w-10 h-10 flex items-center justify-center rounded-full 
                  font-semibold text-lg transition-all duration-200 border-2
                  ${
                    number === currentPage
                      ? 'bg-red-600 text-white scale-110 border-black shadow-md'
                      : number === '...'
                      ? 'bg-transparent text-gray-500 cursor-default text-xl border-transparent'
                      : 'bg-white text-gray-700 hover:bg-gray-100 hover:scale-105 border-black'
                  }
                `}
                disabled={number === '...'}
              >
                {number}
              </button>
            ))}
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 text-2xl font-extrabold transition-all duration-200 ${
              currentPage === totalPages
                ? 'bg-gray-200 text-gray-500 border-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-900 border-black hover:bg-gray-100 hover:scale-105'
            }`}
          >
            <IoIosArrowRoundForward size={26} />
          </button>
        </div>
      )}

      {/* Add product form */}
      {adding && (
        <div className="bg-white p-6 rounded-lg w-full max-w-2xl mb-6 shadow-md border">
          <h3 className="text-lg font-semibold mb-4 text-black">+</h3>

        {/* Title */}
<input
  type="text"
  name="title"
  placeholder="Product Title"
  value={newProduct.title}
  onChange={handleInputChange}
  className="w-full mb-3 p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
 
/>

{/* Price */}
<input
  type="number"
  name="price"
  placeholder="Price"
  value={newProduct.price}
  onChange={handleInputChange}
  className="w-full mb-3 p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
 
/>

          {/* Size Selection */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Available Sizes</label>
            <div className="flex flex-wrap gap-2">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    const currentSizes = newProduct.size || [];
                    if (currentSizes.includes(size)) {
                      setNewProduct({
                        ...newProduct,
                        size: currentSizes.filter((s) => s !== size),
                      });
                    } else {
                      setNewProduct({
                        ...newProduct,
                        size: [...currentSizes, size],
                      });
                    }
                  }}
                  className={`w-12 h-12 flex items-center justify-center border-2 rounded-lg font-bold transition-all duration-200 ${
                    newProduct.size?.includes(size)
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {newProduct.size && newProduct.size.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                Selected: {newProduct.size.join(', ')}
              </p>
            )}
          </div>

          {/* Color Selection */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Color</label>
            <div className="flex flex-wrap gap-3">
              {[
                { name: "White", value: "#FFFFFF" },
                { name: "Black", value: "#000000" },
                { name: "Blue", value: "#0000FF" },
                { name: "Pink", value: "#FF69B4" },
                { name: "Red", value: "#FF0000" },
                { name: "Green", value: "#008000" },
                { name: "Yellow", value: "#FFFF00" },
                { name: "Gray", value: "#808080" },
              ].map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setNewProduct({ ...newProduct, color: color.value })}
                  className={`relative w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                    newProduct.color === color.value
                      ? 'border-black ring-2 ring-offset-1 ring-black'
                      : 'border-gray-300 hover:scale-110'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {newProduct.color === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            {newProduct.color && (
              <p className="text-sm text-gray-600 mt-2">
                Selected color: {
                  [
                    { name: "White", value: "#FFFFFF" },
                    { name: "Black", value: "#000000" },
                    { name: "Blue", value: "#0000FF" },
                    { name: "Pink", value: "#FF69B4" },
                    { name: "Red", value: "#FF0000" },
                    { name: "Green", value: "#008000" },
                    { name: "Yellow", value: "#FFFF00" },
                    { name: "Gray", value: "#808080" },
                  ].find(c => c.value === newProduct.color)?.name
                }
              </p>
            )}
          </div>

          {/* Description */}
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={newProduct.description}
            onChange={handleInputChange}
            className="w-full mb-3 p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Image */}
          <input
            type="text"
            name="image"
            placeholder="Image URL"
            value={newProduct.image}
            onChange={handleInputChange}
            className="w-full mb-3 p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Category */}
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={newProduct.category}
            onChange={handleInputChange}
            className="w-full mb-3 p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Submit Button */}
          <div className="flex space-x-3">
            <button
              onClick={addProduct}
              className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2 rounded-lg flex items-center transition-colors"
            >
              <FiPlus className="mr-2" />
              Add Product
            </button>
            <button
              onClick={() => setAdding(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-6 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleProducts;





{/*

   <div className="mb-3">
   <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho (Size)</label>
   <div className="flex space-x-3">
     {['P', 'M', 'G'].map((size) => (
       <button
         key={size}
         type="button"
         onClick={() => {
           if (newProduct.tamanho?.includes(size)) {
             setNewProduct({
               ...newProduct,
               tamanho: newProduct.tamanho.filter((s) => s !== size),
             });
           } else {
             setNewProduct({
               ...newProduct,
               tamanho: [...(newProduct.tamanho || []), size],
             });
           }
         }}
         className={`w-12 h-12 flex items-center justify-center border-2 rounded-lg font-bold transition-all duration-200 ${
           newProduct.tamanho?.includes(size)
             ? 'bg-black text-white border-black'
             : 'bg-white text-black border-gray-300 hover:bg-gray-100'
         }`}
       >
         {size}
       </button>
     ))}
   </div>
 </div>


 <div className="mb-3">
   <label className="block text-sm font-medium text-gray-700 mb-2">Cor (Color)</label>
   <div className="flex space-x-3">
     {['#FFFFFF', '#000000', '#0000FF', '#FF69B4'].map((color) => (
       <button
         key={color}
         type="button"
         onClick={() =>
           setNewProduct({
             ...newProduct,
             cor: color,
           })
         }
         className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
           newProduct.cor === color
             ? 'border-black ring-2 ring-offset-1 ring-black'
             : 'border-gray-300'
         }`}
         style={{ backgroundColor: color }}
       />
     ))}
   </div>
 </div>
 */}