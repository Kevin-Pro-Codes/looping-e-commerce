// src/components/admin/StockManagement.jsx
import React, { useState, useEffect, useRef } from "react";
import { 
  FiSearch, FiPlus, FiPackage, FiLayers, FiAlertCircle, FiEdit, FiCheck, FiX,
  FiSave, FiDownload, FiUpload, FiTrash2, FiDollarSign, FiPercent, FiRefreshCw,
  FiEye, FiInfo
} from "react-icons/fi";

const StockManagement = () => {
  const [stockSearch, setStockSearch] = useState("");
  const [editingVariant, setEditingVariant] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [lastSaved, setLastSaved] = useState("");
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [showAddVariantForm, setShowAddVariantForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingPrice, setEditingPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);

  // ... (resto do código permanece igual até a função getProductStatus)

  // ✅ FUNÇÕES AUXILIARES
  const getProductStatus = (variants) => {
    const totalStock = variants.reduce((sum, variant) => sum + variant.stock, 0);
    const totalIncoming = variants.reduce((sum, variant) => sum + variant.incoming, 0);
    
    if (totalStock === 0 && totalIncoming === 0) return "Sem Estoque";
    if (totalStock === 0 && totalIncoming > 0) return "Estoque em Chegada";
    if (totalStock > 0) return "Em Estoque";
    return "Sem Estoque";
  };

  // ✅ FUNÇÃO PARA VISUALIZAR INFORMAÇÕES DO PRODUTO
  const viewProductInfo = (product) => {
    setViewingProduct(product);
  };

  // ✅ MODAL DE INFORMAÇÕES DO PRODUTO
  const ProductInfoModal = ({ product, onClose }) => {
    if (!product) return null;

    const totals = calculateProductTotals(product.variants);
    const productValue = calculateProductValue(product);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Informações Detalhadas do Produto</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-200"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Informações Básicas */}
            <div>
              <h4 className="font-semibold text-lg mb-3 text-blue-600">{product.name}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><span className="font-medium">ID:</span> {product.product_id}</p>
                  <p><span className="font-medium">SKU:</span> {product.sku}</p>
                  <p><span className="font-medium">Categoria:</span> {product.category}</p>
                </div>
                <div>
                  <p><span className="font-medium">Fornecedor:</span> {product.supplier}</p>
                  <p><span className="font-medium">Criado em:</span> {product.created_at}</p>
                  <p><span className="font-medium">Atualizado em:</span> {product.updated_at}</p>
                </div>
              </div>
            </div>

            {/* Informações Financeiras */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-semibold mb-3 text-gray-700">Informações Financeiras</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-600">Preço de Custo</p>
                  <p className="text-lg font-semibold text-green-600">R$ {product.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Lucro Unitário</p>
                  <p className="text-lg font-semibold text-blue-600">R$ {product.profit.toFixed(2)}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Preço de Venda</p>
                  <p className="text-lg font-semibold text-purple-600">R$ {product.sale_price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Margem</p>
                  <p className="text-lg font-semibold text-orange-600">{product.profit_margin.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            {/* Estoque Total */}
            <div className="bg-white border rounded-lg p-4">
              <h5 className="font-semibold mb-3 text-gray-700">Resumo de Estoque</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totals.totalStock}</p>
                  <p className="text-sm text-gray-600">Estoque Total</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{totals.totalReserved}</p>
                  <p className="text-sm text-gray-600">Reservado</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{totals.availableStock}</p>
                  <p className="text-sm text-gray-600">Disponível</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{totals.totalIncoming}</p>
                  <p className="text-sm text-gray-600">Em Chegada</p>
                </div>
              </div>
            </div>

            {/* Valor Total */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border">
              <h5 className="font-semibold mb-2 text-gray-700">Valor Total em Estoque</h5>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-3xl font-bold text-gray-900">R$ {productValue.stockValue.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Baseado no preço de venda atual</p>
                </div>
                <FiDollarSign className="text-4xl text-green-500" />
              </div>
            </div>

            {/* Variantes */}
            <div>
              <h5 className="font-semibold mb-3 text-gray-700">Variantes ({product.variants.length})</h5>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {product.variants.map((variant, index) => (
                  <div key={variant.id} className="flex justify-between items-center p-3 border rounded-lg bg-white">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ 
                          backgroundColor: variant.color === 'Branco' ? '#FFFFFF' :
                                        variant.color === 'Preto' ? '#000000' :
                                        variant.color === 'Cinza' ? '#808080' : '#D3D3D3'
                        }}
                      />
                      <span className="font-medium">{variant.color} - {variant.size}</span>
                    </div>
                    <div className="flex space-x-4 text-sm">
                      <span className={variant.stock > 0 ? "text-green-600" : "text-red-600"}>
                        Estoque: {variant.stock}
                      </span>
                      <span className="text-blue-600">
                        Disponível: {variant.available}
                      </span>
                      {variant.incoming > 0 && (
                        <span className="text-orange-600">
                          Chegando: {variant.incoming}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t flex justify-end space-x-3">
            <button
              onClick={() => {
                editProduct(product);
                onClose();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
            >
              <FiEdit className="mr-2" />
              Editar Produto
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ... (resto do código permanece igual)

  return (
    <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
      {/* ... (cabeçalho e outras seções permanecem iguais) */}

      <div className="space-y-6">
        {filteredStockItems.length > 0 ? (
          filteredStockItems.map((product) => {
            const totals = calculateProductTotals(product.variants);
            const status = getProductStatus(product.variants);
            const productValue = calculateProductValue(product);
            
            return (
              <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 sm:px-6 py-4 border-b">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <div className="flex gap-1">
                          <button
                            onClick={() => editProduct(product)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                            title="Editar produto"
                          >
                            <FiEdit size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirmDelete('⚠️ Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) {
                                deleteProduct(product.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                            title="Excluir produto"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-1 text-sm text-gray-600">
                        <span>ID: {product.product_id}</span>
                        <span>SKU: {product.sku}</span>
                        <span>Categoria: {product.category}</span>
                        <span>Fornecedor: {product.supplier}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Criado: {product.created_at} | Atualizado: {product.updated_at}
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium ${getStatusColor(status)}`}>
                        {status}
                      </span>
                      <button
                        onClick={() => viewProductInfo(product)}
                        className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700 flex items-center justify-center"
                        title="Visualizar informações do produto"
                      >
                        <FiEye size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowAddVariantForm(true);
                        }}
                        className="bg-green-600 text-white p-1 rounded hover:bg-green-700 flex items-center justify-center"
                        title="Adicionar variante"
                      >
                        <FiPlus size={21} />                   
                      </button>                  
                    </div>
                  </div>
                  
                  {/* ... (resto do conteúdo do produto permanece igual) */}
                </div>

                {/* ... (tabela de variantes permanece igual) */}
              </div>
            );
          })
        ) : (
          // ... (mensagem de nenhum produto encontrado permanece igual)
        )}
      </div>

      {/* Modal de Informações do Produto */}
      {viewingProduct && (
        <ProductInfoModal 
          product={viewingProduct} 
          onClose={() => setViewingProduct(null)} 
        />
      )}
    </div>
  );
};

export default StockManagement;