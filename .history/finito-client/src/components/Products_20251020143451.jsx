import React, { useState, useEffect } from "react";
import { FiHeart, FiShoppingCart, FiPlus, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { IoIosArrowRoundForward, IoIosArrowRoundBack } from "react-icons/io";

const SaleProducts = () => {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  
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
      console.log("🔄 Starting to fetch products from: http://localhost:8000/api/products");
      
      const response = await fetch("http://localhost:8000/api/products", {
        credentials: "include",
      });

      console.log("📡 Response status:", response.status);
      console.log("📡 Response ok:", response.ok);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Raw data from API:", data);
      console.log("📊 Data type:", typeof data);
      console.log("📊 Is array?", Array.isArray(data));
      
      const normalized = Array.isArray(data)
        ? data.map((p, index) => {
            const normalizedProduct = {
              _id: p._id?.$oid || p._id || Math.random().toString(),
              title: p.title || "No title",
              price: p.price || 0,
              description: p.description || "",
              image: p.image || null,
              category: p.category || "",
              size: p.size || ["P", "M", "G"],
              color: p.color || "#000000",
            };
            console.log(`📦 Product ${index}:`, normalizedProduct);
            return normalizedProduct;
          })
        : [];
      
      console.log("🎯 Normalized products array:", normalized);
      console.log("🔢 Total products after normalization:", normalized.length);
      
      setProducts(normalized);
    } catch (error) {
      console.error("❌ Error loading products:", error);
    }
    setLoading(false);
  };

  // Fetch products automatically when component mounts
  useEffect(() => {
    console.log("🚀 Products component mounted, starting to load products...");
    loadProducts();
  }, []);

  // Log when products state changes
  useEffect(() => {
    console.log("🔄 Products state updated:", {
      totalProducts: products.length,
      products: products
    });
  }, [products]);

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
      size: newProduct.size || [],
      color: newProduct.color || "#000000",
    };

    console.log("➕ Adding product (frontend only):", newProductWithId);
    
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

  // Log current page products
  useEffect(() => {
    console.log("📄 Current page products:", {
      currentPage,
      productsPerPage,
      indexOfFirstProduct,
      indexOfLastProduct,
      currentProductsCount: currentProducts.length,
      currentProducts: currentProducts
    });
  }, [currentPage, products, currentProducts]);

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
      
      {/* Debug Info Panel */}
      <div className="bg-blue-100 p-4 mb-4 rounded-lg border-2 border-blue-300 w-full">
        <h2 className="text-lg font-bold text-blue-800 mb-2">🔍 Debug Information:</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div>
            <span className="font-semibold">Total Products:</span> {products.length}
          </div>
          <div>
            <span className="font-semibold">Loading:</span> {loading ? '✅ Yes' : '❌ No'}
          </div>
          <div>
            <span className="font-semibold">Current Page:</span> {currentPage}
          </div>
          <div>
            <span className="font-semibold">Total Pages:</span> {totalPages}
          </div>
          <div>
            <span className="font-semibold">Showing:</span> {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, products.length)}
          </div>
          <div>
            <span className="font-semibold">Current Products:</span> {currentProducts.length}
          </div>
        </div>
        {products.length > 0 && (
          <div className="mt-2 text-xs">
            <span className="font-semibold">First Product Sample:</span> {products[0].title} - ${products[0].price}
            {products[0].image && (
              <span> - Image: {products[0].image.substring(0, 50)}...</span>
            )}
          </div>
        )}
      </div>

      {/* Products grid */}
      {loading && (
        <div className="bg-yellow-100 p-4 rounded border-2 border-yellow-300">
          <p className="text-black font-bold">🔄 Loading products...</p>
        </div>
      )}
      
      {!loading && products.length === 0 && (
        <div className="bg-red-100 p-4 rounded border-2 border-red-300">
          <p className="text-black font-bold">❌ No products loaded. Check console for errors.</p>
        </div>
      )}

      {/* Products Count and Page Info */}
      {!loading && products.length > 0 && (
        <div className="w-full mb-4 flex justify-between items-center">
          <p className="text-black text-lg" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
            Mostrando {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, products.length)} de {products.length} produtos
          </p>
          <p className="text-black text-lg" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
            Página {currentPage} de {totalPages}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
        {currentProducts.map((product) => {
          const isFavorited = favorites.includes(product._id);
          console.log("🎨 Rendering product:", product.title, "Image:", product.image);
          
          return (
            <div key={product._id} className="relative bg-white rounded-2xl shadow-xl flex flex-col items-center p-4 border-1 border-black duration-300 hover:shadow-2xl transition-all">
              <button className="absolute top-3 right-3 transition-colors duration-300">
                <FiHeart size={24} style={{ stroke: "black", strokeWidth: 1.5, fill: isFavorited ? "red" : "none" }} />
              </button>

              {product.image ? (
                <div className="relative">
                  <img 
                    src={product.image} 
                    alt={product.title} 
                    className="w-full h-auto max-h-[220px] object-contain rounded-xl mb-3"
                    onError={(e) => {
                      console.error("❌ Image failed to load:", product.image);
                      e.target.style.border = "2px solid red";
                    }}
                    onLoad={(e) => {
                      console.log("✅ Image loaded successfully:", product.image);
                    }}
                  />
                  {/* Image debug info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                    {product.image.substring(0, 30)}...
                  </div>
                </div>
              ) : (
                <div className="w-full h-[220px] bg-gray-200 rounded-xl mb-3 flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}

              <p className="text-xl sm:text-2xl font-bold mb-1 text-black text-center" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
                {product.title}
              </p>

              <p className="text-xl sm:text-2xl font-bold mb-1 text-black text-center" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
                ${product.price}
              </p>

              {/* Size Selection */}
              <div className="mb-3 mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Georgia', 'Times New Roman', 'Palatino', serif" }}>
                  Tamanho
                </label>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['P', 'M', 'G'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setProducts((prev) =>
                          prev.map((p) =>
                            p._id === product._id ? { ...p, selectedSize: size } : p
                          )
                        );
                      }}
                      className={`w-12 h-12 flex items-center justify-center border-2 rounded-lg font-bold transition-all duration-200 ${
                        product.selectedSize === size
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                      }`}
                      style={{
                        fontFamily: "'Georgia', 'Times New Roman', 'Palatino', serif"
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Georgia', 'Times New Roman', 'Palatino', serif" }}>
                  Cor
                </label>
                <div className="flex flex-wrap gap-3 justify-center">
                  {[
                    { name: 'White', value: '#FFFFFF' },
                    { name: 'Black', value: '#000000' },
                    { name: 'Blue', value: '#0000FF' },
                    { name: 'Pink', value: '#FF69B4' },
                  ].map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => {
                        setProducts((prev) =>
                          prev.map((p) =>
                            p._id === product._id ? { ...p, selectedColor: color.value } : p
                          )
                        );
                      }}
                      className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                        product.selectedColor === color.value
                          ? 'border-black ring-2 ring-offset-1 ring-black'
                          : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                {product.selectedColor && (
                  <p className="text-sm text-gray-600 mt-2" style={{ fontFamily: "'Georgia', 'Times New Roman', 'Palatino', serif" }}>
                    Selected: {product.selectedColor}
                  </p>
                )}
              </div>

              <div className="w-full flex justify-center mt-3">
                <button 
                  className="flex items-center justify-center bg-red-500 text-white px-4 py-2 rounded-md border-2 border-red-600 hover:bg-red-600 transition-colors"
                  style={{ fontFamily: "'Georgia', 'Times New Roman', 'Palatino', serif" }}
                >
                  <FiShoppingCart className="text-xl mr-1" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rest of your component remains the same... */}
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

      {/* Add product form - rest of your code remains the same */}
      {adding && (
        <div className="bg-white p-6 rounded-lg w-full max-w-2xl mb-6 shadow-md border">
          {/* ... your existing add product form code ... */}
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