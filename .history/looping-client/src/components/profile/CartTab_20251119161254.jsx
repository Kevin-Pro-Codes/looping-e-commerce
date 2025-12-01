import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiPlus, FiMinus, FiTrash2, FiCheck } from 'react-icons/fi';
import { Card } from './SharedComponents';

// ✅ ADD: CSRF Token Manager for direct API calls if needed
const CsrfTokenManager = {
  getCsrfToken: async () => {
    try {
      const response = await fetch('http://localhost:8000/sanctum/csrf-cookie', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const cookies = document.cookie;
        const tokenMatch = cookies.match(/XSRF-TOKEN=([^;]+)/);
        
        if (tokenMatch && tokenMatch[1]) {
          return decodeURIComponent(tokenMatch[1]);
        }
      }
      
      const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      return metaToken || 'fallback-csrf-token';
      
    } catch (error) {
      console.error('❌ Error getting CSRF token:', error);
      return 'fallback-csrf-token';
    }
  }
};

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const cartRef = useRef(cart);

  // ✅ FIXED: Helper function to get unique item identifier
  const getItemId = (item) => {
    return item.id || item._id || item.product_id || `${item.product_id}-${item.size}-${item.color}`;
  };

  useEffect(() => {
    if (cart && JSON.stringify(cartRef.current) !== JSON.stringify(cart)) {
      setOptimisticCart(cart);
      cartRef.current = cart;
      
      // ✅ FIXED: Only initialize selection if no items are currently selected
      if (cart.length > 0 && selectedItems.size === 0) {
        setSelectedItems(new Set());
        setSelectAll(false);
      }
    }
  }, [cart]);

  // ✅ IMPROVED: Remove from cart with better error handling
  const handleRemoveFromCart = async (itemId) => {
    try {
      setRemovingItems(prev => ({ ...prev, [itemId]: true }));

      // Optimistic update first
      setOptimisticCart(prevCart => 
        prevCart.filter(item => getItemId(item) !== itemId)
      );

      // Remove from selected items if present
      const newSelectedItems = new Set(selectedItems);
      newSelectedItems.delete(itemId);
      setSelectedItems(newSelectedItems);

      // Try the provided removeFromCart function first
      if (removeFromCart) {
        await removeFromCart(itemId);
      } else {
        // Fallback: Direct API call
        await removeFromCartDirect(itemId);
      }

    } catch (error) {
      console.error('❌ Error removing item:', error);
      // Rollback optimistic update
      setOptimisticCart(cartRef.current);
      alert('Erro ao remover item. Tente novamente.');
    } finally {
      setRemovingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // ✅ ADD: Direct API call as fallback
  const removeFromCartDirect = async (itemId) => {
    try {
      const csrfToken = await CsrfTokenManager.getCsrfToken();
      
      console.log('🔄 Removing item directly via API:', itemId);
      
      // Try DELETE request first
      let response = await fetch(`http://localhost:8000/api/cart/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-XSRF-TOKEN': csrfToken,
        },
      });

      // If DELETE fails, try POST with _method=DELETE (Laravel style)
      if (!response.ok) {
        console.log('🔄 DELETE failed, trying POST with _method=DELETE');
        response = await fetch(`http://localhost:8000/api/cart/${itemId}`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': csrfToken,
          },
          body: JSON.stringify({
            _method: 'DELETE'
          })
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      console.log('✅ Item removed successfully:', result);
      
    } catch (error) {
      console.error('❌ Direct API removal failed:', error);
      throw error;
    }
  };

  // ✅ UPDATE: Handle update quantity with better error handling
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      const item = optimisticCart.find(item => getItemId(item) === itemId);
      if (item) {
        const product = item.product || {};
        setShowDeleteConfirm({
          itemId,
          itemName: product.name || 'Este produto'
        });
      }
      return;
    }

    try {
      setUpdatingItems(prev => ({ ...prev, [itemId]: true }));

      // Optimistic update
      setOptimisticCart(prevCart => 
        prevCart.map(item => 
          getItemId(item) === itemId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      );

      if (updateCartQuantity) {
        await updateCartQuantity(itemId, newQuantity);
      } else {
        // Fallback direct API call
        await updateCartQuantityDirect(itemId, newQuantity);
      }

    } catch (error) {
      console.error('❌ Error updating quantity:', error);
      // Rollback optimistic update
      setOptimisticCart(cartRef.current);
      alert('Erro ao atualizar quantidade. Tente novamente.');
    } finally {
      setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // ✅ ADD: Direct API call for quantity update
  const updateCartQuantityDirect = async (itemId, newQuantity) => {
    try {
      const csrfToken = await CsrfTokenManager.getCsrfToken();
      
      const response = await fetch(`http://localhost:8000/api/cart/${itemId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-XSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify({
          quantity: newQuantity
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Quantity updated successfully:', result);
      
    } catch (error) {
      console.error('❌ Direct API quantity update failed:', error);
      throw error;
    }
  };

  // Rest of the component remains the same until the delete confirmation...
  const confirmRemoveFromCart = (itemId, itemName) => {
    setShowDeleteConfirm({
      itemId,
      itemName
    });
  };

  const executeRemoveFromCart = async () => {
    if (showDeleteConfirm) {
      await handleRemoveFromCart(showDeleteConfirm.itemId);
      setShowDeleteConfirm(null);
    }
  };

  const cancelRemoveFromCart = () => {
    setShowDeleteConfirm(null);
  };

  const handleQuickDecrease = async (itemId, currentQuantity) => {
    await handleUpdateQuantity(itemId, currentQuantity - 1);
  };

  const handleQuickIncrease = async (itemId, currentQuantity) => {
    await handleUpdateQuantity(itemId, currentQuantity + 1);
  };

  // ✅ UPDATE: Toggle select all items
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      const allItemIds = new Set(displayCart.map(item => getItemId(item)));
      setSelectedItems(allItemIds);
    }
    setSelectAll(!selectAll);
  };

  // ✅ UPDATE: Toggle individual item selection
  const handleItemSelect = (itemId) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(itemId)) {
      newSelectedItems.delete(itemId);
    } else {
      newSelectedItems.add(itemId);
    }
    setSelectedItems(newSelectedItems);
    
    const allItemIds = new Set(displayCart.map(item => getItemId(item)));
    setSelectAll(newSelectedItems.size === allItemIds.size);
  };

  // ✅ UPDATE: Calculate total for selected items only
  const calculateSelectedTotal = () => {
    return displayCart.reduce((total, item) => {
      const itemId = getItemId(item);
      if (selectedItems.has(itemId)) {
        const itemPrice = item.price || (item.product?.price || 0);
        return total + (itemPrice * item.quantity);
      }
      return total;
    }, 0);
  };

  // ✅ UPDATE: Get selected items count
  const getSelectedItemsCount = () => {
    return selectedItems.size;
  };

  // ✅ UPDATE: Check if item is selected
  const isItemSelected = (itemId) => {
    return selectedItems.has(itemId);
  };

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
    return colorMap[color] || colorMap[normalizedColor] || `${color}`;
  };

  // Enhanced helper to extract size and color from cart item
  const getItemAttributes = (item) => {
    const size = item.size || item.selectedSize || item.tamanho || 'Não especificado';
    const color = item.color || item.selectedColor || item.cor || 'Não especificado';
    
    return { size, color };
  };

  const isItemUpdating = (itemId) => updatingItems[itemId];
  const isItemRemoving = (itemId) => removingItems[itemId];

  const calculateOptimisticTotal = () => {
    return optimisticCart.reduce((total, item) => {
      const itemPrice = item.price || (item.product?.price || 0);
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  const optimisticTotal = calculateOptimisticTotal();

  // ✅ UPDATE: Process checkout with selected items only
  const processCheckout = () => {
    if (selectedItems.size === 0) {
      alert("Selecione pelo menos um item para finalizar a compra!");
      return;
    }

    // ✅ FIXED: Create a filtered cart with only selected items
    const selectedCartItems = displayCart.filter(item => 
      selectedItems.has(getItemId(item))
    );

    if (selectedCartItems.length === 0) {
      alert("Nenhum item selecionado para checkout!");
      return;
    }

    console.log("🛒 Selected items for checkout:", selectedCartItems);
    console.log("💰 Selected total:", calculateSelectedTotal());

    navigate('/checkout', { 
      state: { 
        selectedCartItems,
        selectedItemsTotal: calculateSelectedTotal()
      } 
    });
  };

  const DeleteConfirmationModal = () => {
    if (!showDeleteConfirm) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTrash2 className="text-red-600" size={24} />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Remover do carrinho?
            </h3>
            
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja remover <strong>"{showDeleteConfirm.itemName}"</strong> do seu carrinho?
            </p>
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={cancelRemoveFromCart}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              
              <button
                onClick={executeRemoveFromCart}
                disabled={removingItems[showDeleteConfirm.itemId]}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {removingItems[showDeleteConfirm.itemId] ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Removendo...
                  </>
                ) : (
                  <>
                    <FiTrash2 size={16} />
                    Sim, Remover
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loadingCart || cart === null) {
    return (
      <div className="text-center py-8" style={{fontFamily: 'Calibri, Arial, sans-serif'}}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando seu carrinho...</p>
      </div>
    );
  }

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

  const selectedTotal = calculateSelectedTotal();
  const selectedCount = getSelectedItemsCount();

  return (
    <>
      <DeleteConfirmationModal />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Carrinho</h2>
            <p className="text-gray-500 mt-1">
              {displayCart.length} {displayCart.length === 1 ? 'item' : 'itens'} no carrinho
              {selectedCount > 0 && (
                <span className="text-green-600 font-semibold ml-2">
                  • {selectedCount} {selectedCount === 1 ? 'selecionado' : 'selecionados'}
                </span>
              )}
            </p>
          </div>
        </div>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSelectAll}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  selectAll 
                    ? 'bg-green-600 border-green-600 text-white' 
                    : 'border-gray-300 hover:border-green-500'
                }`}
              >
                {selectAll && <FiCheck size={12} />}
              </button>
              <span className="text-sm font-medium text-gray-700">
                {selectAll ? 'Desmarcar todos' : 'Selecionar todos'}
              </span>
            </div>
            
            {selectedCount > 0 && (
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  Total selecionado: <span className="font-bold text-green-600">R$ {selectedTotal.toFixed(2)}</span>
                </p>
                <p className="text-xs text-gray-500">
                  {selectedCount} {selectedCount === 1 ? 'item' : 'itens'} selecionados
                </p>
              </div>
            )}
          </div>
        </Card>

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
            const itemId = getItemId(item);

            const isUpdating = isItemUpdating(itemId);
            const isRemoving = isItemRemoving(itemId);
            const isProcessing = isUpdating || isRemoving;
            const isSelected = isItemSelected(itemId);

            return (
              <Card 
                key={itemId || `${item.product_id}-${index}`} 
                className={`p-4 hover:shadow-md transition-all duration-300 ${
                  isProcessing ? 'opacity-60' : ''
                } ${isRemoving ? 'border-2 border-red-200 bg-red-50' : ''} ${
                  isSelected ? 'border-2 border-green-500 bg-green-50' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-start">
                    <button
                      onClick={() => handleItemSelect(itemId)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors mt-1 ${
                        isSelected 
                          ? 'bg-green-600 border-green-600 text-white' 
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {isSelected && <FiCheck size={12} />}
                    </button>
                  </div>

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
                          {isSelected && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Selecionado
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Tamanho:</span>
                            <span className="px-3 py-1 bg-gray-100 rounded text-sm font-medium border border-gray-300 min-w-8 text-center">
                              {size}
                            </span>
                          </div>
                          
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
                          
                          <span className={`font-bold text-lg ${
                            isSelected ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            R$ {itemTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-row sm:flex-col gap-2">
                        <button
                          onClick={() => confirmRemoveFromCart(itemId, product.name)}
                          disabled={isProcessing}
                          className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Resumo do Pedido</h3>
              {selectedCount > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  {selectedCount} {selectedCount === 1 ? 'item selecionado' : 'itens selecionados'} para checkout
                </p>
              )}
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-green-600">
                R$ {selectedCount > 0 ? selectedTotal.toFixed(2) : displayTotal.toFixed(2)}
              </span>
              {selectedCount > 0 && selectedCount < displayCart.length && (
                <p className="text-sm text-gray-500 mt-1">
                  Total do carrinho: R$ {displayTotal.toFixed(2)}
                </p>
              )}
            </div>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal {selectedCount > 0 && `(${selectedCount} itens)`}</span>
              <span>R$ {selectedCount > 0 ? selectedTotal.toFixed(2) : displayTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Frete</span>
              <span>Grátis</span>
            </div>
            <div className="flex justify-between text-lg font-semibold text-gray-900 pt-3 border-t border-gray-200">
              <span>Total</span>
              <span>R$ {selectedCount > 0 ? selectedTotal.toFixed(2) : displayTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={processCheckout}
            disabled={
              Object.keys(updatingItems).some(key => updatingItems[key]) || 
              Object.keys(removingItems).some(key => removingItems[key]) ||
              selectedItems.size === 0
            }
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {Object.keys(updatingItems).some(key => updatingItems[key]) || Object.keys(removingItems).some(key => removingItems[key]) 
              ? 'Processando...' 
              : selectedItems.size === 0
              ? 'Selecione itens para comprar'
              : `Finalizar Compra (${selectedCount} ${selectedCount === 1 ? 'item' : 'itens'})`
            }
          </button>  

          {selectedItems.size === 0 && (
            <p className="text-center text-orange-600 text-sm mt-3">
              ⚠️ Selecione os itens que deseja comprar
            </p>
          )}
        </Card>
      </div>
    </>
  );
};

export default CartTab;