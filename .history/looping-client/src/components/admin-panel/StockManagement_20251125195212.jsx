// src/components/admin/StockManagement.jsx
import React, { useState, useEffect, useRef } from "react";
import { 
  FiSearch, FiPlus, FiPackage, FiLayers, FiEdit, FiCheck, FiX,
  FiSave, FiTrash2, FiDollarSign, FiRefreshCw, FiEye, FiRotateCcw
} from "react-icons/fi";

const StockManagement = () => {
  const [stockSearch, setStockSearch] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [lastSaved, setLastSaved] = useState("");
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [showAddVariantForm, setShowAddVariantForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  
  const [productForm, setProductForm] = useState({
    product_id: "", name: "", sku: "", category: "", supplier: "",
    price: "", profit: "", total_value: "", sale_price: "",
  });

  const [variantForm, setVariantForm] = useState({
    color: "", size: "", stock: "", reserved: "", incoming: "",
  });

  const [stockItems, setStockItems] = useState([]);
  const hasFetchedRef = useRef(false);

  // ✅ Simplified API calls
  const apiCall = async (url, method = 'GET', data = null) => {
    const csrfToken = await getCsrfToken();
    const config = {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-XSRF-TOKEN': csrfToken,
      },
    };
    
    if (data) config.body = JSON.stringify(data);
    
    const response = await fetch(`http://localhost:8000/api/infos/stock/${url}`, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  };

  const getCsrfToken = async () => {
    await fetch("http://localhost:8000/sanctum/csrf-cookie", {
      method: "GET",
      credentials: "include",
    });

    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("XSRF-TOKEN="))
      ?.split("=")[1];

    return decodeURIComponent(csrfToken || '');
  };

  const fetchStockFromBackend = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall('fetch');
      
      if (result.success && result.data?.length > 0) {
        const transformedStock = transformBackendDataToStock(result.data);
        setStockItems(transformedStock);
      } else {
        setStockItems([]);
      }
      
      setLastSaved(new Date().toLocaleString('pt-BR'));
    } catch (error) {
      console.error("Error fetching stock:", error);
      setError(error.message);
      setStockItems([]);
    } finally {
      setLoading(false);
    }
  };

  const transformBackendDataToStock = (backendData) => {
    if (!backendData || !Array.isArray(backendData)) return [];
  
    return backendData.map((stockItem, index) => {
      const productId = stockItem.id || index + 1;
      const productCost = parseFloat(stockItem.cost) || 0;
      const productProfit = parseFloat(stockItem.profit) || 0;
      const productSalePrice = parseFloat(stockItem.sale_price) || 0;
      
      const variants = stockItem.variants || [];
      const totalStock = variants.reduce((sum, variant) => sum + (variant.stock || 0), 0);

      return {
        id: productId,
        product_id: stockItem.product_id || `PROD-${String(productId).padStart(3, '0')}`,
        name: stockItem.name || `Produto ${productId}`,
        sku: stockItem.variants?.[0]?.sku || `SKU-${String(productId).padStart(3, '0')}`,
        category: stockItem.category || "Roupas",
        supplier: stockItem.supplier || "Fornecedor Padrão",
        price: productCost,
        cost: productCost,
        profit: productProfit,
        profit_margin: productProfit > 0 ? (productProfit / productCost) * 100 : 0,
        sale_price: productSalePrice,
        total_value: parseFloat(stockItem.total_value) || (totalStock * productSalePrice),
        last_updated: stockItem.last_updated || new Date().toISOString().split('T')[0],
        created_at: stockItem.created_at || new Date().toISOString().split('T')[0],
        updated_at: stockItem.updated_at || new Date().toISOString().split('T')[0],
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

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchStockFromBackend();
  }, []);

  // ✅ Unified editing function
  const startEditing = (type, productId, field, currentValue, variantId = null) => {
    setEditingItem({ type, productId, field, variantId });
    setEditValue(currentValue.toString());
  };

  const saveEditing = async () => {
    if (!editingItem || !editValue) return;

    try {
      const { type, productId, field, variantId } = editingItem;
      
      if (type === 'variant-stock') {
        await apiCall(`${variantId}/update`, 'PUT', { stock: parseInt(editValue) });
      } 
      else if (type === 'product-field') {
        await apiCall(`product/${productId}/update-field`, 'PUT', { [field]: editValue });
      }
      else if (type === 'product-pricing') {
        const product = stockItems.find(p => p.product_id === productId);
        if (product) {
          const pricingData = {
            cost: field === 'price' ? parseFloat(editValue) : product.cost,
            profit: field === 'profit' ? parseFloat(editValue) : product.profit,
            sale_price: field === 'sale_price' ? parseFloat(editValue) : product.sale_price,
          };
          await apiCall(`product/${productId}/pricing`, 'PUT', pricingData);
        }
      }

      await fetchStockFromBackend();
      cancelEditing();
    } catch (error) {
      console.error("Error updating:", error);
      alert(`Erro ao atualizar: ${error.message}`);
      await fetchStockFromBackend();
    }
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditValue("");
  };

  const isEditing = (type, productId, field, variantId = null) => {
    return editingItem?.type === type && 
           editingItem?.productId === productId && 
           editingItem?.field === field && 
           editingItem?.variantId === variantId;
  };

  // ✅ Unified field editor component
  const FieldEditor = ({ type, productId, field, currentValue, label, variantId = null, inputType = "text" }) => {
    const editing = isEditing(type, productId, field, variantId);
    
    if (editing) {
      return (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 min-w-20">{label}:</span>
          <input
            type={inputType}
            step={inputType === "number" ? "0.01" : undefined}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className={`p-1 border border-gray-300 rounded text-sm text-black ${
              inputType === "number" ? "w-20 text-center" : "w-32"
            }`}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEditing();
              if (e.key === 'Escape') cancelEditing();
            }}
          />
          <div className="flex space-x-1">
            <button onClick={saveEditing} className="text-green-600 hover:text-green-800 bg-green-50 p-1 rounded w-6 h-6 flex items-center justify-center">
              <FiCheck size={12} />
            </button>
            <button onClick={cancelEditing} className="text-red-600 hover:text-red-800 bg-red-50 p-1 rounded w-6 h-6 flex items-center justify-center">
              <FiX size={12} />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">{label}:</span>
        <span className="text-sm font-medium text-gray-900 max-w-32 truncate">
          {inputType === "number" && field !== 'product_id' ? `R$ ${parseFloat(currentValue).toFixed(2)}` : currentValue}
        </span>
        <button
          onClick={() => startEditing(type, productId, field, currentValue, variantId)}
          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 w-6 h-6 flex items-center justify-center"
        >
          <FiEdit size={10} />
        </button>
      </div>
    );
  };

  // ✅ Simplified product operations
  const addNewProduct = async () => {
    if (!productForm.product_id || !productForm.name || !productForm.sku) {
      alert('Por favor, preencha os campos obrigatórios: ID do Produto, Nome e SKU');
      return;
    }

    const newProductData = {
      product_id: productForm.product_id,
      name: productForm.name,
      sku: productForm.sku,
      category: productForm.category || "Roupas",
      supplier: productForm.supplier || "Fornecedor Padrão",
      cost: parseFloat(productForm.price) || 0,
      profit: parseFloat(productForm.profit) || 0,
      sale_price: parseFloat(productForm.sale_price) || 0,
      color: "Default",
      size: "UN",
      stock: 0,
      reserved: 0,
      incoming: 0
    };

    try {
      await apiCall('samples', 'POST', newProductData);
      await fetchStockFromBackend();
      resetProductForm();
      setShowAddProductForm(false);
      alert('✅ Produto adicionado com sucesso!');
    } catch (error) {
      alert(`Erro ao criar produto: ${error.message}`);
    }
  };

  const deleteProduct = async (productId, productName) => {
    if (confirm(`⚠️ Tem certeza que deseja excluir o produto "${productName}"?`)) {
      try {
        await apiCall(`product/${productId}`, 'DELETE');
        setStockItems(prev => prev.filter(product => product.product_id !== productId));
        alert('✅ Produto excluído com sucesso!');
      } catch (error) {
        alert(`Erro ao excluir produto: ${error.message}`);
        await fetchStockFromBackend();
      }
    }
  };

  const deleteVariant = async (variantId, color, size) => {
    if (confirm(`⚠️ Tem certeza que deseja excluir a variante ${color} - ${size}?`)) {
      try {
        await apiCall(`variant/${variantId}`, 'DELETE');
        await fetchStockFromBackend();
        alert('✅ Variante excluída com sucesso!');
      } catch (error) {
        alert(`Erro ao excluir variante: ${error.message}`);
      }
    }
  };

  // ✅ Simplified utility functions
  const calculateProductValue = (product) => {
    const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
    const stockValue = totalStock * product.sale_price;
    
    return {
      stockValue,
      profitValue: totalStock * product.profit,
    };
  };

  const calculateTotalInventoryValue = () => {
    return stockItems.reduce((total, product) => total + calculateProductValue(product).stockValue, 0);
  };

  const calculateTotalProfitValue = () => {
    return stockItems.reduce((total, product) => total + calculateProductValue(product).profitValue, 0);
  };

  const calculateProductTotals = (variants) => {
    return {
      totalStock: variants.reduce((sum, v) => sum + v.stock, 0),
      totalReserved: variants.reduce((sum, v) => sum + v.reserved, 0),
      totalIncoming: variants.reduce((sum, v) => sum + v.incoming, 0),
      availableStock: variants.reduce((sum, v) => sum + (v.stock - v.reserved), 0)
    };
  };

  const resetProductForm = () => {
    setProductForm({
      product_id: "", name: "", sku: "", category: "", supplier: "",
      price: "", profit: "", total_value: "", sale_price: "",
    });
  };

  const resetVariantForm = () => {
    setVariantForm({ color: "", size: "", stock: "", reserved: "", incoming: "" });
  };

  // ... Rest of the component (JSX) remains largely the same but simplified
  // You would update the JSX to use the unified FieldEditor and remove duplicate modals

  return (
    <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
      {/* Header and controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Gestão de Estoque Completo</h2>
          {lastSaved && <p className="text-sm text-gray-500 mt-1">Última atualização: {lastSaved}</p>}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button 
            onClick={fetchStockFromBackend}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center text-sm"
          >
            <FiRefreshCw className="mr-2" />
            Atualizar
          </button>
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

      {/* Product list rendering - simplified using unified FieldEditor */}
      {stockItems.map((product) => {
        const totals = calculateProductTotals(product.variants);
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
                        onClick={() => deleteProduct(product.product_id, product.name)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                        title="Excluir produto"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-2 text-sm">
                    <FieldEditor 
                      type="product-field"
                      productId={product.product_id}
                      field="product_id"
                      currentValue={product.product_id}
                      label="ID"
                    />
                    <FieldEditor 
                      type="product-field"
                      productId={product.product_id}
                      field="sku"
                      currentValue={product.sku}
                      label="SKU"
                    />
                    <FieldEditor 
                      type="product-field"
                      productId={product.product_id}
                      field="category"
                      currentValue={product.category}
                      label="Categoria"
                    />
                  </div>
                </div>
                
                <div className="text-right flex items-center gap-2">
                  <button
                    onClick={() => viewProductInfo(product)}
                    className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700 flex items-center justify-center"
                    title="Visualizar informações"
                  >
                    <FiEye size={20} />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 p-3 bg-white rounded border">
                <div className="space-y-2">
                  <FieldEditor 
                    type="product-pricing"
                    productId={product.product_id}
                    field="price"
                    currentValue={product.price}
                    label="Preço"
                    inputType="number"
                  />
                  <FieldEditor 
                    type="product-pricing"
                    productId={product.product_id}
                    field="profit"
                    currentValue={product.profit}
                    label="Lucro"
                    inputType="number"
                  />
                </div>
                <div className="space-y-2">                    
                  <FieldEditor 
                    type="product-pricing"
                    productId={product.product_id}
                    field="sale_price"
                    currentValue={product.sale_price}
                    label="Preço de Venda"
                    inputType="number"
                  />
                </div>
              </div>
            </div>

            {/* Variants table - simplified */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cor</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamanho</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {product.variants.map((variant) => (
                    <tr key={variant.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-full border border-gray-300 mr-2 bg-gray-200" />
                          <span className="text-sm font-medium text-gray-900">{variant.color}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{variant.size}</td>
                      
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <FieldEditor 
                          type="variant-stock"
                          productId={product.id}
                          field="stock"
                          currentValue={variant.stock}
                          label=""
                          variantId={variant.id}
                          inputType="number"
                        />
                      </td>
                      
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button 
                          onClick={() => deleteVariant(variant.id, variant.color, variant.size)}
                          className="text-red-600 hover:text-red-900 text-xs bg-red-100 px-2 py-1 rounded"
                        >
                          <FiTrash2 size={10} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StockManagement;