// src/components/admin/StockManagement.jsx
import React, { useState } from "react";
import { 
  FiSearch, FiPlus, FiPackage, FiLayers, FiAlertCircle, FiEdit, FiCheck, FiX 
} from "react-icons/fi";

const StockManagement = () => {
  const [stockSearch, setStockSearch] = useState("");
  const [editingVariant, setEditingVariant] = useState(null); // { productId, color, size }
  const [editValue, setEditValue] = useState("");
  
  const [stockItems, setStockItems] = useState([
    {
      id: 1,
      productId: "PROD-001",
      name: "Camiseta Finito Branca",
      sku: "CT-FINITO-WHITE",
      category: "Roupas",
      supplier: "Fabricante A",
      cost: 15.00,
      lastUpdated: "2024-01-15",
      variants: [
        { color: "Branco", size: "P", stock: 10, reserved: 2, incoming: 5 },
        { color: "Branco", size: "M", stock: 15, reserved: 3, incoming: 0 },
        { color: "Branco", size: "G", stock: 8, reserved: 1, incoming: 10 },
        { color: "Branco", size: "GG", stock: 5, reserved: 0, incoming: 0 }
      ]
    },
    {
      id: 2,
      productId: "PROD-002",
      name: "Camiseta Finito Preta",
      sku: "CT-FINITO-BLACK",
      category: "Roupas",
      supplier: "Fabricante A",
      cost: 15.00,
      lastUpdated: "2024-01-15",
      variants: [
        { color: "Preto", size: "P", stock: 0, reserved: 0, incoming: 20 },
        { color: "Preto", size: "M", stock: 3, reserved: 2, incoming: 0 },
        { color: "Preto", size: "G", stock: 7, reserved: 1, incoming: 0 },
        { color: "Preto", size: "GG", stock: 2, reserved: 0, incoming: 0 }
      ]
    },
  ]);

  // ✅ NOVO: Iniciar edição
  const startEditing = (productId, color, size, currentStock) => {
    setEditingVariant({ productId, color, size });
    setEditValue(currentStock.toString());
  };

  // ✅ NOVO: Salvar edição
  const saveEditing = () => {
    if (editingVariant && editValue !== "") {
      updateVariantStock(
        editingVariant.productId, 
        editingVariant.color, 
        editingVariant.size, 
        parseInt(editValue) || 0
      );
    }
    cancelEditing();
  };

  // ✅ NOVO: Cancelar edição
  const cancelEditing = () => {
    setEditingVariant(null);
    setEditValue("");
  };

  // ✅ ATUALIZADO: Atualizar estoque com verificação de edição
  const updateVariantStock = (productId, color, size, newStock) => {
    setStockItems(prev => prev.map(product => 
      product.id === productId 
        ? {
            ...product,
            variants: product.variants.map(variant =>
              variant.color === color && variant.size === size
                ? { ...variant, stock: Math.max(0, parseInt(newStock) || 0) }
                : variant
            ),
            lastUpdated: new Date().toISOString().split('T')[0]
          }
        : product
    ));
  };

  // ✅ NOVO: Verificar se uma variante está sendo editada
  const isEditing = (productId, color, size) => {
    return editingVariant && 
           editingVariant.productId === productId && 
           editingVariant.color === color && 
           editingVariant.size === size;
  };

  const getProductStatus = (variants) => {
    const totalStock = variants.reduce((sum, variant) => sum + variant.stock, 0);
    const totalIncoming = variants.reduce((sum, variant) => sum + variant.incoming, 0);
    
    if (totalStock === 0 && totalIncoming === 0) return "Out of Stock";
    if (totalStock === 0 && totalIncoming > 0) return "Incoming Stock";
    if (totalStock <= 10) return "Low Stock";
    return "In Stock";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "In Stock": return "bg-green-100 text-green-800 border border-green-200";
      case "Low Stock": return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "Incoming Stock": return "bg-blue-100 text-blue-800 border border-blue-200";
      case "Out of Stock": return "bg-red-100 text-red-800 border border-red-200";
      default: return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const addIncomingStock = (productId, color, size, quantity) => {
    setStockItems(prev => prev.map(product => 
      product.id === productId 
        ? {
            ...product,
            variants: product.variants.map(variant =>
              variant.color === color && variant.size === size
                ? { ...variant, incoming: variant.incoming + quantity }
                : variant
            )
          }
        : product
    ));
  };

  const receiveIncomingStock = (productId, color, size) => {
    setStockItems(prev => prev.map(product => 
      product.id === productId 
        ? {
            ...product,
            variants: product.variants.map(variant =>
              variant.color === color && variant.size === size
                ? { 
                    ...variant, 
                    stock: variant.stock + variant.incoming,
                    incoming: 0 
                  }
                : variant
            ),
            lastUpdated: new Date().toISOString().split('T')[0]
          }
        : product
    ));
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
    item.sku.toLowerCase().includes(stockSearch.toLowerCase()) ||
    item.category.toLowerCase().includes(stockSearch.toLowerCase())
  );

  return (
    <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Stock Management - Color & Size Variants</h2>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search stock items..."
              value={stockSearch}
              onChange={(e) => setStockSearch(e.target.value)}
              className="w-full p-2 pl-10 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ fontFamily: 'Calibri, sans-serif' }}
            />
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center whitespace-nowrap" style={{ fontFamily: 'Calibri, sans-serif' }}>
            <FiPlus className="mr-2" />
            Add Stock Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stockItems.length}</p>
            </div>
            <FiPackage className="text-2xl text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Variants</p>
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
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {stockItems.filter(item => getProductStatus(item.variants) === "Low Stock").length}
              </p>
            </div>
            <FiAlertCircle className="text-2xl text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {stockItems.filter(item => getProductStatus(item.variants) === "Out of Stock").length}
              </p>
            </div>
            <FiAlertCircle className="text-2xl text-red-500" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {filteredStockItems.map((product) => {
          const totals = calculateProductTotals(product.variants);
          const status = getProductStatus(product.variants);
          
          return (
            <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 sm:px-6 py-4 border-b">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-1 text-sm text-gray-600">
                      <span>SKU: {product.sku}</span>
                      <span>Category: {product.category}</span>
                      <span>Supplier: {product.supplier}</span>
                      <span>Cost: ${product.cost}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                      {status}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      Updated: {product.lastUpdated}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">{totals.totalStock}</div>
                    <div className="text-gray-500">Total Stock</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{totals.totalReserved}</div>
                    <div className="text-gray-500">Reserved</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{totals.availableStock}</div>
                    <div className="text-gray-500">Available</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{totals.totalIncoming}</div>
                    <div className="text-gray-500">Incoming</div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reserved</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incoming</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {product.variants.map((variant, index) => {
                      const available = variant.stock - variant.reserved;
                      const variantStatus = variant.stock === 0 
                        ? (variant.incoming > 0 ? "Incoming" : "Out of Stock")
                        : (variant.stock <= 5 ? "Low Stock" : "In Stock");
                      
                      const isVariantEditing = isEditing(product.id, variant.color, variant.size);
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50">
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
                          
                          {/* ✅ ATUALIZADO: Campo de estoque com blocked state */}
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
                                  onClick={() => startEditing(product.id, variant.color, variant.size, variant.stock)}
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
                                  onClick={() => receiveIncomingStock(product.id, variant.color, variant.size)}
                                  className="text-green-600 hover:text-green-800 text-xs bg-green-100 px-2 py-1 rounded"
                                >
                                  Receive
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              variantStatus === "In Stock" ? "bg-green-100 text-green-800" :
                              variantStatus === "Low Stock" ? "bg-yellow-100 text-yellow-800" :
                              variantStatus === "Incoming" ? "bg-blue-100 text-blue-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {variantStatus}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button 
                              onClick={() => addIncomingStock(product.id, variant.color, variant.size, 10)}
                              className="text-blue-600 hover:text-blue-900 text-xs bg-blue-100 px-2 py-1 rounded"
                            >
                              Order +
                            </button>
                            <button className="text-gray-600 hover:text-gray-900 text-xs bg-gray-100 px-2 py-1 rounded">
                              History
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
            <FiAlertCircle className="mr-2" />
            Low Stock Alerts
          </h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {stockItems.flatMap(product => 
              product.variants
                .filter(variant => variant.stock > 0 && variant.stock <= 5)
                .map(variant => (
                  <div key={`${product.id}-${variant.color}-${variant.size}`} 
                       className="flex justify-between items-center p-3 bg-yellow-100 rounded">
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-yellow-800 block truncate">{product.name}</span>
                      <div className="text-sm text-yellow-600">
                        {variant.color} - {variant.size} | Stock: {variant.stock} | Reserved: {variant.reserved}
                      </div>
                    </div>
                    <button 
                      onClick={() => addIncomingStock(product.id, variant.color, variant.size, 20)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 whitespace-nowrap ml-2"
                    >
                      Reorder
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
            <FiAlertCircle className="mr-2" />
            Out of Stock
          </h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {stockItems.flatMap(product => 
              product.variants
                .filter(variant => variant.stock === 0)
                .map(variant => (
                  <div key={`${product.id}-${variant.color}-${variant.size}`} 
                       className="flex justify-between items-center p-3 bg-red-100 rounded">
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-red-800 block truncate">{product.name}</span>
                      <div className="text-sm text-red-600">
                        {variant.color} - {variant.size} | Incoming: {variant.incoming} units
                      </div>
                    </div>
                    <button 
                      onClick={() => addIncomingStock(product.id, variant.color, variant.size, 50)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 whitespace-nowrap ml-2"
                    >
                      Urgent Order
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockManagement;