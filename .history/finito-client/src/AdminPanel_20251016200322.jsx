// src/pages/AdminPanel.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminPanel = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([
    { id: 1, name: "Camiseta Finito", price: 44.95 },
    { id: 2, name: "Boné Finito", price: 45.0 },
    { id: 3, name: "Caneca Finito", price: 25.0 },
  ]);
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (isAdmin !== "true") {
      navigate("/"); 
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("loginStateChange"));
    navigate("/logar");
  };

  const handleAddProduct = () => {
    if (!newProductName || !newProductPrice) return;

    const newProduct = {
      id: Date.now(),
      name: newProductName,
      price: parseFloat(newProductPrice),
    };

    setProducts([...products, newProduct]);
    setNewProductName("");
    setNewProductPrice("");
  };

  const handleRemoveProduct = (id) => {
    setProducts(products.filter((product) => product.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Add Product Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Add New Product</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Product Name"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              className="border border-black rounded-md px-2 py-1 flex-1"
            />
            <input
              type="number"
              placeholder="Price"
              value={newProductPrice}
              onChange={(e) => setNewProductPrice(e.target.value)}
              className="border border-black rounded-md px-2 py-1 w-24"
            />
            <button
              onClick={handleAddProduct}
              className="px-4 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
            >
              Add
            </button>
          </div>
        </div>

        {/* Product List */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Products</h2>
          <ul className="space-y-2">
            {products.map((product) => (
              <li
                key={product.id}
                className="flex justify-between items-center border-b border-gray-200 py-2"
              >
                <span>{product.name} - ${product.price.toFixed(2)}</span>
                <button
                  onClick={() => handleRemoveProduct(product.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
