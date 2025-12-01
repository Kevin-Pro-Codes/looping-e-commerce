// src/components/admin/StockManagement.jsx
import React, { useState, useEffect } from "react";
import { 
  FiSearch, FiPlus, FiPackage, FiLayers, FiAlertCircle, FiEdit, FiCheck, FiX,
  FiSave, FiDownload, FiUpload, FiRefreshCw
} from "react-icons/fi";

// Stock API Service (mantido igual)
const StockAPI = {
  // ... (todo o código da StockAPI permanece igual)
};

const StockManagement = () => {
  // ... (todos os states permanecem iguais)

  // ✅ Função para formatar a quantidade - SEMPRE mostra um número
  const formatQuantity = (quantity) => {
    // Garante que sempre retorne um número formatado, mesmo se for 0
    return parseInt(quantity) || 0;
  };

  // ✅ Função para obter a cor baseada na quantidade
  const getQuantityColor = (quantity, type = 'stock') => {
    const qty = parseInt(quantity) || 0;
    
    if (type === 'available') {
      if (qty <= 0) return "text-red-600 font-bold";
      if (qty <= 5) return "text-yellow-600 font-medium";
      return "text-green-600";
    }
    
    if (qty === 0) return "text-red-600 font-bold";
    if (qty <= 5) return "text-yellow-600 font-medium";
    return "text-gray-900";
  };

  // ✅ Função para obter ícone baseado na quantidade
  const getQuantityIcon = (quantity) => {
    const qty = parseInt(quantity) || 0;
    
    if (qty === 0) return "🔴";
    if (qty <= 5) return "🟡";
    return "🟢";
  };

  // ✅ Componente para display consistente de quantidade
  const QuantityDisplay = ({ quantity, className = "", showIcon = false, type = 'stock' }) => {
    const formattedQuantity = formatQuantity(quantity);
    const colorClass = getQuantityColor(quantity, type);
    const icon = showIcon ? getQuantityIcon(quantity) : "";
    
    return (
      <div className={`flex items-center justify-center space-x-1 ${className}`}>
        {showIcon && <span className="text-sm">{icon}</span>}
        <span className={`text-sm ${colorClass}`}>
          {formattedQuantity.toLocaleString('pt-BR')}
        </span>
      </div>
    );
  };

  // ✅ Componente para display de estoque em edição
  const EditableQuantity = ({ 
    variantId, 
    currentStock, 
    isEditing, 
    editValue, 
    onStartEdit, 
    onSave, 
    onCancel, 
    onEditChange 
  }) => {
    if (isEditing) {
      return (
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            className="w-16 sm:w-20 p-1 border border-gray-300 rounded text-sm text-black text-center font-medium"
            min="0"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSave();
              if (e.key === 'Escape') onCancel();
            }}
          />
          <div className="flex space-x-1">
            <button
              onClick={onSave}
              className="text-green-600 hover:text-green-800 bg-green-50 p-1 rounded"
              title="Confirmar"
            >
              <FiCheck size={14} />
            </button>
            <button
              onClick={onCancel}
              className="text-red-600 hover:text-red-800 bg-red-50 p-1 rounded"
              title="Cancelar"
            >
              <FiX size={14} />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        <QuantityDisplay 
          quantity={currentStock} 
          showIcon={true}
          className="min-w-12"
        />
        <button
          onClick={() => onStartEdit(variantId, currentStock)}
          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
          title="Editar estoque"
        >
          <FiEdit size={12} />
        </button>
      </div>
    );
  };

  // ... (restante do código permanece igual, apenas vamos modificar a renderização)

  // Na renderização da tabela, substituir as células de quantidade pelos novos componentes:

  return (
    <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
      {/* Cabeçalho - mantido igual */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* ... */}
      </div>

      {/* Cards de resumo - melhorados para sempre mostrar números */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatQuantity(stockItems.length)}
              </p>
            </div>
            <FiPackage className="text-2xl text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Variantes</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatQuantity(stockItems.reduce((sum, item) => sum + item.variants.length, 0))}
              </p>
            </div>
            <FiLayers className="text-2xl text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Itens com Baixo Estoque</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatQuantity(stockItems.filter(item => getProductStatus(item.variants) === "Baixo Estoque").length)}
              </p>
            </div>
            <FiAlertCircle className="text-2xl text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sem Estoque</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatQuantity(stockItems.filter(item => getProductStatus(item.variants) === "Sem Estoque").length)}
              </p>
            </div>
            <FiAlertCircle className="text-2xl text-red-500" />
          </div>
        </div>
      </div>

      {/* Lista de produtos - com displays de quantidade melhorados */}
      <div className="space-y-6">
        {filteredStockItems.map((product) => {
          const totals = calculateProductTotals(product.variants);
          const status = getProductStatus(product.variants);
          
          return (
            <div key={product.product_id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Cabeçalho do produto - mantido igual */}
              <div className="bg-gray-50 px-4 sm:px-6 py-4 border-b">
                {/* ... */}
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cor</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamanho</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque Atual</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reservado</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disponível</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Em Chegada</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {product.variants.map((variant) => {
                      const available = variant.stock - variant.reserved;
                      const variantStatus = variant.stock === 0 
                        ? (variant.incoming > 0 ? "Em Chegada" : "Sem Estoque")
                        : (variant.stock <= 5 ? "Baixo Estoque" : "Em Estoque");
                      
                      const isVariantEditing = isEditing(variant.id);
                      
                      return (
                        <tr key={variant.id} className="hover:bg-gray-50">
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div 
                                className="w-4 h-4 rounded-full border border-gray-300 mr-2"
                                style={{ 
                                  backgroundColor: variant.color === 'Branco' ? '#FFFFFF' :
                                                variant.color === 'Preto' ? '#000000' :
                                                variant.color === 'Cinza' ? '#808080' : '#D3D3D3'
                                }}
                              />
                              <span className="text-sm font-medium text-gray-900">{variant.color}</span>
                            </div>
                          </td>
                          
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{variant.size}</td>
                          
                          {/* Estoque Atual - Agora com display consistente */}
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <EditableQuantity
                              variantId={variant.id}
                              currentStock={variant.stock}
                              isEditing={isVariantEditing}
                              editValue={editValue}
                              onStartEdit={startEditing}
                              onSave={saveEditing}
                              onCancel={cancelEditing}
                              onEditChange={setEditValue}
                            />
                          </td>
                          
                          {/* Reservado */}
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                            <QuantityDisplay 
                              quantity={variant.reserved} 
                              className="justify-center"
                            />
                          </td>
                          
                          {/* Disponível */}
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                            <QuantityDisplay 
                              quantity={available} 
                              type="available"
                              showIcon={true}
                              className="justify-center font-medium"
                            />
                          </td>
                          
                          {/* Em Chegada */}
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2 justify-center">
                              <QuantityDisplay 
                                quantity={variant.incoming} 
                                className="justify-center"
                              />
                              {variant.incoming > 0 && (
                                <button
                                  onClick={() => receiveIncomingStock(variant.id)}
                                  className="text-green-600 hover:text-green-800 text-xs bg-green-100 px-2 py-1 rounded transition-colors"
                                >
                                  Receber
                                </button>
                              )}
                            </div>
                          </td>
                          
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              variantStatus === "Em Estoque" ? "bg-green-100 text-green-800" :
                              variantStatus === "Baixo Estoque" ? "bg-yellow-100 text-yellow-800" :
                              variantStatus === "Em Chegada" ? "bg-blue-100 text-blue-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {variantStatus}
                            </span>
                          </td>
                          
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button 
                              onClick={() => addIncomingStock(variant.id, 10)}
                              className="text-blue-600 hover:text-blue-900 text-xs bg-blue-100 px-2 py-1 rounded transition-colors"
                            >
                              Pedir +
                            </button>
                            <button className="text-gray-600 hover:text-gray-900 text-xs bg-gray-100 px-2 py-1 rounded transition-colors">
                              Histórico
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alertas - mantidos iguais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ... */}
      </div>
    </div>
  );
};

export default StockManagement;