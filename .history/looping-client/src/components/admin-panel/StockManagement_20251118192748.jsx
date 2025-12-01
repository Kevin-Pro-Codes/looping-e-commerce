// src/components/admin/StockManagement.jsx
import React, { useState, useEffect, useRef } from "react";
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

  const [productForm, setProductForm] = useState({
    product_id: "",
    name: "",
    sku: "",
    category: "",
    supplier: "",
    price: "",
    profit: "",
    total_value: "",
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

  // ✅ Refs para controlar execuções duplas
  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);

  // ✅ Função para obter CSRF Token (mesmo padrão do Login)
  const getCsrfToken = async () => {
    try {
      console.log("🔐 Getting CSRF token for stock management...");
      
      // 1. Get CSRF cookie from Sanctum
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      // 2. Extract CSRF token from cookies
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      console.log("🔑 CSRF token found:", !!csrfToken);
      
      if (!csrfToken) {
        throw new Error("CSRF token not found");
      }

      return decodeURIComponent(csrfToken);
    } catch (error) {
      console.error("❌ Error getting CSRF token:", error);
      throw error;
    }
  };

  // ✅ Fetch stock data from backend - COM CSRF HANDLING
  const fetchStockFromBackend = async () => {
    if (isFetchingRef.current) {
      console.log('⏸️ Fetch already in progress, skipping duplicate call');
      return;
    }

    setLoading(true);
    setError(null);
    isFetchingRef.current = true;
    
    try {
      console.log('🔄 [1] Fetching stock from Laravel backend...');
      
      // Get CSRF token first
      const csrfToken = await getCsrfToken();
      
      const response = await fetch(`http://localhost:8000/api/infos/stock/fetch`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      console.log('📡 [2] Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      console.log('📦 [3] Backend response success:', result.success);
      console.log('📦 [4] Backend data length:', result.data?.length);
      
      if (result.success) {
        if (result.data && result.data.length > 0) {
          console.log('✅ [5] Using REAL data from backend');
          const transformedStock = transformBackendDataToStock(result.data);
          console.log('🔄 [6] Transformed stock items:', transformedStock.length);
          setStockItems(transformedStock);
        } else {
          console.log('📭 [7] No data from backend - empty array');
          setStockItems([]);
        }
        
        setLastSaved(new Date().toLocaleString('pt-BR'));
      } else {
        console.log('❌ [8] Backend returned success: false');
        throw new Error(result.message || 'Failed to fetch stock data');
      }
      
    } catch (error) {
      console.error("❌ [9] Error fetching stock from backend:", error);
      setError(error.message);
      setStockItems([]);
    } finally {
      console.log('🏁 [10] Fetch completed, setting loading false');
      setLoading(false);
      isFetchingRef.current = false;
    }
  };


  // ✅ Transform backend data to frontend format - USING DATABASE VALUES
  const transformBackendDataToStock = (backendData) => {
    console.log('🔄 Transforming backend data:', backendData);
    
    if (!backendData || !Array.isArray(backendData)) {
      console.log('❌ Backend data is invalid - returning empty array');
      return [];
    }
  
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

  // ✅ Carregar dados quando o componente montar - COM CONTROLE DE DUPLICAÇÃO
  useEffect(() => {
    console.log('🔵 [EFFECT] useEffect triggered');
    
    if (hasFetchedRef.current) {
      console.log('⏸️ [EFFECT] Already fetched data, skipping...');
      return;
    }

    console.log('🎯 [EFFECT] First mount - fetching data');
    hasFetchedRef.current = true;
    
    fetchStockFromBackend();

    return () => {
      console.log('🔴 [EFFECT] Cleanup function');
    };
  }, []);

  // ✅ Confirmation dialog function
  const confirmDelete = (message) => {
    return window.confirm(message);
  };

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

  const savePriceEditing = async () => {
    if (editingPrice && editValue !== "") {
      const newValue = parseFloat(editValue) || 0;
      
      try {
        // Primeiro atualiza localmente
        updateProductPrice(
          editingPrice.productId,
          editingPrice.field,
          newValue
        );
  
        // Encontra o produto para obter todos os dados atualizados
        const product = stockItems.find(p => p.id === editingPrice.productId);
        if (product) {
          // Prepara os dados para enviar ao backend
          const pricingData = {
            cost: product.price,
            profit: product.profit,
            sale_price: product.sale_price,
            total_value: product.total_value
          };
  
          // Atualiza o campo específico que está sendo editado
          pricingData[editingPrice.field] = newValue;
  
          // Recalcula o total_value se necessário
          if (editingPrice.field === 'sale_price') {
            const productValue = calculateProductValue({...product, sale_price: newValue});
            pricingData.total_value = productValue.stockValue;
          }
  
          // Salva no backend
          const csrfToken = await getCsrfToken();
          const response = await fetch(`http://localhost:8000/api/infos/stock/product/${product.product_id}/pricing`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-XSRF-TOKEN': csrfToken,
              'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify(pricingData)
          });
  
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
  
          const result = await response.json();
          
          if (result.success) {
            console.log(`✅ Preços atualizados para produto ${product.product_id}`);
            // Atualiza os dados do backend para garantir sincronização
            await fetchStockFromBackend();
          } else {
            throw new Error(result.message || 'Failed to update pricing');
          }
        }
      } catch (error) {
        console.error("❌ Error updating pricing:", error);
        alert(`Erro ao atualizar preços: ${error.message}`);
        // Reverte a mudança local em caso de erro
        await fetchStockFromBackend();
      }
    }
    cancelPriceEditing();
  };
  

  const updateProductPrice = (productId, field, newValue) => {
    setStockItems(prev => {
      const updatedStock = prev.map(product => 
        product.id === productId
          ? {
              ...product,
              [field]: newValue,
              total_value: field === 'sale_price' 
                ? calculateProductValue({...product, sale_price: newValue}).stockValue
                : product.total_value,
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


const PriceEditor = ({ productId, field, currentValue, label }) => {
  const isEditing = isPriceEditing(productId, field);
  
  const handleSave = async () => {
    if (editValue !== "") {
      const newValue = parseFloat(editValue) || 0;
      
      try {
        // Primeiro atualiza localmente para feedback imediato
        updateProductPrice(productId, field, newValue);

        // Encontra o produto para obter o product_id correto
        const product = stockItems.find(p => p.id === productId);
        if (product) {
          // Prepara os dados atualizados para enviar ao backend
          const updatedProduct = {
            ...product,
            [field]: newValue
          };

          const productValue = calculateProductValue(updatedProduct);

          // Prepara TODOS os dados de preço para enviar ao backend
          // Garanta que estamos usando os valores ATUALIZADOS
          const pricingData = {
            cost: field === 'price' ? newValue : updatedProduct.price,
            profit: field === 'profit' ? newValue : updatedProduct.profit,
            sale_price: field === 'sale_price' ? newValue : updatedProduct.sale_price,
            total_value: field === 'total_value' ? newValue : productValue.stockValue
          };

          console.log('💾 Salvando TODOS os campos no banco:', {
            product_id: product.product_id,
            field_editado: field,
            novo_valor: newValue,
            pricingData_enviado: pricingData
          });

          // Salva no backend
          const csrfToken = await getCsrfToken();
          const response = await fetch(`http://localhost:8000/api/infos/stock/product/${product.product_id}/pricing`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-XSRF-TOKEN': csrfToken,
              'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify(pricingData)
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          
          if (result.success) {
            console.log(`✅ TODOS os preços salvos no banco para ${product.product_id}:`, result.message);
            // Atualiza os dados do backend para garantir sincronização
            await fetchStockFromBackend();
          } else {
            throw new Error(result.message || 'Failed to update pricing');
          }
        }
      } catch (error) {
        console.error("❌ Erro ao salvar no banco:", error);
        alert(`Erro ao salvar preços: ${error.message}`);
        // Reverte mudanças locais em caso de erro
        await fetchStockFromBackend();
      }
    }
    setEditingPrice(null);
    setEditValue("");
  };

  const handleCancel = () => {
    setEditingPrice(null);
    setEditValue("");
  };

  const handleStartEdit = () => {
    setEditingPrice({ productId, field, currentValue });
    setEditValue(currentValue.toString());
  };

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
          onKeyDown={async (e) => {
            if (e.key === 'Enter') await handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
        />
        <div className="flex space-x-1">
          <button
            onClick={handleSave}
            className="text-green-600 hover:text-green-800 bg-green-50 p-1 rounded w-6 h-6 flex items-center justify-center"
            title="Confirmar"
          >
            <FiCheck size={12} />
          </button>
          <button
            onClick={handleCancel}
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
        onClick={handleStartEdit}
        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 w-6 h-6 flex items-center justify-center"
        title={`Editar ${label.toLowerCase()}`}
      >
        <FiEdit size={10} />
      </button>
    </div>
  );
};

  // ✅ Update stock in backend - COM CSRF HANDLING
  const updateStockInBackend = async (variantId, newStock) => {
    try {
      const csrfToken = await getCsrfToken();
      
      const response = await fetch(`http://localhost:8000/api/infos/stock/${variantId}/update`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          stock: newStock
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
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

  // ✅ Add incoming stock to backend - COM CSRF HANDLING
  const addIncomingToBackend = async (variantId, quantity) => {
    try {
      const csrfToken = await getCsrfToken();
      
      const response = await fetch(`http://localhost:8000/api/infos/stock/${variantId}/add-incoming`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          quantity: quantity
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
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

  // ✅ Receive incoming stock in backend - COM CSRF HANDLING
  const receiveIncomingFromBackend = async (variantId) => {
    try {
      const csrfToken = await getCsrfToken();
      
      const response = await fetch(`http://localhost:8000/api/infos/stock/${variantId}/receive-incoming`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
          'X-Requested-With': 'XMLHttpRequest',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
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

  // ✅ Create new stock item in backend - COM CSRF HANDLING
  const createStockInBackend = async (stockData) => {
    try {
      const csrfToken = await getCsrfToken();
      
      const response = await fetch(`http://localhost:8000/api/infos/stock/samples`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          ...stockData,
          profit: stockData.profit || 0,
          sale_price: stockData.sale_price || 0,
          total_value: stockData.total_value || 0
        })
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      
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
  

  // ✅ ADICIONAR NOVO PRODUTO
  const addNewProduct = async () => {
    const newProductData = {
      product_id: productForm.product_id,
      name: productForm.name,
      sku: productForm.sku,
      category: productForm.category,
      supplier: productForm.supplier,
      cost: parseFloat(productForm.price) || 0,
      profit: parseFloat(productForm.profit) || 0,
      sale_price: parseFloat(productForm.sale_price) || 0,
      total_value: parseFloat(productForm.total_value) || 0, // ← Note: total_value aqui
      color: "Default",
      size: "UN",
      stock: 0,
      reserved: 0,
      incoming: 0
    };
  
    console.log('📤 Criando novo produto:', newProductData);
  
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
      total_value: product.total_value.toString(),
      sale_price: product.sale_price.toString(),
    });
    setShowAddProductForm(true);
  };

  // ✅ ATUALIZAR PRODUTO
  const updateProduct = async () => {
    try {
      const product = stockItems.find(p => p.id === editingProduct.id);
      if (product) {
        const pricingData = {
          cost: parseFloat(productForm.price) || 0,
          profit: parseFloat(productForm.profit) || 0,
          sale_price: parseFloat(productForm.sale_price) || 0,
          total_value: parseFloat(productForm.total_value) || 0
        };
  
        console.log('📤 Atualizando produto no backend:', {
          product_id: product.product_id,
          pricingData
        });
  
        const csrfToken = await getCsrfToken();
        const response = await fetch(`http://localhost:8000/api/infos/stock/product/${product.product_id}/pricing`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-XSRF-TOKEN': csrfToken,
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify(pricingData)
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Produto atualizado com sucesso no backend');
          // Atualiza localmente após sucesso no backend
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
                    total_value: parseFloat(productForm.total_value) || 0,
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
        } else {
          throw new Error(result.message || 'Failed to update product');
        }
      }
    } catch (error) {
      console.error("❌ Error updating product:", error);
      alert(`Erro ao atualizar produto: ${error.message}`);
    }
  };
  

  // ✅ EXCLUIR PRODUTO
  const deleteProduct = (productId) => {
    if (confirmDelete('⚠️ Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) {
      setStockItems(prev => {
        const updatedStock = prev.filter(product => product.id !== productId);
        return updatedStock;
      });
      alert('✅ Produto excluído com sucesso!');
    }
  };

  // ✅ ADICIONAR NOVA VARIANTE
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
    if (confirmDelete('⚠️ Tem certeza que deseja excluir esta variante?')) {
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
      total_value: "",
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
                  total_value: calculateProductValue({
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
                total_value: calculateProductValue({
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

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
                <p className="mt-1">Banco de dados pode estar vazio.</p>
              </div>
            </div>
          </div>
        </div>
      )}

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
              <p className="text-sm font-medium text-gray-600">Faturamento</p>
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

      {showAddProductForm && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">
            {editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID do Produto *
              </label>
              <input
                type="text"
                value={productForm.product_id}
                onChange={(e) => setProductForm({...productForm, product_id: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded text-black"
                placeholder="Ex: PROD-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Produto *
              </label>
              <input
                type="text"
                value={productForm.name}
                onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded text-black"
                placeholder="Ex: Camiseta Looping"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU *
              </label>
              <input
                type="text"
                value={productForm.sku}
                onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded text-black"
                placeholder="Ex: CT-LOOPING-WHITE"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria *
              </label>
              <input
                type="text"
                value={productForm.category}
                onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded text-black"
                placeholder="Ex: Roupas"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fornecedor *
              </label>
              <input
                type="text"
                value={productForm.supplier}
                onChange={(e) => setProductForm({...productForm, supplier: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded text-black"
                placeholder="Ex: Fabricante A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                value={productForm.price}
                onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded text-black"
                placeholder="Ex: 60.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lucro (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                value={productForm.profit}
                onChange={(e) => setProductForm({...productForm, profit: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded text-black"
                placeholder="Ex: 45.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor em Estoque (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={productForm.total_value}
                onChange={(e) => setProductForm({...productForm, total_value: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded text-black"
                placeholder="Ex: 600.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço de Venda (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={productForm.sale_price}
                onChange={(e) => setProductForm({...productForm, sale_price: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded text-black"
                placeholder="Ex: 60.90"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={cancelProductForm}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={editingProduct ? updateProduct : addNewProduct}
              disabled={!productForm.product_id || !productForm.name || !productForm.sku}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {editingProduct ? 'Atualizar Produto' : 'Adicionar Produto'}
            </button>
          </div>
        </div>
      )}

      {showAddVariantForm && selectedProduct && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">
            Adicionar Variante para {selectedProduct.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cor *
              </label>
              <input
                type="text"
                value={variantForm.color}
                onChange={(e) => setVariantForm({...variantForm, color: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded text-black"
                placeholder="Ex: Branco"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tamanho *
              </label>
              <input
                type="text"
                value={variantForm.size}
                onChange={(e) => setVariantForm({...variantForm, size: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded text-black"
                placeholder="Ex: P, M, G"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estoque Inicial
              </label>
              <input
                type="number"
                value={variantForm.stock}
                onChange={(e) => setVariantForm({...variantForm, stock: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded text-black"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reservado
              </label>
              <input
                type="number"
                value={variantForm.reserved}
                onChange={(e) => setVariantForm({...variantForm, reserved: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded text-black"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Em Chegada
              </label>
              <input
                type="number"
                value={variantForm.incoming}
                onChange={(e) => setVariantForm({...variantForm, incoming: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded text-black"
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={cancelVariantForm}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={addNewVariant}
              disabled={!variantForm.color || !variantForm.size}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Adicionar Variante
            </button>
          </div>
        </div>
      )}

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
                        field="sale_price"
                        currentValue={product.sale_price}
                        label="Preço de Venda"
                      />
                        <PriceEditor 
                        productId={product.id}
                        field="total_value"
                        currentValue={productValue.stockValue}
                        label="Faturamento"
                      />
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
                          : "Em Estoque";
                        
                        const isVariantEditing = isEditing(product.id, variant.id);
                        
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
                                      className="text-green-600 hover:text-green-800 bg-green-50 p-1 rounded w-6 h-6 flex items-center justify-center"
                                      title="Confirmar"
                                    >
                                      <FiCheck size={14} />
                                    </button>
                                    <button
                                      onClick={cancelEditing}
                                      className="text-red-600 hover:text-red-800 bg-red-50 p-1 rounded w-6 h-6 flex items-center justify-center"
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
                                    onClick={() => startEditing(product.id, variant.id, variant.stock)}
                                    className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 w-6 h-6 flex items-center justify-center"
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
                                    onClick={() => receiveIncomingStock(product.id, variant.id)}
                                    className="text-green-600 hover:text-green-800 text-xs bg-green-100 px-2 py-1 rounded"
                                  >
                                    Receber
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
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
                                onClick={() => {
                                  if (confirmDelete('⚠️ Tem certeza que deseja excluir esta variante?')) {
                                    deleteVariant(product.id, variant.id);
                                  }
                                }}
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
              {stockSearch ? 'Tente ajustar os termos da busca.' : 'Banco de dados vazio. Comece adicionando um novo produto.'}
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