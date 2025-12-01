import React, { useState } from "react";
import axios from "axios";
import { FiHeart, FiShoppingCart } from "react-icons/fi";

const SaleProducts = () => {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/products"); // your Laravel route
      const data = Array.isArray(response.data) ? response.data : [];

      // normalize MongoDB ObjectId
      const normalized = data.map((p) => ({
        _id: p._id?.$oid || p._id || Math.random().toString(),
        title: p.title || "No title",
        price: p.price || 0,
        description: p.description || "",
        image: p.image || null,
      }));

      setProducts(normalized);
    } catch (error) {
      console.error("Error loading products:", error);
    }
    setLoading(false);
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto my-4 flex flex-col items-center p-5">
      <button
        onClick={loadProducts}
        disabled={loading}
        className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-md mb-4"
      >
        {loading ? "Loading..." : "Load"}
      </button>

      {products.length === 0 && !loading && (
        <p className="text-gray-500 mt-2">No products loaded.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
        {products.map((product) => {
          const isFavorited = favorites.includes(product._id);
          return (
            <div
              key={product._id}
              className="relative bg-white rounded-2xl shadow-xl flex flex-col items-center p-4 border-1 border-black duration-300"
            >
              <button
                className="absolute top-3 right-3 transition-colors duration-300"
                onClick={() => toggleFavorite(product._id)}
              >
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

              <h2 className="text-lg sm:text-xl font-bold mb-1 text-gray-800 text-center">
                {product.title}
              </h2>

              <p className="text-red-500 font-semibold text-md sm:text-lg text-center">
                ${product.price}
              </p>

              {product.description && (
                <p className="text-gray-600 text-sm mt-1 text-center">
                  {product.description}
                </p>
              )}

              <div className="w-full flex justify-center mt-2">
                <button className="flex items-center justify-center bg-red-500 text-black px-4 py-2 rounded-md border-2 border-black hover:bg-red-600 transition-colors">
                  <FiShoppingCart className="text-xl mr-1" />
                  Add to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SaleProducts;
