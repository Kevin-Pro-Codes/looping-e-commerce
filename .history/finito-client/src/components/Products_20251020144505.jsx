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
      console.log("🔄 Fetching products from API...");
      const response = await fetch("http://localhost:8000/api/products", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Raw API response:", data);
      
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
            console.log(`📦 Product ${index}:`, {
              title: normalizedProduct.title,
              image: normalizedProduct.image,
              hasImage: !!normalizedProduct.image
            });
            return normalizedProduct;
          })
        : [];
      
      console.log("🎯 Final normalized products:", normalized);
      setProducts(normalized);
    } catch (error) {
      console.error("❌ Error loading products:", error);
    }
    setLoading(false);
  };

  // Fetch products automatically when component mounts
  useEffect(() => {
    loadProducts();
  }, []);

  // Log when products state changes
  useEffect(() => {
    if (products.length > 0) {
      console.log("🔄 Products state updated - checking images:");
      products.forEach((product, index) => {
        console.log(`   Product ${index}: "${product.title}" - Image: "${product.image}"`);
      });
    }
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

    console.log("➕ Adding product:", newProductWithId);
    
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

  // Handle image loading errors
  const handleImageError = (e, product) => {
    console.error(`❌ Image failed to load for "${product.title}":`, product.image);
    e.target.style.display = 'none';
    // Optionally show a placeholder
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
    e.target.style.display = 'block';
  };

  const handleImageLoad = (e, product) => {
    console.log(`✅ Image loaded successfully for "${product.title}":`, product.image);
  };

  return (
    <div className="max-w-[1400px] mx-auto my-4 flex flex-col items-center p-5">
 
      {/* Debug Info */}
      <div className="w-full mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-blue-800 font-bold mb-2">🔍 Debug Information:</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          <div><strong>Total Products:</strong> {products.length}</div>
          <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
          <div><strong>Current Page:</strong> {currentPage}</div>
          <div><strong>Products with Images:</strong> {products.filter(p => p.image).length}</div>
          <div><strong>Products without Images:</strong> {products.filter(p => !p.image).length}</div>
        </div>
      </div>

      {/* Products grid */}
      {loading && <p className="text-black mt-2">Loading...</p>}
      {!loading && products.length === 0 && <p className="text-black mt-2">No products loaded.</p>}

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
          console.log(`🎨 Rendering product: "${product.title}" with image: "${product.image}"`);
          
          return (
            <div key={product._id} className="relative bg-white rounded-2xl shadow-xl flex flex-col items-center p-4 border-1 border-black duration-300 hover:shadow-2xl transition-all">
              <button className="absolute top-3 right-3 transition-colors duration-300">
                <FiHeart size={24} style={{ stroke: "black", strokeWidth: 1.5, fill: isFavorited ? "red" : "none" }} />
              </button>

              {/* Image with error handling */}
              <div className="w-full h-[220px] flex items-center justify-center mb-3 bg-gray-100 rounded-xl">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.title} 
                    className="w-full h-full object-contain rounded-xl"
                    onError={(e) => handleImageError(e, product)}
                    onLoad={(e) => handleImageLoad(e, product)}
                  />
                ) : (
                  <div className="text-gray-500 text-center">
                    <div className="text-4xl mb-2">📷</div>
                    <div className="text-sm">No Image</div>
                  </div>
                )}
              </div>

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
          {/* ... your existing pagination code ... */}
        </div>
      )}

      {/* Add product form */}
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