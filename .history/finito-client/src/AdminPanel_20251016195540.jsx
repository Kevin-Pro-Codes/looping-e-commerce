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

  // Add new product
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

  // Remove product
  const handleRemoveProduct = (id) => {
    setProducts(products.filter((product) => product.id !== id));
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

        <div className="mb-6">
          <p className="text-lg">Welcome, Admin 👋</p>
          <p className="text-gray-600">You have successfully logged in as an administrator.</p>
        </div>

        {/* Admin Controls */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Admin Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Product Management Placeholder */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Product Management</h3>
              <ul className="list-disc ml-6 text-sm text-gray-600">
                <li>Add new products</li>
                <li>Edit existing products</li>
                <li>Delete products</li>
                <li>Manage inventory</li>
              </ul>
            </div>
            {/* User & Order Management... */}
          </div>
        </div>

        {/* New Product Management Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Manage Market Products</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                placeholder="Product Name"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                className="p-2 border border-gray-300 rounded flex-1"
              />
              <input
                type="number"
                placeholder="Price"
                value={newProductPrice}
                onChange={(e) => setNewProductPrice(e.target.value)}
                className="p-2 border border-gray-300 rounded w-32"
              />
              <button
                onClick={handleAddProduct}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>

            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Price (R$)</th>
                  <th className="px-6 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-2 whitespace-nowrap">{product.name}</td>
                    <td className="px-6 py-2 whitespace-nowrap">{product.price.toFixed(2)}</td>
                    <td className="px-6 py-2 whitespace-nowrap">
                      <button
                        onClick={() => handleRemoveProduct(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ...Rest of your sections like Orders, Customers, Delivery Tracking */}
      </div>
    </div>
  );
};

export default AdminPanel;
