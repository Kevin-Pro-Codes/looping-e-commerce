// src/pages/AdminPanel.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { 
  FiHeart, FiShoppingCart, FiPlus, FiTrash2, FiSearch, FiImage, 
  FiEdit, FiUpload, FiUsers, FiPackage, FiTruck, FiDollarSign, 
  FiBarChart2, FiSettings, FiMail, FiBell, FiUser, FiShoppingBag,
  FiPieChart, FiTrendingUp, FiTrendingDown, FiArchive, FiTag,
  FiCreditCard, FiTrello, FiSend, FiEye, FiDownload, FiKey,
  FiShield, FiMoon, FiDatabase, FiMessageSquare, FiBox,
  FiMapPin, FiRefreshCw, FiClipboard, FiCalendar, FiBarChart,
  FiLayers, FiAlertCircle, FiCheckCircle, FiClock, FiX,
  FiMenu, FiXCircle
} from "react-icons/fi";

// Mobile Responsive Components
const MobileHeader = ({ darkMode, setDarkMode, handleLogout, setMobileMenuOpen }) => (
  <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
    <div className="flex items-center space-x-3">
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 lg:hidden"
      >
        <FiMenu size={20} />
      </button>
      <h1 className="text-xl font-bold">Admin Panel</h1>
    </div>
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <FiMoon size={18} />
      </button>
      <button className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 relative">
        <FiBell size={18} />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>
    </div>
  </div>
);

