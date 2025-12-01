import React, { useState, useEffect } from "react";
import {
FiHeart,
FiShoppingCart,
FiPlus,
} from "react-icons/fi";
import { IoIosArrowRoundForward, IoIosArrowRoundBack } from "react-icons/io";
import { Link, Routes, Route, useParams, useNavigate } from "react-router-dom";

// ============================
// Product Detail Component
// ============================
const ProductDetail = ({ products }) => {
const { id } = useParams();
const navigate = useNavigate();

const product = products.find((p) => p._id === id);

if (!product) {
return ( <div className="max-w-4xl mx-auto p-4 text-center"> <p className="text-red-500 text-lg">Product not found.</p>
<button
onClick={() => navigate(-1)}
className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
>
Go Back </button> </div>
);
}

return ( <div className="max-w-5xl mx-auto p-6 flex flex-col md:flex-row gap-6 bg-white rounded-2xl shadow-md"> <div className="flex-1"> <img
       src={product.image}
       alt={product.title}
       className="w-full h-auto object-contain rounded-xl"
     /> </div>

```
  <div className="flex-1 flex flex-col gap-4">
    <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
    <p className="text-2xl font-semibold text-gray-700">${product.price}</p>
    <p className="text-gray-600">{product.description}</p>
    <p className="text-sm text-gray-500">Category: {product.category}</p>

    {product.size?.length > 0 && (
      <div>
        <h3 className="font-semibold mb-1">Available Sizes:</h3>
        <div className="flex gap-2">
          {product.size.map((s) => (
            <span
              key={s}
              className="px-3 py-1 border rounded-md bg-gray-100"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    )}

    {product.color && (
      <div>
        <h3 className="font-semibold mb-1">Colors:</h3>
        <div className="flex gap-2">
          {Array.isArray(product.color) ? (
            product.color.map((c) => (
              <span
                key={c}
                className="w-6 h-6 rounded-full border"
                style={{ backgroundColor: c }}
              />
            ))
          ) : (
            <span
              className="w-6 h-6 rounded-full border"
              style={{ backgroundColor: product.color }}
            />
          )}
        </div>
      </div>
    )}

    <button
      onClick={() => navigate(-1)}
      className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 w-max"
    >
      Go Back
    </button>
  </div>
</div>
```

);
};

// ============================
// SaleProducts Component
// ============================
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

const [currentPage, setCurrentPage] = useState(1);
const [productsPerPage] = useState(20);

const loadProducts = async () => {
setLoading(true);
try {
const response = await fetch("[http://localhost:8000/api/products](http://localhost:8000/api/products)", {
credentials: "include",
});

```
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  const data = await response.json();
  const normalized = Array.isArray(data)
    ? data.map((p) => ({
        _id: p._id?.$oid || p._id || Math.random().toString(),
        title: p.title || "No title",
        price: p.price || 0,
        description: p.description || "",
        image: p.image || "",
        category: p.category || "",
        size: p.size || ["P", "M", "G"],
        color: p.color || "#000000",
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

const handleInputChange = (e) =>
setNewProduct({ ...newProduct, [e.target.name]: e.target.value });

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

```
setProducts([newProductWithId, ...products]);
setAdding(false);
setNewProduct({
  title: "",
  price: "",
  description: "",
  image: "",
  category: "",
  size: [],
  color: "",
});
```

};

const indexOfLastProduct = currentPage * productsPerPage;
const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
const totalPages = Math.ceil(products.length / productsPerPage);

const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

const getPageNumbers = () => {
const pageNumbers = [];
const maxPagesToShow = 5;
if (totalPages <= maxPagesToShow) {
for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
} else if (currentPage <= 3) {
for (let i = 1; i <= 4; i++) pageNumbers.push(i);
pageNumbers.push("...");
pageNumbers.push(totalPages);
} else if (currentPage >= totalPages - 2) {
pageNumbers.push(1);
pageNumbers.push("...");
for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
} else {
pageNumbers.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
}
return pageNumbers;
};

return ( <div className="max-w-[1400px] mx-auto my-4 flex flex-col items-center p-5"> <Routes>
<Route
path="/"
element={
<>
{loading && <p className="text-black mt-2">Loading...</p>}
{!loading && products.length === 0 && ( <p className="text-black mt-2">No products loaded.</p>
)}
{!loading && products.length > 0 && ( <div className="w-full mb-4 flex justify-between items-center"> <p className="text-black text-lg">
Mostrando {indexOfFirstProduct + 1}-
{Math.min(indexOfLastProduct, products.length)} de {products.length} produtos </p> <p className="text-black text-lg">
Página {currentPage} de {totalPages} </p> </div>
)}

```
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {currentProducts.map((product) => {
              const isFavorited = favorites.includes(product._id);
              return (
                <div
                  key={product._id}
                  className="relative bg-white rounded-2xl shadow-xl flex flex-col items-center p-4 border duration-300 hover:shadow-2xl transition-all"
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
                    <Link to={`/product/${product._id}`}>
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-auto max-h-[220px] object-contain rounded-xl mb-3"
                      />
                    </Link>
                  )}

                  <p className="text-xl sm:text-2xl font-bold mb-1 text-black text-center">
                    <Link to={`/product/${product._id}`}>{product.title}</Link>
                  </p>

                  <p className="text-xl sm:text-2xl font-bold mb-1 text-black text-center">
                    ${product.price}
                  </p>

                  <div className="w-full flex justify-center mt-3">
                    <button className="flex items-center justify-center bg-red-500 text-white px-4 py-2 rounded-md border-2 border-red-600 hover:bg-red-600 transition-colors">
                      <FiShoppingCart className="text-xl mr-1" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

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
                <IoIosArrowRoundBack size={26} />
              </button>

              <div className="flex space-x-2">
                {getPageNumbers().map((number, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      typeof number === "number" && setCurrentPage(number)
                    }
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
                <IoIosArrowRoundForward size={26} />
              </button>
            </div>
          )}
        </>
      }
    />
    <Route path="/product/:id" element={<ProductDetail products={products} />} />
  </Routes>
</div>
```

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