import React from 'react';
import { FiPackage } from 'react-icons/fi';
import { IoReload } from 'react-icons/io5';
import { Button, Card } from './SharedComponents';

const OrdersTab = ({ 
  orders, 
  loadingOrders, 
  fetchOrders, 
  setActiveTab,
  getStatusColor,
  getStatusText 
}) => {
  if (loadingOrders) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando seus pedidos...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiPackage size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum pedido encontrado</h3>
        <p className="text-gray-500 mb-6">Você ainda não realizou nenhum pedido.</p>
        <Button onClick={() => setActiveTab("carrinho")}>
          Ir para Carrinho
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meus Pedidos</h2>
          <p className="text-gray-500 mt-1">
            {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'} encontrados
          </p>
        </div>
        <Button
          onClick={fetchOrders}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <IoReload size={21} />
          Atualizar
        </Button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="p-6 hover:shadow-md transition-shadow">
            {/* Order Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {order.order_number}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  Pedido realizado em {new Date(order.order_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  R$ {order.total.toFixed(2).replace('.', ',')}
                </p>
                <p className="text-sm text-gray-500">
                  {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                        <FiPackage size={16} className="text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {item.product_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qtd: {item.quantity} × R$ {item.price.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900">
                      R$ {item.total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-200">
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  <strong>Endereço de entrega:</strong> {order.shipping_address}
                </p>
                {order.tracking_number && (
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Código de rastreio:</strong> {order.tracking_number}
                  </p>
                )}
                {order.estimated_delivery && (
                  <p className="text-sm text-green-600 mt-1">
                    <strong>Previsão de entrega:</strong> {new Date(order.estimated_delivery).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                <Button variant="outline" className="sm:w-auto">
                  Detalhes
                </Button>
                {order.status === "entregue" && (
                  <Button variant="primary" className="sm:w-auto">
                    Comprar Novamente
                  </Button>
                )}
                {order.status === "enviado" && (
                  <Button variant="primary" className="sm:w-auto">
                    Rastrear
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Orders Summary */}
      <Card className="p-6 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            <p className="text-sm text-gray-600">Total de Pedidos</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {orders.filter(o => o.status === 'entregue').length}
            </p>
            <p className="text-sm text-gray-600">Entregues</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {orders.filter(o => o.status === 'enviado').length}
            </p>
            <p className="text-sm text-gray-600">Enviados</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">
              {orders.filter(o => o.status === 'processando').length}
            </p>
            <p className="text-sm text-gray-600">Processando</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OrdersTab;