const MobileSidebar = ({ activeTab, setActiveTab, mobileMenuOpen, setMobileMenuOpen, handleLogout }) => {
  const tabs = [
    { id: "dashboard", name: "Dashboard", icon: FiBarChart2 },
    { id: "stock", name: "Stock", icon: FiBox },
    { id: "products", name: "Products", icon: FiPackage },
    { id: "orders", name: "Orders", icon: FiShoppingBag },
    { id: "customers", name: "Customers", icon: FiUsers },
    { id: "delivery", name: "Delivery", icon: FiTruck },           
    { id: "promotions", name: "Promotions", icon: FiSend },
    { id: "reports", name: "Reports", icon: FiPieChart },
    { id: "settings", name: "Settings", icon: FiSettings }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg z-50 transform transition-transform lg:relative lg:translate-x-0 lg:shadow-none
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Navigation</h2>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 lg:hidden"
          >
            <FiXCircle size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{tab.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
          >
            <FiXCircle size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

// Responsive Container Component
const ResponsiveContainer = ({ children, className = "" }) => (
  <div className={`w-full max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 ${className}`}>
    {children}
  </div>
);

// Responsive Grid Components
const ResponsiveGrid = ({ children, className = "" }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 ${className}`}>
    {children}
  </div>
);

const StatsGrid = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {children}
  </div>
);

// Enhanced SaleProducts Component with Mobile Optimizations
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
    image: "",
    category: "",
    stock: 0,
    tags: "",
    variants: "",
    active: true,
    discount: 0
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  
  // EDIT MODAL STATE
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
    stock: 0,
    tags: "",
    variants: "",
    discount: 0
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
      let productsArray = [];
      
      if (Array.isArray(data)) {
        productsArray = data;
      } else if (data && Array.isArray(data.products)) {
        productsArray = data.products;
      } else if (data && Array.isArray(data.data)) {
        productsArray = data.data;
      } else {
        productsArray = [];
      }

      const normalized = productsArray.map((p) => ({
        _id: p._id?.$oid || p._id || Math.random().toString(),
        title: p.title || "No title",
        price: p.price || 0,
        description: p.description || "",
        image: p.image || "",
        category: p.category || "",
        stock: p.stock || 0,
        tags: p.tags || [],
        variants: p.variants || [],
        active: p.active !== undefined ? p.active : true,
        discount: p.discount || 0
      }));
      
      setProducts(normalized);
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // OPEN EDIT MODAL
  const openEditModal = (productId) => {
    const product = products.find(p => p._id === productId);
    if (product) {
      setEditingProduct(product);
      setEditFormData({
        title: product.title,
        price: product.price,
        description: product.description,
        category: product.category,
        stock: product.stock,
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : product.tags,       
        discount: product.discount
      });
    }
  };

  // CLOSE EDIT MODAL
  const closeEditModal = () => {
    setEditingProduct(null);
    setEditFormData({
      title: "",
      price: "",
      description: "",
      category: "",
      stock: 0,
      tags: "",
      discount: 0     
    });
  };

  // HANDLE EDIT FORM INPUT CHANGE
  const handleEditInputChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  // UPDATE PRODUCT
  const updateProduct = async () => {
    try {
      await fetch("/sanctum/csrf-cookie", { credentials: "include" });

      const token = decodeURIComponent(
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("XSRF-TOKEN="))
          ?.split("=")[1]
      );

      const productData = {
        ...editFormData,
        tags: editFormData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        variants: editFormData.variants.split(',').map(variant => variant.trim()).filter(variant => variant !== ''),
        stock: parseInt(editFormData.stock),
        discount: parseFloat(editFormData.discount)
      };

      const response = await fetch(`http://localhost:8000/api/products/${editingProduct._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": token,
        },
        credentials: "include",
        body: JSON.stringify(productData),
      });

      if (!response.ok) throw new Error("Failed to update product");

      const updatedProduct = await response.json();
      
      setProducts(products.map(product => 
        product._id === editingProduct._id 
          ? { ...product, ...productData }
          : product
      ));

      closeEditModal();
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleInputChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
  
    try {
      const API_BASE = 'http://localhost:8000';
      
      await fetch(`${API_BASE}/sanctum/csrf-cookie`, {
        credentials: "include",
      });
  
      const csrfToken = decodeURIComponent(
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("XSRF-TOKEN="))
          ?.split("=")[1]
      );

      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-XSRF-TOKEN': csrfToken,
          'Accept': 'application/json',
        },
        body: formData,
      });
  
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error('Server returned invalid JSON response');
      }
  
      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || 'Upload failed');
      }
  
      return data.imageUrl;
  
    } catch (error) {
      console.error("❌ Upload error:", error);
      throw error;
    }
  };

  const addProduct = async () => {
    try {
      let imageUrl = null;
      
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
        image: imageUrl,
        tags: newProduct.tags.split(',').map(tag => tag.trim()),
        variants: newProduct.variants.split(',').map(variant => variant.trim()),
        stock: parseInt(newProduct.stock),
        discount: parseFloat(newProduct.discount)
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
      setNewProduct({ 
        title: "", 
        price: "", 
        description: "", 
        image: "", 
        category: "",
        stock: 0,
        tags: "",
        variants: "",
        active: true,
        discount: 0
      });
      setSelectedFile(null);
      setImagePreview(null);
      
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      setUploading(false);
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

  const toggleProductStatus = async (id, currentStatus) => {
    try {
      await fetch("/sanctum/csrf-cookie", { credentials: "include" });

      const token = decodeURIComponent(
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("XSRF-TOKEN="))
          ?.split("=")[1]
      );

      const response = await fetch(`http://localhost:8000/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": token,
        },
        credentials: "include",
        body: JSON.stringify({ active: !currentStatus }),
      });

      if (!response.ok) throw new Error("Failed to update product status");

      setProducts(products.map(product => 
        product._id === id ? { ...product, active: !currentStatus } : product
      ));
    } catch (error) {
      console.error("Error updating product status:", error);
    }
  };

  const updateProductImage = async (productId, file) => {
    try {
      setUploading(true);
      
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

      setProducts(products.map(product => 
        product._id === productId ? { ...product, image: imageUrl } : product
      ));
      setEditingImage(null);
      setSelectedFile(null);
      
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

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const bestSellingProducts = products.filter(p => p.stock < 10).slice(0, 5);
  const lowStockProducts = products.filter(p => p.stock < 5).slice(0, 5);

  return (
    <ResponsiveContainer className="py-4">
      {/* Search Bar and Add Button */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 w-full">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
          />
          <FiSearch className="absolute left-3 top-3.5 text-gray-400" size={18} />
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-3 rounded-lg flex items-center justify-center transition-colors text-sm md:text-base whitespace-nowrap"
        >
          <FiPlus className="mr-2" size={16} />
          Add Product
        </button>
      </div>

      {/* Stock Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2 flex items-center text-sm md:text-base">
            <FiTrendingUp className="mr-2" size={16} />
            Best Selling Products
          </h3>
          <div className="space-y-2">
            {bestSellingProducts.map(product => (
              <div key={product._id} className="flex justify-between items-center text-xs md:text-sm">
                <span className="text-yellow-700 truncate flex-1 mr-2">{product.title}</span>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                  Stock: {product.stock}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2 flex items-center text-sm md:text-base">
            <FiTrendingDown className="mr-2" size={16} />
            Low Stock Alert
          </h3>
          <div className="space-y-2">
            {lowStockProducts.map(product => (
              <div key={product._id} className="flex justify-between items-center text-xs md:text-sm">
                <span className="text-red-700 truncate flex-1 mr-2">{product.title}</span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                  Only {product.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add product form */}
      {adding && (
        <div className="bg-white p-4 md:p-6 rounded-lg w-full mb-6 shadow-md border">
          <h3 className="text-lg font-semibold mb-4 text-black">Add New Product</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text" name="title" placeholder="Product Title" value={newProduct.title} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded text-black text-sm md:text-base" />
            <input type="number" name="price" placeholder="Price" value={newProduct.price} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded text-black text-sm md:text-base" />
            <input type="number" name="stock" placeholder="Stock Quantity" value={newProduct.stock} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded text-black text-sm md:text-base" />
            <input type="number" name="discount" placeholder="Discount %" value={newProduct.discount} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded text-black text-sm md:text-base" />
          </div>
          <textarea name="description" placeholder="Description" value={newProduct.description} onChange={handleInputChange} className="w-full mt-3 p-3 border border-gray-300 rounded text-black text-sm md:text-base" rows="3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <input type="text" name="category" placeholder="Category" value={newProduct.category} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded text-black text-sm md:text-base" />
            <input type="text" name="tags" placeholder="Tags (comma separated)" value={newProduct.tags} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded text-black text-sm md:text-base" />
          </div>
          
          {/* File Upload for New Product */}
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors p-2">
                <FiUpload className="text-gray-400 mb-2" size={24} />
                <span className="text-xs text-gray-500 text-center">Click to upload</span>
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

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4">
            <button 
              onClick={addProduct} 
              disabled={uploading}
              className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <FiPlus className="mr-2" size={16} />
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
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-6 py-2 rounded-lg text-sm md:text-base"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 md:p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-black">Edit Product</h3>
              <button 
                onClick={closeEditModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Title</label>
                <input 
                  type="text" 
                  name="title" 
                  value={editFormData.title} 
                  onChange={handleEditInputChange}
                  className="w-full p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                <input 
                  type="number" 
                  name="price" 
                  value={editFormData.price} 
                  onChange={handleEditInputChange}
                  className="w-full p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                <input 
                  type="number" 
                  name="stock" 
                  value={editFormData.stock} 
                  onChange={handleEditInputChange}
                  className="w-full p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
                <input 
                  type="number" 
                  name="discount" 
                  value={editFormData.discount} 
                  onChange={handleEditInputChange}
                  className="w-full p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea 
                name="description" 
                value={editFormData.description} 
                onChange={handleEditInputChange}
                rows="3"
                className="w-full p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input 
                  type="text" 
                  name="category" 
                  value={editFormData.category} 
                  onChange={handleEditInputChange}
                  className="w-full p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <input 
                  type="text" 
                  name="tags" 
                  value={editFormData.tags} 
                  onChange={handleEditInputChange}
                  placeholder="cotton, premium, casual (comma separated)"
                  className="w-full p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button 
                onClick={updateProduct}
                className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-lg flex items-center justify-center transition-colors text-sm md:text-base"
              >
                <FiEdit className="mr-2" size={16} />
                Update Product
              </button>
              <button 
                onClick={closeEditModal}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-6 py-3 rounded-lg transition-colors text-sm md:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products grid */}
      {loading && <p className="text-black mt-4 text-lg text-center">Loading products...</p>}
      {!loading && filteredProducts.length === 0 && products.length > 0 && (
        <p className="text-black mt-4 text-center">No products found matching your search.</p>
      )}
      {!loading && products.length === 0 && <p className="text-black mt-4 text-center">No products loaded.</p>}

      <ResponsiveGrid>
        {filteredProducts.map((product) => {
          const isFavorited = favorites.includes(product._id);

          return (
            <div key={product._id} className="relative bg-white rounded-xl shadow-lg flex flex-col items-center p-3 border border-gray-200 duration-300 hover:shadow-xl transition-all">
              
              {/* Delete button */}
              <button
                className="absolute top-2 left-2 transition-colors duration-300 text-red-600 hover:text-red-800 z-10"
                onClick={() => deleteProduct(product._id)}
              >
                <FiTrash2 size={20} style={{ stroke: "red", strokeWidth: 2, fill: isFavorited ? "red" : "white" }} />
              </button>

              {/* Status toggle button */}
              <button
                className="absolute top-2 right-2 transition-colors duration-300 z-10"
                onClick={() => toggleProductStatus(product._id, product.active)}
              >
                <div className={`w-3 h-3 rounded-full ${product.active ? 'bg-green-500' : 'bg-red-500'}`} />
              </button>

              {/* Product Image Area */}
              <div className="h-40 w-full pt-2 relative flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors mb-3">
                {product.image ? (
                  <>
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      className="w-full h-full object-contain rounded-lg"
                    />
                    {/* Change image overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center transition-all rounded-lg cursor-pointer"
                         onClick={() => setEditingImage(product._id)}>
                      <div className="bg-white bg-opacity-90 p-2 rounded-full">
                        <FiEdit className="text-blue-600" size={16} />
                      </div>
                    </div>
                  </>
                ) : (
                  <div 
                    className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
                    onClick={() => setEditingImage(product._id)}
                  >
                    <FiImage size={32} className="mb-2" />
                    <span className="text-xs font-medium">Add Image</span>
                  </div>
                )}
              </div>
  
              <div className="w-full text-center space-y-2">
                {/* Product Title */}
                <h3 className="text-sm font-bold text-black line-clamp-2 min-h-[2.5rem]">
                  {product.title || "Untitled Product"}
                </h3>
                
                {/* Product Price */}
                <p className="text-lg font-semibold text-black">
                  ${product.price ? parseFloat(product.price).toFixed(2) : "0.00"}
                </p>
              </div>

              <div className="w-full mt-3">
                <button
                  className="flex items-center justify-center bg-blue-500 text-white w-full py-2 rounded-lg border-2 border-blue-600 hover:bg-blue-600 transition-colors text-sm"
                  onClick={() => openEditModal(product._id)}
                >
                  <FiEdit className="mr-2" size={14} />
                  Edit Product
                </button>
              </div>
            </div>
          );
        })}
      </ResponsiveGrid>

      {/* Enhanced Image Update Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 md:p-6 rounded-lg w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 text-black">Update Product Image</h3>
            
            {/* Current Image Preview */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Current Image:</p>
              {(() => {
                const productBeingEdited = products.find(p => p._id === editingImage);
                const imageUrl = productBeingEdited?.image;
                const hasError = imageErrors[editingImage];
                
                if (imageUrl && !hasError) {
                  return (
                    <img 
                      src={imageUrl} 
                      alt="Current" 
                      className="w-full max-h-48 object-contain rounded-lg border mb-4"
                      onError={() => {
                        setImageErrors(prev => ({...prev, [editingImage]: true}));
                      }}
                    />
                  );
                } else {
                  return (
                    <div className="w-full h-48 bg-gray-100 rounded-lg flex flex-col items-center justify-center mb-4">
                      <FiImage className="text-gray-400" size={48} />
                      <p className="text-sm text-gray-500 mt-2">
                        {imageUrl ? 'Error!' : 'No image'}
                      </p>
                    </div>
                  );
                }
              })()}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select New Image</label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors p-4">
                <FiUpload className="text-gray-400 mb-2" size={24} />
                <span className="text-sm text-gray-500 text-center">Click to upload new image</span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setSelectedFile(file);
                      const previewUrl = URL.createObjectURL(file);
                      setImagePreview(previewUrl);
                    }
                  }}
                  className="hidden"
                />
              </label>
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-2">Selected: {selectedFile.name}</p>
              )}
            </div>

            {imagePreview && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">New Image Preview:</p>
                <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-contain rounded-lg border" />
              </div>
            )}

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button 
                onClick={() => {
                  if (selectedFile) {
                    updateProductImage(editingImage, selectedFile);
                  }
                }}
                disabled={!selectedFile || uploading}
                className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <FiImage className="mr-2" size={16} />
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
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-6 py-2 rounded-lg text-sm md:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </ResponsiveContainer>
  );
};

// ENHANCED STOCK MANAGEMENT WITH COLOR AND SIZE VARIANTS
const StockManagement = () => {
  const [stockSearch, setStockSearch] = useState("");
  
  // Enhanced stock items with color and size variants
  const [stockItems, setStockItems] = useState([
    {
      id: 1,
      productId: "PROD-001",
      name: "Camiseta Finito Branca",
      sku: "CT-FINITO-WHITE",
      category: "Roupas",
      supplier: "Fabricante A",
      cost: 15.00,
      lastUpdated: "2024-01-15",
      variants: [
        { color: "Branco", size: "P", stock: 10, reserved: 2, incoming: 5 },
        { color: "Branco", size: "M", stock: 15, reserved: 3, incoming: 0 },
        { color: "Branco", size: "G", stock: 8, reserved: 1, incoming: 10 },
        { color: "Branco", size: "GG", stock: 5, reserved: 0, incoming: 0 }
      ]
    },
    {
      id: 2,
      productId: "PROD-002",
      name: "Camiseta Finito Preta",
      sku: "CT-FINITO-BLACK",
      category: "Roupas",
      supplier: "Fabricante A",
      cost: 15.00,
      lastUpdated: "2024-01-15",
      variants: [
        { color: "Preto", size: "P", stock: 0, reserved: 0, incoming: 20 },
        { color: "Preto", size: "M", stock: 3, reserved: 2, incoming: 0 },
        { color: "Preto", size: "G", stock: 7, reserved: 1, incoming: 0 },
        { color: "Preto", size: "GG", stock: 2, reserved: 0, incoming: 0 }
      ]
    },
  ]);

  // Calculate overall status for each product
  const getProductStatus = (variants) => {
    const totalStock = variants.reduce((sum, variant) => sum + variant.stock, 0);
    const totalIncoming = variants.reduce((sum, variant) => sum + variant.incoming, 0);
    
    if (totalStock === 0 && totalIncoming === 0) return "Out of Stock";
    if (totalStock === 0 && totalIncoming > 0) return "Incoming Stock";
    if (totalStock <= 10) return "Low Stock";
    return "In Stock";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "In Stock": return "bg-green-100 text-green-800 border border-green-200";
      case "Low Stock": return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "Incoming Stock": return "bg-blue-100 text-blue-800 border border-blue-200";
      case "Out of Stock": return "bg-red-100 text-red-800 border border-red-200";
      default: return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const updateVariantStock = (productId, color, size, newStock) => {
    setStockItems(prev => prev.map(product => 
      product.id === productId 
        ? {
            ...product,
            variants: product.variants.map(variant =>
              variant.color === color && variant.size === size
                ? { ...variant, stock: parseInt(newStock) || 0 }
                : variant
            ),
            lastUpdated: new Date().toISOString().split('T')[0]
          }
        : product
    ));
  };

  const addIncomingStock = (productId, color, size, quantity) => {
    setStockItems(prev => prev.map(product => 
      product.id === productId 
        ? {
            ...product,
            variants: product.variants.map(variant =>
              variant.color === color && variant.size === size
                ? { ...variant, incoming: variant.incoming + quantity }
                : variant
            )
          }
        : product
    ));
  };

  const receiveIncomingStock = (productId, color, size) => {
    setStockItems(prev => prev.map(product => 
      product.id === productId 
        ? {
            ...product,
            variants: product.variants.map(variant =>
              variant.color === color && variant.size === size
                ? { 
                    ...variant, 
                    stock: variant.stock + variant.incoming,
                    incoming: 0 
                  }
                : variant
            ),
            lastUpdated: new Date().toISOString().split('T')[0]
          }
        : product
    ));
  };

  // Calculate totals for display
  const calculateProductTotals = (variants) => {
    return {
      totalStock: variants.reduce((sum, v) => sum + v.stock, 0),
      totalReserved: variants.reduce((sum, v) => sum + v.reserved, 0),
      totalIncoming: variants.reduce((sum, v) => sum + v.incoming, 0),
      availableStock: variants.reduce((sum, v) => sum + (v.stock - v.reserved), 0)
    };
  };

  const filteredStockItems = stockItems.filter(item =>
    item.name.toLowerCase().includes(stockSearch.toLowerCase()) ||
    item.sku.toLowerCase().includes(stockSearch.toLowerCase()) ||
    item.category.toLowerCase().includes(stockSearch.toLowerCase())
  );

  return (
    <ResponsiveContainer className="space-y-6 py-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h2 className="text-xl font-semibold">Stock Management</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <input
              type="text"
              placeholder="Search stock items..."
              value={stockSearch}
              onChange={(e) => setStockSearch(e.target.value)}
              className="w-full p-3 pl-10 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" size={16} />
          </div>
          <button className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 flex items-center justify-center text-sm md:text-base whitespace-nowrap">
            <FiPlus className="mr-2" size={16} />
            Add Stock Item
          </button>
        </div>
      </div>

      {/* Stock Overview Cards */}
      <StatsGrid>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stockItems.length}</p>
            </div>
            <FiPackage className="text-2xl text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Variants</p>
              <p className="text-2xl font-bold text-gray-900">
                {stockItems.reduce((sum, item) => sum + item.variants.length, 0)}
              </p>
            </div>
            <FiLayers className="text-2xl text-purple-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {stockItems.filter(item => getProductStatus(item.variants) === "Low Stock").length}
              </p>
            </div>
            <FiAlertCircle className="text-2xl text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {stockItems.filter(item => getProductStatus(item.variants) === "Out of Stock").length}
              </p>
            </div>
            <FiAlertCircle className="text-2xl text-red-500" />
          </div>
        </div>
      </StatsGrid>

      {/* Stock Items with Variants */}
      <div className="space-y-6">
        {filteredStockItems.map((product) => {
          const totals = calculateProductTotals(product.variants);
          const status = getProductStatus(product.variants);
          
          return (
            <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Product Header */}
              <div className="bg-gray-50 p-4 md:p-6 border-b">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-1 text-sm text-gray-600">
                      <span>SKU: {product.sku}</span>
                      <span>Category: {product.category}</span>
                      <span>Supplier: {product.supplier}</span>
                      <span>Cost: ${product.cost}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                      {status}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      Updated: {product.lastUpdated}
                    </div>
                  </div>
                </div>
                
                {/* Product Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">{totals.totalStock}</div>
                    <div className="text-gray-500">Total Stock</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{totals.totalReserved}</div>
                    <div className="text-gray-500">Reserved</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{totals.availableStock}</div>
                    <div className="text-gray-500">Available</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{totals.totalIncoming}</div>
                    <div className="text-gray-500">Incoming</div>
                  </div>
                </div>
              </div>

              {/* Variants Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {product.variants.map((variant, index) => {
                      const available = variant.stock - variant.reserved;
                      const variantStatus = variant.stock === 0 
                        ? (variant.incoming > 0 ? "Incoming" : "Out of Stock")
                        : (variant.stock <= 5 ? "Low Stock" : "In Stock");
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div 
                                className="w-4 h-4 rounded-full border border-gray-300 mr-2"
                                style={{ 
                                  backgroundColor: variant.color === 'Branco' ? '#FFFFFF' :
                                                variant.color === 'Preto' ? '#000000' :
                                                variant.color === 'Cinza' ? '#808080' : '#D3D3D3'
                                }}
                              />
                              <span className="text-sm font-medium text-gray-900">{variant.color}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{variant.size}</td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              value={variant.stock}
                              onChange={(e) => updateVariantStock(product.id, variant.color, variant.size, e.target.value)}
                              className="w-20 p-2 border border-gray-300 rounded text-sm text-black text-center"
                              min="0"
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-center">
                            <span className={available <= 0 ? "text-red-600" : "text-green-600"}>
                              {available}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button 
                              onClick={() => addIncomingStock(product.id, variant.color, variant.size, 10)}
                              className="text-blue-600 hover:text-blue-900 text-xs bg-blue-100 px-2 py-1 rounded"
                            >
                              Order +
                            </button>
                            {variant.incoming > 0 && (
                              <button
                                onClick={() => receiveIncomingStock(product.id, variant.color, variant.size)}
                                className="text-green-600 hover:text-green-800 text-xs bg-green-100 px-2 py-1 rounded"
                              >
                                Receive
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </ResponsiveContainer>
  );
};

// MAIN ADMIN PANEL COMPONENT
const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search states
  const [productSearch, setProductSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [deliverySearch, setDeliverySearch] = useState("");
  const [stockSearch, setStockSearch] = useState("");

  // Dashboard stats
  const [dashboardStats] = useState({
    totalSales: 12450,
    totalUsers: 892,
    totalOrders: 345,
    totalRevenue: 45280,
    revenueChange: 12.5,
    salesChange: 8.2,
    userChange: 15.7,
    orderChange: -3.4
  });

  // Sample data arrays remain the same as your original code
  const [orders, setOrders] = useState([...]);
  const [customers, setCustomers] = useState([...]);
  const [deliveries, setDeliveries] = useState([...]);
  const [coupons, setCoupons] = useState([...]);
  const [adminUsers, setAdminUsers] = useState([...]);
  const [deliverySettings, setDeliverySettings] = useState({...});

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
    navigate("/login");
  };

  // All your existing filter functions, status functions, and update functions remain the same
  const filteredOrders = orders.filter(order => ...);
  const filteredCustomers = customers.filter(customer => ...);
  const filteredDeliveries = deliveries.filter(delivery => ...);

  const getStatusColor = (status) => { ... };
  const getDeliveryStatusColor = (status) => { ... };
  const getStockStatusColor = (status) => { ... };

  const updateOrderStatus = (orderId, newStatus) => { ... };
  const updateDeliveryStatus = (deliveryId, newStatus) => { ... };
  const toggleCustomerStatus = (customerId, currentStatus) => { ... };

  // All your existing render functions (renderDashboard, renderOrders, etc.) remain exactly the same
  // Just make sure they use the responsive components where needed

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <StatsGrid>
        <div className="bg-white p-4 md:p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">${dashboardStats.totalSales.toLocaleString()}</p>
            </div>
            <FiTrendingUp className={`text-2xl ${dashboardStats.salesChange >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
          <p className={`text-sm mt-2 ${dashboardStats.salesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {dashboardStats.salesChange >= 0 ? '+' : ''}{dashboardStats.salesChange}% from last month
          </p>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalUsers}</p>
            </div>
            <FiUsers className={`text-2xl ${dashboardStats.userChange >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
          <p className={`text-sm mt-2 ${dashboardStats.userChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {dashboardStats.userChange >= 0 ? '+' : ''}{dashboardStats.userChange}% from last month
          </p>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalOrders}</p>
            </div>
            <FiShoppingBag className={`text-2xl ${dashboardStats.orderChange >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
          <p className={`text-sm mt-2 ${dashboardStats.orderChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {dashboardStats.orderChange >= 0 ? '+' : ''}{dashboardStats.orderChange}% from last month
          </p>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${dashboardStats.totalRevenue.toLocaleString()}</p>
            </div>
            <FiDollarSign className={`text-2xl ${dashboardStats.revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
          <p className={`text-sm mt-2 ${dashboardStats.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {dashboardStats.revenueChange >= 0 ? '+' : ''}{dashboardStats.revenueChange}% from last month
          </p>
        </div>
      </StatsGrid>

      {/* Rest of your dashboard content remains the same */}
      {/* ... */}
    </div>
  );

  // Other render functions remain exactly the same as your original code
  const renderProducts = () => <SaleProducts />;
  const renderOrders = () => ( ... );
  const renderCustomers = () => ( ... );
  const renderDelivery = () => ( ... );
  const renderStock = () => <StockManagement />;
  const renderPromotion = () => ( ... );
  const renderSettings = () => ( ... );
  const renderReports = () => ( ... );

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}`}>
      <div className="flex">
        {/* Mobile Sidebar */}
        <MobileSidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          handleLogout={handleLogout}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-0">
          {/* Mobile Header */}
          <MobileHeader 
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            handleLogout={handleLogout}
            setMobileMenuOpen={setMobileMenuOpen}
          />

          {/* Main Content Area */}
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <ResponsiveContainer>
              {/* Welcome Section */}
              <div className="mb-6">
                <p className="text-lg">Welcome, Admin!</p>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  You have successfully logged in as an administrator.
                </p>
              </div>

              {/* Tab Content */}
              <div className="mt-6">
                {activeTab === "dashboard" && renderDashboard()}
                {activeTab === "products" && renderProducts()}
                {activeTab === "orders" && renderOrders()}
                {activeTab === "customers" && renderCustomers()}
                {activeTab === "delivery" && renderDelivery()}
                {activeTab === "stock" && renderStock()}
                {activeTab === "promotions" && renderPromotion()}
                {activeTab === "reports" && renderReports()}
                {activeTab === "settings" && renderSettings()}
              </div>
            </ResponsiveContainer>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;