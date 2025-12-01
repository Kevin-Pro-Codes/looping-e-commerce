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

  // ✅ FIXED: Use actual product pricing data instead of hardcoded calculations
  const formatPrice = (price) => {
    if (!price && price !== 0) return '$0.00';
    return `$${parseFloat(price).toFixed(2)}`;
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
        console.log("📦 Product detail loaded:", productData);
        
        // ✅ FIXED: Use the new pricing fields from backend
        const normalizedProduct = {
          _id: productData._id?.$oid || productData._id || id,
          title: productData.title || "Sem título",
          // ✅ Use actual pricing data from backend
          base_price: productData.base_price || 0,
          original_price: productData.original_price || productData.base_price || 0,
          sale_price: productData.sale_price || productData.base_price || 0,
          discount_percent: productData.discount_percent || 0,
          on_sale: productData.on_sale || false,
          has_discount: productData.has_discount || false,
          display_price: productData.display_price || productData.sale_price || productData.base_price || 0,
          display_original_price: productData.display_original_price || productData.original_price || productData.base_price || 0,
          has_valid_discount: productData.has_valid_discount || false,
          
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
          // Imagens adicionais se disponíveis
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
      fetchProductDetail();
    }
  }, [id]);

  // ✅ FIXED: Adicionar ao carrinho com preços reais
  const handleAddToCart = () => {
    if (!product) return;
    
    if (!selectedSize) {
      alert("Por favor, selecione um tamanho");
      return;
    }

    const cartItem = {
      id: product._id,
      title: product.title,
      // ✅ Use actual product prices instead of calculated ones
      price: product.display_price || product.sale_price || product.base_price,
      original_price: product.display_original_price || product.original_price || product.base_price,
      discount_percent: product.discount_percent,
      on_sale: product.on_sale,
      image: product.image,
      size: selectedSize,
      color: selectedColor,
      quantity: quantity
    };

    console.log("🛒 Adding to cart:", cartItem);

    // Adicionar ao localStorage ou context
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
    
    // Mostrar mensagem de sucesso
    alert(`Adicionado ${quantity} ${product.title} ao carrinho!`);
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
      "#FFFFFF": "Branco", 
      "#1E90FF": "Azul",
      "#FF69B4": "Rosa",
      "#FF0000": "Vermelho",
      "#008000": "Verde",
      "#FFFF00": "Amarelo",
      "#808080": "Cinza"
    };
    return colorMap[color] || `Cor ${color}`;
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

  // ✅ FIXED: Use actual product pricing data
  const displayPrice = product.display_price || product.sale_price || product.base_price;
  const displayOriginalPrice = product.display_original_price || product.original_price || product.base_price;
  const hasValidDiscount = product.has_valid_discount && product.on_sale;

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
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                <img 
                  src={mainImage} 
                  alt={product.title}
                  className="w-full h-full object-cover"
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
              {/* ✅ FIXED: Título e Preço - Use actual product data */}
              <div>
                <h1 
                  className="text-3xl font-bold text-black mb-2"
                  style={{ fontFamily: "'Calibri', 'sans-serif'" }}
                >
                  {product.title}
                </h1>
                <div className="flex items-center space-x-4">
                  {/* Current Price */}
                  <p 
                    className="text-3xl font-bold text-black"
                    style={{ fontFamily: "'Calibri', 'sans-serif'" }}
                  >
                    {formatPrice(displayPrice)}
                  </p>
                  
                  {/* Original Price - Only show if there's a valid discount */}
                  {hasValidDiscount && (
                    <>
                      <p 
                        className="text-xl font-semibold text-gray-500 line-through"
                        style={{ fontFamily: "'Calibri', 'sans-serif'" }}
                      >
                        {formatPrice(displayOriginalPrice)}
                      </p>
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded-md text-sm font-semibold">
                        -{product.discount_percent}%
                      </span>
                    </>
                  )}
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
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 py-4 px-6 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center ${
                    product.stock === 0
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                  style={{ fontFamily: "'Georgia', 'Times New Roman', 'Palatino', serif" }}
                >
                  <FiShoppingCart className="mr-3" size={23} />
                  {product.stock === 0 ? 'Fora de Stock' : 'Adicionar ao Carrinho'}
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
                  {/* ✅ ADDED: Pricing Information */}
                  <div>
                    <span className="font-semibold">Preço Base:</span> {formatPrice(product.base_price)}
                  </div>
                  {hasValidDiscount && (
                    <div>
                      <span className="font-semibold">Desconto:</span> {product.discount_percent}%
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Abas do Produto */}
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
                  {tab === 'description' ? 'descrição' : 
                   tab === 'specifications' ? 'especificações' : 'envio'}
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
                      {/* ✅ ADDED: Pricing Information */}
                      <div className="flex justify-between border-b border-gray-100 py-2">
                        <dt className="text-gray-600">Preço Base</dt>
                        <dd className="text-black">{formatPrice(product.base_price)}</dd>
                      </div>
                      {hasValidDiscount && (
                        <>
                          <div className="flex justify-between border-b border-gray-100 py-2">
                            <dt className="text-gray-600">Preço Original</dt>
                            <dd className="text-black">{formatPrice(product.original_price)}</dd>
                          </div>
                          <div className="flex justify-between border-b border-gray-100 py-2">
                            <dt className="text-gray-600">Preço de Venda</dt>
                            <dd className="text-black">{formatPrice(product.sale_price)}</dd>
                          </div>
                          <div className="flex justify-between border-b border-gray-100 py-2">
                            <dt className="text-gray-600">Desconto Aplicado</dt>
                            <dd className="text-green-600 font-semibold">{product.discount_percent}% OFF</dd>
                          </div>
                        </>
                      )}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;