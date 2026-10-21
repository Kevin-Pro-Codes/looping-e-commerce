import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiHeart, FiShoppingCart, FiShare2 } from "react-icons/fi";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

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
  const [rating, setRating] = useState({
    average: 0,
    count: 0,
    distribution: [0, 0, 0, 0, 0]
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
    return (price * 0.67).toFixed(2);
  };

  // Gerar avaliações aleatórias para o produto
  const generateRandomRating = () => {
    const average = (Math.random() * 0.9 + 4.1).toFixed(1);
    const count = Math.floor(Math.random() * 491) + 10;
    const distribution = Array(5).fill(0);
    let remaining = count;

    for (let i = 0; i < 2; i++) {
      const max = Math.floor(count * 0.05);
      const value = Math.floor(Math.random() * (max + 1));
      distribution[i] = value;
      remaining -= value;
    }

    const maxThree = Math.floor(remaining * 0.15);
    const threeStars = Math.floor(Math.random() * (maxThree + 1));
    distribution[2] = threeStars;
    remaining -= threeStars;

    const maxFour = Math.floor(remaining * 0.5);
    const minFour = Math.floor(remaining * 0.3);
    const fourStars = Math.floor(Math.random() * (maxFour - minFour + 1)) + minFour;
    distribution[3] = fourStars;
    remaining -= fourStars;

    distribution[4] = remaining;

    const calculatedAverage = (
      (1 * distribution[0] + 
       2 * distribution[1] + 
       3 * distribution[2] + 
       4 * distribution[3] + 
       5 * distribution[4]) / count
    );

    if (calculatedAverage < 4.0) {
      const neededIncrease = (4.0 - calculatedAverage) * count;
      const transferFromThree = Math.min(distribution[2], Math.ceil(neededIncrease));
      
      distribution[2] -= transferFromThree;
      distribution[3] += transferFromThree;
      
      const newAverage = (
        (1 * distribution[0] + 
         2 * distribution[1] + 
         3 * distribution[2] + 
         4 * distribution[3] + 
         5 * distribution[4]) / count
      );
      
      if (newAverage < 4.0) {
        const additionalNeeded = (4.0 - newAverage) * count;
        const transferFromTwo = Math.min(distribution[1], Math.ceil(additionalNeeded * 2));
        
        distribution[1] -= transferFromTwo;
        distribution[3] += transferFromTwo;
      }
    }
    
    return {
      average: parseFloat(average),
      count: count,
      distribution: distribution
    };
  };

  // Renderizar estrelas
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-500" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-500" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-500" />);
      }
    }
    
    return stars;
  };

  // Calcular porcentagem para cada estrela
  const calculatePercentage = (count, total) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  // Buscar detalhes do produto do backend
  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        setError("");
        
        const response = await fetch(`/api/products/${id}`, {
          credentials: "include",
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Erro HTTP! status: ${response.status}`);
        }

        const productData = await response.json();
        
        const normalizedProduct = {
          _id: productData._id?.$oid || productData._id || id,
          title: productData.title || "Sem título",
          price: productData.price || 0,
          description: productData.description || "Sem descrição disponível",
          image: (productData.image || "").replace('http://localhost:8000', 'http://localhost:8888'),
          category: productData.category || "Sem categoria",
          size: Array.isArray(productData.size) ? productData.size : ["P", "M", "G"],
          color: Array.isArray(productData.color) ? productData.color : ["#000000", "#FFFFFF", "#1E90FF", "#FF69B4"],
          stock: productData.stock || 50,
          material: productData.material || "Algodão Premium",
          care: productData.care || "Lavar na máquina",
          origin: productData.origin || "Portugal",
          sku: productData.sku || productData._id?.$oid || productData._id,
          images: (productData.images || [productData.image]).filter(Boolean).map(img => img.replace('http://localhost:8000', 'http://localhost:8888'))
        };

        setProduct(normalizedProduct);
        setMainImage(normalizedProduct.image);
        setImageGallery(normalizedProduct.images);
        setSelectedSize(normalizedProduct.size[0] || "");
        setSelectedColor(normalizedProduct.color[0] || "#000000");
        
        const randomRating = generateRandomRating();
        setRating(randomRating);
        
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
    }
  }, [id]);

  const addToCart = async () => {
    if (!product) return;
    
    if (!selectedSize) {
      alert("Por favor, selecione um tamanho");
      return;
    }

    if (!isLoggedIn) {
      alert("Por favor, faça login para adicionar itens ao carrinho");
      window.location.href = '/login';
      return;
    }

    try {
      setAddingToCart(true);

      await fetch("/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const getCsrfToken = () => {
        return document.cookie
          .split('; ')
          .find(row => row.startsWith('XSRF-TOKEN='))
          ?.split('=')[1];
      };

      const csrfToken = getCsrfToken();
      
      if (!csrfToken) {
        alert("Erro de autenticação. Por favor, tente fazer login novamente.");
        return;
      }

      const res = await fetch("/api/cart/add", {
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
          size: selectedSize,
          color: selectedColor
        }),
      });

      if (res.status === 401) {
        setIsLoggedIn(false);
        localStorage.removeItem('user');
        localStorage.removeItem('loggedIn');
        alert("Sua sessão expirou. Por favor, faça login novamente.");
        window.location.href = '/login';
        return;
      }

      if (res.ok) {
        // Dispatch custom event to notify Navbar of cart update
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { 
            action: 'add',
            product_id: product._id,
            quantity: quantity,
            size: selectedSize,
            color: selectedColor,
            title: product.title
          } 
        }));
        
        alert(`"${product.title}" (Tamanho: ${selectedSize}, Cor: ${getColorName(selectedColor)}) adicionado ao carrinho!`);
      } else {
        const errorData = await res.json();
        if (res.status === 404) {
          alert("Produto não encontrado. Por favor, tente novamente.");
        } else {
          alert("Falha ao adicionar produto ao carrinho. Por favor, tente novamente.");
        }
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Erro de rede. Por favor, verifique sua conexão e tente novamente.");
    } finally {
      setAddingToCart(false);
    }
  };

  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };
  
  const decreaseQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      if (product && value <= product.stock) {
        setQuantity(value);
      } else if (!product) {
        setQuantity(value);
      }
    } else if (e.target.value === '') {
      setQuantity(1);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="max-w-6xl mt-28 mx-auto px-3 sm:px-6 lg:px-8">
      {/* Botão Voltar - Aligned left on all screens */}
<div className="w-full">
  <button 
    onClick={() => navigate(-1)}
    className="flex items-center text-black mb-4 hover:text-red-600 transition-colors text-sm"
    style={{ fontFamily: "'Calibri', 'sans-serif'" }}
  >
    <IoIosArrowRoundBack size={20} className="mr-1" />
    Voltar para Produtos
  </button>
</div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
            {/* Imagens do Produto */}
            <div className="space-y-3">
              {/* Imagem Principal */}
              <div className="bg-white rounded-lg overflow-hidden aspect-square flex items-center justify-center">
                <img 
                  src={mainImage} 
                  alt={product.title}
                  className="w-full h-full object-contain p-4"
                />
              </div>

              {/* Galeria de Imagens */}
              {imageGallery.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {imageGallery.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setMainImage(img)}
                      className={`aspect-square bg-gray-50 rounded-md overflow-hidden border ${
                        mainImage === img ? 'border-red-600' : 'border-gray-200'
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
            <div className="space-y-4 text-center sm:text-left">
              {/* Título e Avaliações */}
              <div className="flex flex-col gap-2 items-center sm:items-start">
                {/* Título */}
                <h1 
                  className="text-xl sm:text-2xl lg:text-3xl font-bold text-black text-center sm:text-left"
                  style={{ fontFamily: "'Calibri', 'sans-serif'" }}
                >
                  {product.title}
                </h1>

                {/* Sistema de Estrelas */}
                <div className="flex items-center justify-center sm:justify-start flex-wrap gap-2" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
                  {/* Estrelas */}
                  <div className="flex items-center">
                    {renderStars(rating.average)}
                  </div>
                  
                  {/* Número da avaliação e quantidade */}
                  <div className="flex items-center gap-1">
                    <span className="text-gray-800 font-bold text-sm sm:text-base">
                      {rating.average.toFixed(1)}
                    </span>
                    <span className="text-gray-400 text-sm">|</span>
                    <span className="text-gray-500 text-xs sm:text-sm">
                      {rating.count} avaliações
                    </span>
                  </div>
                </div>
              </div>

              {/* Preços - Centralizado em mobile */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
                <p className="text-xl sm:text-2xl font-bold text-black">
                  ${product.price}
                </p>
                <p className="text-base sm:text-lg font-semibold text-gray-500 line-through">
                  ${Math.floor(parseFloat(product.price) + parseFloat(product.price) * 0.4968 + 0.20)}.99
                </p>
                <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-semibold">
                  -33%
                </span>
              </div>

              {/* Categoria e Stock - Centralizado em mobile */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                  {product.category}
                </span>
                <span className="text-green-600 text-sm font-semibold">
                  {product.stock > 0 ? 'Em Stock' : 'Fora de Stock'}
                </span>
              </div>

              {/* Descrição */}
              <p className="text-gray-700 text-sm leading-relaxed text-center sm:text-left" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
                {product.description}
              </p>

              {/* Seleção de Tamanho */}
              <div>
                <label 
                  className="block text-base font-semibold text-black mb-2 text-center sm:text-left"
                  style={{ fontFamily: "'Georgia', 'Times New Roman', 'Palatino', serif" }}
                >
                  Tamanho
                </label>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  {product.size.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border rounded-md font-bold text-base transition-all duration-200 ${
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

              {/* Seleção de Cor */}
              <div>
                <label 
                  className="block text-base font-semibold text-black mb-2 text-center sm:text-left"
                  style={{ fontFamily: "'Georgia', 'Times New Roman', 'Palatino', serif" }}
                >
                  Cor
                </label>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  {product.color.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border transition-all duration-200 ${
                        selectedColor === color
                          ? 'border-black ring-1 ring-offset-1 ring-black'
                          : 'border-gray-300 hover:scale-105'
                      } ${
                        color === "#FFFFFF" ? 'border-gray-300' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      title={getColorName(color)}
                    />
                  ))}
                </div>
                {selectedColor && (
                  <p className="text-xs text-gray-600 mt-1 text-center sm:text-left" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
                    Cor selecionada: {getColorName(selectedColor)}
                  </p>
                )}
              </div>

              {/* Seletor de Quantidade */}
              <div>
                <label 
                  className="block text-base font-semibold text-black mb-2 text-center sm:text-left"
                  style={{ fontFamily: "'Georgia', 'Times New Roman', 'Palatino', serif" }}
                >
                  Quantidade
                </label>
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className={`w-8 h-8 flex items-center justify-center font-bold transition-colors ${
                        quantity <= 1 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'hover:bg-gray-100 text-black'
                      }`}
                      style={{ fontFamily: "'Calibri', 'sans-serif'" }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-8 h-8 flex items-center justify-center font-semibold text-center border-0 focus:outline-none focus:ring-0 text-black text-sm"
                      style={{ fontFamily: "'Calibri', 'sans-serif'" }}
                    />
                    <button
                      onClick={increaseQuantity}
                      disabled={quantity >= product.stock}
                      className={`w-8 h-8 flex items-center justify-center font-bold transition-colors ${
                        quantity >= product.stock
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'hover:bg-gray-100 text-black'
                      }`}
                      style={{ fontFamily: "'Calibri', 'sans-serif'" }}
                    >
                      +
                    </button>
                  </div>
                  <span className="text-gray-600 text-sm text-center sm:text-left" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
                    {product.stock} disponíveis
                  </span>
                </div>
                {quantity >= product.stock && (
                  <p className="text-red-500 text-xs mt-1 text-center sm:text-left" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
                    Quantidade máxima atingida
                  </p>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row gap-3 pt-3">
                <button
                  onClick={addToCart}
                  disabled={product.stock === 0 || addingToCart}
                  className={`flex-1 py-3 px-4 rounded-md font-semibold text-base transition-colors flex items-center justify-center ${
                    product.stock === 0 || addingToCart
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                  style={{ fontFamily: "'Georgia', 'Times New Roman', 'Palatino', serif" }}
                >
                  {addingToCart ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Adicionando...
                    </>
                  ) : (
                    <>
                      <FiShoppingCart className="mr-2" size={18} />                      
                    </>
                  )}
                </button>
                <div className="flex justify-center sm:justify-start gap-2">
                  <button
                    onClick={() => setFavorite(!favorite)}
                    className="flex-1 sm:w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md hover:border-red-600 transition-colors"
                  >
                    <FiHeart 
                      size={18} 
                      style={{ 
                        stroke: favorite ? "red" : "black", 
                        strokeWidth: 1.5, 
                        fill: favorite ? "red" : "none" 
                      }} 
                    />
                  </button>
                  <button className="flex-1 sm:w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md hover:border-red-600 transition-colors">
                    <FiShare2 size={18} style={{ stroke: "black", strokeWidth: 1.5 }} />
                  </button>
                </div>
              </div>

              {/* Informações Adicionais */}
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 text-center sm:text-left" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
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
          <div className="border-t border-gray-200 mt-4 sm:mt-6">
            <div className="flex flex-wrap sm:flex-nowrap border-b border-gray-200 overflow-x-auto justify-center sm:justify-start">
              {['description', 'reviews', 'specifications', 'shipping'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 min-w-[120px] py-3 px-2 sm:px-4 text-sm font-semibold text-center capitalize transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'text-red-600 border-b-2 border-red-600'
                      : 'text-gray-600 hover:text-red-600'
                  }`}
                  style={{ fontFamily: "'Calibri', 'sans-serif'" }}
                >
                  {tab === 'description' ? 'descrição' : 
                   tab === 'reviews' ? 'avaliações' :
                   tab === 'specifications' ? 'especificações' : 'envio'}
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-6">
              {activeTab === 'description' && (
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-bold text-black mb-3" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
                    Descrição do Produto
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
                    {product.description}
                  </p>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-black mb-3 text-center sm:text-left" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
                    Avaliações dos Clientes
                  </h3>
                  
                  {/* Resumo das avaliações */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg flex-1">
                      <div className="flex flex-col items-center" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
                        <div className="text-3xl font-bold text-black mb-1">
                          {rating.average.toFixed(1)}
                        </div>
                        <div className="flex mb-1">
                          {renderStars(rating.average)}
                        </div>
                        <p className="text-gray-600 text-sm">
                          {rating.count} avaliações
                        </p>
                      </div>
                    </div>
                    
                    {/* Distribuição de estrelas */}
                    <div className="space-y-2 flex-1" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const count = rating.distribution[stars - 1];
                        const percentage = calculatePercentage(count, rating.count);
                        
                        return (
                          <div key={stars} className="flex items-center text-xs">
                            <div className="w-8 flex items-center">
                              <span className="text-gray-700 mr-1 min-w-[16px]">{stars}</span>
                              <FaStar className="text-yellow-500 text-xs" />
                            </div>
                            <div className="flex-1 mx-2">
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-yellow-500 h-1.5 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="w-10 text-right text-gray-700">
                              {percentage}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Exemplo de avaliações */}
                  <div className="mt-6">
                    <h4 className="text-base font-semibold text-black mb-3 text-center sm:text-left" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
                      Avaliações recentes
                    </h4>
                    <div className="space-y-4" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
                      <div className="border-b border-gray-200 pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 mb-1">
                          <div className="flex justify-center sm:justify-start">
                            {renderStars(5)}
                          </div>
                          <span className="font-semibold text-sm text-center sm:text-left">Excelente produto!</span>
                        </div>
                        <p className="text-gray-700 text-sm mb-1 text-center sm:text-left">
                          "Qualidade excepcional e confortável. Superou minhas expectativas!"
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 gap-1">
                          <span>João Silva</span>
                          <span>15 Jan, 2024</span>
                        </div>
                      </div>
                      
                      <div className="border-b border-gray-200 pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 mb-1">
                          <div className="flex justify-center sm:justify-start">
                            {renderStars(4)}
                          </div>
                          <span className="font-semibold text-sm text-center sm:text-left">Muito bom</span>
                        </div>
                        <p className="text-gray-700 text-sm mb-1 text-center sm:text-left">
                          "Gostei muito, mas poderia ter mais cores disponíveis."
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 gap-1">
                          <span>Maria Santos</span>
                          <span>10 Jan, 2024</span>
                        </div>
                      </div>
                      
                      <div className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 mb-1">
                          <div className="flex justify-center sm:justify-start">
                            {renderStars(5)}
                          </div>
                          <span className="font-semibold text-sm text-center sm:text-left">Perfeito!</span>
                        </div>
                        <p className="text-gray-700 text-sm mb-1 text-center sm:text-left">
                          "Exatamente como na foto. Entrega rápida e produto de alta qualidade."
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 gap-1">
                          <span>Carlos Oliveira</span>
                          <span>5 Jan, 2024</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="space-y-4" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
                  <h3 className="text-lg font-bold text-black mb-3 text-center sm:text-left">Especificações</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-base font-semibold text-black mb-2 text-center sm:text-left">Detalhes do Produto</h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-200 py-2">
                        <dt className="text-gray-600 mb-1 sm:mb-0 text-center sm:text-left">Material</dt>
                        <dd className="text-black font-medium text-center sm:text-left">{product.material}</dd>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-200 py-2">
                        <dt className="text-gray-600 mb-1 sm:mb-0 text-center sm:text-left">Instruções de Cuidado</dt>
                        <dd className="text-black font-medium text-center sm:text-left">{product.care}</dd>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-200 py-2">
                        <dt className="text-gray-600 mb-1 sm:mb-0 text-center sm:text-left">Origem</dt>
                        <dd className="text-black font-medium text-center sm:text-left">{product.origin}</dd>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2">
                        <dt className="text-gray-600 mb-1 sm:mb-0 text-center sm:text-left">SKU</dt>
                        <dd className="text-black font-medium text-center sm:text-left">{product.sku}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-3" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
                  <h3 className="text-lg font-bold text-black mb-3 text-center sm:text-left">Envio & Devoluções</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-base font-semibold text-black mb-2 text-center sm:text-left">Informações de Envio</h4>
                      <ul className="space-y-1 text-sm text-gray-700 text-center sm:text-left">
                        <li>• Envio gratuito mundial</li>
                        <li>• Entrega em 2-5 dias úteis</li>
                        <li>• Envio expresso disponível</li>
                        <li>• Acompanhe seu pedido online</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-base font-semibold text-black mb-2 text-center sm:text-left">Política de Devolução</h4>
                      <ul className="space-y-1 text-sm text-gray-700 text-center sm:text-left">
                        <li>• Política de devolução de 30 dias</li>
                        <li>• Devoluções gratuitas</li>
                        <li>• Processo de devolução fácil</li>
                        <li>• Garantia de reembolso total</li>
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