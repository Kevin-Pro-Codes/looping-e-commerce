import React from 'react';
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
    
    // Handle both hex codes and color names
    const normalizedColor = color.toLowerCase().trim();
    return colorMap[color] || colorMap[normalizedColor] || `Cor ${color}`;
  };

  // Helper to extract size and color from cart item
  const getItemAttributes = (item) => {
    // Try different possible property names
    const size = item.size || item.tamanho || item.selectedSize || 'Não especificado';
    const color = item.color || item.cor || item.selectedColor || 'Não especificado';
    
    return { size, color };
  };

  if (loadingCart || cart === null) {
    return (
      <div className="text-center py-8" style={{fontFamily: 'Calibri, Arial, sans-serif'}}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando seu carrinho...</p>
      </div>
    );
  }

  if (cart.length === 0) {
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
    if (cart.length === 0) {
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
            {cart.length} {cart.length === 1 ? 'item' : 'itens'}
          </p>
        </div>
      </div>

      {/* Cart Items */}
      <div className="space-y-4">
        {cart.map((item, index) => {
          const { size, color } = getItemAttributes(item);
          const product = item.product || {
            id: item.product_id,
            name: item.title || 'Product ' + (item.product_id || item.id),
            price: item.price || 0,
            image: item.image,
            description: item.description || 'Product information not available',
            category: item.category || 'Unknown'
          };

          const itemPrice = item.price || product.price || 0;
          const itemTotal = itemPrice * item.quantity;

          return (
            <Card key={item.id || `${item.product_id}-${index}`} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Product Image */}
                <div className="flex-shrink-0 w-full sm:w-24 h-40 sm:h-24 bg-transparent border-2 border-black rounded-lg flex items-center justify-center">
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
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {product.name}
                      </h3>
                      
                      {/* ✅ SIZE AND COLOR INFORMATION */}
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
                        <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-1">
                          <button
                            onClick={() => updateCartQuantity(item.id || item.product_id, Math.max(1, item.quantity - 1))}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-200 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <FiMinus size={14} />
                          </button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id || item.product_id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-200 transition-colors"
                          >
                            <FiPlus size={14} />
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
                        onClick={() => removeFromCart(item.id || item.product_id)}
                        className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors"
                        title="Remover do carrinho"
                      >
                        <FiTrash2 size={18} />
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
            R$ {cartTotal.toFixed(2)}
          </span>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>R$ {cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Frete</span>
            <span>Grátis</span>
          </div>
          <div className="flex justify-between text-lg font-semibold text-gray-900 pt-3 border-t border-gray-200">
            <span>Total</span>
            <span>R$ {cartTotal.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={processCheckout}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold text-lg transition-colors"
        >
          Finalizar Compra
        </button>  
      </Card>

      {/* ✅ DEBUG SECTION - Development Only */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <details className="text-sm">
          <summary className="cursor-pointer font-medium text-yellow-700">
            🔧 Informações de Debug (Desenvolvimento)
          </summary>
          <div className="mt-2 space-y-2 text-xs">
            <p><strong>Total de itens no carrinho:</strong> {cart.length}</p>
            <p><strong>Estrutura do primeiro item:</strong></p>
            <pre className="bg-white p-2 rounded border overflow-x-auto">
              {JSON.stringify(cart[0], null, 2)}
            </pre>
            <button 
              onClick={() => console.log('🛒 Cart Data:', cart)}
              className="text-blue-600 hover:text-blue-800"
            >
              Ver dados completos no console
            </button>
          </div>
        </details>
      </div>
    </div>
  );
};

export default CartTab;