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

  // Debug function to test image URLs
  const testImageUrl = async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      console.log("🔄 Fetching products...");
      
      const response = await fetch("http://localhost:8000/api/products", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("📦 Products loaded:", data);

      // Process products with better image handling
      const processedProducts = Array.isArray(data) ? data.map((p) => {
        let imageUrl = p.image || "";
        
        // Fix image URL if needed
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = `http://localhost:8000/storage/${imageUrl}`;
        }
        
        // Try alternative URL formats if main one fails
        const alternativeUrls = [
          imageUrl,
          imageUrl?.replace('/storage/', '/'),
          imageUrl?.replace('http://localhost:8000/storage/', 'http://localhost:8000/')
        ].filter(url => url);

        return {
          _id: p._id?.$oid || p._id || Math.random().toString(),
          title: p.title || "No title",
          price: p.price || 0,
          description: p.description || "",
          image: imageUrl,
          alternativeUrls: alternativeUrls,
          category: p.category || "",
          stock: p.stock || 0,
          tags: p.tags || [],
          variants: p.variants || [],
          active: p.active !== undefined ? p.active : true,
          discount: p.discount || 0
        };
      }) : [];
      
      console.log("🖼️ Processed products with images:", processedProducts.map(p => ({
        title: p.title,
        image: p.image,
        alternatives: p.alternativeUrls
      })));
      
      setProducts(processedProducts);
    } catch (error) {
      console.error("❌ Error loading products:", error);
      setProducts([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

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
      await fetch("http://localhost:8000/sanctum/csrf-cookie", { credentials: "include" });

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

      console.log('🔄 Updating product:', productData);

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
        throw new Error(`Failed to update product: ${response.status}`);
      }

      const updatedProduct = await response.json();
      
      setProducts(products.map(product => 
        product._id === editingProduct._id 
          ? { ...product, ...productData }
          : product
      ));

      closeEditModal();
      alert('✅ Product updated successfully!');
      
    } catch (error) {
      console.error("❌ Error updating product:", error);
      alert('❌ Error updating product. Please check console for details.');
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

  // NEW: Direct product creation with image upload
  const addProduct = async () => {
    if (!selectedFile) {
      alert('❌ Please select an image for the product');
      return;
    }

    try {
      setUploading(true);

      // Get CSRF token first
      await fetch("http://localhost:8000/sanctum/csrf-cookie", { 
        credentials: "include" 
      });

      const token = decodeURIComponent(
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("XSRF-TOKEN="))
          ?.split("=")[1]
      );

      // Create FormData for direct upload to products endpoint
      const formData = new FormData();
      formData.append('title', newProduct.title);
      formData.append('price', newProduct.price);
      formData.append('description', newProduct.description);
      formData.append('category', newProduct.category);
      formData.append('stock', newProduct.stock.toString());
      formData.append('discount', newProduct.discount.toString());
      formData.append('image', selectedFile); // Append file directly

      console.log('📦 Creating product with FormData...');

      const response = await fetch("http://localhost:8000/api/products", {
        method: "POST",
        headers: {
          "X-XSRF-TOKEN": token,
          "Accept": "application/json",
        },
        credentials: "include",
        body: formData, // Send as FormData, not JSON
      });

      console.log('📨 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create product: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Product created:', data);
      
      // Add the new product to state with proper image URL
      const added = {
        _id: data._id?.$oid || data._id || Math.random().toString(),
        ...data,
      };
      
      setProducts([added, ...products]);
      setAdding(false);
      
      // Reset form
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
      console.error("❌ Error adding product:", error);
      alert('❌ Error creating product: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await fetch("http://localhost:8000/sanctum/csrf-cookie", { credentials: "include" });

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
      alert('✅ Product deleted successfully!');
    } catch (error) {
      console.error("❌ Error deleting product:", error);
      alert('❌ Error deleting product');
    }
  };

  const toggleProductStatus = async (id, currentStatus) => {
    try {
      await fetch("http://localhost:8000/sanctum/csrf-cookie", { credentials: "include" });

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
      console.error("❌ Error updating product status:", error);
    }
  };

  const updateProductImage = async (productId, file) => {
    try {
      setUploading(true);

      // Get CSRF token
      await fetch("http://localhost:8000/sanctum/csrf-cookie", { credentials: "include" });

      const token = decodeURIComponent(
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("XSRF-TOKEN="))
          ?.split("=")[1]
      );

      // Use FormData for image update
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`http://localhost:8000/api/products/${productId}`, {
        method: "POST", // Some APIs use POST for image updates
        headers: {
          "X-XSRF-TOKEN": token,
          "Accept": "application/json",
        },
        credentials: "include",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to update product image");

      const updatedProduct = await response.json();
      
      setProducts(products.map(product => 
        product._id === productId ? { ...product, image: updatedProduct.image } : product
      ));
      
      setEditingImage(null);
      setSelectedFile(null);
      
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
      
      alert('✅ Product image updated successfully!');
    } catch (error) {
      console.error("❌ Error updating product image:", error);
      alert('❌ Error updating product image');
    } finally {
      setUploading(false);
    }
  };

  // Enhanced image component with multiple fallbacks
  const ProductImage = ({ product }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
      const nextIndex = currentImageIndex + 1;
      if (product.alternativeUrls && nextIndex < product.alternativeUrls.length) {
        // Try next alternative URL
        setCurrentImageIndex(nextIndex);
      } else {
        // All URLs failed
        setImageError(true);
      }
    };

    const handleImageLoad = () => {
      setImageError(false);
      console.log('✅ Image loaded successfully');
    };

    if (imageError || !product.image) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100 rounded-xl">
          <FiImage size={32} className="text-gray-400 mb-2" />
          <span className="text-sm text-gray-500 text-center px-2">No image available</span>
        </div>
      );
    }

    const currentImageUrl = product.alternativeUrls?.[currentImageIndex] || product.image;

    return (
      <img 
        src={currentImageUrl}
        alt={product.title}
        className="w-full h-full object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    );
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
      
      {/* Debug Panel */}
      <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg z-50 max-w-md text-xs">
        <h4 className="font-bold mb-2">Debug Info:</h4>
        <div>Total Products: {products.length}</div>
        <div>Products with Images: {products.filter(p => p.image).length}</div>
        <div>Loading: {loading ? 'Yes' : 'No'}</div>
        <button 
          onClick={() => loadProducts()}
          className="mt-2 bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-xs"
        >
          Reload Products
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4 w-full max-w-2xl">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search products..."
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

      {/* Stats Cards */}
      <div className="w-full mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
            <FiTrendingUp className="mr-2" />
            Best Selling Products
          </h3>
          <div className="space-y-2">
            {bestSellingProducts.map(product => (
              <div key={product._id} className="flex justify-between items-center text-sm">
                <span className="text-yellow-700 truncate flex-1 mr-2">{product.title}</span>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs whitespace-nowrap">
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
                <span className="text-red-700 truncate flex-1 mr-2">{product.title}</span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                  Only {product.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Product Form */}
      {adding && (
        <div className="bg-white p-6 rounded-lg w-full max-w-2xl mb-6 shadow-md border">
          <h3 className="text-lg font-semibold mb-4 text-black">Add New Product</h3>
          <div className="space-y-3">
            <input type="text" name="title" placeholder="Product Title" value={newProduct.title} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="number" name="price" placeholder="Price" value={newProduct.price} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="number" name="stock" placeholder="Stock Quantity" value={newProduct.stock} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="number" name="discount" placeholder="Discount %" value={newProduct.discount} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="text" name="description" placeholder="Description" value={newProduct.description} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="text" name="category" placeholder="Category" value={newProduct.category} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500" />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Image *</label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
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
              {!selectedFile && (
                <p className="text-sm text-red-500 mt-2">Image is required</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button 
                onClick={addProduct} 
                disabled={uploading || !selectedFile}
                className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
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
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && <p className="text-black mt-4 text-lg">Loading products...</p>}
      
      {/* Empty State */}
      {!loading && products.length === 0 && (
        <div className="text-center py-8">
          <FiImage size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No products found</p>
          <button 
            onClick={() => setAdding(true)}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Add Your First Product
          </button>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
        {filteredProducts.map((product) => (
          <div key={product._id} className="relative bg-white rounded-2xl shadow-xl flex flex-col items-center p-3 border border-gray-200 duration-300 hover:shadow-2xl transition-all min-h-[380px]">
            
            {/* Action Buttons */}
            <button
              className="absolute top-3 left-3 transition-colors duration-300 text-red-600 hover:text-red-800 z-10 bg-white p-1 rounded-full shadow-md"
              onClick={() => deleteProduct(product._id)}
              title="Delete product"
            >
              <FiTrash2 size={16} />
            </button>

            <button
              className="absolute top-3 right-3 transition-colors duration-300 z-10 bg-white p-1 rounded-full shadow-md"
              onClick={() => toggleProductStatus(product._id, product.active)}
              title={product.active ? 'Deactivate product' : 'Activate product'}
            >
              <div className={`w-3 h-3 rounded-full ${product.active ? 'bg-green-500' : 'bg-red-500'}`} />
            </button>

            {/* Image Container */}
            <div className="w-full aspect-square max-w-[200px] p-2 relative flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200 overflow-hidden group mb-3">
              <ProductImage product={product} />
              
              {/* Edit Image Overlay */}
              <div 
                className="absolute inset-0 flex items-center justify-center transition-all rounded-xl cursor-pointer bg-black bg-opacity-0 hover:bg-opacity-20"
                onClick={() => setEditingImage(product._id)}
              >
                <div className="bg-white bg-opacity-90 p-3 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                  <FiEdit2 className="text-blue-600" size={20} />
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="w-full text-center mt-2 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-black line-clamp-2 px-1 mb-2">
                  {product.title || "Untitled Product"}
                </h3>
                
                <div className="flex flex-col items-center gap-2 mt-2 px-1">
                  <p className="text-xl font-semibold text-black text-center w-full">
                    ${product.price ? parseFloat(product.price).toFixed(2) : "0.00"}
                  </p>
                  
                  <span className={`text-xs px-3 py-1 rounded whitespace-nowrap inline-block ${
                    product.stock > 10 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : product.stock > 0 
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    Stock: {product.stock}
                  </span>
                </div>

                {product.category && (
                  <p className="text-sm text-gray-600 text-center mt-1 px-1">{product.category}</p>
                )}

                {product.description && (
                  <p className="text-xs text-gray-500 text-center line-clamp-2 mt-1 px-1">
                    {product.description}
                  </p>
                )}
              </div>

              <div className="w-full mt-2 flex justify-center">
                <button
                  className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg border-2 border-black transition-all duration-200 hover:shadow-md min-w-[60px]"
                  onClick={() => openEditModal(product._id)}
                >
                  <FiEdit className="text-lg" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Image Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 text-black">Update Product Image</h3>
            
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Current Image:</p>
              {(() => {
                const productBeingEdited = products.find(p => p._id === editingImage);
                return productBeingEdited ? (
                  <ProductImage product={productBeingEdited} />
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                    <FiImage className="text-gray-400" size={48} />
                    <p className="text-sm text-gray-500 mt-2">No image available</p>
                  </div>
                );
              })()}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select New Image</label>
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors p-4">
                <FiUpload className="text-gray-400 mb-2" size={32} />
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

            <div className="flex space-x-3">
              <button 
                onClick={() => {
                  if (selectedFile) {
                    updateProductImage(editingImage, selectedFile);
                  }
                }}
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
    </div>
  );
};

export default SaleProducts;