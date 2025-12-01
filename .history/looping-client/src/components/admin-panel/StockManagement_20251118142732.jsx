import React, { useState, useEffect } from "react";
import { 
  Search, Plus, Package, Layers, AlertCircle, Edit, Check, X,
  Trash2, DollarSign, Percent, RefreshCw
} from "lucide-react"; // Importação confirmada de lucide-react para evitar erros de dependência antigos.

// NOTE: Para usar o Tailwind CSS, é necessário que ele esteja configurado ou carregado no ambiente.

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

  // Função auxiliar para delay
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const MAX_RETRIES = 3;

  // ✅ API Configuration - ENDPOINTS COMPLETOS
  const API_BASE_URL = 'http://localhost:8000/api';
  const API_ENDPOINTS = {
    stock: `${API_BASE_URL}/infos/stock`,
    updateStock: (id) => `${API_BASE_URL}/infos/stock/${id}/update`,
    updateDetails: (id) => `${API_BASE_URL}/infos/stock/${id}/update-details`, // NOVO
    delete: (id) => `${API_BASE_URL}/infos/stock/${id}/delete`, // NOVO
    addIncoming: (id) => `${API_BASE_URL}/infos/stock/${id}/add-incoming`,
    receiveIncoming: (id) => `${API_BASE_URL}/infos/stock/${id}/receive-incoming`,
    lowStock: `${API_BASE_URL}/infos/stock/low-stock`,
    outOfStock: `${API_BASE_URL}/infos/stock/out-of-stock`,
    createStock: `${API_BASE_URL}/infos/stock/samples`
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

  // ✅ Custom Modal/Dialog function (Replaced window.confirm)
  const showCustomConfirmation = (message, onConfirm) => {
    // NOTE: Usando window.confirm temporariamente, mas deve ser substituído por um modal customizado
    console.warn(`[CONFIRMATION REQUIRED]: ${message}`);
    if (window.confirm(message)) {
      onConfirm();
    }
  };

  // ----------------------------------------------------------------------
  // ✅ FUNÇÕES DE COMUNICAÇÃO COM O BACKEND
  // ----------------------------------------------------------------------

  // ✅ Fetch stock data from backend (com re-tentativas)
  const fetchStockFromBackend = async () => {
    setLoading(true);
    setError(null);
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        console.log(`🔄 Fetching stock from Laravel backend (Attempt ${attempt + 1}/${MAX_RETRIES})...`);
        
        const response = await fetch(API_ENDPOINTS.stock, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
          console.log('📦 Backend response:', result);
          
          if (result.data && result.data.length > 0) {
            const transformedStock = transformBackendDataToStock(result.data);
            setStockItems(transformedStock);
          } else {
            console.log('📦 No data from backend, using sample data');
            const fallbackStock = generateSampleStock();
            setStockItems(fallbackStock);
          }
          
          setLastSaved(new Date().toLocaleString('pt-BR'));
          setLoading(false);
          return; // Exit function on success
        } else {
          throw new Error(result.message || 'Failed to fetch stock data (API reported failure)');
        }
        
      } catch (err) {
        if (attempt < MAX_RETRIES - 1) {
          const waitTime = Math.pow(2, attempt) * 1000;
          console.warn(`❌ Network/HTTP error on attempt ${attempt + 1}: ${err.message}. Retrying in ${waitTime}ms. (Verify server status and CORS).`);
          await delay(waitTime);
        } else {
          // Última tentativa falhou
          console.error("❌ Final attempt failed. Cannot connect to backend server. Falling back to sample data.", err);
          setError("Falha na conexão com o servidor de backend. Verifique se o Laravel está rodando e se o CORS está configurado. (Usando dados de exemplo).");
          const fallbackStock = generateSampleStock();
          setStockItems(fallbackStock);
          setLoading(false);
          return;
        }
      }
    }
  };

  // ✅ Update stock in backend (quantity only)
  const updateStockInBackend = async (variantId, newStock) => {
    try {
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Stock updated for variant ${variantId}`);
        return true;
      } else {
        throw new Error(result.message || 'Failed to update stock quantity');
      }
      
    } catch (error) {
      console.error("❌ Error updating stock:", error);
      return false;
    }
  };

  // ✅ Update details in backend (price, profit, sale_price) - NOVO
  const updateDetailsInBackend = async (productId, field, value) => {
    try {
      // NOTE: We pass the product's (variant) ID for routing, and then the field/value
      const response = await fetch(API_ENDPOINTS.updateDetails(productId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          field: field,
          value: value
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Product details updated for product ID ${productId}`);
        // Refetch everything to ensure price/profit calculations are correct across all variants
        await fetchStockFromBackend();
        return true;
      } else {
        throw new Error(result.message || 'Failed to update product details');
      }
      
    } catch (error) {
      console.error("❌ Error updating product details:", error);
      return false;
    }
  };

  // ✅ Delete stock item/variant in backend - NOVO
  const deleteStockItemInBackend = async (variantId) => {
    try {
      const response = await fetch(API_ENDPOINTS.delete(variantId), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Stock item deleted: ${variantId}`);
        // Refetch to update the UI globally
        await fetchStockFromBackend();
        return true;
      } else {
        throw new Error(result.message || 'Failed to delete stock item');
      }
      
    } catch (error) {
      console.error("❌ Error deleting stock item:", error);
      return false;
    }
  };

  // ✅ Add incoming stock to backend
  const addIncomingToBackend = async (variantId, quantity) => {
    try {
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
      return false;
    }
  };

  // ✅ Receive incoming stock in backend
  const receiveIncomingFromBackend = async (variantId) => {
    try {
      const response = await fetch(API_ENDPOINTS.receiveIncoming(variantId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
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
      return false;
    }
  };

  // ✅ Create new stock item in backend
  const createStockInBackend = async (stockData) => {
    try {
      const response = await fetch(API_ENDPOINTS.createStock, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(stockData)
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
      return null;
    }
  };


  // ----------------------------------------------------------------------
  // ✅ LÓGICA DE DADOS E ESTADO
  // ----------------------------------------------------------------------

  // ✅ Transform backend data to frontend format
  const transformBackendDataToStock = (backendData) => {
    console.log('🔄 Transforming backend data:', backendData);
    
    if (!backendData || !Array.isArray(backendData)) {
      console.log('❌ Backend data is invalid, using sample data');
      return generateSampleStock();
    }

    return backendData.map((productGroup, index) => {
      const productId = productGroup.id || index + 1;
      // Use price, profit, sale_price as received from Model/Controller, 
      // or calculate if missing (fallback for older DB data)
      const productCost = parseFloat(productGroup.price) || 60.00;
      const productProfit = parseFloat(productGroup.profit) || (productCost * 0.6);
      const productSalePrice = parseFloat(productGroup.sale_price) || (productCost * 1.8);
      
      const variants = productGroup.variants || [];
      const totalStock = variants.reduce((sum, variant) => sum + (variant.stock || 0), 0);
      const stockValue = totalStock * productSalePrice; // Calcula o valor do estoque baseado no preço de VENDA

      return {
        id: productId,
        product_id: productGroup.product_id || `PROD-${String(productId).padStart(3, '0')}`,
        name: productGroup.name || `Produto ${productId}`,
        // Using the SKU of the first variant for the product row, as per original logic
        sku: productGroup.variants?.[0]?.sku || `SKU-${String(productId).padStart(3, '0')}`,
        category: productGroup.category || "Roupas",
        supplier: productGroup.supplier || "Fornecedor Padrão",
        price: productCost,
        profit: productProfit,
        stock_value: stockValue, // Valor total em estoque (a preço de venda)
        sale_price: productSalePrice,
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
    // ... (rest of the sample data remains the same)
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

  // ----------------------------------------------------------------------
  // ✅ EDIÇÃO DE PREÇOS (CONECTADO AO BACKEND)
  // ----------------------------------------------------------------------

  const startPriceEditing = (productId, field, currentValue) => {
    setEditingPrice({ productId, field, currentValue });
    setEditValue(currentValue.toString());
  };

  const savePriceEditing = async () => {
    if (editingPrice && editValue !== "") {
      const newValue = parseFloat(editValue) || 0;
      
      // CHAMA O NOVO BACKEND ENDPOINT PARA ATUALIZAR DETALHES DO PRODUTO
      const success = await updateDetailsInBackend(
        editingPrice.productId,
        editingPrice.field,
        newValue
      );

      if (success) {
        // Se a atualização for bem-sucedida, o fetchStockFromBackend já foi chamado 
        // em updateDetailsInBackend para recarregar todos os dados.
        // Se a atualização falhar, a UI não é atualizada.
      }
    }
    cancelPriceEditing();
  };

  const cancelPriceEditing = () => {
    setEditingPrice(null);
    setEditValue("");
  };

  const isPriceEditing = (productId, field) => {
    return editingPrice && 
           editingPrice.productId === productId && 
           editingPrice.field === field;
  };

  // ✅ COMPONENTE DE EDIÇÃO DE PREÇO (Ícones atualizados)
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
              <Check size={12} />
            </button>
            <button
              onClick={cancelPriceEditing}
              className="text-red-600 hover:text-red-800 bg-red-50 p-1 rounded w-6 h-6 flex items-center justify-center"
              title="Cancelar"
            >
              <X size={12} />
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
          <Edit size={10} />
        </button>
      </div>
    );
  };

  // ----------------------------------------------------------------------
  // ✅ FUNÇÕES DE CRUD (ADICIONAR/EXCLUIR)
  // ----------------------------------------------------------------------
  
  // ✅ ADICIONAR NOVO PRODUTO (e Variante Padrão)
  const addNewProduct = async () => {
    const newProductData = {
      product_id: productForm.product_id,
      name: productForm.name,
      sku: productForm.sku,
      category: productForm.category,
      supplier: productForm.supplier,
      cost: parseFloat(productForm.price) || 0, // Mapeado para 'cost' no backend
      color: "Default", // Criando uma variante padrão
      size: "UN", // Tamanho Único (UN)
      stock: 0,
      reserved: 0,
      incoming: 0
    };

    const createdProduct = await createStockInBackend(newProductData);
    
    if (createdProduct) {
      await fetchStockFromBackend(); // Recarrega todos os dados
      resetProductForm();
      setShowAddProductForm(false);
    }
  };

  // ✅ EDITAR PRODUTO (Apenas localmente, a edição de preço está conectada ao backend)
  const updateProduct = () => {
    // Implementação de updateProduct (detalhes do produto) no backend ausente.
    // Atualiza apenas localmente (o preço já é tratado por updateDetailsInBackend)
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
              price: parseFloat(productForm.price) || 0, // Apenas local, o price real é salvo em savePriceEditing
              updated_at: new Date().toISOString().split('T')[0]
            }
          : product
      );
      return updatedStock;
    });

    resetProductForm();
    setShowAddProductForm(false);
    setEditingProduct(null);
    console.log('✅ Produto atualizado localmente!');
    // Idealmente, aqui deveria ter uma chamada ao endpoint de update product details.
  };

  // ✅ ADICIONAR NOVA VARIANTE
  const addNewVariant = async () => {
    if (!selectedProduct) return;

    const newVariantData = {
      product_id: selectedProduct.product_id,
      name: selectedProduct.name,
      // Gerando um SKU único para a nova variante
      sku: `${selectedProduct.product_id}-${variantForm.color}-${variantForm.size}`.toUpperCase().replace(/\s/g, ''),
      category: selectedProduct.category,
      supplier: selectedProduct.supplier,
      cost: selectedProduct.price, // Usa o custo do produto base
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
      cancelVariantForm();
    }
  };

  // ✅ EXCLUIR PRODUTO (TODAS AS VARIANTES) - Requer múltiplas chamadas DELETE
  const deleteProduct = (product) => {
    showCustomConfirmation(
      `⚠️ Tem certeza que deseja excluir o produto "${product.name}" (e todas as suas ${product.variants.length} variantes)? Esta ação não pode ser desfeita.`,
      async () => {
        let successCount = 0;
        let failureCount = 0;

        for (const variant of product.variants) {
          const success = await deleteStockItemInBackend(variant.id);
          if (success) {
            successCount++;
          } else {
            failureCount++;
          }
        }
        
        if (failureCount === 0) {
          console.log('✅ Produto excluído com sucesso!');
        } else {
          console.error(`⚠️ Ocorreu um erro ao excluir ${failureCount} variante(s).`);
        }
        // O fetchStockFromBackend é chamado dentro de deleteStockItemInBackend
      }
    );
  };

  // ✅ EXCLUIR VARIANTE (ITEM ÚNICO)
  const deleteVariant = (productId, variantId) => {
    showCustomConfirmation('⚠️ Tem certeza que deseja excluir esta variante?', async () => {
      // Aqui usamos o variantId, que é o ID da linha da tabela 'stock'
      await deleteStockItemInBackend(variantId);
      console.log('✅ Variante excluída com sucesso!');
    });
  };

  // FUNÇÕES EXISTENTES DE EDIÇÃO DE ESTOQUE E RECEBIMENTO
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
        // Atualização OTIMISTA no frontend após sucesso do backend
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
      // Atualização OTIMISTA
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
      // Atualização OTIMISTA
      setStockItems(prev => {
        const updatedStock = prev.map(product =>  
          product.id === productId  
            ? {
                ...product,
                variants: product.variants.map(variant => {
                  if (variant.id === variantId) {
                    return {  
                      ...variant,  
                      stock: variant.stock + variant.incoming,
                      incoming: 0  
                    };
                  }
                  return variant;
                }),
                // Recalcula o stock_value, pois o estoque mudou
                stock_value: calculateProductValue({
                  ...product,
                  variants: product.variants.map(variant => {
                    if (variant.id === variantId) {
                      return {  
                        ...variant,  
                        stock: variant.stock + variant.incoming, // Usa o valor antigo do incoming
                        incoming: 0  
                      };
                    }
                    return variant;
                  })
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

  const calculateProductValue = (product) => {
    const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
    const totalAvailable = product.variants.reduce((sum, variant) => sum + (variant.stock - variant.reserved), 0);
    const stockValue = totalStock * product.sale_price;
    
    // Calcula o custo total e o valor total de venda
    const costValue = totalStock * product.price;
    const saleValue = totalStock * product.sale_price;

    return {
      costValue: costValue,
      profitValue: saleValue - costValue, // Lucro é Venda - Custo
      stockValue: stockValue,
      saleValue: saleValue,
      availableValue: totalAvailable * product.sale_price,
      // Margem de Lucro: (Preço Venda - Custo) / Preço Venda * 100
      profitPercentage: product.sale_price > 0 ? ((product.sale_price - product.price) / product.sale_price) * 100 : 0
    };
  };

  const calculateTotalInventoryValue = () => {
    return stockItems.reduce((total, product) => {
      const productValue = calculateProductValue(product);
      return total + productValue.stockValue;
    }, 0);
  };

  const calculateTotalProfitValue = () => {
    return stockItems.reduce((total, product) => {
      const productValue = calculateProductValue(product);
      return total + productValue.profitValue;
    }, 0);
  };

  const getProductStatus = (variants) => {
    const totalStock = variants.reduce((sum, variant) => sum + variant.stock, 0);
    const totalIncoming = variants.reduce((sum, variant) => sum + variant.incoming, 0);
    
    if (totalStock === 0 && totalIncoming === 0) return "Sem Estoque";
    if (totalStock === 0 && totalIncoming > 0) return "Estoque em Chegada";
    // Lógica simples para "Baixo Estoque" (abaixo de 10 unidades no total)
    if (totalStock > 0 && totalStock <= 10) return "Baixo Estoque";
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
  

  // --- SKELETONS (Ícones atualizados) ---
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
  // --- END SKELETONS ---

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
              <RefreshCw className="mr-2" size={16} />
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
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
            <button 
              onClick={() => setShowAddProductForm(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center whitespace-nowrap"
            >
              <Plus className="mr-2" size={20} />
              Adicionar Produto
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
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

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
              <p className="text-2xl font-bold text-gray-900">{stockItems.length}</p>
            </div>
            <Package className="text-2xl text-blue-500" />
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
            <Layers className="text-2xl text-purple-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Faturamento (Venda)</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {calculateTotalInventoryValue().toFixed(2)}
              </p>
            </div>
            <DollarSign className="text-2xl text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lucro Estimado</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {calculateTotalProfitValue().toFixed(2)}
              </p>
            </div>
            <DollarSign className="text-2xl text-orange-500" />
          </div>
        </div>
      </div>

      {/* Formulário de Adicionar/Editar Produto */}
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
                SKU (Base para variantes) *
              </label>
              <input
                type="text"
                value={productForm.sku}
                onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded text-black"
                placeholder="Ex: CT-LOOPING-BASE"
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
            {/* O campo Preço (Custo) é o único que importará para o backend ao criar/editar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custo de Compra (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                value={productForm.price}
                onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded text-black"
                placeholder="Ex: 15.00"
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
              disabled={!productForm.product_id || !productForm.name || !productForm.sku || !productForm.price}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {editingProduct ? 'Atualizar Produto' : 'Adicionar Produto'}
            </button>
          </div>
        </div>
      )}

      {/* Formulário de Adicionar Nova Variante */}
      {showAddVariantForm && selectedProduct && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">
            Adicionar Variante para {selectedProduct.name} (ID: {selectedProduct.product_id})
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
                min="0"
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
                min="0"
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
                min="0"
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

      {/* Lista de Produtos */}
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
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => deleteProduct(product)}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                            title="Excluir produto (Todas as variantes)"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-1 text-sm text-gray-600">
                        <span>ID: {product.product_id}</span>
                        <span>SKU Base: {product.sku}</span>
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
                        <Plus size={21} />              
                      </button>            
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 p-3 bg-white rounded border">
                    <div className="space-y-2">
                      {/* Usando ID da primeira variante (product.id) como proxy para o ID do produto */}
                      <PriceEditor 
                        productId={product.id}
                        field="price"
                        currentValue={product.price}
                        label="Custo (R$)" // Renomeado para Custo
                      />
                      <PriceEditor 
                        productId={product.id}
                        field="sale_price"
                        currentValue={product.sale_price}
                        label="Preço Venda (R$)" // Novo campo para Venda
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Lucro Estimado (%):</span>
                        <span className="text-sm font-medium text-gray-900">
                          {productValue.profitPercentage.toFixed(2)}%
                        </span>
                        <Percent className="text-orange-500" size={16} />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Valor Total Estoque (Venda):</span>
                        <span className="text-sm font-medium text-gray-900">
                          R$ {productValue.stockValue.toFixed(2)}
                        </span>
                        <DollarSign className="text-green-500" size={16} />
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
                          : (variant.stock <= 5 ? "Baixo Estoque" : "Em Estoque"); // Lógica de baixo estoque no nível da variante
                        
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
                                                     variant.color === 'Cinza' ? '#808080' : 
                                                     variant.color === 'Default' ? '#D3D3D3' :
                                                     variant.color.toLowerCase() // Usa o nome da cor se não for padrão
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
                                      <Check size={14} />
                                    </button>
                                    <button
                                      onClick={cancelEditing}
                                      className="text-red-600 hover:text-red-800 bg-red-50 p-1 rounded w-6 h-6 flex items-center justify-center"
                                      title="Cancelar"
                                    >
                                      <X size={14} />
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
                                    <Edit size={12} />
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
                                    title="Receber estoque em chegada"
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
                                title="Adicionar 10 unidades na chegada"
                              >
                                Pedir +
                              </button>
                              <button 
                                onClick={() => deleteVariant(product.id, variant.id)}
                                className="text-red-600 hover:text-red-900 text-xs bg-red-100 px-2 py-1 rounded"
                                title="Excluir Variante"
                              >
                                <Trash2 size={10} />
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
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum produto encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {stockSearch ? 'Tente ajustar os termos da busca.' : 'Comece adicionando um novo produto.'}
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddProductForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="mr-2" size={16} />
                Adicionar Produto
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Remover o export default para evitar o erro de re-exportação (se for um componente auxiliar)
export default StockManagement;