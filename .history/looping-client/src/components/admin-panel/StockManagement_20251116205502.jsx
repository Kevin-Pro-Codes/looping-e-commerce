// src/components/admin/StockManagement.jsx
import React, { useState, useEffect } from "react";
import { 
  FiSearch, FiPlus, FiPackage, FiLayers, FiAlertCircle, FiEdit, FiCheck, FiX,
  FiSave, FiDownload, FiUpload, FiTrash2, FiDollarSign
} from "react-icons/fi";

const StockManagement = () => {
  const [stockSearch, setStockSearch] = useState("");
  const [editingField, setEditingField] = useState(null); // { productId, variantId, field, currentValue }
  const [editValue, setEditValue] = useState("");
  const [lastSaved, setLastSaved] = useState("");
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [showAddVariantForm, setShowAddVariantForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // ✅ Form states
  const [productForm, setProductForm] = useState({
    product_id: "",
    name: "",
    category: "",
    supplier: "",
  });

  const [variantForm, setVariantForm] = useState({
    color: "",
    size: "",
    stock: "",
    reserved: "",
    incoming: "",
  });

  // ✅ Dados iniciais vazios
  const [stockItems, setStockItems] = useState([]);

  // ✅ Carregar dados quando o componente montar
  useEffect(() => {
    setLastSaved(new Date().toLocaleString('pt-BR'));
  }, []);

  // ✅ EDIÇÃO DE QUALQUER CAMPO
  const startEditing = (productId, variantId, field, currentValue) => {
    setEditingField({ productId, variantId, field, currentValue });
    setEditValue(currentValue.toString());
  };

  const saveEditing = () => {
    if (editingField && editValue !== "") {
      if (editingField.variantId) {
        // Editar campo da variante
        updateVariantField(
          editingField.productId,
          editingField.variantId,
          editingField.field,
          editingField.field === 'stock' || editingField.field === 'reserved' || editingField.field === 'incoming' 
            ? parseInt(editValue) || 0 
            : editValue
        );
      } else {
        // Editar campo do produto
        updateProductField(
          editingField.productId,
          editingField.field,
          editValue
        );
      }
    }
    cancelEditing();
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValue("");
  };

  const updateProductField = (productId, field, newValue) => {
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

  const updateVariantField = (productId, variantId, field, newValue) => {
    setStockItems(prev => {
      const updatedStock = prev.map(product => 
        product.id === productId 
          ? {
              ...product,
              variants: product.variants.map(variant =>
                variant.id === variantId
                  ? { 
                      ...variant, 
                      [field]: field === 'stock' || field === 'reserved' || field === 'incoming' 
                        ? Math.max(0, newValue) 
                        : newValue 
                    }
                  : variant
              ),
              last_updated: new Date().toISOString().split('T')[0],
              updated_at: new Date().toISOString().split('T')[0]
            }
          : product
      );
      return updatedStock;
    });
  };

  const isEditing = (productId, variantId, field) => {
    return editingField && 
           editingField.productId === productId && 
           editingField.variantId === variantId &&
           editingField.field === field;
  };

  // ✅ COMPONENTE DE EDIÇÃO GENÉRICO
  const FieldEditor = ({ productId, variantId, field, currentValue, label, type = "text", className = "" }) => {
    const isEditingField = isEditing(productId, variantId, field);
    
    if (isEditingField) {
      return (
        <div className={`flex items-center space-x-2 ${className}`}>
          <input
            type={type}
            step={type === "number" ? "0.01" : undefined}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-20 p-1 border border-gray-300 rounded text-sm text-black text-center"
            min={type === "number" ? "0" : undefined}
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
              <FiCheck size={12} />
            </button>
            <button
              onClick={cancelEditing}
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
      <div className={`flex items-center space-x-2 ${className}`}>
        <span className={`text-sm font-medium ${type === "number" ? "text-gray-900" : "text-gray-900"}`}>
          {type === "number" && field !== 'stock' && field !== 'reserved' && field !== 'incoming' ? `R$ ${parseFloat(currentValue).toFixed(2)}` : currentValue}
        </span>
        <button
          onClick={() => startEditing(productId, variantId, field, currentValue)}
          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
          title={`Editar ${label.toLowerCase()}`}
        >
          <FiEdit size={10} />
        </button>
      </div>
    );
  };

  // ✅ CÁLCULOS DE VALOR
  const calculateProductValue = (product) => {
    const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
    const totalAvailable = product.variants.reduce((sum, variant) => sum + (variant.stock - variant.reserved), 0);
    
    return {
      stockValue: totalStock * (product.price || 0),
      saleValue: totalStock * (product.sale_price || 0),
      availableValue: totalAvailable * (product.sale_price || 0),
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

  // ✅ ADICIONAR NOVO PRODUTO
  const addNewProduct = () => {
    const newProduct = {
      id: Date.now(),
      product_id: productForm.product_id,
      name: productForm.name,
      category: productForm.category,
      supplier: productForm.supplier,
      price: 0,
      sale_price: 0,
      last_updated: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
      variants: []
    };

    setStockItems(prev => [...prev, newProduct]);
    resetProductForm();
    setShowAddProductForm(false);
  };

  // ✅ EDITAR PRODUTO
  const editProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      product_id: product.product_id,
      name: product.name,
      category: product.category,
      supplier: product.supplier,
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
              category: productForm.category,
              supplier: productForm.supplier,
              updated_at: new Date().toISOString().split('T')[0]
            }
          : product
      );
      return updatedStock;
    });

    resetProductForm();
    setShowAddProductForm(false);
    setEditingProduct(null);
  };

  // ✅ EXCLUIR PRODUTO
  const deleteProduct = (productId) => {
    if (window.confirm('⚠️ Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) {
      setStockItems(prev => prev.filter(product => product.id !== productId));
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
      return updatedStock;
    });

    resetVariantForm();
    setShowAddVariantForm(false);
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
    }
  };

  // ✅ RESET FORMULÁRIOS
  const resetProductForm = () => {
    setProductForm({
      product_id: "",
      name: "",
      category: "",
      supplier: "",
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

  // ✅ ADICIONAR ESTOQUE EM CHEGADA
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
      return updatedStock;
    });
  };

  // ✅ RECEBER ESTOQUE EM CHEGADA
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
      return updatedStock;
    });
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
          <h2 className="text-xl font-semibold">Gestão de Estoque</h2>
          {lastSaved && (
            <p className="text-sm text-gray-500 mt-1">
              Última atualização: {lastSaved}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="flex gap-2">
            <button 
              onClick={() => setLastSaved(new Date().toLocaleString('pt-BR'))}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center whitespace-nowrap text-sm"
            >
              <FiSave className="mr-2" />
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
              <p className="text-sm font-medium text-gray-600">Valor de Venda</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {calculateTotalSalesValue().toFixed(2)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              disabled={!productForm.product_id || !productForm.name}
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
                      <FieldEditor 
                        productId={product.id}
                        variantId={null}
                        field="name"
                        currentValue={product.name}
                        label="Nome"
                        className="text-lg font-semibold"
                      />
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
                      <FieldEditor 
                        productId={product.id}
                        variantId={null}
                        field="product_id"
                        currentValue={product.product_id}
                        label="ID"
                      />
                      <FieldEditor 
                        productId={product.id}
                        variantId={null}
                        field="category"
                        currentValue={product.category}
                        label="Categoria"
                      />
                      <FieldEditor 
                        productId={product.id}
                        variantId={null}
                        field="supplier"
                        currentValue={product.supplier}
                        label="Fornecedor"
                      />
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
                
                {/* Informações de Valor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 p-3 bg-white rounded border">
                  <div className="space-y-2">
                    <FieldEditor 
                      productId={product.id}
                      variantId={null}
                      field="price"
                      currentValue={product.price}
                      label="Preço"
                      type="number"
                    />
                    <FieldEditor 
                      productId={product.id}
                      variantId={null}
                      field="sale_price"
                      currentValue={product.sale_price}
                      label="Preço Promocional"
                      type="number"
                    />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valor em Estoque:</span>
                      <span className="font-medium">R$ {productValue.stockValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valor de Venda:</span>
                      <span className="font-medium">R$ {productValue.saleValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valor Disponível:</span>
                      <span className="font-medium">R$ {productValue.availableValue.toFixed(2)}</span>
                    </div>
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
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
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
                              <FieldEditor 
                                productId={product.id}
                                variantId={variant.id}
                                field="color"
                                currentValue={variant.color}
                                label="Cor"
                              />
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <FieldEditor 
                              productId={product.id}
                              variantId={variant.id}
                              field="size"
                              currentValue={variant.size}
                              label="Tamanho"
                            />
                          </td>
                          
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <FieldEditor 
                              productId={product.id}
                              variantId={variant.id}
                              field="stock"
                              currentValue={variant.stock}
                              label="Estoque"
                              type="number"
                            />
                          </td>
                          
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <FieldEditor 
                              productId={product.id}
                              variantId={variant.id}
                              field="reserved"
                              currentValue={variant.reserved}
                              label="Reservado"
                              type="number"
                            />
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                            <span className={available <= 0 ? "text-red-600" : "text-green-600"}>
                              {available}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <FieldEditor 
                                productId={product.id}
                                variantId={variant.id}
                                field="incoming"
                                currentValue={variant.incoming}
                                label="Em Chegada"
                                type="number"
                              />
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