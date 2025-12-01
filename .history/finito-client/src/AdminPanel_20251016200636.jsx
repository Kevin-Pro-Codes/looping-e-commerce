// src/pages/AdminPanel.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiHeart, FiShoppingCart, FiPlus, FiTrash2 } from "react-icons/fi";

const AdminPanel = () => {
  const navigate = useNavigate();

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

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (isAdmin !== "true") {
      navigate("/");
    } else {
      loadProducts();
    }
  }, [navigate]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/products", {
        credentials: "include",
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

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

  const handleInputChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const addProduct = async () => {
    if (!newProduct.title || !newProduct.price) return;

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

  const deleteProduct = async (id) => {
    try {
      await fetch("/sanctum/csrf-cookie", { credentials: "include" });

      const token = decodeURIComponent(
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("XSRF-TOKEN="))
          ?.split("=")[1]
      );

      const response = await fetch(`http://localhost:8000/api/products/${id}`, {
        method: "DELETE",
        headers: { "X-XSRF-TOKEN": token },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete product");

      setProducts(products.filter((product) => product._id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("loginStateChange"));
    navigate("/logar");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black p-15 mt-30">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Manage Market Products</h2>
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setAdding(!adding)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-md flex items-center"
            >
              Add
            </button>
          </div>

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
                className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-md mt-2 flex items-center"
              >
                <FiPlus className="mr-1" /> Add Product
              </button>
            </div>
          )}

          {loading && <p className="text-black mt-2">Loading...</p>}
          {!loading && products.length === 0 && <p className="text-black mt-2">No products loaded.</p>}

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {products.map((product) => {
              const isFavorited = favorites.includes(product._id);
              return (
                <div
                  key={product._id}
                  className="relative bg-white rounded-2xl shadow-xl flex flex-col items-center p-4 border-1 border-black duration-300"
                >
                  <button
                    className="absolute top-3 left-3 transition-colors duration-300 text-red-600"
                    onClick={() => deleteProduct(product._id)}
                  >
                    <FiTrash2 size={24} />
                  </button>

                  <button className="absolute top-3 right-3 transition-colors duration-300">
                    <FiHeart
                      size={24}
                      style={{ stroke: "black", strokeWidth: 1.5, fill: isFavorited ? "red" : "none" }}
                    />
                  </button>

                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-auto max-h-[220px] object-contain rounded-xl mb-3"
                    />
                  )}

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
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
