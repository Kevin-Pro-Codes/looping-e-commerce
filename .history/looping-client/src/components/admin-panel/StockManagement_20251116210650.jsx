// src/components/admin/StockManagement.jsx
import React, { useState, useEffect } from "react";
import { 
  FiSearch, FiPlus, FiPackage, FiLayers, FiAlertCircle, FiEdit, FiCheck, FiX,
  FiSave, FiDownload, FiUpload, FiTrash2, FiDollarSign, FiPercent
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
  const [editingPrice, setEditingPrice] = useState(null); // { productId, field, currentValue }

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
    
    // Dados padrão com preços
    return [
      {
        id: 1,
        product_id: "PROD-001",
        name: "Camiseta Looping Branca",
        sku: "CT-LOOPING-WHITE",
        category: "Roupas",
        supplier: "Fabricante A",
        price: 60.00,
        profit: 45.00,
        stock_value: 600.00,
        sale_price: 60.90,
        last_updated: "2024-01-15",
        created_at: "2024-01-01",
        updated_at: "2024-01-15",
        variants: [
          { id: 1, color: "Branco", size: "P", stock: 10, reserved: 2, incoming: 5 },
          { id: 2, color: "Branco", size: "M", stock: 15, reserved: 3, incoming: 0 },
          { id: 3, color: "Branco", size: "G", stock: 8, reserved: 1, incoming: 10 },
          { id: 4, color: "Branco", size: "GG", stock: 5, reserved: 0, incoming: 0 }
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
        profit: 45.00,
        stock_value: 300.00,
        sale_price: 60.90,
        last_updated: "2024-01-15",
        created_at: "2024-01-01",
        updated_at: "2024-01-15",
        variants: [
          { id: 5, color: "Preto", size: "P", stock: 0, reserved: 0, incoming: 20 },
          { id: 6, color: "Preto", size: "M", stock: 3, reserved: 2, incoming: 0 },
          { id: 7, color: "Preto", size: "G", stock: 7, reserved: 1, incoming: 0 },
          { id: 8, color: "Preto", size: "GG", stock: 2, reserved: 0, incoming: 0 }
        ]
      },
    ];
  };

  const [stockItems, setStockItems] = useState([]);

  // ✅ Carregar dados quando o componente montar
  useEffect(() => {
    const loadedStock = loadStockFromStorage();
    setStockItems(loadedStock);
    
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
        totalVariants: stockItems.reduce((sum, item) => sum + item.variants.length, 0),
        totalValue: calculateTotalInventoryValue()
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
    
    event.target.value = '';
  };

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
      saveStockToStorage(updatedStock);
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

  // ✅ ADICIONAR NOVO PRODUTO
  const addNewProduct = () => {
    const newProduct = {
      id: Date.now(),
      product_id: productForm.product_id,
      name: productForm.name,
      sku: productForm.sku,
      category: productForm.category,
      supplier: productForm.supplier,
      price: parseFloat(productForm.price) || 0,
      profit: parseFloat(productForm.profit) || 0,
      stock_value: parseFloat(productForm.stock_value) || 0,
      sale_price: parseFloat(productForm.sale_price) || 0,
      last_updated: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
      variants: []
    };

    setStockItems(prev => {
      const updatedStock = [...prev, newProduct];
      saveStockToStorage(updatedStock);
      return updatedStock;
    });

    resetProductForm();
    setShowAddProductForm(false);
    alert('✅ Produto adicionado com sucesso!');
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
      saveStockToStorage(updatedStock);
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
        saveStockToStorage(updatedStock);
        return updatedStock;
      });
      alert('✅ Produto excluído com sucesso!');
    }
  };

  // ✅ ADICIONAR NOVA VARIANTE
  const addNewVariant = () => {
    if (!selectedProduct) return;

    const newVariant = {
      id: Date.now(),
      color: variantForm.color,
      size: variantForm.size,
      stock: parseInt(variantForm.stock) || 0,
      reserved: parseInt(variantForm.reserved) || 0,
      incoming: parseInt(variantForm.incoming) || 0,
    };

    setStockItems(prev => {
      const updatedStock = prev.map(product => 
        product.id === selectedProduct.id
          ? {
              ...product,
              variants: [...product.variants, newVariant],
              updated_at: new Date().toISOString().split('T')[0]
            }
          : product
      );
      saveStockToStorage(updatedStock);
      return updatedStock;
    });

    resetVariantForm();
    setShowAddVariantForm(false);
    alert('✅ Variante adicionada com sucesso!');
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
        saveStockToStorage(updatedStock);
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

  const saveEditing = () => {
    if (editingVariant && editValue !== "") {
      updateVariantStock(
        editingVariant.productId, 
        editingVariant.variantId, 
        parseInt(editValue) || 0,
        true
      );
    }
    cancelEditing();
  };

  const cancelEditing = () => {
    setEditingVariant(null);
    setEditValue("");
  };

  const updateVariantStock = (productId, variantId, newStock, autoSave = true) => {
    setStockItems(prev => {
      const updatedStock = prev.map(product => 
        product.id === productId 
          ? {
              ...product,
              variants: product.variants.map(variant =>
                variant.id === variantId
                  ? { ...variant, stock: Math.max(0, parseInt(newStock) || 0) }
                  : variant
              ),
              last_updated: new Date().toISOString().split('T')[0],
              updated_at: new Date().toISOString().split('T')[0]
            }
          : product
      );
      
      if (autoSave) {
        setTimeout(() => saveStockToStorage(updatedStock), 100);
      }
      
      return updatedStock;
    });
  };

  const addIncomingStock = (productId, variantId, quantity) => {
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
      
      saveStockToStorage(updatedStock);
      return updatedStock;
    });
  };

  const receiveIncomingStock = (productId, variantId) => {
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
              last_updated: new Date().toISOString().split('T')[0],
              updated_at: new Date().toISOString().split('T')[0]
            }
          : product
      );
      
      saveStockToStorage(updatedStock);
      return updatedStock;
    });
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
    item.sku.toLowerCase().includes(stockSearch.toLowerCase()) ||
    item.category.toLowerCase().includes(stockSearch.toLowerCase())
  );

  const getLowStockItems = () => {
    return stockItems.flatMap(product => 
      product.variants
        .filter(variant => variant.stock > 0 && variant.stock <= 5)
        .map(variant => ({ ...variant, product }))
    );
  };

  const getOutOfStockItems = () => {
    return stockItems.flatMap(product => 
      product.variants
        .filter(variant => variant.stock === 0)
        .map(variant => ({ ...variant, product }))
    );
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
      {/* Cabeçalho com botões */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Gestão de Estoque Completo</h2>
          {lastSaved && (
            <p className="text-sm text-gray-500 mt-1">
              Último salvamento: {lastSaved}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
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
                value={productForm.stock_value}
                onChange={(e) => setProductForm({...productForm, stock_value: e.target.value})}
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

      {/* Formulário de Adicionar Variante */}
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

      {/* Lista de produtos */}
      <div className="space-y-6">
        {filteredStockItems.map((product) => {
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
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                      {status}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowAddVariantForm(true);
                      }}
                      className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center"
                    >
                      <FiPlus size={12} className="mr-1" />
                      Add Variante
                    </button>
                  </div>
                </div>
                
                {/* Informações de Preço - APENAS OS 4 CAMPOS SOLICITADOS */}
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
                        : (variant.stock <= 5 ? "Baixo Estoque" : "Em Estoque");
                      
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
                                    className="text-green-600 hover:text-green-800 bg-green-50 p-1 rounded"
                                    title="Confirmar"
                                  >
                                    <FiCheck size={14} />
                                  </button>
                                  <button
                                    onClick={cancelEditing}
                                    className="text-red-600 hover:text-red-800 bg-red-50 p-1 rounded"
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
                <div key={`${variant.product.id}-${variant.color}-${variant.size}`} 
                     className="flex justify-between items-center p-3 bg-yellow-100 rounded">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-yellow-800 block truncate">{variant.product.name}</span>
                    <div className="text-sm text-yellow-600">
                      {variant.color} - {variant.size} | Estoque: {variant.stock} | Reservado: {variant.reserved}
                    </div>
                  </div>
                  <button 
                    onClick={() => addIncomingStock(variant.product.id, variant.id, 20)}
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
                <div key={`${variant.product.id}-${variant.color}-${variant.size}`} 
                     className="flex justify-between items-center p-3 bg-red-100 rounded">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-red-800 block truncate">{variant.product.name}</span>
                    <div className="text-sm text-red-600">
                      {variant.color} - {variant.size} | Em Chegada: {variant.incoming} unidades
                    </div>
                  </div>
                  <button 
                    onClick={() => addIncomingStock(variant.product.id, variant.id, 50)}
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