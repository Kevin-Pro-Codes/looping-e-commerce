import React, { useState } from "react";
import axios from "axios";
import { FiHeart, FiShoppingCart, FiPlus } from "react-icons/fi";

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

  axios.defaults.baseURL = "http://localhost:8000";
  axios.defaults.withCredentials = true;
  axios.defaults.headers.common['Accept'] = 'application/json';
  axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/products");
      const data = Array.isArray(response.data) ? response.data : [];
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

  const handleInputChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

 const addProduct = async () => {
    try {
      console.log("Getting CSRF cookie...");
      await getCsrfCookie();
      console.log("CSRF cookie obtained, sending POST request...");

      const response = await axios.post("/api/products", newProduct);

      const added = {
        _id: response.data._id?.$oid || response.data._id,
        ...response.data,
      };
      setProducts([added, ...products]);
      setAdding(false);
      setNewProduct({ title: "", price: "", description: "", image: "", category: "" });
    } catch (error) {
      console.error("Error adding product:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);


  return (
    <div className="max-w-[1400px] mx-auto my-4 flex flex-col items-center p-5">
      {/* Load and Add buttons */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={loadProducts}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-md"
        >
          {loading ? "Loading..." : "Load"}
        </button>

        <button
          onClick={() => setAdding(!adding)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-md flex items-center"
        >
          Add
        </button>
      </div>

      {/* Add product form */}
      {adding && (
        <div className="bg-white p-4 rounded-md w-full max-w-xl mb-4">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={newProduct.title}
            onChange={handleInputChange}
            className="w-full mb-2 p-2 border rounded text-black"
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={newProduct.price}
            onChange={handleInputChange}
            className="w-full mb-2 p-2 border rounded text-black"
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={newProduct.description}
            onChange={handleInputChange}
            className="w-full mb-2 p-2 border rounded text-black"
          />
          <input
            type="text"
            name="image"
            placeholder="Image URL"
            value={newProduct.image}
            onChange={handleInputChange}
            className="w-full mb-2 p-2 border rounded text-black"
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={newProduct.category}
            onChange={handleInputChange}
            className="w-full mb-2 p-2 border rounded text-black"
          />
          <button
            onClick={addProduct}
            className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-md mt-2"
          >
            <FiPlus className="mr-1" />
          </button>
        </div>
      )}

      {/* Products grid */}
      {products.length === 0 && !loading && (
        <p className="text-black mt-2">No products loaded.</p>
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

              <h2 className="text-lg sm:text-xl font-bold mb-1 text-black text-center">
                {product.title}
              </h2>

              <p className="text-black font-semibold text-md sm:text-lg text-center">
                ${product.price}
              </p>

              {product.description && (
                <p className="text-black text-sm mt-1 text-center">
                  {product.description}
                </p>
              )}

              <div className="w-full flex justify-center mt-2">
                <button className="flex items-center justify-center bg-red-500 text-black px-4 py-2 rounded-md border-2 border-black hover:bg-red-600 transition-colors">
                  <FiShoppingCart className="text-xl mr-1" />
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
