// src/components/admin/StockManagement.jsx
import React, { useState, useEffect } from "react";
import { 
  FiSearch, FiPlus, FiPackage, FiLayers, FiAlertCircle, FiEdit, FiCheck, FiX,
  FiSave, FiDownload, FiUpload
} from "react-icons/fi";

const StockManagement = () => {
  const [stockSearch, setStockSearch] = useState("");
  const [editingVariant, setEditingVariant] = useState(null); // { productId, color, size }
  const [editValue, setEditValue] = useState("");
  const [lastSaved, setLastSaved] = useState("");
  
  // ✅ Carregar estoque do localStorage
  const loadStockFromStorage = () => {
    try {
      const savedStock = localStorage.getItem('stock_management_data');
      if (savedStock) {
        const parsedData = JSON.parse(savedStock);
        console.log('📦 Estoque carregado do localStorage:', parsedData);
        return parsedData;
      }
    } catch (error) {
      console.error('❌ Erro ao carregar estoque do localStorage:', error);
    }
    
    // Dados padrão se não houver nada salvo
    return [
      {
        id: 1,
        productId: "PROD-001",
        name: "Camiseta Finito Branca",
        sku: "CT-FINITO-WHITE",
        category: "Roupas",
        supplier: "Fabricante A",
        cost: 15.00,
        lastUpdated: "2024-01-15",
        variants: [
          { color: "Branco", size: "P", stock: 10, reserved: 2, incoming: 5 },
          { color: "Branco", size: "M", stock: 15, reserved: 3, incoming: 0 },
          { color: "Branco", size: "G", stock: 8, reserved: 1, incoming: 10 },
          { color: "Branco", size: "GG", stock: 5, reserved: 0, incoming: 0 }
        ]
      },
      {
        id: 2,
        productId: "PROD-002",
        name: "Camiseta Finito Preta",
        sku: "CT-FINITO-BLACK",
        category: "Roupas",
        supplier: "Fabricante A",
        cost: 15.00,
        lastUpdated: "2024-01-15",
        variants: [
          { color: "Preto", size: "P", stock: 0, reserved: 0, incoming: 20 },
          { color: "Preto", size: "M", stock: 3, reserved: 2, incoming: 0 },
          { color: "Preto", size: "G", stock: 7, reserved: 1, incoming: 0 },
          { color: "Preto", size: "GG", stock: 2, reserved: 0, incoming: 0 }
        ]
      },
    ];
  };

  const [stockItems, setStockItems] = useState([]);

  // ✅ Carregar dados quando o componente montar
  useEffect(() => {
    const loadedStock = loadStockFromStorage();
    setStockItems(loadedStock);
    
    // Verificar se há última data de salvamento
    const savedTime = localStorage.getItem('stock_last_saved');
    if (savedTime) {
      setLastSaved(new Date(savedTime).toLocaleString('pt-BR'));
    }
  }, []);

  // ✅ SALVAR TODO O ESTOQUE NO LOCALSTORAGE
  const saveStockToStorage = (stockData = null) => {
    try {
      const dataToSave = stockData || stockItems;
      const timestamp = new Date().toISOString();
      
      localStorage.setItem('stock_management_data', JSON.stringify(dataToSave));
      localStorage.setItem('stock_last_saved', timestamp);
      
      setLastSaved(new Date(timestamp).toLocaleString('pt-BR'));
      console.log('💾 Estoque salvo no localStorage:', dataToSave);
      
      // ✅ REMOVIDO: alert duplicado - o feedback visual já é dado pelo timestamp
      // alert('✅ Estoque salvo com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro ao salvar estoque:', error);
      alert('❌ Erro ao salvar estoque. Verifique o console.');
    }
  };
  // ✅ EXPORTAR ESTOQUE PARA JSON
  const exportStock = () => {
    try {
      const exportData = {
        stockItems,
        exportedAt: new Date().toISOString(),
        totalProducts: stockItems.length,
        totalVariants: stockItems.reduce((sum, item) => sum + item.variants.length, 0)
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `estoque_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      console.log('📤 Estoque exportado:', exportData);
      alert('📤 Backup do estoque exportado com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro ao exportar estoque:', error);
      alert('❌ Erro ao exportar estoque.');
    }
  };

  // ✅ IMPORTAR ESTOQUE DE JSON
  const importStock = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        if (importedData.stockItems && Array.isArray(importedData.stockItems)) {
          if (window.confirm('⚠️ Isso substituirá todo o estoque atual. Continuar?')) {
            setStockItems(importedData.stockItems);
            saveStockToStorage(importedData.stockItems);
            alert('✅ Estoque importado com sucesso!');
          }
        } else {
          alert('❌ Arquivo inválido. Formato correto não encontrado.');
        }
      } catch (error) {
        console.error('❌ Erro ao importar estoque:', error);
        alert('❌ Erro ao importar arquivo. Verifique o formato.');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  // ✅ Iniciar edição
  const startEditing = (productId, color, size, currentStock) => {
    setEditingVariant({ productId, color, size });
    setEditValue(currentStock.toString());
  };

  // ✅ Salvar edição
  const saveEditing = () => {
    if (editingVariant && editValue !== "") {
      updateVariantStock(
        editingVariant.productId, 
        editingVariant.color, 
        editingVariant.size, 
        parseInt(editValue) || 0,
        true // ✅ Apenas salvar uma vez aqui
      );
    }
    cancelEditing();
  };
  

  // ✅ Cancelar edição
  const cancelEditing = () => {
    setEditingVariant(null);
    setEditValue("");
  };

  // ✅ ATUALIZADO: Atualizar estoque com auto-salvamento
  const updateVariantStock = (productId, color, size, newStock, autoSave = true) => {
    setStockItems(prev => {
      const updatedStock = prev.map(product => 
        product.id === productId 
          ? {
              ...product,
              variants: product.variants.map(variant =>
                variant.color === color && variant.size === size
                  ? { ...variant, stock: Math.max(0, parseInt(newStock) || 0) }
                  : variant
              ),
              lastUpdated: new Date().toISOString().split('T')[0]
            }
          : product
      );
      
      // ✅ CORREÇÃO: Auto-salvar apenas se solicitado
      if (autoSave) {
        setTimeout(() => saveStockToStorage(updatedStock), 100);
      }
      
      return updatedStock;
    });
  };

  // ✅ ATUALIZADO: Adicionar estoque em chegada com auto-salvamento
  const addIncomingStock = (productId, color, size, quantity) => {
    setStockItems(prev => {
      const updatedStock = prev.map(product => 
        product.id === productId 
          ? {
              ...product,
              variants: product.variants.map(variant =>
                variant.color === color && variant.size === size
                  ? { ...variant, incoming: variant.incoming + quantity }
                  : variant
              )
            }
          : product
      );
      
      // ✅ CORREÇÃO: Salvar apenas uma vez
      saveStockToStorage(updatedStock);
      
      return updatedStock;
    });
  };

  // ✅ CORRIGIDO: Receber estoque em chegada
const receiveIncomingStock = (productId, color, size) => {
  setStockItems(prev => {
    const updatedStock = prev.map(product => 
      product.id === productId 
        ? {
            ...product,
            variants: product.variants.map(variant =>
              variant.color === color && variant.size === size
                ? { 
                    ...variant, 
                    stock: variant.stock + variant.incoming,
                    incoming: 0 
                  }
                : variant
            ),
            lastUpdated: new Date().toISOString().split('T')[0]
          }
        : product
    );
    
    // ✅ CORREÇÃO: Salvar apenas uma vez
    saveStockToStorage(updatedStock);
    
    return updatedStock;
  });
};

  // ✅ Verificar se uma variante está sendo editada
  const isEditing = (productId, color, size) => {
    return editingVariant && 
           editingVariant.productId === productId && 
           editingVariant.color === color && 
           editingVariant.size === size;
  };

  const getProductStatus = (variants) => {
    const totalStock = variants.reduce((sum, variant) => sum + variant.stock, 0);
    const totalIncoming = variants.reduce((sum, variant) => sum + variant.incoming, 0);
    
    if (totalStock === 0 && totalIncoming === 0) return "Sem Estoque";
    if (totalStock === 0 && totalIncoming > 0) return "Estoque em Chegada";
    if (totalStock <= 10) return "Baixo Estoque";
    return "Em Estoque";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Em Estoque": return "bg-green-100 text-green-800 border border-green-200";
      case "Baixo Estoque": return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "Estoque em Chegada": return "bg-blue-100 text-blue-800 border border-blue-200";
      case "Sem Estoque": return "bg-red-100 text-red-800 border border-red-200";
      default: return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const calculateProductTotals = (variants) => {
    return {
      totalStock: variants.reduce((sum, v) => sum + v.stock, 0),
      totalReserved: variants.reduce((sum, v) => sum + v.reserved, 0),
      totalIncoming: variants.reduce((sum, v) => sum + v.incoming, 0),
      availableStock: variants.reduce((sum, v) => sum + (v.stock - v.reserved), 0)
    };
  };

  const filteredStockItems = stockItems.filter(item =>
    item.name.toLowerCase().includes(stockSearch.toLowerCase()) ||
    item.sku.toLowerCase().includes(stockSearch.toLowerCase()) ||
    item.category.toLowerCase().includes(stockSearch.toLowerCase())
  );

  // ✅ Função para obter itens com baixo estoque
  const getLowStockItems = () => {
    return stockItems.flatMap(product => 
      product.variants
        .filter(variant => variant.stock > 0 && variant.stock <= 5)
    );
  };

  // ✅ Função para obter itens sem estoque
  const getOutOfStockItems = () => {
    return stockItems.flatMap(product => 
      product.variants
        .filter(variant => variant.stock === 0)
    );
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
      {/* Cabeçalho com botões de salvamento */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Gestão de Estoque - Variantes de Cor e Tamanho</h2>
          {lastSaved && (
            <p className="text-sm text-gray-500 mt-1">
              Último salvamento: {lastSaved}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Botões de salvamento e backup */}
          <div className="flex gap-2">
            <button 
              onClick={() => saveStockToStorage()}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center whitespace-nowrap text-sm"
            >
              <FiSave className="mr-2" />
              Salvar
            </button>
            
            <button 
              onClick={exportStock}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center whitespace-nowrap text-sm"
            >
              <FiDownload className="mr-2" />
              Exportar
            </button>
            
            <label className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center whitespace-nowrap text-sm cursor-pointer">
              <FiUpload className="mr-2" />
              Importar
              <input
                type="file"
                accept=".json"
                onChange={importStock}
                className="hidden"
              />
            </label>
          </div>
          
          <div className="flex gap-2">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Buscar itens em estoque..."
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                className="w-full p-2 pl-10 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center whitespace-nowrap">
              <FiPlus className="mr-2" />
              Adicionar Item
            </button>
          </div>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
              <p className="text-2xl font-bold text-gray-900">{stockItems.length}</p>
            </div>
            <FiPackage className="text-2xl text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Variantes</p>
              <p className="text-2xl font-bold text-gray-900">
                {stockItems.reduce((sum, item) => sum + item.variants.length, 0)}
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
                {stockItems.filter(item => getProductStatus(item.variants) === "Baixo Estoque").length}
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
                {stockItems.filter(item => getProductStatus(item.variants) === "Sem Estoque").length}
              </p>
            </div>
            <FiAlertCircle className="text-2xl text-red-500" />
          </div>
        </div>
      </div>

      {/* Lista de produtos */}
      <div className="space-y-6">
        {filteredStockItems.map((product) => {
          const totals = calculateProductTotals(product.variants);
          const status = getProductStatus(product.variants);
          
          return (
            <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 sm:px-6 py-4 border-b">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-1 text-sm text-gray-600">
                      <span>SKU: {product.sku}</span>
                      <span>Categoria: {product.category}</span>
                      <span>Fornecedor: {product.supplier}</span>
                      <span>Custo: R$ {product.cost}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                      {status}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      Atualizado: {product.lastUpdated}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">{totals.totalStock}</div>
                    <div className="text-gray-500">Estoque Total</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{totals.totalReserved}</div>
                    <div className="text-gray-500">Reservado</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{totals.availableStock}</div>
                    <div className="text-gray-500">Disponível</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{totals.totalIncoming}</div>
                    <div className="text-gray-500">Em Chegada</div>
                  </div>
                </div>
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
                    {product.variants.map((variant, index) => {
                      const available = variant.stock - variant.reserved;
                      const variantStatus = variant.stock === 0 
                        ? (variant.incoming > 0 ? "Em Chegada" : "Sem Estoque")
                        : (variant.stock <= 5 ? "Baixo Estoque" : "Em Estoque");
                      
                      const isVariantEditing = isEditing(product.id, variant.color, variant.size);
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50">
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
                          
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            {isVariantEditing ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-16 sm:w-20 p-1 border border-gray-300 rounded text-sm text-black text-center"
                                  min="0"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEditing();
                                    if (e.key === 'Escape') cancelEditing();
                                  }}
                                />
                                <div className="flex space-x-1">
                                  <button
                                    onClick={saveEditing}
                                    className="text-green-600 hover:text-green-800"
                                    title="Confirmar"
                                  >
                                    <FiCheck size={14} />
                                  </button>
                                  <button
                                    onClick={cancelEditing}
                                    className="text-red-600 hover:text-red-800"
                                    title="Cancelar"
                                  >
                                    <FiX size={14} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900 w-8 text-center">
                                  {variant.stock}
                                </span>
                                <button
                                  onClick={() => startEditing(product.id, variant.color, variant.size, variant.stock)}
                                  className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                                  title="Editar estoque"
                                >
                                  <FiEdit size={12} />
                                </button>
                              </div>
                            )}
                          </td>
                          
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {variant.reserved}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                            <span className={available <= 0 ? "text-red-600" : "text-green-600"}>
                              {available}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-900">{variant.incoming}</span>
                              {variant.incoming > 0 && (
                                <button
                                  onClick={() => receiveIncomingStock(product.id, variant.color, variant.size)}
                                  className="text-green-600 hover:text-green-800 text-xs bg-green-100 px-2 py-1 rounded"
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
                              onClick={() => addIncomingStock(product.id, variant.color, variant.size, 10)}
                              className="text-blue-600 hover:text-blue-900 text-xs bg-blue-100 px-2 py-1 rounded"
                            >
                              Pedir +
                            </button>
                            <button className="text-gray-600 hover:text-gray-900 text-xs bg-gray-100 px-2 py-1 rounded">
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

      {/* Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
            <FiAlertCircle className="mr-2" />
            Alertas de Baixo Estoque
          </h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {getLowStockItems().length > 0 ? (
              getLowStockItems().map(variant => {
                const product = stockItems.find(p => p.variants.includes(variant));
                return (
                  <div key={`${product.id}-${variant.color}-${variant.size}`} 
                       className="flex justify-between items-center p-3 bg-yellow-100 rounded">
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-yellow-800 block truncate">{product.name}</span>
                      <div className="text-sm text-yellow-600">
                        {variant.color} - {variant.size} | Estoque: {variant.stock} | Reservado: {variant.reserved}
                      </div>
                    </div>
                    <button 
                      onClick={() => addIncomingStock(product.id, variant.color, variant.size, 20)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 whitespace-nowrap ml-2"
                    >
                      Reabastecer
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4">
                <p className="text-yellow-700">🎉 Nenhum item com baixo estoque no momento!</p>
                <p className="text-yellow-600 text-sm mt-1">Todos os produtos estão com estoque adequado.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
            <FiAlertCircle className="mr-2" />
            Sem Estoque
          </h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {getOutOfStockItems().length > 0 ? (
              getOutOfStockItems().map(variant => {
                const product = stockItems.find(p => p.variants.includes(variant));
                return (
                  <div key={`${product.id}-${variant.color}-${variant.size}`} 
                       className="flex justify-between items-center p-3 bg-red-100 rounded">
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-red-800 block truncate">{product.name}</span>
                      <div className="text-sm text-red-600">
                        {variant.color} - {variant.size} | Em Chegada: {variant.incoming} unidades
                      </div>
                    </div>
                    <button 
                      onClick={() => addIncomingStock(product.id, variant.color, variant.size, 50)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 whitespace-nowrap ml-2"
                    >
                      Pedido Urgente
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4">
                <p className="text-red-700">✅ Todos os produtos estão em estoque!</p>
                <p className="text-red-600 text-sm mt-1">Nenhum item sem estoque no momento.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockManagement;