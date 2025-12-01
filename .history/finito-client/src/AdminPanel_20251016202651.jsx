// src/pages/AdminPanel.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiHeart, FiShoppingCart, FiPlus, FiTrash2 } from "react-icons/fi";

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

  // Delete product
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

  return (
    <div className="max-w-[1400px] mx-auto my-4 flex flex-col items-center p-5">
      {/* Add button only */}
      <div className="flex space-x-2 mb-4">
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

      {/* Products grid */}
      {loading && <p className="text-black mt-2">Loading...</p>}
      {!loading && products.length === 0 && <p className="text-black mt-2">No products loaded.</p>}

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
        {products.map((product) => {
          const isFavorited = favorites.includes(product._id);
          return (
            <div key={product._id} className="relative bg-white rounded-2xl shadow-xl flex flex-col items-center p-4 border-1 border-black duration-300">
              {/* Delete button left */}
              <button
                className="absolute top-3 left-3 transition-colors duration-300 text-red-600"
                onClick={() => deleteProduct(product._id)}
              >
                <FiTrash2 size={24} />
              </button>

              {/* Favorite button right */}
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
      
    </div>
  );
};

const AdminPanel = () => {
  const navigate = useNavigate();

  // State for market products
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

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Admin Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Product Management</h3>
              <ul className="list-disc ml-6 text-sm text-gray-600">
                <li>Add new products</li>
                <li>Edit existing products</li>
                <li>Delete products</li>
                <li>Manage inventory</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">User Management</h3>
              <ul className="list-disc ml-6 text-sm text-gray-600">
                <li>View all users</li>
                <li>Manage user accounts</li>
                <li>View user analytics</li>
                <li>Handle user support</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Order Management</h3>
              <ul className="list-disc ml-6 text-sm text-gray-600">
                <li>View all orders</li>
                <li>Track deliveries</li>
                <li>Manage payments</li>
                <li>Customer information</li>
              </ul>
            </div>
          </div>
        </div>

        {/* SaleProducts Component */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Product Management</h2>
          <SaleProducts />
        </div>

        {/* Orders Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto drawer-scroll">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#ORD-001</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">João Silva</div>
                      <div className="text-sm text-gray-500">joao@email.com</div>
                      <div className="text-sm text-gray-500">+55 11 99999-9999</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Camiseta Finito</div>
                      <div className="text-sm text-gray-500">Qty: 2</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ 89,90</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Cartão de Crédito
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">São Paulo, SP</div>
                      <div className="text-sm text-gray-500">Rua das Flores, 123</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Em Preparação
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                      <button className="text-green-600 hover:text-green-900">Update</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#ORD-002</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Maria Santos</div>
                      <div className="text-sm text-gray-500">maria@email.com</div>
                      <div className="text-sm text-gray-500">+55 21 88888-8888</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Boné Finito</div>
                      <div className="text-sm text-gray-500">Qty: 1</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ 45,00</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        PIX
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Rio de Janeiro, RJ</div>
                      <div className="text-sm text-gray-500">Av. Copacabana, 456</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Enviado
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                      <button className="text-green-600 hover:text-green-900">Update</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#ORD-003</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Pedro Costa</div>
                      <div className="text-sm text-gray-500">pedro@email.com</div>
                      <div className="text-sm text-gray-500">+55 31 77777-7777</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Caneca Finito</div>
                      <div className="text-sm text-gray-500">Qty: 3</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ 75,00</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Boleto
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Belo Horizonte, MG</div>
                      <div className="text-sm text-gray-500">Rua da Liberdade, 789</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Pendente
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                      <button className="text-green-600 hover:text-green-900">Update</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Customer Information Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">João Silva</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Email:</strong> joao@email.com</p>
                <p><strong>Phone:</strong> +55 11 99999-9999</p>
                <p><strong>CPF:</strong> 123.456.789-00</p>
                <p><strong>Address:</strong> Rua das Flores, 123 - São Paulo, SP</p>
                <p><strong>Orders:</strong> 5</p>
                <p><strong>Total Spent:</strong> R$ 450,00</p>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Maria Santos</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Email:</strong> maria@email.com</p>
                <p><strong>Phone:</strong> +55 21 88888-8888</p>
                <p><strong>CPF:</strong> 987.654.321-00</p>
                <p><strong>Address:</strong> Av. Copacabana, 456 - Rio de Janeiro, RJ</p>
                <p><strong>Orders:</strong> 3</p>
                <p><strong>Total Spent:</strong> R$ 180,00</p>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Pedro Costa</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Email:</strong> pedro@email.com</p>
                <p><strong>Phone:</strong> +55 31 77777-7777</p>
                <p><strong>CPF:</strong> 456.789.123-00</p>
                <p><strong>Address:</strong> Rua da Liberdade, 789 - Belo Horizonte, MG</p>
                <p><strong>Orders:</strong> 2</p>
                <p><strong>Total Spent:</strong> R$ 120,00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Tracking Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Delivery Tracking</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold">Order #ORD-002 - Maria Santos</h4>
                  <p className="text-sm text-gray-600">Boné Finito - R$ 45,00</p>
                  <p className="text-sm text-gray-500">Rio de Janeiro, RJ</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Enviado
                  </span>
                  <p className="text-sm text-gray-500 mt-1">Tracking: BR123456789</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold">Order #ORD-001 - João Silva</h4>
                  <p className="text-sm text-gray-600">Camiseta Finito - R$ 89,90</p>
                  <p className="text-sm text-gray-500">São Paulo, SP</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Em Preparação
                  </span>
                  <p className="text-sm text-gray-500 mt-1">Preparando envio</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Market Products Management Section */}
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
                
      </div>
    </div>
  );
};

export default AdminPanel;