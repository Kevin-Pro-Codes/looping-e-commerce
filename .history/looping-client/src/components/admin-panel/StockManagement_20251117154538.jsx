// src/components/admin/StockManagement.jsx
import React, { useState, useEffect } from "react";
import { 
  FiSearch, FiPlus, FiPackage, FiLayers, FiAlertCircle, FiEdit, FiCheck, FiX,
  FiSave, FiDownload, FiUpload, FiTrash2, FiDollarSign, FiPercent, FiRefreshCw
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

  // ✅ API Configuration
  const API_BASE_URL = 'http://localhost:8000/api';
  const API_ENDPOINTS = {
    stock: `${API_BASE_URL}/info/stock`,
    updateStock: (id) => `${API_BASE_URL}/info/stock/${id}/update`,
    addIncoming: (id) => `${API_BASE_URL}/info/stock/${id}/add-incoming`,
    receiveIncoming: (id) => `${API_BASE_URL}/info/stock/${id}/receive-incoming`,
    lowStock: `${API_BASE_URL}/info/stock/low-stock`,
    outOfStock: `${API_BASE_URL}/info/stock/out-of-stock`,
    createStock: `${API_BASE_URL}/info/stock/samples`
  };

  // ✅ Form states
  const [productForm, setProductForm] = useState({
    product_id: "",
    name: "",
    sku: "",
    category: "",
    supplier: "",
    price: "",
    profit: "",
    stock_value: "",
    sale_price: "",
  });

  const [variantForm, setVariantForm] = useState({
    color: "",
    size: "",
    stock: "",
    reserved: "",
    incoming: "",
  });

  const [stockItems, setStockItems] = useState([]);

  // ✅ Fetch stock data from backend
  const fetchStockFromBackend = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching stock from Laravel backend...');
      
      const response = await fetch(API_ENDPOINTS.stock, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      if (result.success) {
        console.log('📦 Backend response:', result);
        
        if (result.data && result.data.length > 0) {
          // Transform backend data to frontend format
          const transformedStock = transformBackendDataToStock(result.data);
          console.log('🔄 Transformed stock:', transformedStock);
          setStockItems(transformedStock);
        } else {
          // If no data from backend, use sample data
          console.log('📦 No data from backend, using sample data');
          const fallbackStock = generateSampleStock();
          setStockItems(fallbackStock);
        }
        
        setLastSaved(new Date().toLocaleString('pt-BR'));
      } else {
        throw new Error(result.message || 'Failed to fetch stock data');
      }
      
    } catch (error) {
      console.error("❌ Error fetching stock from backend:", error);
      setError(error.message);
      // Fallback to sample data
      const fallbackStock = generateSampleStock();
      setStockItems(fallbackStock);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Transform backend data to frontend format - CORRIGIDO
  const transformBackendDataToStock = (backendData) => {
    console.log('🔄 Transforming backend data:', backendData);
    
    if (!backendData || !Array.isArray(backendData)) {
      console.log('❌ Backend data is invalid, using sample data');
      return generateSampleStock();
    }

    return backendData.map((productGroup, index) => {
      // Use proper IDs from backend or generate fallback
      const productId = productGroup.id || index + 1;
      const productCost = parseFloat(productGroup.cost) || 60.00;
      
      // Calculate totals from variants
      const variants = productGroup.variants || [];
      const totalStock = variants.reduce((sum, variant) => sum + (variant.stock || 0), 0);
      const totalValue = totalStock * productCost;
      
      return {
        id: productId,
        product_id: productGroup.product_id || `PROD-${String(productId).padStart(3, '0')}`,
        name: productGroup.name || `Produto ${productId}`,
        sku: productGroup.variants?.[0]?.sku || `SKU-${String(productId).padStart(3, '0')}`,
        category: productGroup.category || "Roupas",
        supplier: productGroup.supplier || "Fornecedor Padrão",
        price: productCost,
        profit: productCost * 0.6, // 60% profit
        stock_value: totalValue,
        sale_price: productCost * 1.8, // 80% markup
        last_updated: productGroup.last_updated || new Date().toISOString().split('T')[0],
        created_at: productGroup.created_at || new Date().toISOString().split('T')[0],
        updated_at: productGroup.updated_at || new Date().toISOString().split('T')[0],
        variants: variants.map((variant, variantIndex) => ({
          id: variant.id || variantIndex + 1,
          color: variant.color || "Default",
          size: variant.size || "UN",
          stock: variant.stock || 0,
          reserved: variant.reserved || 0,
          incoming: variant.incoming || 0,
          available: (variant.stock || 0) - (variant.reserved || 0)
        }))
      };
    });
  };

  // ✅ Generate sample stock (fallback) - MELHORADO
  const generateSampleStock = () => {
    console.log('📦 Generating sample stock data');
    return [
      {
        id: 1,
        product_id: "PROD-001",
        name: "Camiseta Looping Branca",
        sku: "CT-LOOPING-WHITE",
        category: "Roupas",
        supplier: "Fabricante A",
        price: 60.00,
        profit: 36.00,
        stock_value: 2280.00,
        sale_price: 108.00,
        last_updated: "2024-01-15",
        created_at: "2024-01-01",
        updated_at: "2024-01-15",
        variants: [
          { id: 1, color: "Branco", size: "P", stock: 10, reserved: 2, incoming: 5, available: 8 },
          { id: 2, color: "Branco", size: "M", stock: 15, reserved: 3, incoming: 0, available: 12 },
          { id: 3, color: "Branco", size: "G", stock: 8, reserved: 1, incoming: 10, available: 7 },
          { id: 4, color: "Branco", size: "GG", stock: 5, reserved: 0, incoming: 0, available: 5 }
        ]
      },
      {
        id: 2,
        product_id: "PROD-002",
        name: "Camiseta Looping Preta",
        sku: "CT-LOOPING-BLACK",
        category: "Roupas",
        supplier: "Fabricante A",
        price: 60.00,
        profit: 36.00,
        stock_value: 720.00,
        sale_price: 108.00,
        last_updated: "2024-01-15",
        created_at: "2024-01-01",
        updated_at: "2024-01-15",
        variants: [
          { id: 5, color: "Preto", size: "P", stock: 0, reserved: 0, incoming: 20, available: 0 },
          { id: 6, color: "Preto", size: "M", stock: 3, reserved: 2, incoming: 0, available: 1 },
          { id: 7, color: "Preto", size: "G", stock: 7, reserved: 1, incoming: 0, available: 6 },
          { id: 8, color: "Preto", size: "GG", stock: 2, reserved: 0, incoming: 0, available: 2 }
        ]
      },
    ];
  };

  // ✅ Carregar dados quando o componente montar
  useEffect(() => {
    fetchStockFromBackend();
  }, []);

  // ✅ CÁLCULOS DE VALOR
  const calculateProductValue = (product) => {
    const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
    const totalAvailable = product.variants.reduce((sum, variant) => sum + (variant.stock - variant.reserved), 0);
    
    return {
      priceValue: totalStock * product.price,
      profitValue: totalStock * product.profit,
      stockValue: product.stock_value,
      saleValue: totalStock * product.sale_price,
      availableValue: totalAvailable * product.sale_price,
      profitPercentage: product.profit > 0 ? ((product.sale_price - (product.price - product.profit)) / (product.price - product.profit)) * 100 : 0
    };
  };

  const calculateTotalInventoryValue = () => {
    return stockItems.reduce((total, product) => {
      return total + (product.stock_value || 0);
    }, 0);
  };

  const calculateTotalSalesValue = () => {
    return stockItems.reduce((total, product) => {
      const productValue = calculateProductValue(product);
      return total + productValue.saleValue;
    }, 0);
  };

  const calculateTotalProfitValue = () => {
    return stockItems.reduce((total, product) => {
      const productValue = calculateProductValue(product);
      return total + productValue.profitValue;
    }, 0);
  };

  // ✅ EDIÇÃO DE PREÇOS
  const startPriceEditing = (productId, field, currentValue) => {
    setEditingPrice({ productId, field, currentValue });
    setEditValue(currentValue.toString());
  };

  const savePriceEditing = () => {
    if (editingPrice && editValue !== "") {
      updateProductPrice(
        editingPrice.productId,
        editingPrice.field,
        parseFloat(editValue) || 0
      );
    }
    cancelPriceEditing();
  };

  const cancelPriceEditing = () => {
    setEditingPrice(null);
    setEditValue("");
  };

  const updateProductPrice = (productId, field, newValue) => {
    setStockItems(prev => {
      const updatedStock = prev.map(product => 
        product.id === productId
          ? {
              ...product,
              [field]: newValue,
              updated_at: new Date().toISOString().split('T')[0]
            }
          : product
      );
      return updatedStock;
    });
  };

  const isPriceEditing = (productId, field) => {
    return editingPrice && 
           editingPrice.productId === productId && 
           editingPrice.field === field;
  };

  // ✅ COMPONENTE DE EDIÇÃO DE PREÇO
  const PriceEditor = ({ productId, field, currentValue, label }) => {
    const isEditing = isPriceEditing(productId, field);
    
    if (isEditing) {
      return (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 min-w-20">{label}:</span>
          <input
            type="number"
            step="0.01"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-20 p-1 border border-gray-300 rounded text-sm text-black text-center"
            min="0"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') savePriceEditing();
              if (e.key === 'Escape') cancelPriceEditing();
            }}
          />
          <div className="flex space-x-1">
            <button
              onClick={savePriceEditing}
              className="text-green-600 hover:text-green-800 bg-green-50 p-1 rounded"
              title="Confirmar"
            >
              <FiCheck size={12} />
            </button>
            <button
              onClick={cancelPriceEditing}
              className="text-red-600 hover:text-red-800 bg-red-50 p-1 rounded"
              title="Cancelar"
            >
              <FiX size={12} />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600 min-w-20">{label}:</span>
        <span className="text-sm font-medium text-gray-900">
          R$ {parseFloat(currentValue).toFixed(2)}
        </span>
        <button
          onClick={() => startPriceEditing(productId, field, currentValue)}
          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
          title={`Editar ${label.toLowerCase()}`}
        >
          <FiEdit size={10} />
        </button>
      </div>
    );
  };

  // ✅ FUNÇÕES AUXILIARES
  const getProductStatus = (variants) => {
    const totalStock = variants.reduce((sum, variant) => sum + variant.stock, 0);
    const totalIncoming = variants.reduce((sum, variant) => sum + variant.incoming, 0);
    
    if (totalStock === 0 && totalIncoming === 0) return "Sem Estoque";
    if (totalStock === 0 && totalIncoming > 0) return "Estoque em Chegada";
    if (totalStock > 0) return "Em Estoque";
    return "Sem Estoque";
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
    item.sku.toLowerCase().includes(stockSearch.toLowerCase()) ||
    item.category.toLowerCase().includes(stockSearch.toLowerCase())
  );

  // ✅ Skeleton Loading Components
  const SkeletonCard = () => (
    <div className="bg-white p-4 rounded-lg shadow border animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  );

  const SkeletonProductCard = () => (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
      <div className="bg-gray-50 px-4 sm:px-6 py-4 border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="flex gap-1">
                <div className="h-6 w-6 bg-gray-200 rounded"></div>
                <div className="h-6 w-6 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-3">
              <div className="h-3 bg-gray-200 rounded w-20"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-28"></div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-40 mt-2"></div>
          </div>
          <div className="text-right">
            <div className="h-6 bg-gray-200 rounded w-24"></div>
            <div className="h-8 bg-gray-200 rounded w-28 mt-2"></div>
          </div>
        </div>
        
        {/* Price Information Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 p-3 bg-white rounded border">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>

        {/* Stock Totals Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center">
              <div className="h-5 bg-gray-200 rounded w-8 mx-auto"></div>
              <div className="h-3 bg-gray-200 rounded w-16 mx-auto mt-1"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {[...Array(8)].map((_, i) => (
                <th key={i} className="px-4 sm:px-6 py-3">
                  <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[...Array(3)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(8)].map((_, colIndex) => (
                  <td key={colIndex} className="px-4 sm:px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-12 mx-auto"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <div className="h-7 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="flex gap-2">
              <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

        {/* Product List Skeleton */}
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <SkeletonProductCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
      {/* Cabeçalho com botões */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Gestão de Estoque Completo</h2>
          {lastSaved && (
            <p className="text-sm text-gray-500 mt-1">
              Última atualização: {lastSaved}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="flex gap-2">
            <button 
              onClick={fetchStockFromBackend}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center whitespace-nowrap text-sm"
            >
              <FiRefreshCw className="mr-2" />
              Atualizar
            </button>
          </div>
          
          <div className="flex gap-2">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                className="w-full p-2 pl-10 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
            <button 
              onClick={() => setShowAddProductForm(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center whitespace-nowrap"
            >
              <FiPlus className="mr-2" />
              Adicionar Produto
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiPackage className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erro ao carregar dados</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                <p className="mt-1">Usando dados de exemplo.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cards de resumo com valores */}
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
              <p className="text-sm font-medium text-gray-600">Valor em Estoque</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {calculateTotalInventoryValue().toFixed(2)}
              </p>
            </div>
            <FiDollarSign className="text-2xl text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lucro Total</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {calculateTotalProfitValue().toFixed(2)}
              </p>
            </div>
            <FiDollarSign className="text-2xl text-orange-500" />
          </div>
        </div>
      </div>

      {/* ✅ LISTA PRINCIPAL DE PRODUTOS - ESTA É A PARTE IMPORTANTE! */}
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
                            onClick={() => deleteProduct(product.id)}
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
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                        {status}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowAddVariantForm(true);
                        }}
                        className="bg-green-600 text-white p-1 rounded hover:bg-green-700 flex items-center justify-center"
                        title="Adicionar variante"
                      >
                        <FiPlus size={22} />                   
                      </button>                  
                    </div>
                  </div>
                  
                  {/* Informações de Preço */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 p-3 bg-white rounded border">
                    <div className="space-y-2">
                      <PriceEditor 
                        productId={product.id}
                        field="price"
                        currentValue={product.price}
                        label="Preço"
                      />
                      <PriceEditor 
                        productId={product.id}
                        field="profit"
                        currentValue={product.profit}
                        label="Lucro"
                      />
                    </div>
                    <div className="space-y-2">
                      <PriceEditor 
                        productId={product.id}
                        field="stock_value"
                        currentValue={product.stock_value}
                        label="Valor em Estoque"
                      />
                      <PriceEditor 
                        productId={product.id}
                        field="sale_price"
                        currentValue={product.sale_price}
                        label="Preço de Venda"
                      />
                    </div>
                  </div>

                  {/* Totais de Estoque */}
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
                          : "Em Estoque";
                        
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
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900 w-8 text-center">
                                  {variant.stock}
                                </span>
                                <button
                                  onClick={() => startEditing(product.id, variant.id, variant.stock)}
                                  className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                                  title="Editar estoque"
                                >
                                  <FiEdit size={12} />
                                </button>
                              </div>
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
                                    onClick={() => receiveIncomingStock(product.id, variant.id)}
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
                                onClick={() => addIncomingStock(product.id, variant.id, 10)}
                                className="text-blue-600 hover:text-blue-900 text-xs bg-blue-100 px-2 py-1 rounded"
                              >
                                Pedir +
                              </button>
                              <button 
                                onClick={() => deleteVariant(product.id, variant.id)}
                                className="text-red-600 hover:text-red-900 text-xs bg-red-100 px-2 py-1 rounded"
                              >
                                <FiTrash2 size={10} />
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
          })
        ) : (
          <div className="text-center py-8 bg-white rounded-lg border">
            <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum produto encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {stockSearch ? 'Tente ajustar os termos da busca.' : 'Comece adicionando um novo produto.'}
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddProductForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiPlus className="mr-2" />
                Adicionar Produto
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockManagement;