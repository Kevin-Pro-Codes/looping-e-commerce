import React from 'react';
import { FiShoppingCart } from 'react-icons/fi';
import { IoReload } from 'react-icons/io5';
import { Button, Card } from './SharedComponents';

const WishlistTab = ({ 
  wishlist, 
  loadingWishlist, 
  fetchWishlist, 
  removeFromWishlist 
}) => {
  if (loadingWishlist) {
    return (
      <div className="text-center py-8 text-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        Carregando seus desejos...
      </div>
    );
  }

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

          return (
            <Card key={item.id || index} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Product Image */}
                <div className="flex-shrink-0 w-full sm:w-24 h-48 sm:h-24">
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
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                        {productTitle}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {productDescription}
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xl font-bold text-gray-900">
                          R$ {formattedPrice}
                        </span>
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full capitalize">
                          {productCategory}
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                      {/* Remove Button */}
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to remove this item from your wishlist?")) {
                            removeFromWishlist(item.product_id);
                          }
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2 h-10 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <span className="text-lg font-bold">×</span>
                        Remover
                      </Button>

                      {/* Add to Cart Button */}
                      <Button
                        onClick={() => {
                          console.log('Add to cart:', item.product_id);
                          alert(`Produto "${productTitle}" adicionado ao carrinho!`);
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2 h-10 bg-red-600 border-1 border-black hover:bg-red-700 text-white"
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
  );
};

export default WishlistTab;