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

  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);

  const getCsrfToken = async () => {
    try {
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      if (!csrfToken) throw new Error("CSRF token not found");
      return decodeURIComponent(csrfToken);
    } catch (error) {
      console.error("Error getting CSRF token:", error);
      throw error;
    }
  };

  const fetchStockFromBackend = async () => {
    if (isFetchingRef.current) return;

    setLoading(true);
    setError(null);
    isFetchingRef.current = true;

    try {
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

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      if (result.success && result.data) {
        const transformedStock = transformBackendDataToStock(result.data);
        setStockItems(transformedStock);
        setLastSaved(new Date().toLocaleString('pt-BR'));
      } else {
        throw new Error(result.message || 'Failed to fetch stock data');
      }
    } catch (error) {
      console.error("Error fetching stock:", error);
      setError(error.message);
      setStockItems([]);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  const transformBackendDataToStock = (backendData) => {
    if (!backendData || !Array.isArray(backendData)) return [];

    return backendData.map((item) => {
      const productId = item.id || Date.now();
      const variants = item.variants || [];
      const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
      const totalValue = parseFloat(item.stock_value) || (totalStock * (parseFloat(item.sale_price) || 0));

      return {
        id: productId,
        product_id: item.product_id || `PROD-${String(productId).padStart(3, '0')}`,
        name: item.name || `Produto ${productId}`,
        sku: item.variants?.[0]?.sku || `SKU-${String(productId).padStart(3, '0')}`,
        category: item.category || "Roupas",
        supplier: item.supplier || "Fornecedor Padrão",
        price: parseFloat(item.cost) || 0,
        profit: parseFloat(item.profit) || 0,
        profit_margin: parseFloat(item.profit_margin) || 0.60,
        sale_markup: parseFloat(item.sale_markup) || 1.80,
        stock_value: totalValue,
        sale_price: parseFloat(item.sale_price) || 0,
        last_updated: item.last_updated || new Date().toISOString().split('T')[0],
        created_at: item.created_at || new Date().toISOString().split('T')[0],
        updated_at: item.updated_at || new Date().toISOString().split('T')[0],
        variants: variants.map((v) => ({
          id: v.id || Date.now() + Math.random(),
          color: v.color || "Default",
          size: v.size || "UN",
          stock: v.stock || 0,
          reserved: v.reserved || 0,
          incoming: v.incoming || 0,
          available: (v.stock || 0) - (v.reserved || 0)
        }))
      };
    });
  };

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchStockFromBackend();
    }
  }, []);

  const confirmDelete = (message) => window.confirm(message);

  const calculateProductValue = (product) => {
    const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
    const totalAvailable = product.variants.reduce((sum, v) => sum + (v.stock - v.reserved), 0);
    const stockValue = totalStock * product.sale_price;

    return {
      priceValue: totalStock * product.price,
      profitValue: totalStock * product.profit,
      stockValue,
      saleValue: totalStock * product.sale_price,
      availableValue: totalAvailable * product.sale_price,
    };
  };

  const calculateTotalInventoryValue = () => 
    stockItems.reduce((total, p) => total + calculateProductValue(p).stockValue, 0);

  const calculateTotalProfitValue = () => 
    stockItems.reduce((total, p) => total + calculateProductValue(p).profitValue, 0);

  const startPriceEditing = (productId, field, currentValue) => {
    setEditingPrice({ productId, field, currentValue });
    setEditValue(currentValue.toString());
  };

  const savePriceEditing = async () => {
    if (!editingPrice || editValue === "") return;

    const newValue = parseFloat(editValue) || 0;
    const product = stockItems.find(p => p.id === editingPrice.productId);

    // Atualiza no backend (exemplo: rota PUT /api/infos/stock/product/{id})
    try {
      const csrfToken = await getCsrfToken();
      await fetch(`http://localhost:8000/api/infos/stock/product/${editingPrice.productId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify({ [editingPrice.field]: newValue })
      });
    } catch (e) {
      alert("Erro ao salvar preço no servidor");
    }

    setStockItems(prev => prev.map(p => 
      p.id === editingPrice.productId
        ? { ...p, [editingPrice.field]: newValue, updated_at: new Date().toISOString().split('T')[0] }
        : p
    ));

    setEditingPrice(null);
    setEditValue("");
  };

  const cancelPriceEditing = () => {
    setEditingPrice(null);
    setEditValue("");
  };

  const PriceEditor = ({ productId, field, currentValue, label }) => {
    const isEditing = editingPrice?.productId === productId && editingPrice?.field === field;

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
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') savePriceEditing();
              if (e.key === 'Escape') cancelPriceEditing();
            }}
          />
          <button onClick={savePriceEditing} className="text-green-600 hover:text-green-800">
            <FiCheck size={14} />
          </button>
          <button onClick={cancelPriceEditing} className="text-red-600 hover:text-red-800">
            <FiX size={14} />
          </button>
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
          className="text-blue-600 hover:text-blue-800"
        >
          <FiEdit size={12} />
        </button>
      </div>
    );
  };

  const updateStockInBackend = async (variantId, newStock) => {
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`http://localhost:8000/api/infos/stock/${variantId}/update`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify({ stock: newStock })
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const addIncomingToBackend = async (variantId, quantity) => {
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`http://localhost:8000/api/infos/stock/${variantId}/add-incoming`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify({ quantity })
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const receiveIncomingFromBackend = async (variantId) => {
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`http://localhost:8000/api/infos/stock/${variantId}/receive-incoming`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
        }
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const createStockInBackend = async (data) => {
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`http://localhost:8000/api/infos/stock/samples`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Create failed");
      const json = await res.json();
      return json.data;
    } catch {
      return null;
    }
  };

  const addNewProduct = async () => {
    const data = {
      product_id: productForm.product_id,
      name: productForm.name,
      sku: productForm.sku,
      category: productForm.category,
      supplier: productForm.supplier,
      cost: parseFloat(productForm.price) || 0,
      profit: parseFloat(productForm.profit) || 0,
      sale_price: parseFloat(productForm.sale_price) || 0,
      color: "Default",
      size: "UN",
      stock: 0,
      reserved: 0,
      incoming: 0
    };

    const created = await createStockInBackend(data);
    if (created) {
      await fetchStockFromBackend();
      setShowAddProductForm(false);
      setProductForm({
        product_id: "", name: "", sku: "", category: "", supplier: "",
        price: "", profit: "", stock_value: "", sale_price: ""
      });
    }
  };

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

  const updateProduct = async () => {
    // Implementar atualização no backend se necessário
    setStockItems(prev => prev.map(p => 
      p.id === editingProduct.id
        ? {
            ...p,
            product_id: productForm.product_id,
            name: productForm.name,
            sku: productForm.sku,
            category: productForm.category,
            supplier: productForm.supplier,
            price: parseFloat(productForm.price) || 0,
            profit: parseFloat(productForm.profit) || 0,
            sale_price: parseFloat(productForm.sale_price) || 0,
            updated_at: new Date().toISOString().split('T')[0]
          }
        : p
    ));
    setShowAddProductForm(false);
    setEditingProduct(null);
    setProductForm({
      product_id: "", name: "", sku: "", category: "", supplier: "",
      price: "", profit: "", stock_value: "", sale_price: ""
    });
  };

  const deleteProduct = (productId) => {
    if (confirmDelete('Tem certeza que deseja excluir este produto?')) {
      setStockItems(prev => prev.filter(p => p.id !== productId));
    }
  };

  const addNewVariant = async () => {
    if (!selectedProduct) return;

    const data = {
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

    const created = await createStockInBackend(data);
    if (created) {
      await fetchStockFromBackend();
      setShowAddVariantForm(false);
      setVariantForm({ color: "", size: "", stock: "", reserved: "", incoming: "" });
    }
  };

  const deleteVariant = (productId, variantId) => {
    if (confirmDelete('Tem certeza que deseja excluir esta variante?')) {
      setStockItems(prev => prev.map(p => 
        p.id === productId
          ? { ...p, variants: p.variants.filter(v => v.id !== variantId) }
          : p
      ));
    }
  };

  const startEditing = (productId, variantId, currentStock) => {
    setEditingVariant({ productId, variantId });
    setEditValue(currentStock.toString());
  };

  const saveEditing = async () => {
    if (!editingVariant || editValue === "") return;

    const newStock = Math.max(0, parseInt(editValue) || 0);
    const success = await updateStockInBackend(editingVariant.variantId, newStock);

    if (success) {
      setStockItems(prev => prev.map(p => 
        p.id === editingVariant.productId
          ? {
              ...p,
              variants: p.variants.map(v => 
                v.id === editingVariant.variantId ? { ...v, stock: newStock } : v
              ),
              updated_at: new Date().toISOString().split('T')[0]
            }
          : p
      ));
    }
    setEditingVariant(null);
    setEditValue("");
  };

  const cancelEditing = () => {
    setEditingVariant(null);
    setEditValue("");
  };

  const addIncomingStock = async (productId, variantId, quantity) => {
    const success = await addIncomingToBackend(variantId, quantity);
    if (success) {
      setStockItems(prev => prev.map(p => 
        p.id === productId
          ? {
              ...p,
              variants: p.variants.map(v => 
                v.id === variantId ? { ...v, incoming: v.incoming + quantity } : v
              )
            }
          : p
      ));
    }
  };

  const receiveIncomingStock = async (productId, variantId) => {
    const success = await receiveIncomingFromBackend(variantId);
    if (success) {
      setStockItems(prev => prev.map(p => 
        p.id === productId
          ? {
              ...p,
              variants: p.variants.map(v => 
                v.id === variantId
                  ? { ...v, stock: v.stock + v.incoming, incoming: 0 }
                  : v
              ),
              updated_at: new Date().toISOString().split('T')[0]
            }
          : p
      ));
    }
  };

  const getProductStatus = (variants) => {
    const totalStock = variants.reduce((s, v) => s + v.stock, 0);
    const totalIncoming = variants.reduce((s, v) => s + v.incoming, 0);
    if (totalStock === 0 && totalIncoming === 0) return "Sem Estoque";
    if (totalStock === 0) return "Estoque em Chegada";
    return "Em Estoque";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Em Estoque": return "bg-green-100 text-green-800 border border-green-200";
      case "Estoque em Chegada": return "bg-blue-100 text-blue-800 border border-blue-200";
      default: return "bg-red-100 text-red-800 border border-red-200";
    }
  };

  const calculateProductTotals = (variants) => ({
    totalStock: variants.reduce((s, v) => s + v.stock, 0),
    totalReserved: variants.reduce((s, v) => s + v.reserved, 0),
    totalIncoming: variants.reduce((s, v) => s + v.incoming, 0),
    availableStock: variants.reduce((s, v) => s + (v.stock - v.reserved), 0)
  });

  const filteredStockItems = stockItems.filter(item =>
    [item.name, item.product_id, item.sku, item.category].some(field =>
      field?.toLowerCase().includes(stockSearch.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="mt-8 space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Estoque</h2>
          {lastSaved && <p className="text-sm text-gray-500">Última atualização: {lastSaved}</p>}
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={fetchStockFromBackend} className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2">
            <FiRefreshCw /> Atualizar
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar..."
              value={stockSearch}
              onChange={e => setStockSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded w-64"
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <button onClick={() => setShowAddProductForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
            <FiPlus /> Novo Produto
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800">
          Erro: {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Produtos</p>
              <p className="text-2xl font-bold">{stockItems.length}</p>
            </div>
            <FiPackage className="text-3xl text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Variantes</p>
              <p className="text-2xl font-bold">
                {stockItems.reduce((s, p) => s + p.variants.length, 0)}
              </p>
            </div>
            <FiLayers className="text-3xl text-purple-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Faturamento</p>
              <p className="text-2xl font-bold">
                R$ {calculateTotalInventoryValue().toFixed(2)}
              </p>
            </div>
            <FiDollarSign className="text-3xl text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Lucro Total</p>
              <p className="text-2xl font-bold">
                R$ {calculateTotalProfitValue().toFixed(2)}
              </p>
            </div>
            <FiDollarSign className="text-3xl text-orange-500" />
          </div>
        </div>
      </div>

      {showAddProductForm && (
        <div className="bg-white p-6 rounded shadow border">
          <h3 className="text-lg font-bold mb-4">
            {editingProduct ? "Editar" : "Novo"} Produto
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["product_id", "name", "sku", "category", "supplier", "price", "profit", "sale_price"].map(field => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 capitalize">
                  {field.replace("_", " ")}
                </label>
                <input
                  type={field.includes("price") || field.includes("profit") ? "number" : "text"}
                  step="0.01"
                  value={productForm[field]}
                  onChange={e => setProductForm({ ...productForm, [field]: e.target.value })}
                  className="mt-1 w-full p-2 border rounded"
                  placeholder={field}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => { setShowAddProductForm(false); setEditingProduct(null); }} className="px-4 py-2 border rounded">
              Cancelar
            </button>
            <button
              onClick={editingProduct ? updateProduct : addNewProduct}
              className="px-6 py-2 bg-blue-600 text-white rounded"
            >
              {editingProduct ? "Salvar" : "Criar"}
            </button>
          </div>
        </div>
      )}

      {showAddVariantForm && selectedProduct && (
        <div className="bg-white p-6 rounded shadow border">
          <h3 className="text-lg font-bold mb-4">Nova Variante - {selectedProduct.name}</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.keys(variantForm).map(key => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 capitalize">{key}</label>
                <input
                  type="text"
                  value={variantForm[key]}
                  onChange={e => setVariantForm({ ...variantForm, [key]: e.target.value })}
                  className="mt-1 w-full p-2 border rounded"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setShowAddVariantForm(false)} className="px-4 py-2 border rounded">
              Cancelar
            </button>
            <button onClick={addNewVariant} className="px-6 py-2 bg-green-600 text-white rounded">
              Adicionar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {filteredStockItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded border">
            <FiPackage className="mx-auto text-6xl text-gray-300" />
            <p className="mt-4 text-lg text-gray-600">
              {stockSearch ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
            </p>
          </div>
        ) : (
          filteredStockItems.map(product => {
            const totals = calculateProductTotals(product.variants);
            const status = getProductStatus(product.variants);

            return (
              <div key={product.id} className="bg-white rounded-lg shadow border overflow-hidden">
                <div className="bg-gray-50 p-4 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold">{product.name}</h3>
                        <div className="flex gap-2">
                          <button onClick={() => editProduct(product)} className="text-blue-600">
                            <FiEdit />
                          </button>
                          <button onClick={() => deleteProduct(product.id)} className="text-red-600">
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {product.product_id} • {product.category} • {product.supplier}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded text-sm ${getStatusColor(status)}`}>
                        {status}
                      </span>
                      <button
                        onClick={() => { setSelectedProduct(product); setShowAddVariantForm(true); }}
                        className="bg-green-600 text-white p-2 rounded"
                      >
                        <FiPlus />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <PriceEditor productId={product.id} field="price" currentValue={product.price} label="Custo" />
                    <PriceEditor productId={product.id} field="profit" currentValue={product.profit} label="Lucro" />
                    <PriceEditor productId={product.id} field="sale_price" currentValue={product.sale_price} label="Venda" />
                    <div className="text-sm">
                      <span className="text-gray-600">Faturamento:</span>
                      <span className="font-bold ml-2">
                        R$ {calculateProductValue(product).stockValue.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mt-4 text-center text-sm">
                    <div><strong>{totals.totalStock}</strong><br/>Total</div>
                    <div><strong>{totals.totalReserved}</strong><br/>Reservado</div>
                    <div><strong>{totals.availableStock}</strong><br/>Disponível</div>
                    <div><strong>{totals.totalIncoming}</strong><br/>Chegada</div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Cor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Tamanho</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Estoque</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Reservado</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Disponível</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Chegada</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {product.variants.map(variant => {
                        const available = variant.stock - variant.reserved;
                        const isEditing = editingVariant?.productId === product.id && editingVariant?.variantId === variant.id;

                        return (
                          <tr key={variant.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded border" style={{ backgroundColor: variant.color.toLowerCase() }} />
                                {variant.color}
                              </div>
                            </td>
                            <td className="px-4 py-3">{variant.size}</td>
                            <td className="px-4 py-3">
                              {isEditing ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={editValue}
                                    onChange={e => setEditValue(e.target.value)}
                                    className="w-16 px-2 py-1 border rounded"
                                    onKeyDown={e => e.key === 'Enter' && saveEditing()}
                                  />
                                  <button onClick={saveEditing}><FiCheck className="text-green-600" /></button>
                                  <button onClick={cancelEditing}><FiX className="text-red-600" /></button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span>{variant.stock}</span>
                                  <button onClick={() => startEditing(product.id, variant.id, variant.stock)}>
                                    <FiEdit className="text-blue-600 text-sm" />
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">{variant.reserved}</td>
                            <td className="px-4 py-3 text-center font-medium" style={{ color: available <= 0 ? 'red' : 'green' }}>
                              {available}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {variant.incoming}
                                {variant.incoming > 0 && (
                                  <button onClick={() => receiveIncomingStock(product.id, variant.id)} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                    Receber
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right space-x-2">
                              <button onClick={() => addIncomingStock(product.id, variant.id, 10)} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                +10
                              </button>
                              <button onClick={() => deleteVariant(product.id, variant.id)} className="text-red-600">
                                <FiTrash2 size={14} />
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
        )}
      </div>
    </div>
  );
};

export default StockManagement;