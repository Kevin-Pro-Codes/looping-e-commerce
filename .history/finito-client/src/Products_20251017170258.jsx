import React, { useState, useEffect } from "react";
import { FiHeart, FiShoppingCart, FiPlus, FiChevronLeft, FiChevronRight } from "react-icons/fi";


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
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20); // Show 20 products per page

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
            image: p.image || null,
            category: p.category || "",
          }))
        : [];
      setProducts(normalized);
    } catch (error) {
      console.error("Error loading products:", error);
    }
    setLoading(false);
  };

  // Fetch products automatically when component mounts
  useEffect(() => {
    loadProducts();
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  // Add product
  const addProduct = async () => {
    try {
      await fetch("/sanctum/csrf-cookie", { credentials: "include" });

      const token = decodeURIComponent(
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("XSRF-TOKEN="))
          ?.split("=")[1]
      );

      const response = await fetch("http://localhost:8000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": token,
        },
        credentials: "include",
        body: JSON.stringify(newProduct),
      });

      const data = await response.json();
      const added = {
        _id: data._id?.$oid || data._id || Math.random().toString(),
        ...data,
      };
      setProducts([added, ...products]);
      setAdding(false);
      setNewProduct({ title: "", price: "", description: "", image: "", category: "" });
    } catch (error) {
      console.error("Error adding product:", error);
    }
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
    const maxPagesToShow = 5; // Maximum page numbers to show in pagination
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages are less than maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show limited pages with ellipsis
      if (currentPage <= 3) {
        // Show first 4 pages and last page
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show first page and last 4 pages
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Show pages around current page
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
          <p className="text-black text-sm">
            Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, products.length)} of {products.length} products
          </p>
          <p className="text-black text-sm">
            Page {currentPage} of {totalPages}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
        {currentProducts.map((product) => {
          const isFavorited = favorites.includes(product._id);
          return (
            <div key={product._id} className="relative bg-white rounded-2xl shadow-xl flex flex-col items-center p-4 border-1 border-black duration-300">
              <button className="absolute top-3 right-3 transition-colors duration-300">
                <FiHeart size={24} style={{ stroke: "black", strokeWidth: 1.5, fill: isFavorited ? "red" : "none" }} />
              </button>

              {product.image && <img src={product.image} alt={product.title} className="w-full h-auto max-h-[220px] object-contain rounded-xl mb-3" />}

              <h2 className="text-lg sm:text-xl font-bold mb-1 text-black text-center">{product.title}</h2>

              <p className="text-black font-semibold text-md sm:text-lg text-center">${product.price}</p>

              {product.description && <p className="text-black text-sm mt-1 text-center">{product.description}</p>}

              <div className="w-full flex justify-center mt-2">
                <button className="flex items-center justify-center bg-red-500 text-black px-4 py-2 rounded-md border-2 border-black hover:bg-red-600 transition-colors">
                  <FiShoppingCart className="text-xl mr-1" />
                </button>
              </div>
            </div>
          );
        })}
      </div>


{/* Pagination Controls */}
{!loading && products.length > productsPerPage && (
  <div className="flex justify-center items-center space-x-4 mt-8">
    {/* Previous Button */}
    <button
      onClick={prevPage}
      disabled={currentPage === 1}
      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 text-2xl font-extrabold transition-all duration-200 ${
        currentPage === 1
          ? 'bg-gray-200 text-gray-500 border-gray-400 cursor-not-allowed'
          : 'bg-white text-gray-900 border-black hover:bg-gray-100 hover:scale-105'
      }`}
    >
      <FiChevronLeft size={26} />
    </button>

    {/* Page Numbers - Circular Buttons */}
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

    {/* Next Button */}
    <button
      onClick={nextPage}
      disabled={currentPage === totalPages}
      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 text-2xl font-extrabold transition-all duration-200 ${
        currentPage === totalPages
          ? 'bg-gray-200 text-gray-500 border-gray-400 cursor-not-allowed'
          : 'bg-white text-gray-900 border-black hover:bg-gray-100 hover:scale-105'
      }`}
    >
      <FiChevronRight size={26} />
    </button>
  </div>
)}






      {/* Add product form - hidden since Add button is removed */}
      {adding && (
        <div className="bg-white p-4 rounded-md w-full max-w-xl mb-4">
          <input type="text" name="title" placeholder="Title" value={newProduct.title} onChange={handleInputChange} className="w-full mb-2 p-2 border rounded text-black" />
          <input type="number" name="price" placeholder="Price" value={newProduct.price} onChange={handleInputChange} className="w-full mb-2 p-2 border rounded text-black" />
          <input type="text" name="description" placeholder="Description" value={newProduct.description} onChange={handleInputChange} className="w-full mb-2 p-2 border rounded text-black" />
          <input type="text" name="image" placeholder="Image URL" value={newProduct.image} onChange={handleInputChange} className="w-full mb-2 p-2 border rounded text-black" />
          <input type="text" name="category" placeholder="Category" value={newProduct.category} onChange={handleInputChange} className="w-full mb-2 p-2 border rounded text-black" />
          <button onClick={addProduct} className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-md mt-2">
            <FiPlus className="mr-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SaleProducts;