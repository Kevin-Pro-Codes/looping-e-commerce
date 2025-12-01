import React, { useState, useEffect } from "react";
import {
FiHeart,
FiShoppingCart,
FiPlus,
FiChevronLeft,
FiChevronRight,
} from "react-icons/fi";

const SaleProducts = () => {
const [products, setProducts] = useState([]);
const [favorites, setFavorites] = useState([]);
const [loading, setLoading] = useState(false);
const [adding, setAdding] = useState(false);

const [newProduct, setNewProduct] = useState({
title: "",
price: "",
image: "",
category: "",
sizes: ["P", "M", "G"], // Default sizes
color: "#000000", // Default color
});

// Pagination state
const [currentPage, setCurrentPage] = useState(1);
const [productsPerPage] = useState(20);

// Fetch and normalize products
const loadProducts = async () => {
setLoading(true);
try {
const response = await fetch("[http://localhost:8000/api/products](http://localhost:8000/api/products)", {
credentials: "include",
});

```
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  const defaultColors = ["#FFFFFF", "#000000", "#0000FF", "#FF69B4"];

  const normalized = Array.isArray(data)
    ? data.map((p) => ({
        _id: p._id?.$oid || p._id || Math.random().toString(),
        title: p.title || "Untitled Product",
        price: p.price || 0,
        image: p.image || null,
        category: p.category || "",
        sizes: ["P", "M", "G"],
        color:
          defaultColors[Math.floor(Math.random() * defaultColors.length)],
      }))
    : [];

  setProducts(normalized);
} catch (error) {
  console.error("Error loading products:", error);
}
setLoading(false);
```

};

useEffect(() => {
loadProducts();
}, []);

// Input handler for new product form
const handleInputChange = (e) => {
setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
};

// Add new product manually (frontend only)
const addProduct = async () => {
const added = {
_id: Math.random().toString(),
...newProduct,
};
setProducts([added, ...products]);
setAdding(false);
setNewProduct({
title: "",
price: "",
image: "",
category: "",
sizes: ["P", "M", "G"],
color: "#000000",
});
};

// Pagination logic
const indexOfLastProduct = currentPage * productsPerPage;
const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
const currentProducts = products.slice(
indexOfFirstProduct,
indexOfLastProduct
);
const totalPages = Math.ceil(products.length / productsPerPage);

const paginate = (pageNumber) => setCurrentPage(pageNumber);
const nextPage = () => {
if (currentPage < totalPages) setCurrentPage(currentPage + 1);
};
const prevPage = () => {
if (currentPage > 1) setCurrentPage(currentPage - 1);
};

const getPageNumbers = () => {
const numbers = [];
const max = 5;

```
if (totalPages <= max) {
  for (let i = 1; i <= totalPages; i++) numbers.push(i);
} else {
  if (currentPage <= 3) {
    for (let i = 1; i <= 4; i++) numbers.push(i);
    numbers.push("...");
    numbers.push(totalPages);
  } else if (currentPage >= totalPages - 2) {
    numbers.push(1);
    numbers.push("...");
    for (let i = totalPages - 3; i <= totalPages; i++) numbers.push(i);
  } else {
    numbers.push(1);
    numbers.push("...");
    for (let i = currentPage - 1; i <= currentPage + 1; i++)
      numbers.push(i);
    numbers.push("...");
    numbers.push(totalPages);
  }
}

return numbers;
```

};

return ( <div className="max-w-[1400px] mx-auto my-4 flex flex-col items-center p-5">
{loading && <p className="text-black mt-2">Loading...</p>}
{!loading && products.length === 0 && ( <p className="text-black mt-2">No products loaded.</p>
)}

```
  {!loading && products.length > 0 && (
    <div className="w-full mb-4 flex justify-between items-center">
      <p className="text-black text-lg">
        Showing {indexOfFirstProduct + 1}-
        {Math.min(indexOfLastProduct, products.length)} of {products.length}{" "}
        products
      </p>
      <p className="text-black text-lg">
        Page {currentPage} of {totalPages}
      </p>
    </div>
  )}

  {/* Product Grid */}
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
    {currentProducts.map((product) => {
      const isFavorited = favorites.includes(product._id);
      return (
        <div
          key={product._id}
          className="relative bg-white rounded-2xl shadow-xl flex flex-col items-center p-4 border border-black duration-300"
        >
          <button className="absolute top-3 right-3 transition-colors duration-300">
            <FiHeart
              size={24}
              style={{
                stroke: "black",
                strokeWidth: 1.5,
                fill: isFavorited ? "red" : "none",
              }}
            />
          </button>

          {product.image && (
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-auto max-h-[220px] object-contain rounded-xl mb-3"
            />
          )}

          <h2 className="text-lg sm:text-xl font-bold mb-1 text-black text-center">
            {product.title}
          </h2>

          <p className="text-black font-semibold text-md sm:text-lg text-center">
            ${product.price}
          </p>

          {/* Sizes */}
          <div className="flex justify-center gap-2 mt-2">
            {product.sizes.map((size) => (
              <span
                key={size}
                className="w-8 h-8 flex items-center justify-center text-xs font-bold border border-black rounded-md"
              >
                {size}
              </span>
            ))}
          </div>

          {/* Color */}
          <div className="flex justify-center mt-2">
            <div
              className="w-8 h-8 rounded-full border border-gray-400"
              style={{ backgroundColor: product.color }}
            />
          </div>

          <div className="w-full flex justify-center mt-3">
            <button className="flex items-center justify-center bg-red-500 text-black px-4 py-2 rounded-md border-2 border-black hover:bg-red-600 transition-colors">
              <FiShoppingCart className="text-xl mr-1" />
            </button>
          </div>
        </div>
      );
    })}
  </div>

  {/* Pagination */}
  {!loading && products.length > productsPerPage && (
    <div className="flex justify-center items-center space-x-4 mt-8">
      <button
        onClick={prevPage}
        disabled={currentPage === 1}
        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 text-2xl font-extrabold transition-all duration-200 ${
          currentPage === 1
            ? "bg-gray-200 text-gray-500 border-gray-400 cursor-not-allowed"
            : "bg-white text-gray-900 border-black hover:bg-gray-100 hover:scale-105"
        }`}
      >
        <FiChevronLeft size={26} />
      </button>

      <div className="flex space-x-2">
        {getPageNumbers().map((number, index) => (
          <button
            key={index}
            onClick={() => typeof number === "number" && paginate(number)}
            className={`w-10 h-10 flex items-center justify-center rounded-full font-semibold text-lg transition-all duration-200 border-2 ${
              number === currentPage
                ? "bg-red-600 text-white scale-110 border-black shadow-md"
                : number === "..."
                ? "bg-transparent text-gray-500 cursor-default text-xl border-transparent"
                : "bg-white text-gray-700 hover:bg-gray-100 hover:scale-105 border-black"
            }`}
            disabled={number === "..."}
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
            ? "bg-gray-200 text-gray-500 border-gray-400 cursor-not-allowed"
            : "bg-white text-gray-900 border-black hover:bg-gray-100 hover:scale-105"
        }`}
      >
        <FiChevronRight size={26} />
      </button>
    </div>
  )}

  {/* Add Product Form */}
  {adding && (
    <div className="bg-white p-6 rounded-lg w-full max-w-2xl mb-6 shadow-md border">
      <h3 className="text-lg font-semibold mb-4 text-black">
        Add New Product
      </h3>

      <input
        type="text"
        name="title"
        placeholder="Product Title"
        value={newProduct.title}
        onChange={handleInputChange}
        className="w-full mb-3 p-3 border border-gray-300 rounded text-black"
      />

      <input
        type="number"
        name="price"
        placeholder="Price"
        value={newProduct.price}
        onChange={handleInputChange}
        className="w-full mb-3 p-3 border border-gray-300 rounded text-black"
      />

      {/* Size Selector */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sizes
        </label>
        <div className="flex space-x-3">
          {["P", "M", "G"].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => {
                if (newProduct.sizes.includes(size)) {
                  setNewProduct({
                    ...newProduct,
                    sizes: newProduct.sizes.filter((s) => s !== size),
                  });
                } else {
                  setNewProduct({
                    ...newProduct,
                    sizes: [...newProduct.sizes, size],
                  });
                }
              }}
              className={`w-12 h-12 flex items-center justify-center border-2 rounded-lg font-bold transition-all duration-200 ${
                newProduct.sizes.includes(size)
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-gray-300 hover:bg-gray-100"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Color Selector */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color
        </label>
        <div className="flex space-x-3">
          {["#FFFFFF", "#000000", "#0000FF", "#FF69B4"].map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setNewProduct({ ...newProduct, color })}
              className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                newProduct.color === color
                  ? "border-black ring-2 ring-offset-1 ring-black"
                  : "border-gray-300"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <input
        type="text"
        name="image"
        placeholder="Image URL"
        value={newProduct.image}
        onChange={handleInputChange}
        className="w-full mb-3 p-3 border border-gray-300 rounded text-black"
      />

      <input
        type="text"
        name="category"
        placeholder="Category"
        value={newProduct.category}
        onChange={handleInputChange}
        className="w-full mb-3 p-3 border border-gray-300 rounded text-black"
      />

      <button
        onClick={addProduct}
        className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2 rounded-lg flex items-center mt-3"
      >
        <FiPlus className="mr-2" />
        Add Product
      </button>
    </div>
  )}
</div>


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