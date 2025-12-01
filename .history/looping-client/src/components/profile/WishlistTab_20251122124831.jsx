import React, { useState } from 'react';
import { FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { IoReload } from 'react-icons/io5';
import { Button, Card } from './SharedComponents';

// ✅ ADD: Skeleton Loading Component
const WishlistTabSkeleton = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="w-32 h-10 bg-gray-200 rounded"></div>
      </div>

      {/* Wishlist Items Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((item) => (
          <Card key={item} className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Product Image Skeleton */}
              <div className="flex-shrink-0 w-full sm:w-24 h-48 sm:h-24 bg-gray-200 rounded-lg"></div>

              {/* Product Info Skeleton */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="h-7 bg-gray-200 rounded w-20"></div>
                      <div className="h-6 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  
                  {/* Action Buttons Skeleton */}
                  <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                    <div className="w-24 h-10 bg-gray-200 rounded"></div>
                    <div className="w-24 h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Wishlist Summary Skeleton */}
      <Card className="p-6 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="text-right space-y-1">
            <div className="h-4 bg-gray-200 rounded w-32 ml-auto"></div>
            <div className="h-5 bg-gray-200 rounded w-24 ml-auto"></div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const WishlistTab = ({ 
  wishlist, 
  loadingWishlist, 
  fetchWishlist, 
  removeFromWishlist 
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // { productId, productName }
  const [removingItems, setRemovingItems] = useState({});

  // ✅ UPDATE: Use skeleton while loading
  if (loadingWishlist) {
    return <WishlistTabSkeleton />;
  }

  // ✅ NOVA: Função para confirmar remoção
  const confirmRemoveFromWishlist = (productId, productName) => {
    setShowDeleteConfirm({
      productId,
      productName
    });
  };

  // ✅ NOVA: Executar remoção após confirmação
  const executeRemoveFromWishlist = async () => {
    if (showDeleteConfirm) {
      try {
        setRemovingItems(prev => ({ ...prev, [showDeleteConfirm.productId]: true }));
        await removeFromWishlist(showDeleteConfirm.productId);
      } catch (error) {
        alert('Erro ao remover item da lista de desejos. Tente novamente.');
      } finally {
        setRemovingItems(prev => ({ ...prev, [showDeleteConfirm.productId]: false }));
        setShowDeleteConfirm(null);
      }
    }
  };

  // ✅ NOVA: Cancelar remoção
  const cancelRemoveFromWishlist = () => {
    setShowDeleteConfirm(null);
  };

  // ✅ NOVA: Verificar se item está sendo removido
  const isItemRemoving = (productId) => removingItems[productId];

  // ✅ NOVA: Modal de Confirmação de Exclusão
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
              Remover da lista de desejos?
            </h3>
            
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja remover <strong>"{showDeleteConfirm.productName}"</strong> da sua lista de desejos?
            </p>
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={cancelRemoveFromWishlist}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              
              <button
                onClick={executeRemoveFromWishlist}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <FiTrash2 size={16} />
                Sim, Remover
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (wishlist.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-lg mb-2">Sua lista de desejos está vazia</p>
        <p className="text-gray-400 mb-4">Adicione produtos que você gosta para vê-los aqui!</p>
        <Button onClick={fetchWishlist}>
          <IoReload size={21} />
          Recarregar
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Modal de Confirmação */}
      <DeleteConfirmationModal />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Desejos</h2>
            <p className="text-gray-500 mt-1">
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'itens'}
            </p>
          </div>
          <Button
            onClick={fetchWishlist}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <IoReload size={21} />
            Atualizar
          </Button>
        </div>

        {/* Wishlist Items */}
        <div className="space-y-4">
          {wishlist.map((item, index) => {
            const product = item.product || {};
            const productTitle = product.title || product.name || `Produto ${item.product_id}`;
            const productPrice = product.price || 0;
            const productImage = product.image || product.image_url || null;
            const productDescription = product.description || 'Informação do produto não disponível';
            const productCategory = product.category || 'Desconhecida';

            const formattedPrice = productPrice 
              ? parseFloat(productPrice).toFixed(2).replace('.', ',')
              : '0,00';

            const isRemoving = isItemRemoving(item.product_id);

            return (
              <Card 
                key={item.id || index} 
                className={`p-4 hover:shadow-md transition-shadow ${
                  isRemoving ? 'opacity-60' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0 w-full sm:w-24 h-48 sm:h-24 relative">
                    {isRemoving && (
                      <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center rounded-lg z-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                      </div>
                    )}
                    {productImage ? (
                      <img 
                        src={productImage} 
                        alt={productTitle}
                        className="w-full h-full object-contain rounded-lg bg-gray-100"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = e.target.nextSibling;
                          if (fallback) fallback.classList.remove('hidden');
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 text-sm">Sem imagem</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                            {productTitle}
                          </h3>
                          {isRemoving && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                              Removendo...
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {productDescription}
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xl font-bold text-gray-900">
                            R$ {formattedPrice}
                          </span>
                          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded capitalize">
                            {productCategory}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                        {/* Remove Button */}
                        <Button
                          variant="outline"
                          onClick={() => confirmRemoveFromWishlist(item.product_id, productTitle)}
                          disabled={isRemoving}
                          className="flex items-center justify-center gap-2 px-4 py-2 h-10 text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isRemoving ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <FiTrash2 size={16} />
                              <span>Remover</span>
                            </>
                          )}
                        </Button>

                        {/* Add to Cart Button */}
                        <Button
                          onClick={() => {
                            console.log('Add to cart:', item.product_id);
                            alert(`Produto "${productTitle}" adicionado ao carrinho!`);
                          }}
                          disabled={isRemoving}
                          className="flex items-center justify-center gap-2 px-4 py-2 h-10 bg-red-600 border-1 border-black hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiShoppingCart size={26} className="pr-1"/>
                          <span>Comprar</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Wishlist Summary */}
        <Card className="p-6 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Resumo da Lista de Desejos
            </h3>
            <div className="text-right">
              <p className="text-gray-600">
                Total de itens: <span className="font-bold text-gray-900">{wishlist.length}</span>
              </p>
              <p className="text-gray-600">
                Valor total: <span className="font-bold text-green-600 text-lg">
                  R$ {wishlist.reduce((sum, item) => sum + (item.product?.price || 0), 0).toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default WishlistTab;