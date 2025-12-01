import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import { Card } from './SharedComponents';

const CartTab = ({ 
  cart, 
  loadingCart, 
  updateCartQuantity, 
  removeFromCart, 
  cartTotal 
}) => {
  const navigate = useNavigate();
  const [updatingItems, setUpdatingItems] = useState({});
  const [removingItems, setRemovingItems] = useState({});
  const [optimisticCart, setOptimisticCart] = useState([]);
  
  // Use ref para evitar re-render desnecessários
  const cartRef = useRef(cart);

  // Sync otimista apenas quando o cart muda REALMENTE
  useEffect(() => {
    if (cart && JSON.stringify(cartRef.current) !== JSON.stringify(cart)) {
      setOptimisticCart(cart);
      cartRef.current = cart;
    }
  }, [cart]);

  // Helper function to get color name from hex code
  const getColorName = (color) => {
    if (!color) return 'Não especificado';
    
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

  // Enhanced helper to extract size and color from cart item
  const getItemAttributes = (item) => {
    const size = item.size || item.selectedSize || item.tamanho || 'Não especificado';
    const color = item.color || item.selectedColor || item.cor || 'Não especificado';
    
    return { size, color };
  };

  // ✅ CORRIGIDO: Atualização de quantidade com estado otimista
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      await handleRemoveFromCart(itemId);
      return;
    }

    try {
      setUpdatingItems(prev => ({ ...prev, [itemId]: true }));

      // Atualização otimista IMEDIATA
      setOptimisticCart(prevCart => 
        prevCart.map(item => 
          (item.id || item._id) === itemId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      );

      await updateCartQuantity(itemId, newQuantity);

    } catch (error) {
      // Rollback apenas em caso de erro
      setOptimisticCart(cartRef.current);
      alert('Erro ao atualizar quantidade. Tente novamente.');
    } finally {
      setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // ✅ CORRIGIDO: Remoção com estado otimista
  const handleRemoveFromCart = async (itemId) => {
    try {
      setRemovingItems(prev => ({ ...prev, [itemId]: true }));

      // Remoção otimista IMEDIATA
      setOptimisticCart(prevCart => 
        prevCart.filter(item => (item.id || item._id) !== itemId)
      );

      await removeFromCart(itemId);

    } catch (error) {
      // Rollback apenas em caso de erro
      setOptimisticCart(cartRef.current);
      alert('Erro ao remover item. Tente novamente.');
    } finally {
      setRemovingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Quick quantity handlers
  const handleQuickDecrease = async (itemId, currentQuantity) => {
    await handleUpdateQuantity(itemId, currentQuantity - 1);
  };

  const handleQuickIncrease = async (itemId, currentQuantity) => {
    await handleUpdateQuantity(itemId, currentQuantity + 1);
  };

  // Check if item is being updated
  const isItemUpdating = (itemId) => updatingItems[itemId];
  
  // Check if item is being removed
  const isItemRemoving = (itemId) => removingItems[itemId];

  // Calculate optimistic totals
  const calculateOptimisticTotal = () => {
    return optimisticCart.reduce((total, item) => {
      const itemPrice = item.price || (item.product?.price || 0);
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  const optimisticTotal = calculateOptimisticTotal();

  if (loadingCart || cart === null) {
    return (
      <div className="text-center py-8" style={{fontFamily: 'Calibri, Arial, sans-serif'}}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando seu carrinho...</p>
      </div>
    );
  }

  // Use optimisticCart for rendering instead of cart prop
  const displayCart = optimisticCart.length > 0 ? optimisticCart : cart;
  const displayTotal = optimisticCart.length > 0 ? optimisticTotal : cartTotal;

  if (displayCart.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiShoppingCart size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Seu carrinho está vazio</h3>
        <p className="text-gray-500 mb-6">Adicione produtos para vê-los aqui!</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
        >
          Continuar Comprando
        </button>
      </div>
    );
  }

  const processCheckout = () => {
    if (displayCart.length === 0) {
      alert("Seu carrinho está vazio!");
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Carrinho</h2>
          <p className="text-gray-500 mt-1">
            {displayCart.length} {displayCart.length === 1 ? 'item' : 'itens'}
          </p>
        </div>
      </div>

      {/* Cart Items */}
      <div className="space-y-4">
        {displayCart.map((item, index) => {
          const { size, color } = getItemAttributes(item);
          const product = item.product || {
            id: item.product_id,
            name: item.title || item.name || 'Product ' + (item.product_id || item.id),
            price: item.price || 0,
            image: item.image,
            description: item.description || 'Product information not available',
            category: item.category || 'Unknown'
          };

          const itemPrice = item.price || product.price || 0;
          const itemTotal = itemPrice * item.quantity;
          const itemId = item.id || item._id || item.product_id;

          const isUpdating = isItemUpdating(itemId);
          const isRemoving = isItemRemoving(itemId);
          const isProcessing = isUpdating || isRemoving;

          return (
            <Card 
              key={itemId || `${item.product_id}-${index}`} 
              className={`p-4 hover:shadow-md transition-all duration-300 ${
                isProcessing ? 'opacity-60' : ''
              } ${isRemoving ? 'border-2 border-red-200 bg-red-50' : ''}`}
            >
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Product Image */}
                <div className="flex-shrink-0 w-full sm:w-24 h-40 sm:h-24 bg-transparent border-2 border-black rounded-lg flex items-center justify-center relative">
                  {isProcessing && (
                    <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center rounded-lg z-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                    </div>
                  )}
                  {product.image || item.image ? (
                    <img 
                      src={product.image || item.image} 
                      alt={product.name}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-transparent border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-xs">Sem imagem</span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {product.name}
                        </h3>
                        {isProcessing && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                            {isRemoving ? 'Removendo...' : 'Atualizando...'}
                          </span>
                        )}
                      </div>
                      
                      {/* SIZE AND COLOR INFORMATION */}
                      <div className="flex flex-wrap items-center gap-4 mb-3">
                        {/* Size */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Tamanho:</span>
                          <span className="px-3 py-1 bg-gray-100 rounded text-sm font-medium border border-gray-300 min-w-8 text-center">
                            {size}
                          </span>
                        </div>
                        
                        {/* Color */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Cor:</span>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                              style={{ 
                                backgroundColor: color.startsWith('#') ? color : '#ccc',
                                borderColor: color === '#FFFFFF' ? '#ccc' : 'transparent'
                              }}
                              title={getColorName(color)}
                            ></div>
                            <span className="text-sm font-medium">
                              {getColorName(color)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {product.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4">
                        <span className="text-black font-bold text-lg">
                          R$ {itemPrice.toFixed(2)}
                        </span>
                        <span className="text-gray-500 text-sm capitalize">
                          {product.category}
                        </span>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-1 border">
                          <button
                            onClick={() => handleQuickDecrease(itemId, item.quantity)}
                            disabled={isProcessing || item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUpdating ? (
                              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <FiMinus size={14} />
                            )}
                          </button>
                          
                          <span className={`w-8 text-center font-semibold ${isUpdating ? 'text-gray-400' : ''}`}>
                            {item.quantity}
                          </span>
                          
                          <button
                            onClick={() => handleQuickIncrease(itemId, item.quantity)}
                            disabled={isProcessing}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUpdating ? (
                              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <FiPlus size={14} />
                            )}
                          </button>
                        </div>
                        
                        <span className="text-green-600 font-bold text-lg">
                          R$ {itemTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Remove Button */}
                    <div className="flex flex-row sm:flex-col gap-2">
                      <button
                        onClick={() => handleRemoveFromCart(itemId)}
                        disabled={isProcessing}
                        className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remover do carrinho"
                      >
                        {isRemoving ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <FiTrash2 size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Cart Summary */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Resumo do Pedido</h3>
          <span className="text-2xl font-bold text-green-600">
            R$ {displayTotal.toFixed(2)}
          </span>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>R$ {displayTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Frete</span>
            <span>Grátis</span>
          </div>
          <div className="flex justify-between text-lg font-semibold text-gray-900 pt-3 border-t border-gray-200">
            <span>Total</span>
            <span>R$ {displayTotal.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={processCheckout}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={Object.keys(updatingItems).some(key => updatingItems[key]) || Object.keys(removingItems).some(key => removingItems[key])}
        >
          {Object.keys(updatingItems).some(key => updatingItems[key]) || Object.keys(removingItems).some(key => removingItems[key]) 
            ? 'Processando...' 
            : 'Finalizar Compra'
          }
        </button>  
      </Card>
    </div>
  );
};

export default CartTab;