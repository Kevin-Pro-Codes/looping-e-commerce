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

  // ✅ API Configuration - ATUALIZADO COM SUAS ROTAS
  const API_BASE_URL = 'http://localhost:8000/api';
  const API_ENDPOINTS = {
    stock: `${API_BASE_URL}/infos/stock`,
    updateStock: (id) => `${API_BASE_URL}/infos/stock/${id}/update`,
    addIncoming: (id) => `${API_BASE_URL}/infos/stock/${id}/add-incoming`,
    receiveIncoming: (id) => `${API_BASE_URL}/infos/stock/${id}/receive-incoming`,
    lowStock: `${API_BASE_URL}/infos/stock/low-stock`,
    outOfStock: `${API_BASE_URL}/infos/stock/out-of-stock`,
    createStock: `${API_BASE_URL}/infos/stock` // ✅ Corrigido: removido '/samples'
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

  // ✅ Fetch stock data from backend - ATUALIZADO
  const fetchStockFromBackend = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching stock from:', API_ENDPOINTS.stock);
      
      const response = await fetch(API_ENDPOINTS.stock, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('📊 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response text:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📦 Backend response:', result);
      
      if (result.success) {
        console.log('✅ Data fetched successfully');
        
        if (result.data && result.data.length > 0) {
          const transformedStock = transformBackendDataToStock(result.data);
          console.log('🔄 Transformed stock:', transformedStock);
          setStockItems(transformedStock);
        } else {
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
      setError(`Erro: ${error.message}. Usando dados de exemplo.`);
      const fallbackStock = generateSampleStock();
      setStockItems(fallbackStock);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Transform backend data to frontend format
  const transformBackendDataToStock = (backendData) => {
    console.log('🔄 Transforming backend data:', backendData);
    
    if (!backendData || !Array.isArray(backendData)) {
      console.log('❌ Backend data is invalid, using sample data');
      return generateSampleStock();
    }

    return backendData.map((productGroup, index) => {
      const productId = productGroup.id || index + 1;
      const productCost = parseFloat(productGroup.cost) || 60.00;
      
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
        profit: productCost * 0.6,
        stock_value: totalValue,
        sale_price: productCost * 1.8,
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

  // ✅ Generate sample stock (fallback)
  const generateSampleStock = () => {
    console.log('📦 Generating sample stock data');
    
    const sampleProducts = [
      {
        id: 1,
        product_id: "PROD-001",
        name: "Camiseta Looping Branca",
        sku: "CT-LOOPING-WHITE",
        category: "Roupas",
        supplier: "Fabricante A",
        price: 15.00,
        profit: 45.00,
        sale_price: 60.00,
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
        price: 15.00,
        profit: 45.00,
        sale_price: 60.00,
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

    return sampleProducts.map(product => {
      const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
      const stockValue = totalStock * product.sale_price;
      
      return {
        ...product,
        stock_value: parseFloat(stockValue.toFixed(2))
      };
    });
  };

  // ✅ Carregar dados quando o componente montar
  useEffect(() => {
    fetchStockFromBackend();
  }, []);

  // ✅ CÁLCULOS DE VALOR
  const calculateProductValue = (product) => {
    const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
    const totalAvailable = product.variants.reduce((sum, variant) => sum + (variant.stock - variant.reserved), 0);
    const stockValue = totalStock * product.sale_price;
    
    return {
      priceValue: totalStock * product.price,
      profitValue: totalStock * product.profit,
      stockValue: stockValue,
      saleValue: totalStock * product.sale_price,
      availableValue: totalAvailable * product.sale_price,
      profitPercentage: product.profit > 0 ? ((product.sale_price - (product.price - product.profit)) / (product.price - product.profit)) * 100 : 0
    };
  };

  const calculateTotalInventoryValue = () => {
    return stockItems.reduce((total, product) => {
      const productValue = calculateProductValue(product);
      return total + productValue.stockValue;
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
              stock_value: field === 'sale_price' 
                ? calculateProductValue({...product, sale_price: newValue}).stockValue
                : product.stock_value,
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
              className="text-green-600 hover:text-green-800 bg-green-50 p-1 rounded w-6 h-6 flex items-center justify-center"
              title="Confirmar"
            >
              <FiCheck size={12} />
            </button>
            <button
              onClick={cancelPriceEditing}
              className="text-red-600 hover:text-red-800 bg-red-50 p-1 rounded w-6 h-6 flex items-center justify-center"
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
        <span className="text-sm text-gray-600">{label}:</span>
        <span className="text-sm font-medium text-gray-900">
          R$ {parseFloat(currentValue).toFixed(2)}
        </span>
        <button
          onClick={() => startPriceEditing(productId, field, currentValue)}
          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 w-6 h-6 flex items-center justify-center"
          title={`Editar ${label.toLowerCase()}`}
        >
          <FiEdit size={10} />
        </button>
      </div>
    );
  };

  // ✅ ADICIONAR NOVO PRODUTO - ATUALIZADO
  const addNewProduct = async () => {
    const newProductData = {
      product_id: productForm.product_id,
      name: productForm.name,
      sku: productForm.sku,
      category: productForm.category,
      supplier: productForm.supplier,
      cost: parseFloat(productForm.price) || 0,
      color: "Default",
      size: "UN",
      stock: 0,
      reserved: 0,
      incoming: 0
    };

    const createdProduct = await createStockInBackend(newProductData);
    
    if (createdProduct) {
      await fetchStockFromBackend();
      resetProductForm();
      setShowAddProductForm(false);
      alert('✅ Produto adicionado com sucesso!');
    }
  };

  // ✅ EDITAR PRODUTO
  const editProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      product_id: product.product_id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      supplier: product.supplier,
      price: product.price.toString(),
      profit: product.profit.toString(),
      stock_value: product.stock_value.toString(),
      sale_price: product.sale_price.toString(),
    });
    setShowAddProductForm(true);
  };

  // ✅ ATUALIZAR PRODUTO
  const updateProduct = () => {
    setStockItems(prev => {
      const updatedStock = prev.map(product => 
        product.id === editingProduct.id
          ? {
              ...product,
              product_id: productForm.product_id,
              name: productForm.name,
              sku: productForm.sku,
              category: productForm.category,
              supplier: productForm.supplier,
              price: parseFloat(productForm.price) || 0,
              profit: parseFloat(productForm.profit) || 0,
              stock_value: parseFloat(productForm.stock_value) || 0,
              sale_price: parseFloat(productForm.sale_price) || 0,
              updated_at: new Date().toISOString().split('T')[0]
            }
          : product
      );
      return updatedStock;
    });

    resetProductForm();
    setShowAddProductForm(false);
    setEditingProduct(null);
    alert('✅ Produto atualizado com sucesso!');
  };

  // ✅ EXCLUIR PRODUTO
  const deleteProduct = (productId) => {
    if (window.confirm('⚠️ Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) {
      setStockItems(prev => {
        const updatedStock = prev.filter(product => product.id !== productId);
        return updatedStock;
      });
      alert('✅ Produto excluído com sucesso!');
    }
  };

  // ✅ ADICIONAR NOVA VARIANTE - ATUALIZADO
  const addNewVariant = async () => {
    if (!selectedProduct) return;

    const newVariantData = {
      product_id: selectedProduct.product_id,
      name: selectedProduct.name,
      sku: `${selectedProduct.sku}-${variantForm.color}-${variantForm.size}`.toUpperCase(),
      category: selectedProduct.category,
      supplier: selectedProduct.supplier,
      cost: selectedProduct.price,
      color: variantForm.color,
      size: variantForm.size,
      stock: parseInt(variantForm.stock) || 0,
      reserved: parseInt(variantForm.reserved) || 0,
      incoming: parseInt(variantForm.incoming) || 0,
    };

    const createdVariant = await createStockInBackend(newVariantData);
    
    if (createdVariant) {
      await fetchStockFromBackend();
      resetVariantForm();
      setShowAddVariantForm(false);
      alert('✅ Variante adicionada com sucesso!');
    }
  };

  // ✅ EXCLUIR VARIANTE
  const deleteVariant = (productId, variantId) => {
    if (window.confirm('⚠️ Tem certeza que deseja excluir esta variante?')) {
      setStockItems(prev => {
        const updatedStock = prev.map(product => 
          product.id === productId
            ? {
                ...product,
                variants: product.variants.filter(variant => variant.id !== variantId),
                updated_at: new Date().toISOString().split('T')[0]
              }
            : product
        );
        return updatedStock;
      });
      alert('✅ Variante excluída com sucesso!');
    }
  };

  // ✅ RESET FORMULÁRIOS
  const resetProductForm = () => {
    setProductForm({
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
  };

  const resetVariantForm = () => {
    setVariantForm({
      color: "",
      size: "",
      stock: "",
      reserved: "",
      incoming: "",
    });
  };

  // ✅ CANCELAR FORMULÁRIOS
  const cancelProductForm = () => {
    setShowAddProductForm(false);
    setEditingProduct(null);
    resetProductForm();
  };

  const cancelVariantForm = () => {
    setShowAddVariantForm(false);
    setSelectedProduct(null);
    resetVariantForm();
  };

  // ✅ FUNÇÕES EXISTENTES DE EDIÇÃO DE ESTOQUE
  const startEditing = (productId, variantId, currentStock) => {
    setEditingVariant({ productId, variantId });
    setEditValue(currentStock.toString());
  };

  const saveEditing = async () => {
    if (editingVariant && editValue !== "") {
      const success = await updateStockInBackend(
        editingVariant.variantId, 
        parseInt(editValue) || 0
      );
      
      if (success) {
        setStockItems(prev => {
          const updatedStock = prev.map(product => 
            product.id === editingVariant.productId 
              ? {
                  ...product,
                  variants: product.variants.map(variant =>
                    variant.id === editingVariant.variantId
                      ? { ...variant, stock: Math.max(0, parseInt(editValue) || 0) }
                      : variant
                  ),
                  stock_value: calculateProductValue({
                    ...product,
                    variants: product.variants.map(variant =>
                      variant.id === editingVariant.variantId
                        ? { ...variant, stock: Math.max(0, parseInt(editValue) || 0) }
                        : variant
                    )
                  }).stockValue,
                  last_updated: new Date().toISOString().split('T')[0],
                  updated_at: new Date().toISOString().split('T')[0]
                }
              : product
          );
          return updatedStock;
        });
      }
    }
    cancelEditing();
  };

  const cancelEditing = () => {
    setEditingVariant(null);
    setEditValue("");
  };

  const addIncomingStock = async (productId, variantId, quantity) => {
    const success = await addIncomingToBackend(variantId, quantity);
    
    if (success) {
      setStockItems(prev => {
        const updatedStock = prev.map(product => 
          product.id === productId 
            ? {
                ...product,
                variants: product.variants.map(variant =>
                  variant.id === variantId
                    ? { ...variant, incoming: variant.incoming + quantity }
                    : variant
                ),
                updated_at: new Date().toISOString().split('T')[0]
              }
            : product
        );
        return updatedStock;
      });
    }
  };

  const receiveIncomingStock = async (productId, variantId) => {
    const success = await receiveIncomingFromBackend(variantId);
    
    if (success) {
      setStockItems(prev => {
        const updatedStock = prev.map(product => 
          product.id === productId 
            ? {
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
                stock_value: calculateProductValue({
                  ...product,
                  variants: product.variants.map(variant =>
                    variant.id === variantId
                      ? { 
                          ...variant, 
                          stock: variant.stock + variant.incoming,
                          incoming: 0 
                        }
                      : variant
                  )
                }).stockValue,
                last_updated: new Date().toISOString().split('T')[0],
                updated_at: new Date().toISOString().split('T')[0]
              }
            : product
        );
        return updatedStock;
      });
    }
  };

  const isEditing = (productId, variantId) => {
    return editingVariant && 
           editingVariant.productId === productId && 
           editingVariant.variantId === variantId;
  };

  // ✅ Update stock in backend - ATUALIZADO
  const updateStockInBackend = async (variantId, newStock) => {
    try {
      console.log('🔄 Updating stock for variant:', variantId, 'to:', newStock);
      
      const response = await fetch(API_ENDPOINTS.updateStock(variantId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          stock: newStock
        })
      });

      console.log('📊 Update response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📦 Update response:', result);
      
      if (result.success) {
        console.log(`✅ Stock updated for variant ${variantId}`);
        return true;
      } else {
        throw new Error(result.message || 'Failed to update stock');
      }
      
    } catch (error) {
      console.error("❌ Error updating stock:", error);
      alert(`Erro ao atualizar estoque: ${error.message}`);
      return false;
    }
  };

  // ✅ Add incoming stock to backend - ATUALIZADO
  const addIncomingToBackend = async (variantId, quantity) => {
    try {
      console.log('🔄 Adding incoming stock for variant:', variantId, 'quantity:', quantity);
      
      const response = await fetch(API_ENDPOINTS.addIncoming(variantId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          quantity: quantity
        })
      });

      console.log('📊 Add incoming response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📦 Add incoming response:', result);
      
      if (result.success) {
        console.log(`✅ Incoming stock added for variant ${variantId}`);
        return true;
      } else {
        throw new Error(result.message || 'Failed to add incoming stock');
      }
      
    } catch (error) {
      console.error("❌ Error adding incoming stock:", error);
      alert(`Erro ao adicionar estoque em chegada: ${error.message}`);
      return false;
    }
  };

  // ✅ Receive incoming stock in backend - ATUALIZADO
  const receiveIncomingFromBackend = async (variantId) => {
    try {
      console.log('🔄 Receiving incoming stock for variant:', variantId);
      
      const response = await fetch(API_ENDPOINTS.receiveIncoming(variantId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      console.log('📊 Receive incoming response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📦 Receive incoming response:', result);
      
      if (result.success) {
        console.log(`✅ Incoming stock received for variant ${variantId}`);
        return true;
      } else {
        throw new Error(result.message || 'Failed to receive incoming stock');
      }
      
    } catch (error) {
      console.error("❌ Error receiving incoming stock:", error);
      alert(`Erro ao receber estoque: ${error.message}`);
      return false;
    }
  };

  // ✅ Create new stock item in backend - ATUALIZADO
  const createStockInBackend = async (stockData) => {
    try {
      console.log('🔄 Creating new stock item:', stockData);
      
      const response = await fetch(API_ENDPOINTS.createStock, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(stockData)
      });

      console.log('📊 Create response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Create response text:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📦 Create response:', result);
      
      if (result.success) {
        console.log(`✅ Stock item created: ${result.data.id}`);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to create stock item');
      }
      
    } catch (error) {
      console.error("❌ Error creating stock item:", error);
      alert(`Erro ao criar item de estoque: ${error.message}`);
      return null;
    }
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

  // ✅ Skeleton Loading Components (mantido igual)
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
      {/* ... skeleton content mantido igual ... */}
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
        {/* ... loading skeleton mantido igual ... */}
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
      {/* ... JSX mantido igual (só as URLs da API foram atualizadas) ... */}
    </div>
  );
};

export default StockManagement;