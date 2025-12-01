// src/components/admin/StockManagement.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  FiSearch, FiPlus, FiPackage, FiLayers, FiAlertCircle, FiEdit, FiCheck, FiX,
  FiSave, FiDownload, FiUpload, FiTrash2, FiDollarSign, FiPercent, FiRefreshCw,
  FiEye, FiInfo, FiRotateCcw
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
  const [viewingProduct, setViewingProduct] = useState(null);
  const [orderingVariant, setOrderingVariant] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState("");
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

      if (result.success) {
        if (result.data && result.data.length > 0) {
          const transformedStock = transformBackendDataToStock(result.data);
          setStockItems(transformedStockDataToStock);
        } else {
          setStockItems([]);
        }
        setLastSaved(new Date().toLocaleString('pt-BR'));
      } else {
        throw new Error(result.message || 'Failed to fetch stock data');
      }
    } catch (error) {
      console.error("Error fetching stock from backend:", error);
      setError(error.message);
      setStockItems([]);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
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

  const confirmDelete = (message) => window.confirm(message);

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

  const calculateTotalProfitValue = () => {
    return stockItems.reduce((total, product) => {
      const productValue = calculateProductValue(product);
      return total + productValue.profitValue;
    }, 0);
  };

  const startPriceEditing = (productId, field, currentValue) => {
    setEditingPrice({ productId, field, currentValue });
    setEditValue(currentValue.toString());
  };

  const savePriceEditing = async () => {
    if (editingPrice && editValue !== "") {
      const newValue = parseFloat(editValue) || 0;
      try {
        const product = stockItems.find(p => p.product_id === editingPrice.productId);
        if (product) {
          const pricingData = {
            cost: editingPrice.field === 'price' ? newValue : product.cost,
            profit: editingPrice.field === 'profit' ? newValue : product.profit,
            sale_price: editingPrice.field === 'sale_price' ? newValue : product.sale_price,
          };
          const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
          pricingData.total_value = totalStock * pricingData.sale_price;

          const csrfToken = await getCsrfToken();
          const response = await fetch(`http://localhost:8000/api/infos/stock/product/${editingPrice.productId}/pricing`, {
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
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const result = await response.json();
          if (result.success) await fetchStockFromBackend();
        }
      } catch (error) {
        console.error("Error updating pricing:", error);
        alert(`Erro ao atualizar preços: ${error.message}`);
        await fetchStockFromBackend();
      }
    }
    cancelPriceEditing();
  };

  const cancelPriceEditing = () => {
    setEditingPrice(null);
    setEditValue("");
  };

  const isPriceEditing = (productId, field) => {
    return editingPrice && editingPrice.productId === productId && editingPrice.field === field;
  };

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
            onKeyDown={async (e) => {
              if (e.key === 'Enter') await savePriceEditing();
              if (e.key === 'Escape') cancelPriceEditing();
            }}
          />
          <div className="flex space-x-1">
            <button onClick={savePriceEditing} className="text-green-600 hover:text-green-800 bg-green-50 p-1 rounded w-6 h-6 flex items-center justify-center">
              <FiCheck size={12} />
            </button>
            <button onClick={cancelPriceEditing} className="text-red-600 hover:text-red-800 bg-red-50 p-1 rounded w-6 h-6 flex items-center justify-center">
              <FiX size={12} />
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">{label}:</span>
        <span className="text-sm font-medium text-gray-900">R$ {parseFloat(currentValue).toFixed(2)}</span>
        <button onClick={() => startPriceEditing(productId, field, currentValue)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 w-6 h-6 flex items-center justify-center">
          <FiEdit size={10} />
        </button>
      </div>
    );
  };

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
        body: JSON.stringify({ stock: newStock })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error("Error updating stock:", error);
      alert(`Erro ao atualizar estoque: ${error.message}`);
      return false;
    }
  };

  const updateReservedInBackend = async (variantId, newReserved) => {
    try {
      const csrfToken = await getCsrfToken();
      let currentStock = 0;
      let currentIncoming = 0;
      let variantFound = false;

      for (const product of stockItems) {
        const variant = product.variants.find(v => v.id === variantId);
        if (variant) {
          currentStock = variant.stock || 0;
          currentIncoming = variant.incoming || 0;
          variantFound = true;
          break;
        }
      }
      if (!variantFound) throw new Error('Variante não encontrada');

      const payload = { stock: currentStock, reserved: newReserved, incoming: currentIncoming };
      const response = await fetch(`http://localhost:8000/api/infos/stock/${variantId}/update`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error("Error updating reserved:", error);
      alert(`Erro ao atualizar estoque reservado: ${error.message}`);
      return false;
    }
  };

  const resetReservedStock = async (variantId, variantColor, variantSize) => {
    if (confirmDelete(`Tem certeza que deseja zerar o estoque reservado da variante ${variantColor} - ${variantSize}?`)) {
      setStockItems(prev => prev.map(product => ({
        ...product,
        variants: product.variants.map(v => v.id === variantId ? { ...v, reserved: 0, available: v.stock } : v)
      })));
      const success = await updateReservedInBackend(variantId, 0);
      if (success) {
        setTimeout(() => fetchStockFromBackend(), 500);
        alert('Estoque reservado zerado com sucesso!');
      } else {
        await fetchStockFromBackend();
        alert('Erro ao sincronizar com o servidor. Dados recarregados.');
      }
    }
  };

  const resetAvailableStock = async (variantId, variantColor, variantSize, currentStock, currentReserved) => {
    if (confirmDelete(`Tem certeza que deseja zerar o estoque disponível da variante ${variantColor} - ${variantSize}?`)) {
      const newStock = currentReserved;
      const success = await updateStockInBackend(variantId, newStock);
      if (success) {
        await fetchStockFromBackend();
        alert('Estoque disponível zerado com sucesso!');
      }
    }
  };

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
        body: JSON.stringify({ quantity })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error("Error adding incoming stock:", error);
      alert(`Erro ao adicionar estoque em chegada: ${error.message}`);
      return false;
    }
  };

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
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error("Error receiving incoming stock:", error);
      alert(`Erro ao receber estoque: ${error.message}`);
      return false;
    }
  };

  const createStockInBackend = async (stockData) => {
    try {
      const csrfToken = await getCsrfToken();
      const payload = {
        product_id: stockData.product_id,
        name: stockData.name,
        sku: stockData.sku,
        category: stockData.category,
        supplier: stockData.supplier,
        cost: parseFloat(stockData.cost) || 0,
        profit: parseFloat(stockData.profit) || 0,
        sale_price: parseFloat(stockData.sale_price) || 0,
        total_value: parseFloat(stockData.total_value) || 0,
        color: stockData.color || "Default",
        size: stockData.size || "UN",
        stock: parseInt(stockData.stock) || 0,
        reserved: parseInt(stockData.reserved) || 0,
        incoming: parseInt(stockData.incoming) || 0
      };
      const response = await fetch(`http://localhost:8000/api/infos/stock/samples`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error("Error creating stock item:", error);
      alert(`Erro ao criar item de estoque: ${error.message}`);
      return null;
    }
  };

  const addNewProduct = async () => {
    if (!productForm.product_id || !productForm.name || !productForm.sku) {
      alert('Preencha os campos obrigatórios: ID do Produto, Nome e SKU');
      return;
    }
    const newProductData = {
      product_id: productForm.product_id,
      name: productForm.name,
      sku: productForm.sku,
      category: productForm.category || "Roupas",
      supplier: productForm.supplier || "Fornecedor Padrão",
      cost: parseFloat(productForm.price) || 0,
      price: parseFloat(productForm.price) || 0,
      profit: parseFloat(productForm.profit) || 0,
      sale_price: parseFloat(productForm.sale_price) || 0,
      total_value: parseFloat(productForm.total_value) || 0,
      color: "Default",
      size: "UN",
      stock: 0,
      reserved: 0,
      incoming: 0
    };
    const created = await createStockInBackend(newProductData);
    if (created) {
      await fetchStockFromBackend();
      resetProductForm();
      setShowAddProductForm(false);
      alert('Produto adicionado com sucesso!');
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
      total_value: product.total_value.toString(),
      sale_price: product.sale_price.toString(),
    });
    setShowAddProductForm(true);
  };

  const updateProduct = async () => {
    if (!editingProduct) return;
    const pricingData = {
      cost: parseFloat(productForm.price) || 0,
      profit: parseFloat(productForm.profit) || 0,
      sale_price: parseFloat(productForm.sale_price) || 0,
      total_value: parseFloat(productForm.total_value) || 0
    };
    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch(`http://localhost:8000/api/infos/stock/product/${editingProduct.product_id}/pricing`, {
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
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success) {
        await fetchStockFromBackend();
        resetProductForm();
        setShowAddProductForm(false);
        setEditingProduct(null);
        alert('Produto atualizado com sucesso!');
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert(`Erro ao atualizar produto: ${error.message}`);
    }
  };

  const deleteProduct = async (productId, productName) => {
    if (confirmDelete(`Tem certeza que deseja excluir o produto "${productName}" e TODAS as suas variantes?`)) {
      try {
        const csrfToken = await getCsrfToken();
        const response = await fetch(`http://localhost:8000/api/infos/stock/product/${productId}`, {
          method: 'DELETE',
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
        if (result.success) {
          setStockItems(prev => prev.filter(p => p.product_id !== productId));
          alert('Produto e todas as variantes excluídos com sucesso!');
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        alert(`Erro ao excluir produto: ${error.message}`);
        await fetchStockFromBackend();
      }
    }
  };

  const addNewVariant = async () => {
    if (!selectedProduct) return;
    if (!variantForm.color || !variantForm.size) {
      alert('Preencha cor e tamanho da variante');
      return;
    }
    const newVariantData = {
      product_id: selectedProduct.product_id,
      name: selectedProduct.name,
      sku: `${selectedProduct.sku}-${variantForm.color}-${variantForm.size}`.toUpperCase(),
      category: selectedProduct.category,
      supplier: selectedProduct.supplier,
      cost: selectedProduct.price,
      profit: selectedProduct.profit,
      sale_price: selectedProduct.sale_price,
      color: variantForm.color,
      size: variantForm.size,
      stock: parseInt(variantForm.stock) || 0,
      reserved: parseInt(variantForm.reserved) || 0,
      incoming: parseInt(variantForm.incoming) || 0,
    };
    newVariantData.total_value = newVariantData.stock * newVariantData.sale_price;
    const created = await createStockInBackend(newVariantData);
    if (created) {
      await fetchStockFromBackend();
      resetVariantForm();
      setShowAddVariantForm(false);
      alert('Variante adicionada com sucesso!');
    }
  };

  const deleteVariant = async (productId, variantId, color, size) => {
    if (confirmDelete(`Tem certeza que deseja excluir a variante ${color} - ${size}?`)) {
      try {
        const csrfToken = await getCsrfToken();
        const response = await fetch(`http://localhost:8000/api/infos/stock/variant/${variantId}`, {
          method: 'DELETE',
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
        if (result.success) {
          setStockItems(prev => prev.map(p => p.id === productId ? { ...p, variants: p.variants.filter(v => v.id !== variantId) } : p));
          alert('Variante excluída com sucesso!');
        }
      } catch (error) {
        console.error("Error deleting variant:", error);
        alert(`Erro ao excluir variante: ${error.message}`);
        await fetchStockFromBackend();
      }
    }
  };

  const resetProductForm = () => setProductForm({ product_id: "", name: "", sku: "", category: "", supplier: "", price: "", profit: "", total_value: "", sale_price: "" });
  const resetVariantForm = () => setVariantForm({ color: "", size: "", stock: "", reserved: "", incoming: "" });
  const cancelProductForm = () => { setShowAddProductForm(false); setEditingProduct(null); resetProductForm(); };
  const cancelVariantForm = () => { setShowAddVariantForm(false); setSelectedProduct(null); resetVariantForm(); };

  const startEditing = (productId, variantId, currentStock) => { setEditingVariant({ productId, variantId }); setEditValue(currentStock.toString()); };
  const saveEditing = async () => {
    if (editingVariant && editValue !== "") {
      const newStock = parseInt(editValue) || 0;
      if (newStock < 0) { alert("O estoque não pode ser negativo"); return; }
      const success = await updateStockInBackend(editingVariant.variantId, newStock);
      if (success) {
        await fetchStockFromBackend();
        alert('Estoque atualizado com sucesso!');
      }
    }
    cancelEditing();
  };
  const cancelEditing = () => { setEditingVariant(null); setEditValue(""); };

  const startOrdering = (productId, variantId) => { setOrderingVariant({ productId, variantId }); setOrderQuantity(""); };
  const cancelOrdering = () => { setOrderingVariant(null); setOrderQuantity(""); };
  const confirmOrder = async () => {
    if (orderingVariant && orderQuantity !== "") {
      const quantity = parseInt(orderQuantity) || 0;
      if (quantity <= 0) { alert("Insira uma quantidade válida maior que zero."); return; }
      const success = await addIncomingToBackend(orderingVariant.variantId, quantity);
      if (success) {
        await fetchStockFromBackend();
        alert(`Pedido de ${quantity} unidades adicionado ao estoque em chegada!`);
      }
    }
    cancelOrdering();
  };

  const receiveIncomingStock = async (productId, variantId) => {
    const success = await receiveIncomingFromBackend(variantId);
    if (success) {
      await fetchStockFromBackend();
      alert('Estoque em chegada recebido com sucesso!');
    }
  };

  const isEditing = (productId, variantId) => editingVariant && editingVariant.productId === productId && editingVariant.variantId === variantId;
  const isOrdering = (productId, variantId) => orderingVariant && orderingVariant.productId === productId && orderingVariant.variantId === variantId;

  const getProductStatus = (variants) => {
    const totalStock = variants.reduce((s, v) => s + v.stock, 0);
    const totalIncoming = variants.reduce((s, v) => s + v.incoming, 0);
    if (totalStock === 0 && totalIncoming === 0) return "Sem Estoque";
    if (totalStock === 0 && totalIncoming > 0) return "Estoque em Chegada";
    return "Em Estoque";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Em Estoque": return "bg-green-100 text-green-800 border border-green-200";
      case "Estoque em Chegada": return "bg-blue-100 text-blue-800 border border-blue-200";
      case "Sem Estoque": return "bg-red-100 text-red-800 border border-red-200";
      default: return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const calculateProductTotals = (variants) => ({
    totalStock: variants.reduce((s, v) => s + v.stock, 0),
    totalReserved: variants.reduce((s, v) => s + v.reserved, 0),
    totalIncoming: variants.reduce((s, v) => s + v.incoming, 0),
    availableStock: variants.reduce((s, v) => s + (v.stock - v.reserved), 0)
  });

  const viewProductInfo = (product) => setViewingProduct(product);

  const ProductInfoModal = ({ product, onClose }) => {
    if (!product) return null;
    const totals = calculateProductTotals(product.variants);
    const productValue = calculateProductValue(product);
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Informações Detalhadas do Produto</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-200"><FiX size={20} /></button>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3 text-blue-600">{product.name}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><p><span className="font-medium">ID:</span> {product.product_id}</p><p><span className="font-medium">SKU:</span> {product.sku}</p><p><span className="font-medium">Categoria:</span> {product.category}</p></div>
                <div><p><span className="font-medium">Fornecedor:</span> {product.supplier}</p><p><span className="font-medium">Criado em:</span> {product.created_at}</p><p><span className="font-medium">Atualizado em:</span> {product.updated_at}</p></div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-semibold mb-3 text-gray-700">Informações Financeiras</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><p className="font-medium text-gray-600">Preço de Custo</p><p className="text-lg font-semibold text-green-600">R$ {product.price.toFixed(2)}</p></div>
                <div><p className="font-medium text-gray-600">Lucro Unitário</p><p className="text-lg font-semibold text-blue-600">R$ {product.profit.toFixed(2)}</p></div>
                <div><p className="font-medium text-gray-600">Preço de Venda</p><p className="text-lg font-semibold text-purple-600">R$ {product.sale_price.toFixed(2)}</p></div>
                <div><p className="font-medium text-gray-600">Margem</p><p className="text-lg font-semibold text-orange-600">{product.profit_margin.toFixed(1)}%</p></div>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h5 className="font-semibold mb-3 text-gray-700">Resumo de Estoque</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div><p className="text-2xl font-bold text-gray-900">{totals.totalStock}</p><p className="text-sm text-gray-600">Estoque Total</p></div>
                <div><p className="text-2xl font-bold text-yellow-600">{totals.totalReserved}</p><p className="text-sm text-gray-600">Reservado</p></div>
                <div><p className="text-2xl font-bold text-green-600">{totals.availableStock}</p><p className="text-sm text-gray-600">Disponível</p></div>
                <div><p className="text-2xl font-bold text-blue-600">{totals.totalIncoming}</p><p className="text-sm text-gray-600">Em Chegada</p></div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border">
              <h5 className="font-semibold mb-2 text-gray-700">Valor Total em Estoque</h5>
              <div className="flex justify-between items-center">
                <div><p className="text-3xl font-bold text-gray-900">R$ {productValue.stockValue.toFixed(2)}</p><p className="text-sm text-gray-600">Baseado no preço de venda atual</p></div>
                <FiDollarSign className="text-4xl text-green-500" />
              </div>
            </div>
            <div>
              <h5 className="font-semibold mb-3 text-gray-700">Variantes ({product.variants.length})</h5>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {product.variants.map(v => (
                  <div key={v.id} className="flex justify-between items-center p-3 border rounded-lg bg-white">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: v.color === 'Branco' ? '#FFFFFF' : v.color === 'Preto' ? '#000000' : v.color === 'Cinza' ? '#808080' : '#D3D3D3' }} />
                      <span className="font-medium">{v.color} - {v.size}</span>
                    </div>
                    <div className="flex space-x-4 text-sm">
                      <span className={v.stock > 0 ? "text-green-600" : "text-red-600"}>Estoque: {v.stock}</span>
                      <span className="text-blue-600">Disponível: {v.stock - v.reserved}</span>
                      {v.incoming > 0 && <span className="text-orange-600">Chegando: {v.incoming}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 border-t flex justify-end space-x-3">
            <button onClick={() => { editProduct(product); onClose(); }} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"><FiEdit className="mr-2" />Editar Produto</button>
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Fechar</button>
          </div>
        </div>
      </div>
    );
  };

  const OrderQuantityModal = () => {
    if (!orderingVariant) return null;
    const variant = stockItems.find(p => p.id === orderingVariant.productId)?.variants.find(v => v.id === orderingVariant.variantId);
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800">Fazer Pedido</h3>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Variante selecionada:</p>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: variant?.color === 'Branco' ? '#FFFFFF' : variant?.color === 'Preto' ? '#000000' : variant?.color === 'Cinza' ? '#808080' : '#D3D3D3' }} />
                <span className="font-medium text-gray-900">{variant?.color} - {variant?.size}</span>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade a pedir *</label>
              <input type="number" value={orderQuantity} onChange={(e) => setOrderQuantity(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg text-black text-center text-lg font-semibold" placeholder="0" min="1" autoFocus onKeyDown={(e) => { if (e.key === 'Enter') confirmOrder(); if (e.key === 'Escape') cancelOrdering(); }} />
              <p className="text-xs text-gray-500 mt-2">Esta quantidade será adicionada ao "Estoque em Chegada"</p>
            </div>
            <div className="flex justify-end space-x-3">
              <button onClick={cancelOrdering} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button onClick={confirmOrder} disabled={!orderQuantity || parseInt(orderQuantity) <= 0} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">Confirmar Pedido</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const filteredStockItems = stockItems.filter(item =>
    item.name.toLowerCase().includes(stockSearch.toLowerCase()) ||
    item.product_id.toLowerCase().includes(stockSearch.toLowerCase()) ||
    item.sku.toLowerCase().includes(stockSearch.toLowerCase()) ||
    item.category.toLowerCase().includes(stockSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow border animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-6 bg-gray-200 rounded w-16 mt-2"></div>
            </div>
          ))}
        </div>
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
              <div className="bg-gray-50 px-6 py-4"><div className="h-8 bg-gray-200 rounded w-64"></div></div>
              <div className="p-6"><div className="h-64 bg-gray-200 rounded"></div></div>
            </div>
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
          {lastSaved && <p className="text-sm text-gray-500 mt-1">Última atualização: {lastSaved}</p>}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button onClick={fetchStockFromBackend} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center whitespace-nowrap text-sm">
            <FiRefreshCw className="mr-2" />Atualizar
          </button>
          <div className="relative w-full sm:w-64">
            <input type="text" placeholder="Buscar produtos..." value={stockSearch} onChange={(e) => setStockSearch(e.target.value)} className="w-full p-2 pl-10 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
          <button onClick={() => setShowAddProductForm(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center whitespace-nowrap">
            <FiPlus className="mr-2" />Adicionar Produto
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center"><FiPackage className="h-5 w-5 text-red-400" /><div className="ml-3"><h3 className="text-sm font-medium text-red-800">Erro ao carregar dados</h3><p className="mt-2 text-sm text-red-700">{error}</p></div></div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Total de Produtos</p><p className="text-2xl font-bold text-gray-900">{stockItems.length}</p></div><FiPackage className="text-2xl text-blue-500" /></div></div>
        <div className="bg-white p-4 rounded-lg shadow border"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Total de Variantes</p><p className="text-2xl font-bold text-gray-900">{stockItems.reduce((s, i) => s + i.variants.length, 0)}</p></div><FiLayers className="text-2xl text-purple-500" /></div></div>
        <div className="bg-white p-4 rounded-lg shadow border"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Faturamento</p><p className="text-2xl font-bold text-gray-900">R$ {calculateTotalInventoryValue().toFixed(2)}</p></div><FiDollarSign className="text-2xl text-green-500" /></div></div>
        <div className="bg-white p-4 rounded-lg shadow border"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Lucro Total</p><p className="text-2xl font-bold text-gray-900">R$ {calculateTotalProfitValue().toFixed(2)}</p></div><FiDollarSign className="text-2xl text-orange-500" /></div></div>
      </div>

      {showAddProductForm && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">{editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* campos do formulário mantidos exatamente como antes */}
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button onClick={cancelProductForm} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button onClick={editingProduct ? updateProduct : addNewProduct} disabled={!productForm.product_id || !productForm.name || !productForm.sku} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
              {editingProduct ? 'Atualizar Produto' : 'Adicionar Produto'}
            </button>
          </div>
        </div>
      )}

      {showAddVariantForm && selectedProduct && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Adicionar Variante para {selectedProduct.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* campos do formulário de variante mantidos */}
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button onClick={cancelVariantForm} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button onClick={addNewVariant} disabled={!variantForm.color || !variantForm.size} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed">Adicionar Variante</button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {filteredStockItems.length > 0 ? filteredStockItems.map(product => {
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
                        <button onClick={() => editProduct(product)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50" title="Editar produto"><FiEdit size={14} /></button>
                        <button onClick={() => deleteProduct(product.product_id, product.name)} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50" title="Excluir produto"><FiTrash2 size={14} /></button>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-1 text-sm text-gray-600">
                      <span>ID: {product.product_id}</span>
                      <span>SKU: {product.sku}</span>
                      <span>Categoria: {product.category}</span>
                      <span>Fornecedor: {product.supplier}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Criado: {product.created_at} | Atualizado: {product.updated_at}</div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium ${getStatusColor(status)}`}>{status}</span>
                    <button onClick={() => viewProductInfo(product)} className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700 flex items-center justify-center" title="Visualizar informações"><FiEye size={20} /></button>
                    <button onClick={() => { setSelectedProduct(product); setShowAddVariantForm(true); }} className="bg-green-600 text-white p-1 rounded hover:bg-green-700 flex items-center justify-center" title="Adicionar variante"><FiPlus size={20} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 p-3 bg-white rounded border">
                  <div className="space-y-2">
                    <PriceEditor productId={product.product_id} field="price" currentValue={product.price} label="Preço" />
                    <PriceEditor productId={product.product_id} field="profit" currentValue={product.profit} label="Lucro" />
                  </div>
                  <div className="space-y-2">
                    <PriceEditor productId={product.product_id} field="sale_price" currentValue={product.sale_price} label="Preço de Venda" />
                    <PriceEditor productId={product.product_id} field="total_value" currentValue={productValue.stockValue} label="Faturamento" />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 text-sm">
                  <div className="text-center"><div className="font-semibold">{totals.totalStock}</div><div className="text-gray-500">Estoque Total</div></div>
                  <div className="text-center"><div className="font-semibold">{totals.totalReserved}</div><div className="text-gray-500">Reservado</div></div>
                  <div className="text-center"><div className="font-semibold">{totals.availableStock}</div><div className="text-gray-500">Disponível</div></div>
                  <div className="text-center"><div className="font-semibold">{totals.totalIncoming}</div><div className="text-gray-500">Em Chegada</div></div>
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
                    {product.variants.map(variant => {
                      const isVariantEditing = isEditing(product.id, variant.id);
                      const isVariantOrdering = isOrdering(product.id, variant.id);
                      return (
                        <tr key={variant.id} className="hover:bg-gray-50">
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-4 h-4 rounded-full border border-gray-300 mr-2" style={{ backgroundColor: variant.color === 'Branco' ? '#FFFFFF' : variant.color === 'Preto' ? '#000000' : variant.color === 'Cinza' ? '#808080' : '#D3D3D3' }} />
                              <span className="text-sm font-medium text-gray-900">{variant.color}</span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{variant.size}</td>

                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            {isVariantEditing ? (
                              <div className="flex items-center space-x-2">
                                <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-16 smэнер:w-20 p-1 border border-gray-300 rounded text-sm text-black text-center" min="0" autoFocus onKeyDown={(e) => { if (e.key === 'Enter') saveEditing(); if (e.key === 'Escape') cancelEditing(); }} />
                                <div className="flex space-x-1">
                                  <button onClick={saveEditing} className="text-green-600 hover:text-green-800 bg-green-50 p-1 rounded w-6 h-6 flex items-center justify-center"><FiCheck size={14} /></button>
                                  <button onClick={cancelEditing} className="text-red-600 hover:text-red-800 bg-red-50 p-1 rounded w-6 h-6 flex items-center justify-center"><FiX size={14} /></button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900 w-8 text-center">{variant.stock}</span>
                                <button onClick={() => startEditing(product.id, variant.id, variant.stock)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 w-6 h-6 flex items-center justify-center"><FiEdit size={12} /></button>
                              </div>
                            )}
                          </td>

                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <span>{variant.reserved}</span>
                              {variant.reserved > 0 && (
                                <button onClick={() => resetReservedStock(variant.id, variant.color, variant.size)} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 w-6 h-6 flex items-center justify-center"><FiRotateCcw size={12} /></button>
                              )}
                            </div>
                          </td>

                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                            <span className={variant.stock <= variant.reserved ? "text-red-600" : "text-green-600"}>{variant.stock}</span>
                          </td>

                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-900">{variant.incoming}</span>
                              {variant.incoming > 0 && (
                                <button onClick={() => receiveIncomingStock(product.id, variant.id)} className="text-green-600 hover:text-green-800 text-xs bg-green-100 px-2 py-1 rounded">Receber</button>
                              )}
                            </div>
                          </td>

                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${variant.stock === 0 ? (variant.incoming > 0 ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800") : "bg-green-100 text-green-800"}`}>
                              {variant.stock === 0 ? (variant.incoming > 0 ? "Em Chegada" : "Sem Estoque") : "Em Estoque"}
                            </span>
                          </td>

                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button onClick={() => startOrdering(product.id, variant.id)} className="text-blue-600 hover:text-blue-900 text-xs bg-blue-100 px-2 py-1 rounded">Pedir +</button>
                            <button onClick={() => deleteVariant(product.id, variant.id, variant.color, variant.size)} className="text-red-600 hover:text-red-900 text-xs bg-red-100 px-2 py-1 rounded"><FiTrash2 size={10} /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }) : (
          <div className="text-center py-8 bg-white rounded-lg border">
            <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum produto encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">{stockSearch ? 'Tente ajustar os termos da busca.' : 'Banco de dados vazio. Comece adicionando um novo produto.'}</p>
            <div className="mt-6">
              <button onClick={() => setShowAddProductForm(true)} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                <FiPlus className="mr-2" />Adicionar Produto
              </button>
            </div>
          </div>
        )}
      </div>

      {viewingProduct && <ProductInfoModal product={viewingProduct} onClose={() => setViewingProduct(null)} />}
      <OrderQuantityModal />
    </div>
  );
};

export default StockManagement;