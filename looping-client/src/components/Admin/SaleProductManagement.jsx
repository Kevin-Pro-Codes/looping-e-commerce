// src/components/admin/SaleProducts.jsx
import React, { useEffect, useState } from "react";
import { 
  FiHeart, FiShoppingCart, FiPlus, FiTrash2, FiSearch, FiImage, 
  FiEdit, FiEdit2, FiUpload, FiTrendingUp, FiTrendingDown, FiX 
} from "react-icons/fi";

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
  
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
    stock: 0,
    tags: "",
    variants: "",
    discount: 0,
    active: true
  });

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

  // ✅ BEAUTIFUL SKELETON LOADING LAYOUT
  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto my-4 flex flex-col items-center p-4" style={{ fontFamily: 'Calibri, sans-serif' }}>
        {/* Search and Add Button Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4 w-full max-w-2xl">
          <div className="relative flex-1">
            <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="h-12 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="w-full mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-gray-100 border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="flex items-center mb-2">
                <div className="w-5 h-5 bg-gray-300 rounded mr-2"></div>
                <div className="h-4 bg-gray-300 rounded w-32"></div>
              </div>
              <div className="space-y-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex justify-between items-center">
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                    <div className="h-6 bg-gray-300 rounded w-12"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-xl flex flex-col items-center p-3 border border-gray-200 min-h-[380px] animate-pulse">
              {/* Action Buttons Skeleton */}
              <div className="absolute top-3 left-3 w-5 h-5 bg-gray-300 rounded"></div>
              <div className="absolute top-3 right-3 w-5 h-5 bg-gray-300 rounded"></div>

              {/* Image Container Skeleton */}
              <div className="w-full aspect-square max-w-[200px] p-2 relative flex items-center justify-center bg-gray-200 rounded-xl border border-gray-300 overflow-hidden mb-3">
                <div className="w-full h-full bg-gray-300 rounded-xl"></div>
              </div>

              {/* Content Skeleton */}
              <div className="w-full text-center mt-2 space-y-2 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  {/* Title Skeleton */}
                  <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto"></div>
                  
                  {/* Price and Stock Skeleton */}
                  <div className="flex flex-col items-center gap-2 mt-2 px-1">
                    <div className="h-6 bg-gray-300 rounded w-16 mx-auto"></div>
                    <div className="h-6 bg-gray-300 rounded w-20"></div>
                  </div>

                  {/* Category Skeleton */}
                  <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>

                  {/* Description Skeleton */}
                  <div className="space-y-1">
                    <div className="h-3 bg-gray-300 rounded w-full"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3 mx-auto"></div>
                  </div>
                </div>

                {/* Edit Button Skeleton */}
                <div className="w-full mt-2 flex justify-center">
                  <div className="h-10 bg-gray-300 rounded-lg w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
        variants: Array.isArray(product.variants) ? product.variants.join(', ') : product.variants || "",
        discount: product.discount,
        active: product.active
      });
    }
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setEditFormData({
      title: "",
      price: "",
      description: "",
      category: "",
      stock: 0,
      tags: "",
      variants: "",
      discount: 0,
      active: true
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

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
        stock: parseInt(editFormData.stock) || 0,
        discount: parseFloat(editFormData.discount) || 0,
        price: parseFloat(editFormData.price) || 0,
        active: editFormData.active
      };

      console.log('Updating product with data:', productData);

      const response = await fetch(`http://localhost:8000/api/products/${editingProduct._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": token,
        },
        credentials: "include",
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Failed to update product: ${response.status}`);
      }

      const updatedProduct = await response.json();
      
      setProducts(products.map(product => 
        product._id === editingProduct._id 
          ? { ...product, ...productData }
          : product
      ));

      closeEditModal();
      
      alert('Product updated successfully!');
      
    } catch (error) {
      console.error("Error updating product:", error);
      alert('Error updating product. Please check console for details.');
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
    console.log("🔄 Starting upload for file:", file.name, file.size);
    
    const formData = new FormData();
    formData.append('image', file);
  
    try {
      const API_BASE = 'http://localhost:8000';
      
      console.log("🔐 Getting CSRF token...");
      await fetch(`${API_BASE}/sanctum/csrf-cookie`, {
        credentials: "include",
      });
  
      const csrfToken = decodeURIComponent(
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("XSRF-TOKEN="))
          ?.split("=")[1]
      );
  
      console.log("📤 Sending upload request to:", `${API_BASE}/api/upload`);
      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-XSRF-TOKEN': csrfToken,
          'Accept': 'application/json',
        },
        body: formData,
      });
  
      console.log("📨 Upload response status:", response.status);
      
      const responseText = await response.text();
      console.log("📄 Raw response:", responseText);
  
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("❌ Response is not valid JSON:", responseText);
        throw new Error('Server returned invalid JSON response');
      }
  
      console.log("📊 Parsed response data:", data);
  
      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || 'Upload failed');
      }
  
      console.log("🖼️ Image URL from server:", data.imageUrl);
      
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
    <div className="max-w-[1400px] mx-auto my-4 flex flex-col items-center p-4" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="flex flex-col sm:flex-row gap-4 mb-4 w-full max-w-2xl">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Pesquisar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ fontFamily: 'Calibri, sans-serif' }}
          />
          <FiSearch className="absolute left-3 top-3.5 text-gray-400" size={18} />
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-lg flex items-center justify-center transition-colors whitespace-nowrap"
          style={{ fontFamily: 'Calibri, sans-serif' }}
        >
          <FiPlus className="mr-2" />
          Add Product
        </button>
      </div>

      <div className="w-full mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2 flex items-center" style={{ fontFamily: 'Calibri, sans-serif' }}>
            <FiTrendingUp className="mr-2" />
            Best Selling Products
          </h3>
          <div className="space-y-2">
            {bestSellingProducts.map(product => (
              <div key={product._id} className="flex justify-between items-center text-sm" style={{ fontFamily: 'Calibri, sans-serif' }}>
                <span className="text-yellow-700 truncate flex-1 mr-2">{product.title}</span>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                  Stock: {product.stock}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2 flex items-center" style={{ fontFamily: 'Calibri, sans-serif' }}>
            <FiTrendingDown className="mr-2" />
            Low Stock Alert
          </h3>
          <div className="space-y-2">
            {lowStockProducts.map(product => (
              <div key={product._id} className="flex justify-between items-center text-sm" style={{ fontFamily: 'Calibri, sans-serif' }}>
                <span className="text-red-700 truncate flex-1 mr-2">{product.title}</span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                  Only {product.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {adding && (
        <div className="bg-white p-6 rounded-lg w-full max-w-2xl mb-6 shadow-md border">
          <h3 className="text-lg font-semibold mb-4 text-black" style={{ fontFamily: 'Calibri, sans-serif' }}>Add New Product</h3>
          <div className="space-y-3">
            <input type="text" name="title" placeholder="Product Title" value={newProduct.title} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ fontFamily: 'Calibri, sans-serif' }} />
            <input type="number" name="price" placeholder="Price" value={newProduct.price} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ fontFamily: 'Calibri, sans-serif' }} />
            <input type="number" name="stock" placeholder="Stock Quantity" value={newProduct.stock} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ fontFamily: 'Calibri, sans-serif' }} />
            <input type="number" name="discount" placeholder="Discount %" value={newProduct.discount} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ fontFamily: 'Calibri, sans-serif' }} />
            <input type="text" name="description" placeholder="Description" value={newProduct.description} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ fontFamily: 'Calibri, sans-serif' }} />
            <input type="text" name="category" placeholder="Category" value={newProduct.category} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ fontFamily: 'Calibri, sans-serif' }} />
            <input type="text" name="tags" placeholder="Tags (comma separated)" value={newProduct.tags} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ fontFamily: 'Calibri, sans-serif' }} />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Calibri, sans-serif' }}>Product Image</label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                  <FiUpload className="text-gray-400 mb-2" size={24} />
                  <span className="text-sm text-gray-500 text-center" style={{ fontFamily: 'Calibri, sans-serif' }}>Upload</span>
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
                <p className="text-sm text-gray-600 mt-2" style={{ fontFamily: 'Calibri, sans-serif' }}>Selected: {selectedFile.name}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button 
                onClick={addProduct} 
                disabled={uploading}
                className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ fontFamily: 'Calibri, sans-serif' }}
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
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-6 py-3 rounded-lg transition-colors"
                style={{ fontFamily: 'Calibri, sans-serif' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-black" style={{ fontFamily: 'Calibri, sans-serif' }}>Edit Product - {editingProduct.title}</h3>
              <button 
                onClick={closeEditModal}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-black border-b pb-2" style={{ fontFamily: 'Calibri, sans-serif' }}>Basic Information</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Calibri, sans-serif' }}>Product Title</label>
                  <input 
                    type="text" 
                    name="title" 
                    value={editFormData.title} 
                    onChange={handleEditInputChange}
                    className="w-full p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter product title"
                    style={{ fontFamily: 'Calibri, sans-serif' }}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Calibri, sans-serif' }}>Price ($)</label>
                    <input 
                      type="number" 
                      name="price" 
                      value={editFormData.price} 
                      onChange={handleEditInputChange}
                      step="0.01"
                      min="0"
                      className="w-full p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ fontFamily: 'Calibri, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Calibri, sans-serif' }}>Stock Quantity</label>
                    <input 
                      type="number" 
                      name="stock" 
                      value={editFormData.stock} 
                      onChange={handleEditInputChange}
                      min="0"
                      className="w-full p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ fontFamily: 'Calibri, sans-serif' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Calibri, sans-serif' }}>Discount (%)</label>
                    <input 
                      type="number" 
                      name="discount" 
                      value={editFormData.discount} 
                      onChange={handleEditInputChange}
                      min="0"
                      max="100"
                      className="w-full p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ fontFamily: 'Calibri, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Calibri, sans-serif' }}>Category</label>
                    <input 
                      type="text" 
                      name="category" 
                      value={editFormData.category} 
                      onChange={handleEditInputChange}
                      className="w-full p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Clothing, Electronics"
                      style={{ fontFamily: 'Calibri, sans-serif' }}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="active"
                    checked={editFormData.active}
                    onChange={handleEditInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Calibri, sans-serif' }}>Product Active</label>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-black border-b pb-2" style={{ fontFamily: 'Calibri, sans-serif' }}>Additional Information</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Calibri, sans-serif' }}>Description</label>
                  <textarea 
                    name="description" 
                    value={editFormData.description} 
                    onChange={handleEditInputChange}
                    rows="4"
                    className="w-full p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter product description"
                    style={{ fontFamily: 'Calibri, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Calibri, sans-serif' }}>Tags</label>
                  <input 
                    type="text" 
                    name="tags" 
                    value={editFormData.tags} 
                    onChange={handleEditInputChange}
                    placeholder="cotton, premium, casual (comma separated)"
                    className="w-full p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ fontFamily: 'Calibri, sans-serif' }}
                  />
                  <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Calibri, sans-serif' }}>Separate tags with commas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Calibri, sans-serif' }}>Variants</label>
                  <input 
                    type="text" 
                    name="variants" 
                    value={editFormData.variants} 
                    onChange={handleEditInputChange}
                    placeholder="Small/Red, Medium/Blue, Large/Black (comma separated)"
                    className="w-full p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ fontFamily: 'Calibri, sans-serif' }}
                  />
                  <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Calibri, sans-serif' }}>Separate variants with commas</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold text-black mb-3" style={{ fontFamily: 'Calibri, sans-serif' }}>Current Image</h4>
              <div className="flex items-center space-x-4">
                {editingProduct.image ? (
                  <img 
                    src={editingProduct.image} 
                    alt="Current product" 
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FiImage className="text-gray-400" size={32} />
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Calibri, sans-serif' }}>Current product image</p>
                  <button 
                    onClick={() => setEditingImage(editingProduct._id)}
                    className="text-blue-600 hover:text-blue-800 text-sm mt-2 flex items-center"
                    style={{ fontFamily: 'Calibri, sans-serif' }}
                  >
                    <FiEdit className="mr-1" size={14} />
                    Change Image
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t">
              <button 
                onClick={updateProduct}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg flex items-center justify-center transition-colors flex-1"
                style={{ fontFamily: 'Calibri, sans-serif' }}
              >
                <FiEdit className="mr-2" />
                Update Product
              </button>
              <button 
                onClick={closeEditModal}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-6 py-3 rounded-lg transition-colors flex-1"
                style={{ fontFamily: 'Calibri, sans-serif' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredProducts.length === 0 && products.length > 0 && (
        <p className="text-black mt-4" style={{ fontFamily: 'Calibri, sans-serif' }}>No products found matching your search.</p>
      )}
      {products.length === 0 && !loading && <p className="text-black mt-4" style={{ fontFamily: 'Calibri, sans-serif' }}>No products loaded.</p>}

      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
        {filteredProducts.map((product) => {
          const isFavorited = favorites.includes(product._id);

          return (
            <div key={product._id} className="relative bg-white rounded-2xl shadow-xl flex flex-col items-center p-3 border border-gray-200 duration-300 hover:shadow-2xl transition-all min-h-[380px]">
              
              <button
                className="absolute top-3 left-3 transition-colors duration-300 text-red-600 hover:text-red-800 z-10"
                onClick={() => deleteProduct(product._id)}
              >
                <FiTrash2 size={20} />
              </button>

              <button
                className="absolute top-3 right-3 transition-colors duration-300 z-10"
                onClick={() => toggleProductStatus(product._id, product.active)}
              >
                <div className={`w-3 h-3 rounded-full ${product.active ? 'bg-green-500' : 'bg-red-500'}`} />
              </button>

              {/* Fixed Image Container */}
              <div className="w-full aspect-square max-w-[200px] p-2 relative flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200 overflow-hidden group mb-3">
                {product.image ? (
                  <>
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      className="w-full h-full object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center transition-all rounded-xl cursor-pointer"
                         onClick={() => setEditingImage(product._id)}>
                      <div className="bg-white bg-opacity-90 p-3 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                        <FiEdit2 className="text-blue-600" size={20} />
                      </div>
                    </div>
                  </>
                ) : (
                  <div 
                    className="flex flex-col items-center justify-center w-full h-full bg-gray-200 rounded-lg text-gray-400 hover:text-blue-500 transition-colors cursor-pointer group"
                    onClick={() => setEditingImage(product._id)}
                  >
                    <FiImage size={32} className="mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-center px-2" style={{ fontFamily: 'Calibri, sans-serif' }}>Add Image</span>
                  </div>
                )}
              </div>

              <div className="w-full text-center mt-2 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  {/* Adjustable Title Size - Change text-lg to your preferred size */}
                  <h3 className="text-xl font-bold text-black line-clamp-2 px-1 mb-2" style={{ fontFamily: 'Calibri, sans-serif' }}>
                    {product.title || "Untitled Product"}
                  </h3>
                  
                  {/* Centered Price and Fixed-width Stock */}
                  <div className="flex flex-col items-center gap-2 mt-2 px-1">
                    {/* Centered Price */}
                    <p className="text-xl font-semibold text-black text-center w-full" style={{ fontFamily: 'Calibri, sans-serif' }}>
                      ${product.price ? parseFloat(product.price).toFixed(2) : "0.00"}
                    </p>
                    
                    {/* Fixed-width Stock Badge */}
                    <div className="w-fit">
                      <span className={`text-xs px-3 py-1 rounded whitespace-nowrap inline-block ${
                        product.stock > 10 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : product.stock > 0 
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`} style={{ fontFamily: 'Calibri, sans-serif' }}>
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>

                  {product.category && (
                    <p className="text-sm text-gray-600 text-center mt-1 px-1" style={{ fontFamily: 'Calibri, sans-serif' }}>{product.category}</p>
                  )}

                  {product.description && (
                    <p className="text-xs text-gray-500 text-center line-clamp-2 mt-1 px-1" style={{ fontFamily: 'Calibri, sans-serif' }}>
                      {product.description}
                    </p>
                  )}
                </div>

                <div className="w-full mt-2 flex justify-center">
                  <button
                    className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white 
                               px-4 py-2 rounded-lg border-2 border-black transition-all duration-200 
                               hover:shadow-md min-w-[60px]"
                    onClick={() => openEditModal(product._id)}
                    style={{ fontFamily: 'Calibri, sans-serif' }}
                  >
                    <FiEdit className="text-lg" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 text-black" style={{ fontFamily: 'Calibri, sans-serif' }}>Update Product Image</h3>
            
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Calibri, sans-serif' }}>Current Image:</p>
              {(() => {
                const productBeingEdited = products.find(p => p._id === editingImage);
                const imageUrl = productBeingEdited?.image;
                
                if (imageUrl) {
                  return (
                    <div className="flex flex-col items-center">
                      <img 
                        src={imageUrl} 
                        alt="Current product preview" 
                        className="w-full max-h-48 object-contain rounded-lg border mb-2"
                        onError={(e) => {
                          console.error('Error loading image:', imageUrl);
                          e.target.style.display = 'none';
                          const fallback = document.getElementById(`fallback-${editingImage}`);
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div id={`fallback-${editingImage}`} className="hidden w-full h-48 bg-gray-100 rounded-lg flex flex-col items-center justify-center mb-2">
                        <FiImage className="text-gray-400" size={48} />
                        <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: 'Calibri, sans-serif' }}>
                          Failed to load image
                        </p>
                        <p className="text-xs text-gray-400 mt-1 text-center" style={{ fontFamily: 'Calibri, sans-serif' }}>
                          URL: {imageUrl.length > 50 ? imageUrl.substring(0, 50) + '...' : imageUrl}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-center break-all" style={{ fontFamily: 'Calibri, sans-serif' }}>
                        Image URL: {imageUrl.length > 60 ? imageUrl.substring(0, 60) + '...' : imageUrl}
                      </p>
                    </div>
                  );
                } else {
                  return (
                    <div className="w-full h-48 bg-gray-100 rounded-lg flex flex-col items-center justify-center mb-4">
                      <FiImage className="text-gray-400" size={48} />
                      <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: 'Calibri, sans-serif' }}>
                        No image available
                      </p>
                    </div>
                  );
                }
              })()}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Calibri, sans-serif' }}>Select New Image</label>
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors p-4">
                <FiUpload className="text-gray-400 mb-2" size={32} />
                <span className="text-sm text-gray-500 text-center" style={{ fontFamily: 'Calibri, sans-serif' }}>Click to upload new image</span>
                <span className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'Calibri, sans-serif' }}>PNG, JPG, JPEG up to 5MB</span>
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
                <p className="text-sm text-gray-600 mt-2" style={{ fontFamily: 'Calibri, sans-serif' }}>Selected: {selectedFile.name}</p>
              )}
            </div>

            {imagePreview && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Calibri, sans-serif' }}>New Image Preview:</p>
                <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-contain rounded-lg border" />
              </div>
            )}

            <div className="flex space-x-3">
              <button 
                onClick={() => {
                  if (selectedFile) {
                    updateProductImage(editingImage, selectedFile);
                  }
                }}
                disabled={!selectedFile || uploading}
                className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Calibri, sans-serif' }}
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
                style={{ fontFamily: 'Calibri, sans-serif' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleProducts;