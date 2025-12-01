import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiHeart, FiShoppingCart, FiShare2, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { IoIosArrowRoundBack } from "react-icons/io";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");
  const [imageGallery, setImageGallery] = useState([]);
  const [activeTab, setActiveTab] = useState("description");
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch product details from backend
  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        setError("");
        
        const response = await fetch(`http://localhost:8000/api/products/${id}`, {
          credentials: "include",
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const productData = await response.json();
        
        // Normalize the product data
        const normalizedProduct = {
          _id: productData._id?.$oid || productData._id || id,
          title: productData.title || "No title",
          price: productData.price || 0,
          description: productData.description || "No description available",
          image: productData.image || "",
          category: productData.category || "Uncategorized",
          size: Array.isArray(productData.size) ? productData.size : ["P", "M", "G"],
          color: Array.isArray(productData.color) ? productData.color : ["#000000", "#FFFFFF", "#1E90FF", "#FF69B4"],
          stock: productData.stock || 50,
          material: productData.material || "Premium Cotton",
          care: productData.care || "Machine Wash",
          origin: productData.origin || "Portugal",
          sku: productData.sku || productData._id?.$oid || productData._id,
          // Additional images if available
          images: productData.images || [productData.image].filter(Boolean)
        };

        setProduct(normalizedProduct);
        setMainImage(normalizedProduct.image);
        setImageGallery(normalizedProduct.images);
        
        // Set default selections
        setSelectedSize(normalizedProduct.size[0] || "");
        setSelectedColor(normalizedProduct.color[0] || "#000000");
        
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Failed to load product details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetail();
    }
  }, [id]);

  // Handle add to cart
  const handleAddToCart = () => {
    if (!product) return;
    
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }

    const cartItem = {
      id: product._id,
      title: product.title,
      price: product.price,
      image: product.image,
      size: selectedSize,
      color: selectedColor,
      quantity: quantity
    };

    // Add to localStorage or context
    const existingCart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItemIndex = existingCart.findIndex(item => 
      item.id === cartItem.id && item.size === cartItem.size && item.color === cartItem.color
    );

    if (existingItemIndex >= 0) {
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      existingCart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    // Show success message
    alert(`Added ${quantity} ${product.title} to cart!`);
  };

  // Handle quantity changes
  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };
  
  const decreaseQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

  // Handle direct quantity input
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= product.stock) {
      setQuantity(value);
    }
  };

  // Get color name for tooltip
  const getColorName = (color) => {
    const colorMap = {
      "#000000": "Black",
      "#FFFFFF": "White", 
      "#1E90FF": "Blue",
      "#FF69B4": "Pink"
    };
    return colorMap[color] || `Color ${color}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-black text-lg">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-4">Error Loading Product</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate("/")}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-4">Product Not Found</h2>
          <button 
            onClick={() => navigate("/")}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-black mb-6 hover:text-red-600 transition-colors"
          style={{ fontFamily: "'Calibri', 'sans-serif'" }}
        >
          <IoIosArrowRoundBack size={24} className="mr-2" />
          Back to Products
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                <img 
                  src={mainImage} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Image Gallery */}
              {imageGallery.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {imageGallery.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setMainImage(img)}
                      className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                        mainImage === img ? 'border-red-600' : 'border-transparent'
                      }`}
                    >
                      <img 
                        src={img} 
                        alt={`${product.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Title and Price */}
              <div>
                <h1 
                  className="text-3xl font-bold text-black mb-2"
                  style={{ fontFamily: "'Calibri', 'sans-serif'" }}
                >
                  {product.title}
                </h1>
                <p 
                  className="text-3xl font-bold text-black"
                  style={{ fontFamily: "'Calibri', 'sans-serif'" }}
                >
                  ${product.price}
                </p>
              </div>

              {/* Category */}
              <div className="flex items-center space-x-4">
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {product.category}
                </span>
                <span className="text-green-600 font-semibold">
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-700 text-lg leading-relaxed">
                {product.description}
              </p>

              {/* Size Selection - Dynamic from product data */}
              <div>
                <label 
                  className="block text-lg font-semibold text-black mb-3"
                  style={{ fontFamily: "'Georgia', 'Times New Roman', 'Palatino', serif" }}
                >
                  Size
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.size.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-14 h-14 flex items-center justify-center border-2 rounded-lg font-bold text-lg transition-all duration-200 ${
                        selectedSize === size
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black border-gray-300 hover:border-black'
                      }`}
                      style={{ fontFamily: "'Georgia', 'Times New Roman', 'Palatino', serif" }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection - Dynamic from product data */}
              <div>
                <label 
                  className="block text-lg font-semibold text-black mb-3"
                  style={{ fontFamily: "'Georgia', 'Times New Roman', 'Palatino', serif" }}
                >
                  Color
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.color.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(color)}
                      className={`w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                        selectedColor === color
                          ? 'border-black ring-2 ring-offset-2 ring-black'
                          : 'border-gray-300 hover:scale-110'
                      } ${
                        color === "#FFFFFF" ? 'border-gray-300' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      title={getColorName(color)}
                    />
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div>
  <label 
    className="block text-lg font-semibold text-black mb-3"
    style={{ fontFamily: "'Georgia', 'Times New Roman', 'Palatino', serif" }}
  >
    Quantity
  </label>
  <div className="flex items-center space-x-4">
    <div className="flex items-center border-2 border-gray-300 rounded-lg">
      <button
        onClick={decreaseQuantity}
        disabled={quantity <= 1}
        className={`w-12 h-12 flex items-center justify-center text-xl font-bold transition-colors ${
          quantity <= 1 
            ? 'text-gray-400 cursor-not-allowed' 
            : 'hover:bg-gray-100 text-black'
        }`}
      >
        -
      </button>
      <input
        type="number"
        min="1"
        max={product.stock}
        value={quantity}
        onChange={handleQuantityChange}
        className="w-12 h-12 flex items-center justify-center text-lg font-semibold text-center border-0 focus:outline-none focus:ring-0 text-black"
      />
      <button
        onClick={increaseQuantity}
        disabled={quantity >= product.stock}
        className={`w-12 h-12 flex items-center justify-center text-xl font-bold transition-colors ${
          quantity >= product.stock
            ? 'text-gray-400 cursor-not-allowed'
            : 'hover:bg-gray-100 text-black'
        }`}
      >
        +
      </button>
    </div>
    <span className="text-gray-600">
      {product.stock} available
    </span>
  </div>
  {quantity >= product.stock && (
    <p className="text-red-500 text-sm mt-2">
      Maximum quantity reached
    </p>
  )}
</div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 py-4 px-6 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center ${
                    product.stock === 0
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                  style={{ fontFamily: "'Georgia', 'Times New Roman', 'Palatino', serif" }}
                >
                  <FiShoppingCart className="mr-3" size={29} />
                  {product.stock === 0 ? 'Out of Stock' : ''}
                </button>
                <button
                  onClick={() => setFavorite(!favorite)}
                  className="w-14 h-14 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-red-600 transition-colors"
                >
                  <FiHeart 
                    size={24} 
                    style={{ 
                      stroke: favorite ? "red" : "black", 
                      strokeWidth: 1.5, 
                      fill: favorite ? "red" : "none" 
                    }} 
                  />
                </button>
                <button className="w-14 h-14 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-red-600 transition-colors">
                  <FiShare2 size={24} style={{ stroke: "black", strokeWidth: 1.5 }} />
                </button>
              </div>

              {/* Additional Info */}
              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-semibold">Category:</span> {product.category}
                  </div>
                  <div>
                    <span className="font-semibold">SKU:</span> {product.sku}
                  </div>
                  <div>
                    <span className="font-semibold">Material:</span> {product.material}
                  </div>
                  <div>
                    <span className="font-semibold">Origin:</span> {product.origin}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Tabs */}
          <div className="border-t border-gray-200 mt-8">
            <div className="flex border-b border-gray-200">
              {['description', 'specifications', 'shipping'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 px-6 text-lg font-semibold text-center capitalize transition-colors ${
                    activeTab === tab
                      ? 'text-red-600 border-b-2 border-red-600'
                      : 'text-gray-600 hover:text-red-600'
                  }`}
                  style={{ fontFamily: "'Calibri', 'sans-serif'" }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-8">
              {activeTab === 'description' && (
                <div className="prose max-w-none">
                  <h3 className="text-2xl font-bold text-black mb-4">Product Description</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-black mb-3">Product Details</h4>
                    <dl className="space-y-2">
                      <div className="flex justify-between border-b border-gray-100 py-2">
                        <dt className="text-gray-600">Material</dt>
                        <dd className="text-black">{product.material}</dd>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 py-2">
                        <dt className="text-gray-600">Care Instructions</dt>
                        <dd className="text-black">{product.care}</dd>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 py-2">
                        <dt className="text-gray-600">Origin</dt>
                        <dd className="text-black">{product.origin}</dd>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 py-2">
                        <dt className="text-gray-600">SKU</dt>
                        <dd className="text-black">{product.sku}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-black mb-4">Shipping & Returns</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-black mb-3">Shipping Information</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Free worldwide shipping</li>
                        <li>• 2-5 business days delivery</li>
                        <li>• Express shipping available</li>
                        <li>• Track your order online</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-black mb-3">Return Policy</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li>• 30-day return policy</li>
                        <li>• Free returns</li>
                        <li>• Easy return process</li>
                        <li>• Full refund guarantee</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;