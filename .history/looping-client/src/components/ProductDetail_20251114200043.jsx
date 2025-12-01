import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiHeart, FiShoppingCart, FiShare2, FiTrendingUp, FiUsers } from "react-icons/fi";
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
  const [addingToCart, setAddingToCart] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // ✅ NEW: Development tracking for purchases
  const [purchaseStats, setPurchaseStats] = useState({
    totalPurchases: 0,
    sizeDistribution: {},
    colorDistribution: {},
    recentPurchases: []
  });

  // Check authentication status
  const checkAuthStatus = () => {
    const loggedIn = localStorage.getItem('loggedIn');
    const userData = localStorage.getItem('user');
    const isAuthenticated = !!(loggedIn && userData);
    setIsLoggedIn(isAuthenticated);
    return isAuthenticated;
  };

  // Calcular preço com desconto
  const calculateDiscountedPrice = (price) => {
    return (price * 0.67).toFixed(2); // 33% de desconto
  };

  // ✅ NEW: Load purchase statistics from localStorage
  const loadPurchaseStats = () => {
    try {
      const statsKey = `product_purchases_${id}`;
      const savedStats = localStorage.getItem(statsKey);
      if (savedStats) {
        setPurchaseStats(JSON.parse(savedStats));
      }
    } catch (error) {
      console.error("Error loading purchase stats:", error);
    }
  };

  // ✅ NEW: Save purchase to localStorage for development tracking
  const trackPurchase = (size, color, quantity) => {
    try {
      const statsKey = `product_purchases_${id}`;
      const currentStats = JSON.parse(localStorage.getItem(statsKey)) || {
        totalPurchases: 0,
        sizeDistribution: {},
        colorDistribution: {},
        recentPurchases: []
      };

      // Update total purchases
      currentStats.totalPurchases += quantity;

      // Update size distribution
      currentStats.sizeDistribution[size] = (currentStats.sizeDistribution[size] || 0) + quantity;

      // Update color distribution
      currentStats.colorDistribution[color] = (currentStats.colorDistribution[color] || 0) + quantity;

      // Add to recent purchases (limit to last 10)
      const purchaseRecord = {
        id: Date.now(),
        size,
        color,
        quantity,
        timestamp: new Date().toISOString(),
        colorName: getColorName(color)
      };
      
      currentStats.recentPurchases.unshift(purchaseRecord);
      currentStats.recentPurchases = currentStats.recentPurchases.slice(0, 10);

      // Save to localStorage
      localStorage.setItem(statsKey, JSON.stringify(currentStats));
      setPurchaseStats(currentStats);

      console.log("📊 Purchase tracked:", { size, color, quantity });
      console.log("📈 Updated stats:", currentStats);

    } catch (error) {
      console.error("Error tracking purchase:", error);
    }
  };

  // Buscar detalhes do produto do backend
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
          throw new Error(`Erro HTTP! status: ${response.status}`);
        }

        const productData = await response.json();
        
        // Normalizar os dados do produto
        const normalizedProduct = {
          _id: productData._id?.$oid || productData._id || id,
          title: productData.title || "Sem título",
          price: productData.price || 0,
          description: productData.description || "Sem descrição disponível",
          image: productData.image || "",
          category: productData.category || "Sem categoria",
          size: Array.isArray(productData.size) ? productData.size : ["P", "M", "G"],
          color: Array.isArray(productData.color) ? productData.color : ["#000000", "#FFFFFF", "#1E90FF", "#FF69B4"],
          stock: productData.stock || 50,
          material: productData.material || "Algodão Premium",
          care: productData.care || "Lavar na máquina",
          origin: productData.origin || "Portugal",
          sku: productData.sku || productData._id?.$oid || productData._id,
          images: productData.images || [productData.image].filter(Boolean)
        };

        setProduct(normalizedProduct);
        setMainImage(normalizedProduct.image);
        setImageGallery(normalizedProduct.images);
        
        // Definir seleções padrão
        setSelectedSize(normalizedProduct.size[0] || "");
        setSelectedColor(normalizedProduct.color[0] || "#000000");
        
      } catch (error) {
        console.error("Erro ao buscar produto:", error);
        setError("Falha ao carregar detalhes do produto. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      checkAuthStatus();
      fetchProductDetail();
      loadPurchaseStats(); // ✅ Load purchase stats when component mounts
    }
  }, [id]);

  // ✅ UPDATED: Add to cart function with MongoDB integration and purchase tracking
  const addToCart = async () => {
    if (!product) return;
    
    if (!selectedSize) {
      alert("Por favor, selecione um tamanho");
      return;
    }

    // Check authentication first
    if (!isLoggedIn) {
      alert("Por favor, faça login para adicionar itens ao carrinho");
      window.location.href = '/login';
      return;
    }

    try {
      setAddingToCart(true);

      // Get CSRF cookie first
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      // Extract CSRF token
      const getCsrfToken = () => {
        return document.cookie
          .split('; ')
          .find(row => row.startsWith('XSRF-TOKEN='))
          ?.split('=')[1];
      };

      const csrfToken = getCsrfToken();
      
      if (!csrfToken) {
        console.error("❌ CSRF token not found - authentication issue");
        alert("Erro de autenticação. Por favor, tente fazer login novamente.");
        return;
      }

      console.log("🛒 Adding product to cart:", product._id);

      // Send request to add product to cart with size and color
      const res = await fetch("http://localhost:8000/api/cart/add", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ 
          product_id: product._id,
          quantity: quantity,
          size: selectedSize, // ✅ Include selected size
          color: selectedColor // ✅ Include selected color
        }),
      });

      console.log("📬 Add to cart response status:", res.status);

      if (res.status === 401) {
        console.error("🚨 401 Unauthorized - User not authenticated");
        setIsLoggedIn(false);
        localStorage.removeItem('user');
        localStorage.removeItem('loggedIn');
        alert("Sua sessão expirou. Por favor, faça login novamente.");
        window.location.href = '/login';
        return;
      }

      if (res.ok) {
        const data = await res.json();
        console.log("✅ Product added to cart:", data);
        
        // ✅ TRACK PURCHASE FOR DEVELOPMENT
        trackPurchase(selectedSize, selectedColor, quantity);
        
        // Show success message with size and color
        alert(`✅ "${product.title}" (${selectedSize}, ${getColorName(selectedColor)}) adicionado ao carrinho!`);
        
      } else {
        const errorData = await res.json();
        console.error("❌ Failed to add to cart:", errorData);
        
        if (res.status === 404) {
          alert("Produto não encontrado. Por favor, tente novamente.");
        } else {
          alert("Falha ao adicionar produto ao carrinho. Por favor, tente novamente.");
        }
      }
    } catch (err) {
      console.error("❌ Error adding to cart:", err);
      alert("Erro de rede. Por favor, verifique sua conexão e tente novamente.");
    } finally {
      setAddingToCart(false);
    }
  };

  // Alterar quantidade
  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };
  
  const decreaseQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

  // Alterar quantidade diretamente
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= product.stock) {
      setQuantity(value);
    }
  };

  // Obter nome da cor para tooltip
  const getColorName = (color) => {
    const colorMap = {
      "#000000": "Preto",
      "#000": "Preto",
      "black": "Preto",
      "#FFFFFF": "Branco",
      "#fff": "Branco",
      "white": "Branco",
      "#1E90FF": "Azul",
      "blue": "Azul",
      "#FF69B4": "Rosa",
      "pink": "Rosa",
      "#FF0000": "Vermelho",
      "red": "Vermelho",
      "#00FF00": "Verde",
      "green": "Verde",
      "#0000FF": "Azul Escuro",
      "#FFFF00": "Amarelo",
      "yellow": "Amarelo",
      "#FFA500": "Laranja",
      "orange": "Laranja",
      "#800080": "Roxo",
      "purple": "Roxo",
      "#808080": "Cinza",
      "gray": "Cinza"
    };
    
    const normalizedColor = color.toLowerCase().trim();
    return colorMap[color] || colorMap[normalizedColor] || `Cor ${color}`;
  };

  // ✅ NEW: Get most popular size
  const getMostPopularSize = () => {
    const sizes = Object.entries(purchaseStats.sizeDistribution);
    if (sizes.length === 0) return null;
    return sizes.reduce((a, b) => a[1] > b[1] ? a : b);
  };

  // ✅ NEW: Get most popular color
  const getMostPopularColor = () => {
    const colors = Object.entries(purchaseStats.colorDistribution);
    if (colors.length === 0) return null;
    return colors.reduce((a, b) => a[1] > b[1] ? a : b);
  };

  // ✅ NEW: Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-black text-lg">Carregando detalhes do produto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-4">Erro ao Carregar Produto</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate("/")}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Voltar para Início
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-4">Produto Não Encontrado</h2>
          <button 
            onClick={() => navigate("/")}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Voltar para Início
          </button>
        </div>
      </div>
    );
  }

  const discountedPrice = calculateDiscountedPrice(product.price);
  const mostPopularSize = getMostPopularSize();
  const mostPopularColor = getMostPopularColor();

  return (
    <div className="min-h-screen bg-gray-50 py-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Botão Voltar */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-black mb-6 hover:text-red-600 transition-colors"
          style={{ fontFamily: "'Calibri', 'sans-serif'" }}
        >
          <IoIosArrowRoundBack size={24} className="mr-2" />
          Voltar para Produtos
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Imagens do Produto */}
            <div className="space-y-4">
              {/* Imagem Principal */}
              <div className="bg-gray-100 rounded-xl overflow-hidden h-auto">
                <img 
                  src={mainImage} 
                  alt={product.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Galeria de Imagens */}
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

            {/* Informações do Produto */}
            <div className="space-y-6">
              {/* Título e Preço */}
              <div>
                <h1 
                  className="text-3xl font-bold text-black mb-2"
                  style={{ fontFamily: "'Calibri', 'sans-serif'" }}
                >
                  {product.title}
                </h1>
                <div className="flex items-center space-x-4">
                  <p 
                    className="text-3xl font-bold text-black"
                    style={{ fontFamily: "'Calibri', 'sans-serif'" }}
                  >
                    ${product.price}
                  </p>
                  <p 
                    className="text-xl font-semibold text-gray-500 line-through"
                    style={{ fontFamily: "'Calibri', 'sans-serif'" }}
                  >
                    ${Math.floor(parseFloat(product.price) + parseFloat(product.price) * 0.4968 + 0.20)}.99
                  </p>
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded-md text-sm font-semibold">
                    -33%
                  </span>
                </div>
              </div>

              {/* Categoria */}
              <div className="flex items-center space-x-4">
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {product.category}
                </span>
                <span className="text-green-600 font-semibold">
                  {product.stock > 0 ? 'Em Stock' : 'Fora de Stock'}
                </span>
              </div>

              {/* Descrição */}
              <p className="text-gray-700 text-lg leading-relaxed">
                {product.description}
              </p>

              {/* ✅ NEW: Purchase Statistics (Development) */}
              {purchaseStats.totalPurchases > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                    <FiTrendingUp className="mr-2" />
                    Estatísticas de Desenvolvimento
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-700 font-medium">Total de Compras</p>
                      <p className="text-blue-900 font-bold text-lg">{purchaseStats.totalPurchases}</p>
                    </div>
                    
                    {mostPopularSize && (
                      <div>
                        <p className="text-blue-700 font-medium">Tamanho Mais Popular</p>
                        <p className="text-blue-900 font-bold text-lg">
                          {mostPopularSize[0]} ({mostPopularSize[1]} vendas)
                        </p>
                      </div>
                    )}
                    
                    {mostPopularColor && (
                      <div className="col-span-2">
                        <p className="text-blue-700 font-medium">Cor Mais Popular</p>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: mostPopularColor[0] }}
                          ></div>
                          <span className="text-blue-900 font-bold">
                            {getColorName(mostPopularColor[0])} ({mostPopularColor[1]} vendas)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Seleção de Tamanho - Dinâmico dos dados do produto */}
              <div>
                <label 
                  className="block text-lg font-semibold text-black mb-3"
                  style={{ fontFamily: "'Georgia', 'Times New Roman', 'Palatino', serif" }}
                >
                  Tamanho
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

              {/* Seleção de Cor - Dinâmico dos dados do produto */}
              <div>
                <label 
                  className="block text-lg font-semibold text-black mb-3"
                  style={{ fontFamily: "'Georgia', 'Times New Roman', 'Palatino', serif" }}
                >
                  Cor
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
                {selectedColor && (
                  <p className="text-sm text-gray-600 mt-2">
                    Cor selecionada: {getColorName(selectedColor)}
                  </p>
                )}
              </div>

              {/* Seletor de Quantidade */}
              <div>
                <label 
                  className="block text-lg font-semibold text-black mb-3"
                  style={{ fontFamily: "'Georgia', 'Times New Roman', 'Palatino', serif" }}
                >
                  Quantidade
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
                    {product.stock} disponíveis
                  </span>
                </div>
                {quantity >= product.stock && (
                  <p className="text-red-500 text-sm mt-2">
                    Quantidade máxima atingida
                  </p>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={addToCart}
                  disabled={product.stock === 0 || addingToCart}
                  className={`flex-1 py-4 px-6 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center ${
                    product.stock === 0 || addingToCart
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                  style={{ fontFamily: "'Georgia', 'Times New Roman', 'Palatino', serif" }}
                >
                  {addingToCart ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Adicionando...
                    </>
                  ) : (
                    <>
                      <FiShoppingCart className="mr-3" size={23} />
                      {product.stock === 0 ? 'Fora de Stock' : 'Adicionar ao Carrinho'}
                    </>
                  )}
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

              {/* Informações Adicionais */}
              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-semibold">Categoria:</span> {product.category}
                  </div>
                  <div>
                    <span className="font-semibold">SKU:</span> {product.sku}
                  </div>
                  <div>
                    <span className="font-semibold">Material:</span> {product.material}
                  </div>
                  <div>
                    <span className="font-semibold">Origem:</span> {product.origin}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Abas do Produto */}
          <div className="border-t border-gray-200 mt-8">
            <div className="flex border-b border-gray-200">
              {['description', 'specifications', 'shipping', 'analytics'].map((tab) => (
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
                  {tab === 'description' ? 'descrição' : 
                   tab === 'specifications' ? 'especificações' : 
                   tab === 'shipping' ? 'envio' : 'estatísticas'}
                </button>
              ))}
            </div>

            <div className="p-8">
              {activeTab === 'description' && (
                <div className="prose max-w-none">
                  <h3 className="text-2xl font-bold text-black mb-4">Descrição do Produto</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-black mb-3">Detalhes do Produto</h4>
                    <dl className="space-y-2">
                      <div className="flex justify-between border-b border-gray-100 py-2">
                        <dt className="text-gray-600">Material</dt>
                        <dd className="text-black">{product.material}</dd>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 py-2">
                        <dt className="text-gray-600">Instruções de Cuidado</dt>
                        <dd className="text-black">{product.care}</dd>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 py-2">
                        <dt className="text-gray-600">Origem</dt>
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
                  <h3 className="text-2xl font-bold text-black mb-4">Envio & Devoluções</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-black mb-3">Informações de Envio</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Envio gratuito mundial</li>
                        <li>• Entrega em 2-5 dias úteis</li>
                        <li>• Envio expresso disponível</li>
                        <li>• Acompanhe seu pedido online</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-black mb-3">Política de Devolução</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Política de devolução de 30 dias</li>
                        <li>• Devoluções gratuitas</li>
                        <li>• Processo de devolução fácil</li>
                        <li>• Garantia de reembolso total</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ NEW: Analytics Tab for Development */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-black mb-4 flex items-center">
                    <FiTrendingUp className="mr-2" />
                    Estatísticas de Desenvolvimento
                  </h3>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center">
                        <FiUsers className="text-blue-600 mr-2" size={20} />
                        <h4 className="font-semibold text-blue-800">Total de Compras</h4>
                      </div>
                      <p className="text-2xl font-bold text-blue-900 mt-2">
                        {purchaseStats.totalPurchases}
                      </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center">
                        <FiTrendingUp className="text-green-600 mr-2" size={20} />
                        <h4 className="font-semibold text-green-800">Tamanhos Vendidos</h4>
                      </div>
                      <p className="text-2xl font-bold text-green-900 mt-2">
                        {Object.keys(purchaseStats.sizeDistribution).length}
                      </p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center">
                        <FiTrendingUp className="text-purple-600 mr-2" size={20} />
                        <h4 className="font-semibold text-purple-800">Cores Vendidas</h4>
                      </div>
                      <p className="text-2xl font-bold text-purple-900 mt-2">
                        {Object.keys(purchaseStats.colorDistribution).length}
                      </p>
                    </div>
                  </div>

                  {/* Size Distribution */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-black mb-3">Distribuição de Tamanhos</h4>
                    <div className="space-y-2">
                      {Object.entries(purchaseStats.sizeDistribution)
                        .sort(([,a], [,b]) => b - a)
                        .map(([size, count]) => (
                          <div key={size} className="flex items-center justify-between">
                            <span className="font-medium">Tamanho {size}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ 
                                    width: `${(count / purchaseStats.totalPurchases) * 100}%` 
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600 w-8">{count}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Color Distribution */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-black mb-3">Distribuição de Cores</h4>
                    <div className="space-y-2">
                      {Object.entries(purchaseStats.colorDistribution)
                        .sort(([,a], [,b]) => b - a)
                        .map(([color, count]) => (
                          <div key={color} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: color }}
                              ></div>
                              <span className="font-medium">{getColorName(color)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full" 
                                  style={{ 
                                    width: `${(count / purchaseStats.totalPurchases) * 100}%` 
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600 w-8">{count}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Recent Purchases */}
                  {purchaseStats.recentPurchases.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-black mb-3">Compras Recentes</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {purchaseStats.recentPurchases.map((purchase) => (
                          <div key={purchase.id} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-3 h-3 rounded-full border border-gray-300"
                                style={{ backgroundColor: purchase.color }}
                              ></div>
                              <span>Tamanho {purchase.size}</span>
                              <span>{purchase.colorName}</span>
                              <span className="text-gray-500">Qtd: {purchase.quantity}</span>
                            </div>
                            <span className="text-gray-500 text-xs">
                              {formatTime(purchase.timestamp)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Debug Info */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Informações de Debug</h4>
                    <button
                      onClick={() => {
                        console.log('📊 Purchase Stats:', purchaseStats);
                        alert('Estatísticas logadas no console!');
                      }}
                      className="text-yellow-700 hover:text-yellow-900 text-sm"
                    >
                      Ver dados completos no console
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem(`product_purchases_${id}`);
                        setPurchaseStats({
                          totalPurchases: 0,
                          sizeDistribution: {},
                          colorDistribution: {},
                          recentPurchases: []
                        });
                        alert('Estatísticas resetadas!');
                      }}
                      className="ml-4 text-red-600 hover:text-red-800 text-sm"
                    >
                      Resetar Estatísticas
                    </button>
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