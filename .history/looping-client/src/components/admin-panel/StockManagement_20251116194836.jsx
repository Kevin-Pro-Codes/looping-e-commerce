// src/components/admin/StockManagement.jsx
import React, { useState, useEffect } from "react";
import { 
  FiSearch, FiPlus, FiPackage, FiLayers, FiAlertCircle, FiEdit, FiCheck, FiX,
  FiSave, FiDownload, FiUpload, FiRefreshCw
} from "react-icons/fi";

// Stock API Service
const StockAPI = {
  // Get CSRF Token
  getCsrfToken: async () => {
    try {
      const response = await fetch('http://localhost:8000/sanctum/csrf-cookie', {
        method: 'GET',
        credentials: 'include',
      });
      const cookies = document.cookie;
      const tokenMatch = cookies.match(/XSRF-TOKEN=([^;]+)/);
      return tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
    } catch (error) {
      console.error('CSRF token error:', error);
      return null;
    }
  },

  // Get all stock
  getStock: async () => {
    try {
      const response = await fetch('http://localhost:8000/api/stock', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Get stock error:', error);
      throw error;
    }
  },

  // Update stock
  updateStock: async (itemId, stock) => {
    try {
      const csrfToken = await StockAPI.getCsrfToken();
      
      const response = await fetch(`http://localhost:8000/api/stock/${itemId}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-XSRF-TOKEN': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ stock })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Update stock error:', error);
      throw error;
    }
  },

  // Add incoming stock
  addIncoming: async (itemId, quantity) => {
    try {
      const csrfToken = await StockAPI.getCsrfToken();
      
      const response = await fetch(`http://localhost:8000/api/stock/${itemId}/add-incoming`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-XSRF-TOKEN': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ quantity })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Add incoming error:', error);
      throw error;
    }
  },

  // Receive incoming stock
  receiveIncoming: async (itemId) => {
    try {
      const csrfToken = await StockAPI.getCsrfToken();
      
      const response = await fetch(`http://localhost:8000/api/stock/${itemId}/receive-incoming`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-XSRF-TOKEN': csrfToken,
        },
        credentials: 'include',
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Receive incoming error:', error);
      throw error;
    }
  },

  // Create samples
  createSamples: async () => {
    try {
      const csrfToken = await StockAPI.getCsrfToken();
      
      const response = await fetch('http://localhost:8000/api/stock/samples', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-XSRF-TOKEN': csrfToken,
        },
        credentials: 'include',
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Create samples error:', error);
      throw error;
    }
  }
};

const StockManagement = () => {
  const [stockSearch, setStockSearch] = useState("");
  const [editingVariant, setEditingVariant] = useState(null); // { variantId, currentStock }
  const [editValue, setEditValue] = useState("");
  const [lastSaved, setLastSaved] = useState("");
  const [loading, setLoading] = useState(false);
  const [stockItems, setStockItems] = useState([]);

  // ✅ Carregar dados do banco de dados
  const loadStockFromDatabase = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando estoque do banco de dados...');
      
      const result = await StockAPI.getStock();
      
      if (result.success) {
        setStockItems(result.data);
        setLastSaved(new Date().toLocaleString('pt-BR'));
        console.log('📦 Estoque carregado do banco:', result.data);
      } else {
        throw new Error(result.message || 'Failed to load stock');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar estoque do banco:', error);
      alert('❌ Erro ao carregar estoque: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Carregar dados quando o componente montar
  useEffect(() => {
    loadStockFromDatabase();
  }, []);

  // ✅ Atualizar estoque no banco de dados
  const updateVariantStock = async (variantId, newStock) => {
    try {
      console.log('🔄 Atualizando estoque no banco...', { variantId, newStock });
      
      const result = await StockAPI.updateStock(variantId, newStock);
      
      if (result.success) {
        // Atualizar estado local
        setStockItems(prev => prev.map(product => ({
          ...product,
          variants: product.variants.map(variant => 
            variant.id === variantId 
              ? { ...variant, stock: newStock }
              : variant
          ),
          last_updated: new Date().toISOString().split('T')[0]
        })));
        
        setLastSaved(new Date().toLocaleString('pt-BR'));
        console.log('✅ Estoque atualizado no banco:', result.data);
      } else {
        throw new Error(result.message || 'Failed to update stock');
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar estoque:', error);
      alert('❌ Erro ao atualizar estoque: ' + error.message);
      // Recarregar dados para garantir sincronização
      loadStockFromDatabase();
    }
  };

  // ✅ Adicionar estoque em chegada
  const addIncomingStock = async (variantId, quantity) => {
    try {
      console.log('🔄 Adicionando estoque em chegada...', { variantId, quantity });
      
      const result = await StockAPI.addIncoming(variantId, quantity);
      
      if (result.success) {
        // Atualizar estado local
        setStockItems(prev => prev.map(product => ({
          ...product,
          variants: product.variants.map(variant => 
            variant.id === variantId 
              ? { ...variant, incoming: variant.incoming + quantity }
              : variant
          )
        })));
        
        setLastSaved(new Date().toLocaleString('pt-BR'));
        console.log('✅ Estoque em chegada adicionado:', result.data);
      } else {
        throw new Error(result.message || 'Failed to add incoming stock');
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar estoque em chegada:', error);
      alert('❌ Erro ao adicionar estoque em chegada: ' + error.message);
    }
  };

  // ✅ Receber estoque em chegada
  const receiveIncomingStock = async (variantId) => {
    try {
      console.log('🔄 Recebendo estoque em chegada...', { variantId });
      
      const result = await StockAPI.receiveIncoming(variantId);
      
      if (result.success) {
        // Atualizar estado local
        setStockItems(prev => prev.map(product => ({
          ...product,
          variants: product.variants.map(variant => 
            variant.id === variantId 
              ? { 
                  ...variant, 
                  stock: variant.stock + variant.incoming,
                  incoming: 0 
                }
              : variant
          ),
          last_updated: new Date().toISOString().split('T')[0]
        })));
        
        setLastSaved(new Date().toLocaleString('pt-BR'));
        console.log('✅ Estoque em chegada recebido:', result.data);
      } else {
        throw new Error(result.message || 'Failed to receive incoming stock');
      }
    } catch (error) {
      console.error('❌ Erro ao receber estoque em chegada:', error);
      alert('❌ Erro ao receber estoque em chegada: ' + error.message);
    }
  };

  // ✅ Criar dados de exemplo
  const createSampleData = async () => {
    try {
      if (window.confirm('⚠️ Isso criará dados de exemplo. Continuar?')) {
        const result = await StockAPI.createSamples();
        
        if (result.success) {
          alert('✅ Dados de exemplo criados com sucesso!');
          loadStockFromDatabase();
        } else {
          throw new Error(result.message || 'Failed to create samples');
        }
      }
    } catch (error) {
      console.error('❌ Erro ao criar dados de exemplo:', error);
      alert('❌ Erro ao criar dados de exemplo: ' + error.message);
    }
  };

  // ✅ Iniciar edição
  const startEditing = (variantId, currentStock) => {
    setEditingVariant({ variantId, currentStock });
    setEditValue(currentStock.toString());
  };

  // ✅ Salvar edição
  const saveEditing = async () => {
    if (editingVariant && editValue !== "") {
      await updateVariantStock(
        editingVariant.variantId, 
        parseInt(editValue) || 0
      );
    }
    cancelEditing();
  };

  // ✅ Cancelar edição
  const cancelEditing = () => {
    setEditingVariant(null);
    setEditValue("");
  };

  // ✅ Verificar se uma variante está sendo editada
  const isEditing = (variantId) => {
    return editingVariant && editingVariant.variantId === variantId;
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
    item.product_id.toLowerCase().includes(stockSearch.toLowerCase()) ||
    item.category.toLowerCase().includes(stockSearch.toLowerCase())
  );

  // ✅ Função para obter itens com baixo estoque
  const getLowStockItems = () => {
    return stockItems.flatMap(product => 
      product.variants
        .filter(variant => variant.stock > 0 && variant.stock <= 5)
        .map(variant => ({ ...variant, product }))
    );
  };

  // ✅ Função para obter itens sem estoque
  const getOutOfStockItems = () => {
    return stockItems.flatMap(product => 
      product.variants
        .filter(variant => variant.stock === 0)
        .map(variant => ({ ...variant, product }))
    );
  };

  if (loading && stockItems.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando estoque...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
      {/* Cabeçalho com botões */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Gestão de Estoque - Banco de Dados</h2>
          {lastSaved && (
            <p className="text-sm text-gray-500 mt-1">
              Última atualização: {lastSaved}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Botões de ação */}
          <div className="flex gap-2">
            <button 
              onClick={loadStockFromDatabase}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center whitespace-nowrap text-sm"
            >
              <FiRefreshCw className="mr-2" />
              Atualizar
            </button>
            
            <button 
              onClick={createSampleData}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center whitespace-nowrap text-sm"
            >
              <FiDownload className="mr-2" />
              Criar Exemplos
            </button>
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
            <div key={product.product_id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 sm:px-6 py-4 border-b">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-1 text-sm text-gray-600">
                      <span>ID: {product.product_id}</span>
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
                      Atualizado: {product.last_updated}
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
                                  onClick={() => startEditing(variant.id, variant.stock)}
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
                                  onClick={() => receiveIncomingStock(variant.id)}
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
                              onClick={() => addIncomingStock(variant.id, 10)}
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
              getLowStockItems().map(variant => (
                <div key={variant.id} 
                     className="flex justify-between items-center p-3 bg-yellow-100 rounded">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-yellow-800 block truncate">{variant.product.name}</span>
                    <div className="text-sm text-yellow-600">
                      {variant.color} - {variant.size} | Estoque: {variant.stock} | Reservado: {variant.reserved}
                    </div>
                  </div>
                  <button 
                    onClick={() => addIncomingStock(variant.id, 20)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 whitespace-nowrap ml-2"
                  >
                    Reabastecer
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-yellow-700">✅ Nenhum item com baixo estoque no momento!</p>
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
              getOutOfStockItems().map(variant => (
                <div key={variant.id} 
                     className="flex justify-between items-center p-3 bg-red-100 rounded">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-red-800 block truncate">{variant.product.name}</span>
                    <div className="text-sm text-red-600">
                      {variant.color} - {variant.size} | Em Chegada: {variant.incoming} unidades
                    </div>
                  </div>
                  <button 
                    onClick={() => addIncomingStock(variant.id, 50)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 whitespace-nowrap ml-2"
                  >
                    Pedido Urgente
                  </button>
                </div>
              ))
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