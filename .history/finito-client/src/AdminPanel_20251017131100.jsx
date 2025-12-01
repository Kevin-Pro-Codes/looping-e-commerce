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
  FiLayers, FiAlertCircle, FiCheckCircle, FiClock
} from "react-icons/fi";

// SALE PRODUCTS COMPONENT - ADDED THE MISSING COMPONENT
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
    stock: 0,
    tags: "",
    variants: "",
    active: true,
    discount: 0
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      console.log("Fetching products from:", "http://localhost:8000/api/products");
      
      const response = await fetch("http://localhost:8000/api/products", {
        credentials: "include",
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Raw API response:", data);
      console.log("Is array?", Array.isArray(data));

      // Handle different response formats
      let productsArray = [];
      
      if (Array.isArray(data)) {
        productsArray = data;
      } else if (data && Array.isArray(data.products)) {
        productsArray = data.products;
      } else if (data && Array.isArray(data.data)) {
        productsArray = data.data;
      } else {
        console.log("Unexpected API response format:", data);
        productsArray = [];
      }
      
      console.log("Final products array:", productsArray);

      const normalized = productsArray.map((p) => ({
        _id: p._id?.$oid || p._id || Math.random().toString(),
        title: p.title || "No title",
        price: p.price || 0,
        description: p.description || "",
        image: p.image || null,
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
      setProducts([]); // Ensure products is always an array
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

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
      const response = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
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
        image: null, 
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

      {/* Stock Indicators */}
      <div className="w-full mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
            <FiTrendingUp className="mr-2" />
            Best Selling Products
          </h3>
          <div className="space-y-2">
            {bestSellingProducts.map(product => (
              <div key={product._id} className="flex justify-between items-center text-sm">
                <span className="text-yellow-700">{product.title}</span>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                  Stock: {product.stock}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2 flex items-center">
            <FiTrendingDown className="mr-2" />
            Low Stock Alert
          </h3>
          <div className="space-y-2">
            {lowStockProducts.map(product => (
              <div key={product._id} className="flex justify-between items-center text-sm">
                <span className="text-red-700">{product.title}</span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                  Only {product.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add product form */}
      {adding && (
        <div className="bg-white p-6 rounded-lg w-full max-w-2xl mb-6 shadow-md border">
          <h3 className="text-lg font-semibold mb-4 text-black">Add New Product</h3>
          <input type="text" name="title" placeholder="Product Title" value={newProduct.title} onChange={handleInputChange} className="w-full mb-3 p-3 border border-gray-300 rounded text-black" />
          <input type="number" name="price" placeholder="Price" value={newProduct.price} onChange={handleInputChange} className="w-full mb-3 p-3 border border-gray-300 rounded text-black" />
          <input type="number" name="stock" placeholder="Stock Quantity" value={newProduct.stock} onChange={handleInputChange} className="w-full mb-3 p-3 border border-gray-300 rounded text-black" />
          <input type="number" name="discount" placeholder="Discount %" value={newProduct.discount} onChange={handleInputChange} className="w-full mb-3 p-3 border border-gray-300 rounded text-black" />
          <input type="text" name="description" placeholder="Description" value={newProduct.description} onChange={handleInputChange} className="w-full mb-3 p-3 border border-gray-300 rounded text-black" />
          <input type="text" name="category" placeholder="Category" value={newProduct.category} onChange={handleInputChange} className="w-full mb-3 p-3 border border-gray-300 rounded text-black" />
          <input type="text" name="tags" placeholder="Tags (comma separated)" value={newProduct.tags} onChange={handleInputChange} className="w-full mb-3 p-3 border border-gray-300 rounded text-black" />
          <input type="text" name="variants" placeholder="Variants (comma separated)" value={newProduct.variants} onChange={handleInputChange} className="w-full mb-3 p-3 border border-gray-300 rounded text-black" />
          
          {/* File Upload for New Product */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
            <div className="flex items-center space-x-4">
              <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                <FiUpload className="text-gray-400 mb-2" size={24} />
                <span className="text-sm text-gray-500 text-center"></span>
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
        
        {/* Delete button */}
        <button
          className="absolute top-3 left-3 transition-colors duration-300 text-red-600 hover:text-red-800 z-50"
          onClick={() => deleteProduct(product._id)}
        >
          <FiTrash2 size={24} style={{ stroke: "red", strokeWidth: 2, fill: isFavorited ? "red" : "white" }} />
        </button>

        {/* Status toggle button */}
        <button
          className="absolute top-3 right-3 transition-colors duration-300 z-50"
          onClick={() => toggleProductStatus(product._id, product.active)}
        >
          <div className={`w-3 h-3 rounded-full ${product.active ? 'bg-green-500' : 'bg-red-500'}`} />
        </button>

        {/* Product Image Area */}
        <div className="h-25 w-25 pt-2 relative flex items-center justify-center bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
          {product.image ? (
            <>
              <img 
                src={product.image} 
                alt={product.title} 
                className="w-full h-full object-contain rounded-xl"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setSelectedFile(file);
                    const previewUrl = URL.createObjectURL(file);
                    setImagePreview(previewUrl);
                    updateProductImage(product._id, file);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center transition-all rounded-xl">
                <div className="bg-white bg-opacity-90 p-2 rounded-full">
                  <FiEdit className="text-blue-600" size={20} />
                </div>
              </div>
            </>
          ) : (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setSelectedFile(file);
                    const previewUrl = URL.createObjectURL(file);
                    setImagePreview(previewUrl);
                    updateProductImage(product._id, file);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-blue-500 transition-colors">
                <FiImage size={48} className="mb-2" />
                <span className="text-sm font-medium"></span>
              </div>
            </>
          )}
        </div>

        {/* Title & Price */}
        <div className="mt-2 text-center">
          <p className="text-lg font-bold text-black">{product.title}</p>
          <p className="text-md font-semibold text-gray-700 mt-1">${product.price}</p>
        </div>

        {/* Description & Category */}
        {product.description && <p className="text-black text-sm mt-1 text-center line-clamp-2">{product.description}</p>}
        {product.category && <p className="text-blue-600 text-xs mt-1 text-center bg-blue-50 px-2 py-1 rounded-full">{product.category}</p>}

        <div className="w-full flex items-center justify-between mt-3 px-2 relative">
  {/* Stock badge */}
  <span
    className={`absolute left-2 text-xs px-2 py-1 rounded-full ${
      product.stock > 30
        ? "bg-green-100 text-green-800"
        : product.stock > 1
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-800"
    }`}
  >
    Stock: {product.stock}
  </span>

  {/* Cart and Edit buttons aligned */}
  <div className="flex gap-2 mx-auto">
    {/* Cart Button */}
    <button className="flex items-center justify-center bg-red-500 text-white px-4 py-2 rounded-lg border-2 border-red-600 hover:bg-red-600 transition-colors">
      <FiShoppingCart className="text-xl mr-1" />
      
    </button>

    {/* Edit Button */}
    <button
      className="flex items-center justify-end bg-blue-500 text-white px-4 py-2 pr-1 rounded-lg border-2 border-blue-600 hover:bg-blue-600 transition-colors"
      onClick={() => openEditModal(product._id)}
    >
      <FiEdit className="text-xl mr-1" />
      
    </button>
  </div>
</div>
</div>

          );
        })}
      </div>
    </div>
  );
};

// YOUR EXISTING ADMIN PANEL COMPONENT
const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);

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

  // Sample data
  const [orders, setOrders] = useState([
    { id: 1, orderId: "#ORD-001", customer: "João Silva", email: "joao@email.com", product: "Camiseta Finito", quantity: 2, total: 89.90, payment: "Cartão de Crédito", city: "São Paulo, SP", status: "Em Preparação", date: "2024-01-15" },
    { id: 2, orderId: "#ORD-002", customer: "Maria Santos", email: "maria@email.com", product: "Boné Finito", quantity: 1, total: 45.00, payment: "PIX", city: "Rio de Janeiro, RJ", status: "Enviado", date: "2024-01-14" },
    { id: 3, orderId: "#ORD-003", customer: "Pedro Costa", email: "pedro@email.com", product: "Caneca Finito", quantity: 3, total: 75.00, payment: "Boleto", city: "Belo Horizonte, MG", status: "Pendente", date: "2024-01-14" }
  ]);

  const [customers, setCustomers] = useState([
    { id: 1, name: "João Silva", email: "joao@email.com", phone: "+55 11 99999-9999", cpf: "123.456.789-00", address: "Rua das Flores, 123 - São Paulo, SP", orders: 5, totalSpent: 450.00, status: "active", lastPurchase: "2024-01-15" },
    { id: 2, name: "Maria Santos", email: "maria@email.com", phone: "+55 21 88888-8888", cpf: "987.654.321-00", address: "Av. Copacabana, 456 - Rio de Janeiro, RJ", orders: 3, totalSpent: 180.00, status: "active", lastPurchase: "2024-01-14" },
    { id: 3, name: "Pedro Costa", email: "pedro@email.com", phone: "+55 31 77777-7777", cpf: "456.789.123-00", address: "Rua da Liberdade, 789 - Belo Horizonte, MG", orders: 2, totalSpent: 120.00, status: "suspended", lastPurchase: "2024-01-10" }
  ]);

  // Enhanced Deliveries Data
  const [deliveries, setDeliveries] = useState([
    { 
      id: 1, 
      orderId: "#ORD-002", 
      customer: "Maria Santos", 
      product: "Boné Finito", 
      quantity: 1,
      price: 45.00, 
      city: "Rio de Janeiro, RJ", 
      address: "Av. Copacabana, 456 - Rio de Janeiro, RJ",
      status: "Enviado", 
      tracking: "BR123456789",
      carrier: "Correios",
      estimatedDelivery: "2024-01-20",
      shippedDate: "2024-01-14",
      deliveryDate: "",
      notes: "Entregue na portaria"
    },
    { 
      id: 2, 
      orderId: "#ORD-001", 
      customer: "João Silva", 
      product: "Camiseta Finito", 
      quantity: 2,
      price: 89.90, 
      city: "São Paulo, SP", 
      address: "Rua das Flores, 123 - São Paulo, SP",
      status: "Em Preparação", 
      tracking: "Preparando envio",
      carrier: "Loggi",
      estimatedDelivery: "2024-01-18",
      shippedDate: "",
      deliveryDate: "",
      notes: "Aguardando confirmação de pagamento"
    },
    { 
      id: 3, 
      orderId: "#ORD-004", 
      customer: "Ana Oliveira", 
      product: "Moletom Finito", 
      quantity: 1,
      price: 120.00, 
      city: "Curitiba, PR", 
      address: "Rua XV de Novembro, 789 - Curitiba, PR",
      status: "Entregue", 
      tracking: "BR987654321",
      carrier: "Jadlog",
      estimatedDelivery: "2024-01-16",
      shippedDate: "2024-01-12",
      deliveryDate: "2024-01-15",
      notes: "Assinatura digital confirmada"
    }
  ]);

  // Stock Management Data
  const [stockItems, setStockItems] = useState([
    {
      id: 1,
      productId: "PROD-001",
      name: "Camiseta Finito Branca",
      sku: "CT-FINITO-WHITE",
      currentStock: 45,
      minimumStock: 10,
      reservedStock: 5,
      incomingStock: 20,
      lastUpdated: "2024-01-15",
      category: "Roupas",
      supplier: "Fabricante A",
      cost: 15.00,
      status: "In Stock"
    },
    {
      id: 2,
      productId: "PROD-002",
      name: "Boné Finito Preto",
      sku: "BN-FINITO-BLACK",
      currentStock: 8,
      minimumStock: 5,
      reservedStock: 3,
      incomingStock: 0,
      lastUpdated: "2024-01-15",
      category: "Acessórios",
      supplier: "Fabricante B",
      cost: 8.50,
      status: "Low Stock"
    },
    {
      id: 3,
      productId: "PROD-003",
      name: "Caneca Finito Azul",
      sku: "CN-FINITO-BLUE",
      currentStock: 0,
      minimumStock: 15,
      reservedStock: 0,
      incomingStock: 50,
      lastUpdated: "2024-01-14",
      category: "Casa",
      supplier: "Fabricante C",
      cost: 6.00,
      status: "Out of Stock"
    },
    {
      id: 4,
      productId: "PROD-004",
      name: "Moletom Finito Cinza",
      sku: "ML-FINITO-GRAY",
      currentStock: 25,
      minimumStock: 8,
      reservedStock: 12,
      incomingStock: 30,
      lastUpdated: "2024-01-15",
      category: "Roupas",
      supplier: "Fabricante A",
      cost: 35.00,
      status: "In Stock"
    }
  ]);

  const [coupons, setCoupons] = useState([
    { id: 1, code: "WELCOME10", discount: 10, type: "percentage", used: 45, maxUses: 100, validUntil: "2024-12-31" },
    { id: 2, code: "FREESHIP", discount: 0, type: "shipping", used: 23, maxUses: 50, validUntil: "2024-06-30" }
  ]);

  const [adminUsers, setAdminUsers] = useState([
    { id: 1, name: "Admin Master", email: "admin@store.com", role: "Super Admin", lastLogin: "2024-01-15 14:30", permissions: "All" },
    { id: 2, name: "Manager", email: "manager@store.com", role: "Content Manager", lastLogin: "2024-01-14 09-15", permissions: "Products, Content" }
  ]);

  // Delivery Settings
  const [deliverySettings, setDeliverySettings] = useState({
    shippingZones: [
      { id: 1, name: "São Paulo Capital", cities: ["São Paulo"], rate: 15.00, freeShippingMin: 100.00 },
      { id: 2, name: "Rio de Janeiro Capital", cities: ["Rio de Janeiro"], rate: 18.00, freeShippingMin: 120.00 },
      { id: 3, name: "Outras Capitais", cities: ["Belo Horizonte", "Curitiba", "Porto Alegre"], rate: 25.00, freeShippingMin: 150.00 }
    ],
    carriers: [
      { id: 1, name: "Correios", enabled: true, services: ["PAC", "SEDEX"] },
      { id: 2, name: "Loggi", enabled: true, services: ["Express", "Standard"] },
      { id: 3, name: "Jadlog", enabled: false, services: [".COM", "Package"] }
    ],
    deliveryTimes: {
      standard: "3-5 dias úteis",
      express: "1-2 dias úteis",
      sameDay: false
    }
  });

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
    delivery.status.toLowerCase().includes(deliverySearch.toLowerCase()) ||
    delivery.tracking.toLowerCase().includes(deliverySearch.toLowerCase())
  );

  const filteredStockItems = stockItems.filter(item =>
    item.name.toLowerCase().includes(stockSearch.toLowerCase()) ||
    item.sku.toLowerCase().includes(stockSearch.toLowerCase()) ||
    item.category.toLowerCase().includes(stockSearch.toLowerCase()) ||
    item.status.toLowerCase().includes(stockSearch.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Enviado": 
      case "Shipped":
      case "In Stock":
        return "bg-green-100 text-green-800";
      case "Em Preparação": 
      case "Processing":
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800";
      case "Pendente": 
      case "Pending":
        return "bg-blue-100 text-blue-800";
      case "Entregue": 
      case "Delivered":
        return "bg-purple-100 text-purple-800";
      case "Out of Stock":
        return "bg-red-100 text-red-800";
      case "active": 
        return "bg-green-100 text-green-800";
      case "suspended": 
        return "bg-red-100 text-red-800";
      default: 
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDeliveryStatusColor = (status) => {
    switch (status) {
      case "Entregue": return "bg-purple-100 text-purple-800 border border-purple-200";
      case "Enviado": return "bg-green-100 text-green-800 border border-green-200";
      case "Em Preparação": return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "Pendente": return "bg-blue-100 text-blue-800 border border-blue-200";
      default: return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case "In Stock": return "bg-green-100 text-green-800 border border-green-200";
      case "Low Stock": return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "Out of Stock": return "bg-red-100 text-red-800 border border-red-200";
      default: return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.orderId === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const updateDeliveryStatus = (deliveryId, newStatus) => {
    setDeliveries(deliveries.map(delivery => 
      delivery.id === deliveryId ? { 
        ...delivery, 
        status: newStatus,
        ...(newStatus === "Enviado" && !delivery.shippedDate && { shippedDate: new Date().toISOString().split('T')[0] }),
        ...(newStatus === "Entregue" && !delivery.deliveryDate && { deliveryDate: new Date().toISOString().split('T')[0] })
      } : delivery
    ));
  };

  const updateStockQuantity = (itemId, newQuantity) => {
    setStockItems(stockItems.map(item => 
      item.id === itemId ? { 
        ...item, 
        currentStock: newQuantity,
        lastUpdated: new Date().toISOString().split('T')[0],
        status: newQuantity === 0 ? "Out of Stock" : newQuantity <= item.minimumStock ? "Low Stock" : "In Stock"
      } : item
    ));
  };

  const addIncomingStock = (itemId, quantity) => {
    setStockItems(stockItems.map(item => 
      item.id === itemId ? { 
        ...item, 
        incomingStock: item.incomingStock + quantity
      } : item
    ));
  };

  const receiveIncomingStock = (itemId) => {
    setStockItems(stockItems.map(item => 
      item.id === itemId ? { 
        ...item, 
        currentStock: item.currentStock + item.incomingStock,
        incomingStock: 0,
        lastUpdated: new Date().toISOString().split('T')[0],
        status: "In Stock"
      } : item
    ));
  };

  const toggleCustomerStatus = (customerId, currentStatus) => {
    setCustomers(customers.map(customer =>
      customer.id === customerId ? { ...customer, status: currentStatus === "active" ? "suspended" : "active" } : customer
    ));
  };

  // ALL YOUR EXISTING RENDER FUNCTIONS REMAIN EXACTLY THE SAME
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">${dashboardStats.totalSales.toLocaleString()}</p>
            </div>
            <FiTrendingUp className={`text-2xl ${dashboardStats.salesChange >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
          <p className={`text-sm ${dashboardStats.salesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {dashboardStats.salesChange >= 0 ? '+' : ''}{dashboardStats.salesChange}% from last month
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalUsers}</p>
            </div>
            <FiUsers className={`text-2xl ${dashboardStats.userChange >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
          <p className={`text-sm ${dashboardStats.userChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {dashboardStats.userChange >= 0 ? '+' : ''}{dashboardStats.userChange}% from last month
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalOrders}</p>
            </div>
            <FiShoppingBag className={`text-2xl ${dashboardStats.orderChange >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
          <p className={`text-sm ${dashboardStats.orderChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {dashboardStats.orderChange >= 0 ? '+' : ''}{dashboardStats.orderChange}% from last month
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${dashboardStats.totalRevenue.toLocaleString()}</p>
            </div>
            <FiDollarSign className={`text-2xl ${dashboardStats.revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
          <p className={`text-sm ${dashboardStats.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {dashboardStats.revenueChange >= 0 ? '+' : ''}{dashboardStats.revenueChange}% from last month
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Sales Trends</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Sales chart will be displayed here</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Order Trends</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Order chart will be displayed here</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex items-center">
              <FiShoppingBag className="text-blue-500 mr-3" />
              <span>New order #ORD-004 received</span>
            </div>
            <span className="text-sm text-gray-500">2 minutes ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex items-center">
              <FiUser className="text-green-500 mr-3" />
              <span>New user registration</span>
            </div>
            <span className="text-sm text-gray-500">1 hour ago</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div>
      <SaleProducts />
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Order Management</h2>
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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.date}</td>
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
                    <select 
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                      className={`text-xs font-medium rounded-full px-3 py-1 border-0 ${getStatusColor(order.status)}`}
                    >
                      <option value="Pendente">Pending</option>
                      <option value="Em Preparação">Processing</option>
                      <option value="Enviado">Shipped</option>
                      <option value="Entregue">Delivered</option>
                      <option value="Cancelado">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-indigo-600 hover:text-indigo-900">View</button>
                    <button className="text-red-600 hover:text-red-900">Cancel</button>
                    <button className="text-green-600 hover:text-green-900">Invoice</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Customer Management</h2>
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
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold">{customer.name}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                {customer.status}
              </span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Email:</strong> {customer.email}</p>
              <p><strong>Phone:</strong> {customer.phone}</p>
              <p><strong>Orders:</strong> {customer.orders}</p>
              <p><strong>Total Spent:</strong> R$ {customer.totalSpent.toFixed(2)}</p>
              <p><strong>Last Purchase:</strong> {customer.lastPurchase}</p>
            </div>
            <div className="flex space-x-2 mt-3">
              <button 
                onClick={() => toggleCustomerStatus(customer.id, customer.status)}
                className={`text-xs px-3 py-1 rounded ${
                  customer.status === "active" 
                    ? "bg-red-100 text-red-700 hover:bg-red-200" 
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                {customer.status === "active" ? "Suspend" : "Activate"}
              </button>
              <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">
                Edit
              </button>
              <button className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200">
                History
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // NEW DELIVERY SECTION
  const renderDelivery = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Delivery Management</h2>
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

      {/* Delivery Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
              <p className="text-2xl font-bold text-gray-900">{deliveries.length}</p>
            </div>
            <FiTruck className="text-2xl text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {deliveries.filter(d => d.status === "Pendente").length}
              </p>
            </div>
            <FiClock className="text-2xl text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Transit</p>
              <p className="text-2xl font-bold text-gray-900">
                {deliveries.filter(d => d.status === "Enviado").length}
              </p>
            </div>
            <FiRefreshCw className="text-2xl text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">
                {deliveries.filter(d => d.status === "Entregue").length}
              </p>
            </div>
            <FiCheckCircle className="text-2xl text-purple-500" />
          </div>
        </div>
      </div>

      {/* Delivery Tracking Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer & Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carrier & Tracking</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDeliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{delivery.orderId}</div>
                    <div className="text-sm text-gray-500">R$ {delivery.price}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{delivery.customer}</div>
                    <div className="text-sm text-gray-500">{delivery.city}</div>
                    <div className="text-xs text-gray-400 mt-1">{delivery.address}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{delivery.product}</div>
                    <div className="text-sm text-gray-500">Qty: {delivery.quantity}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{delivery.carrier}</div>
                    <div className="text-sm text-gray-500">{delivery.tracking}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {delivery.shippedDate && `Shipped: ${delivery.shippedDate}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      {delivery.estimatedDelivery && `Est: ${delivery.estimatedDelivery}`}
                    </div>
                    {delivery.deliveryDate && (
                      <div className="text-sm text-green-600">Delivered: {delivery.deliveryDate}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select 
                      value={delivery.status}
                      onChange={(e) => updateDeliveryStatus(delivery.id, e.target.value)}
                      className={`text-xs font-medium rounded-full px-3 py-1 border-0 ${getDeliveryStatusColor(delivery.status)}`}
                    >
                      <option value="Pendente">Pending</option>
                      <option value="Em Preparação">Processing</option>
                      <option value="Enviado">Shipped</option>
                      <option value="Entregue">Delivered</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-indigo-600 hover:text-indigo-900">Track</button>
                    <button className="text-green-600 hover:text-green-900">Label</button>
                    <button className="text-blue-600 hover:text-blue-900">Notify</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delivery Settings */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FiSettings className="mr-2" />
          Delivery Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shipping Zones */}
          <div>
            <h4 className="font-semibold mb-3">Shipping Zones</h4>
            <div className="space-y-3">
              {deliverySettings.shippingZones.map(zone => (
                <div key={zone.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{zone.name}</span>
                    <span className="text-sm text-gray-600">R$ {zone.rate}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Free shipping over R$ {zone.freeShippingMin}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Carriers */}
          <div>
            <h4 className="font-semibold mb-3">Carriers</h4>
            <div className="space-y-3">
              {deliverySettings.carriers.map(carrier => (
                <div key={carrier.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">{carrier.name}</span>
                    <div className="text-sm text-gray-500">
                      {carrier.services.join(', ')}
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${carrier.enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // NEW STOCK SECTION
  const renderStock = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Stock Management</h2>
        <div className="flex space-x-4">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search stock items..."
              value={stockSearch}
              onChange={(e) => setStockSearch(e.target.value)}
              className="w-full p-2 pl-10 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center">
            <FiPlus className="mr-2" />
            Add Stock
          </button>
        </div>
      </div>

      {/* Stock Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <p className="text-sm font-medium text-gray-600">In Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {stockItems.filter(item => item.status === "In Stock").length}
              </p>
            </div>
            <FiCheckCircle className="text-2xl text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {stockItems.filter(item => item.status === "Low Stock").length}
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
                {stockItems.filter(item => item.status === "Out of Stock").length}
              </p>
            </div>
            <FiAlertCircle className="text-2xl text-red-500" />
          </div>
        </div>
      </div>

      {/* Stock Items Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reserved</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incoming</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStockItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">Supplier: {item.supplier}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={item.currentStock}
                        onChange={(e) => updateStockQuantity(item.id, parseInt(e.target.value))}
                        className="w-20 p-1 border border-gray-300 rounded text-sm text-black"
                      />
                      <span className="text-xs text-gray-500">Min: {item.minimumStock}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.reservedStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-900">{item.incomingStock}</span>
                      {item.incomingStock > 0 && (
                        <button
                          onClick={() => receiveIncomingStock(item.id)}
                          className="text-green-600 hover:text-green-800 text-xs"
                        >
                          Receive
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.lastUpdated}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">History</button>
                    <button 
                      onClick={() => addIncomingStock(item.id, 10)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Order
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
            <FiAlertCircle className="mr-2" />
            Low Stock Alerts
          </h3>
          <div className="space-y-3">
            {stockItems.filter(item => item.status === "Low Stock").map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-yellow-100 rounded">
                <div>
                  <span className="font-medium text-yellow-800">{item.name}</span>
                  <div className="text-sm text-yellow-600">
                    Current: {item.currentStock} | Min: {item.minimumStock}
                  </div>
                </div>
                <button 
                  onClick={() => addIncomingStock(item.id, 20)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                >
                  Reorder
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Out of Stock Alerts */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
            <FiAlertCircle className="mr-2" />
            Out of Stock
          </h3>
          <div className="space-y-3">
            {stockItems.filter(item => item.status === "Out of Stock").map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-red-100 rounded">
                <div>
                  <span className="font-medium text-red-800">{item.name}</span>
                  <div className="text-sm text-red-600">
                    Incoming: {item.incomingStock} units
                  </div>
                </div>
                <button 
                  onClick={() => addIncomingStock(item.id, 50)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Urgent Order
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPromotion = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Promotions</h2>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
          <FiPlus className="inline mr-2" />
          Create Campaign
        </button>
      </div>

      {/* Coupons Section */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">Discount Codes & Coupons</h3>
        <div className="space-y-4">
          {coupons.map(coupon => (
            <div key={coupon.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-semibold">{coupon.code}</h4>
                <p className="text-sm text-gray-600">
                  {coupon.type === 'percentage' ? `${coupon.discount}% off` : 'Free Shipping'} • 
                  Used {coupon.used}/{coupon.maxUses} times • 
                  Valid until {coupon.validUntil}
                </p>
              </div>
              <div className="space-x-2">
                <button className="text-blue-600 hover:text-blue-800">Edit</button>
                <button className="text-red-600 hover:text-red-800">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Email Campaigns */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">Email Campaigns</h3>
        <div className="space-y-3">
          <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Weekly Newsletter</h4>
                <p className="text-sm text-gray-600">Sent to 2,345 subscribers</p>
              </div>
              <FiSend className="text-gray-400" />
            </div>
          </button>
          <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Abandoned Cart</h4>
                <p className="text-sm text-gray-600">Automated recovery emails</p>
              </div>
              <FiShoppingCart className="text-gray-400" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Settings & Configuration</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Store Settings */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiSettings className="mr-2" />
            Store Configuration
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50">
              Store Information
            </button>
            <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50">
              Tax & Currency Settings
            </button>
            <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50">
              Shipping Options
            </button>
            <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50">
              Payment Gateways
            </button>
          </div>
        </div>

        {/* Security & Admin */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiShield className="mr-2" />
            Security & Admin
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 flex justify-between items-center">
              <span>Admin Users</span>
              <FiUsers className="text-gray-400" />
            </button>
            <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 flex justify-between items-center">
              <span>Two-Factor Authentication</span>
              <FiKey className="text-gray-400" />
            </button>
            <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 flex justify-between items-center">
              <span>API Keys & Integrations</span>
              <FiDatabase className="text-gray-400" />
            </button>
            <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 flex justify-between items-center">
              <span>Backup & Restore</span>
              <FiDatabase className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiMoon className="mr-2" />
            Appearance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Dark Mode</span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  darkMode ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50">
              Theme Customization
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiBell className="mr-2" />
            Notifications
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50">
              Email Preferences
            </button>
            <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50">
              Real-time Alerts
            </button>
            <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50">
              Mobile Notifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Reports & Analytics</h2>
        <div className="space-x-2">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            <FiDownload className="inline mr-2" />
            Export CSV
          </button>
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
            <FiDownload className="inline mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold mb-3">Sales Reports</h3>
          <p className="text-sm text-gray-600 mb-3">View detailed sales performance and trends</p>
          <button className="text-blue-600 hover:text-blue-800 text-sm">Generate Report</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold mb-3">Inventory Reports</h3>
          <p className="text-sm text-gray-600 mb-3">Stock levels and product performance</p>
          <button className="text-blue-600 hover:text-blue-800 text-sm">Generate Report</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold mb-3">User Reports</h3>
          <p className="text-sm text-gray-600 mb-3">Customer behavior and demographics</p>
          <button className="text-blue-600 hover:text-blue-800 text-sm">Generate Report</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold mb-3">Abandoned Cart</h3>
          <p className="text-sm text-gray-600 mb-3">Track and recover abandoned carts</p>
          <button className="text-blue-600 hover:text-blue-800 text-sm">View Analytics</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold mb-3">Promotions Performance</h3>
          <p className="text-sm text-gray-600 mb-3">Campaign results and ROI</p>
          <button className="text-blue-600 hover:text-blue-800 text-sm">View Report</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'} p-15 mt-30`}>
      <div className={`max-w-7xl mx-auto ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <FiMoon />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 relative">
              <FiBell />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-lg">Welcome, Admin!</p>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>You have successfully logged in as an administrator.</p>
        </div>

        {/* Navigation Tabs - UPDATED WITH DELIVERY AND STOCK */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "dashboard", name: "Dashboard", icon: FiBarChart2 },
              { id: "products", name: "Products", icon: FiPackage },
              { id: "orders", name: "Orders", icon: FiShoppingBag },
              { id: "customers", name: "Customers", icon: FiUsers },
              { id: "delivery", name: "Delivery", icon: FiTruck },
              { id: "stock", name: "Stock", icon: FiBox },
              { id: "promotions", name: "Promotions", icon: FiSend },
              { id: "reports", name: "Reports", icon: FiPieChart },
              { id: "settings", name: "Settings", icon: FiSettings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="mr-2" size={16} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content - UPDATED WITH DELIVERY AND STOCK */}
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
      </div>
    </div>
  );
};

export default AdminPanel;