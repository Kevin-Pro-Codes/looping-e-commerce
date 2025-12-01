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
          const product = item.product || {
            id: item.product_id,
            name: 'Product ' + item.product_id,
            price: 0,
            image: '',
            description: 'Product information not available',
            category: 'Unknown'
          };

          const itemTotal = product.price * item.quantity;

          return (
            <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Product Image - TRANSPARENT with black stroke */}
                <div className="flex-shrink-0 w-full sm:w-20 h-40 sm:h-20 bg-transparent border-2 border-black rounded-lg flex items-center justify-center">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-transparent border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-xs">No image</span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">{product.name}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {product.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="text-black font-bold text-lg">
                          R$ {product.price ? parseFloat(product.price).toFixed(2) : '0,00'}
                        </span>
                        <span className="text-gray-500 text-sm capitalize">{product.category}</span>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                          >
                            <FiMinus size={14} />
                          </button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
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
                        onClick={() => removeFromCart(item.product_id)}
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
          Comprar
        </button>  
      </Card>
    </div>
  );
};

export default CartTab;