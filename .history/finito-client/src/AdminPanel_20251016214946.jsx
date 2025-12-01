// src/pages/AdminPanel.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiHeart, FiShoppingCart, FiPlus, FiTrash2, FiSearch, FiImage, FiEdit, FiUpload } from "react-icons/fi";

const SaleProducts = () => {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingImage, setEditingImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: "",
    price: "",
    description: "",
    image: null,
    category: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Upload image and get URL
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.url; // Assuming API returns { url: 'image-url' }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Add product with image upload
  const addProduct = async () => {
    try {
      let imageUrl = null;
      
      // Upload image if selected
      if (selectedFile) {
        setUploading(true);
        imageUrl = await uploadImage(selectedFile);
        setUploading(false);
      }

      await fetch("/sanctum/csrf-cookie", { credentials: "include" });

      const token = decodeURIComponent(
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("XSRF-TOKEN="))
          ?.split("=")[1]
      );

      const productData = {
        ...newProduct,
        image: imageUrl
      };

      const response = await fetch("http://localhost:8000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": token,
        },
        credentials: "include",
        body: JSON.stringify(productData),
      });

      const data = await response.json();
      const added = {
        _id: data._id?.$oid || data._id || Math.random().toString(),
        ...data,
      };
      setProducts([added, ...products]);
      setAdding(false);
      setNewProduct({ title: "", price: "", description: "", image: null, category: "" });
      setSelectedFile(null);
      setImagePreview(null);
      
      // Clean up preview URL
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      setUploading(false);
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

  // Update product image
  const updateProductImage = async (productId, file) => {
    try {
      setUploading(true);
      
      // Upload new image
      const imageUrl = await uploadImage(file);

      await fetch("/sanctum/csrf-cookie", { credentials: "include" });

      const token = decodeURIComponent(
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("XSRF-TOKEN="))
          ?.split("=")[1]
      );

      const response = await fetch(`http://localhost:8000/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": token,
        },
        credentials: "include",
        body: JSON.stringify({ image: imageUrl }),
      });

      if (!response.ok) throw new Error("Failed to update product image");

      // Update local state
      setProducts(products.map(product => 
        product._id === productId ? { ...product, image: imageUrl } : product
      ));
      setEditingImage(null);
      setSelectedFile(null);
      
      // Clean up preview URL
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
    } catch (error) {
      console.error("Error updating product image:", error);
    } finally {
      setUploading(false);
    }
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto my-4 flex flex-col items-center p-5">
      {/* Search Bar and Add Button */}
      <div className="flex space-x-4 mb-4 w-full max-w-2xl">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Pesquisar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FiSearch className="absolute left-3 top-3.5 text-gray-400" size={18} />
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-lg flex items-center transition-colors"
        >
          <FiPlus className="mr-2" />
          Add Product
        </button>
      </div>

      {/* Add product form */}
      {adding && (
        <div className="bg-white p-6 rounded-lg w-full max-w-2xl mb-6 shadow-md border">
          <h3 className="text-lg font-semibold mb-4 text-black">Add New Product</h3>
          <input type="text" name="title" placeholder="Product Title" value={newProduct.title} onChange={handleInputChange} className="w-full mb-3 p-3 border border-gray-300 rounded text-black" />
          <input type="number" name="price" placeholder="Price" value={newProduct.price} onChange={handleInputChange} className="w-full mb-3 p-3 border border-gray-300 rounded text-black" />
          <input type="text" name="description" placeholder="Description" value={newProduct.description} onChange={handleInputChange} className="w-full mb-3 p-3 border border-gray-300 rounded text-black" />
          
          {/* File Upload for New Product */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
            <div className="flex items-center space-x-4">
              <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                <FiUpload className="text-gray-400 mb-2" size={24} />
                <span className="text-sm text-gray-500 text-center">Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              {imagePreview && (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                </div>
              )}
            </div>
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-2">Selected: {selectedFile.name}</p>
            )}
          </div>

          <input type="text" name="category" placeholder="Category" value={newProduct.category} onChange={handleInputChange} className="w-full mb-4 p-3 border border-gray-300 rounded text-black" />
          <div className="flex space-x-3">
            <button 
              onClick={addProduct} 
              disabled={uploading}
              className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <FiPlus className="mr-2" />
                  Create Product
                </>
              )}
            </button>
            <button 
              onClick={() => {
                setAdding(false);
                setSelectedFile(null);
                if (imagePreview) {
                  URL.revokeObjectURL(imagePreview);
                  setImagePreview(null);
                }
              }} 
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-6 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Image Update Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-black">Update Product Image</h3>
            
            {/* File Upload for Existing Product */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select New Image</label>
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors p-4">
                <FiUpload className="text-gray-400 mb-2" size={32} />
                <span className="text-sm text-gray-500 text-center">Click to upload new image</span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-2">Selected: {selectedFile.name}</p>
              )}
            </div>

            {imagePreview && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-contain rounded-lg border" />
              </div>
            )}

            <div className="flex space-x-3">
              <button 
                onClick={() => updateProductImage(editingImage, selectedFile)}
                disabled={!selectedFile || uploading}
                className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <FiImage className="mr-2" />
                    Update Image
                  </>
                )}
              </button>
              <button 
                onClick={() => {
                  setEditingImage(null);
                  setSelectedFile(null);
                  if (imagePreview) {
                    URL.revokeObjectURL(imagePreview);
                    setImagePreview(null);
                  }
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-6 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products grid */}
      {loading && <p className="text-black mt-4 text-lg">Loading products...</p>}
      {!loading && filteredProducts.length === 0 && products.length > 0 && (
        <p className="text-black mt-4">No products found matching your search.</p>
      )}
      {!loading && products.length === 0 && <p className="text-black mt-4">No products loaded.</p>}

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full">
        {filteredProducts.map((product) => {
          const isFavorited = favorites.includes(product._id);
          return (
            <div key={product._id} className="relative bg-white rounded-2xl shadow-xl flex flex-col items-center p-4 border-1 border-black duration-300 hover:shadow-2xl transition-all">
              {/* Delete button left */}
              {!editingImage && (
  <button
    className="absolute top-3 left-3 transition-colors duration-300 text-red-600 hover:text-red-800 z-50"
    onClick={() => deleteProduct(product._id)}
  >
    <FiTrash2 size={24} style={{ stroke: "red", strokeWidth: 2, fill: isFavorited ? "red" : "white" }} />
  </button>
)}

{/* Favorite button */}
{!editingImage && (
  <button className="absolute top-3 right-3 transition-colors duration-300 z-50">
    <FiHeart size={24} style={{ stroke: "black", strokeWidth: 2, fill: isFavorited ? "red" : "white" }} />
  </button>
)}

              {/* Product Image Area - Clickable */}
              <div className="h-25 w-25 mb-3 relative flex items-center justify-center bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                {product.image ? (
                  <>
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      className="w-full h-full object-contain rounded-xl"
                    />
                    {/* Edit Image Overlay */}
                    <button
                      onClick={() => {
                        setEditingImage(product._id);
                        setSelectedFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center transition-all rounded-xl group"
                    >
                      <div className="bg-white bg-opacity-90 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <FiEdit className="text-blue-600" size={20} />
                      </div>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setEditingImage(product._id);
                      setSelectedFile(null);
                      setImagePreview(null);
                    }}
                    className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <FiImage size={48} className="mb-2" />
                    <span className="text-sm font-medium"></span>
                  </button>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-bold mb-1 text-black text-center">{product.title}</h2>

              <p className="text-black font-semibold text-md sm:text-lg text-center">${product.price}</p>

              {product.description && <p className="text-black text-sm mt-1 text-center line-clamp-2">{product.description}</p>}

              {product.category && <p className="text-blue-600 text-xs mt-1 text-center bg-blue-50 px-2 py-1 rounded-full">{product.category}</p>}

              <div className="w-full flex justify-center mt-3">
                <button className="flex items-center justify-center bg-red-500 text-white px-4 py-2 rounded-lg border-2 border-red-600 hover:bg-red-600 transition-colors">
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

const AdminPanel = () => {
  const navigate = useNavigate();

  // Search states for different sections
  const [productSearch, setProductSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [deliverySearch, setDeliverySearch] = useState("");

  // Sample data for orders, customers, and deliveries
  const [orders] = useState([
    { id: 1, orderId: "#ORD-001", customer: "João Silva", email: "joao@email.com", product: "Camiseta Finito", quantity: 2, total: 89.90, payment: "Cartão de Crédito", city: "São Paulo, SP", status: "Em Preparação" },
    { id: 2, orderId: "#ORD-002", customer: "Maria Santos", email: "maria@email.com", product: "Boné Finito", quantity: 1, total: 45.00, payment: "PIX", city: "Rio de Janeiro, RJ", status: "Enviado" },
    { id: 3, orderId: "#ORD-003", customer: "Pedro Costa", email: "pedro@email.com", product: "Caneca Finito", quantity: 3, total: 75.00, payment: "Boleto", city: "Belo Horizonte, MG", status: "Pendente" }
  ]);

  const [customers] = useState([
    { id: 1, name: "João Silva", email: "joao@email.com", phone: "+55 11 99999-9999", cpf: "123.456.789-00", address: "Rua das Flores, 123 - São Paulo, SP", orders: 5, totalSpent: 450.00 },
    { id: 2, name: "Maria Santos", email: "maria@email.com", phone: "+55 21 88888-8888", cpf: "987.654.321-00", address: "Av. Copacabana, 456 - Rio de Janeiro, RJ", orders: 3, totalSpent: 180.00 },
    { id: 3, name: "Pedro Costa", email: "pedro@email.com", phone: "+55 31 77777-7777", cpf: "456.789.123-00", address: "Rua da Liberdade, 789 - Belo Horizonte, MG", orders: 2, totalSpent: 120.00 }
  ]);

  const [deliveries] = useState([
    { id: 1, orderId: "#ORD-002", customer: "Maria Santos", product: "Boné Finito", price: 45.00, city: "Rio de Janeiro, RJ", status: "Enviado", tracking: "BR123456789" },
    { id: 2, orderId: "#ORD-001", customer: "João Silva", product: "Camiseta Finito", price: 89.90, city: "São Paulo, SP", status: "Em Preparação", tracking: "Preparando envio" }
  ]);

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

  // Filter functions
  const filteredOrders = orders.filter(order =>
    order.orderId.toLowerCase().includes(orderSearch.toLowerCase()) ||
    order.customer.toLowerCase().includes(orderSearch.toLowerCase()) ||
    order.product.toLowerCase().includes(orderSearch.toLowerCase()) ||
    order.status.toLowerCase().includes(orderSearch.toLowerCase())
  );

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.address.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredDeliveries = deliveries.filter(delivery =>
    delivery.orderId.toLowerCase().includes(deliverySearch.toLowerCase()) ||
    delivery.customer.toLowerCase().includes(deliverySearch.toLowerCase()) ||
    delivery.product.toLowerCase().includes(deliverySearch.toLowerCase()) ||
    delivery.status.toLowerCase().includes(deliverySearch.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Enviado": return "bg-green-100 text-green-800";
      case "Em Preparação": return "bg-yellow-100 text-yellow-800";
      case "Pendente": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black p-15 mt-30">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
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

        {/* Market Products Management Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Manage Market Products</h2>
          </div>
          <SaleProducts />
        </div>

        {/* Orders Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search orders..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full p-2 pl-10 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
          </div>
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
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderId}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.customer}</div>
                        <div className="text-sm text-gray-500">{order.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.product}</div>
                        <div className="text-sm text-gray-500">Qty: {order.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ {order.total.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.payment === "Cartão de Crédito" ? "bg-green-100 text-green-800" :
                          order.payment === "PIX" ? "bg-blue-100 text-blue-800" :
                          "bg-purple-100 text-purple-800"
                        }`}>
                          {order.payment}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.city}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                        <button className="text-green-600 hover:text-green-900">Update</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Customer Information Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Customer Information</h2>
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search customers..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full p-2 pl-10 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2">{customer.name}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Email:</strong> {customer.email}</p>
                  <p><strong>Phone:</strong> {customer.phone}</p>
                  <p><strong>CPF:</strong> {customer.cpf}</p>
                  <p><strong>Address:</strong> {customer.address}</p>
                  <p><strong>Orders:</strong> {customer.orders}</p>
                  <p><strong>Total Spent:</strong> R$ {customer.totalSpent.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Tracking Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Delivery Tracking</h2>
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search deliveries..."
                value={deliverySearch}
                onChange={(e) => setDeliverySearch(e.target.value)}
                className="w-full p-2 pl-10 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-4">
              {filteredDeliveries.map((delivery) => (
                <div key={delivery.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold">{delivery.orderId} - {delivery.customer}</h4>
                    <p className="text-sm text-gray-600">{delivery.product} - R$ {delivery.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{delivery.city}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                      {delivery.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">Tracking: {delivery.tracking}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;