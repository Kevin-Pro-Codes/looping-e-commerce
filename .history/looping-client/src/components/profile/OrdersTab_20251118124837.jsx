import React, { useState } from 'react';
import { FiPackage, FiTruck, FiCalendar, FiXCircle } from 'react-icons/fi';
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
  const [activeSubTab, setActiveSubTab] = useState('entrega'); // Mudado para 'entrega' como padrão

  // Filter orders based on active sub-tab
  const filteredOrders = activeSubTab === 'entrega' 
    ? orders.filter(order => 
        order.status === 'enviado' || 
        order.status === 'entregue' || 
        order.status === 'a_caminho' || 
        order.status === 'cancelado'
      )
    : orders;

  if (loadingOrders) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando seus pedidos...</p>
      </div>
    );
  }

  const EmptyState = ({ title, description, icon: Icon }) => (
    <div className="text-center py-8">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon size={32} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{description}</p>
      <Button onClick={() => setActiveTab("carrinho")}>
        Ir para Carrinho
      </Button>
    </div>
  );

  if (filteredOrders.length === 0) {
    if (activeSubTab === 'pedidos') {
      return (
        <EmptyState 
          title="Nenhum pedido encontrado"
          description="Você ainda não realizou nenhum pedido."
          icon={FiPackage}
        />
      );
    } else {
      return (
        <EmptyState 
          title="Nenhuma entrega encontrada"
          description="Você não tem entregas em andamento ou concluídas."
          icon={FiTruck}
        />
      );
    }
  }

  // Função para gerar informações de rastreio realistas
  const generateTrackingInfo = (order) => {
    if (order.status === 'a_caminho') {
      const steps = [
        { status: 'postado', date: new Date(order.order_date), location: 'Centro de Distribuição - SP' },
        { status: 'em_transito', date: new Date(), location: 'Unidade Local - Sua Cidade' },
        { status: 'saiu_entrega', date: null, location: 'Em breve' }
      ];
      return steps;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meus Pedidos</h2>
          <p className="text-gray-500 mt-1">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'item' : 'itens'} encontrados
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

      {/* Sub Navigation Tabs - ORDEM INVERTIDA */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {/* ABA ENTREGAS AGORA VEM PRIMEIRO */}
          <button
            onClick={() => setActiveSubTab('entrega')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeSubTab === 'entrega'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FiTruck size={18} />
              <span>Entregas</span>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {orders.filter(o => 
                  o.status === 'enviado' || 
                  o.status === 'entregue' || 
                  o.status === 'a_caminho' || 
                  o.status === 'cancelado'
                ).length}
              </span>
            </div>
          </button>
          
          {/* ABA TODOS OS PEDIDOS AGORA VEM SEGUNDO */}
          <button
            onClick={() => setActiveSubTab('pedidos')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeSubTab === 'pedidos'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FiPackage size={18} />
              <span>Todos os Pedidos</span>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {orders.length}
              </span>
            </div>
          </button>
        </nav>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const trackingSteps = generateTrackingInfo(order);
          
          return (
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

              {/* Delivery Information - Enhanced for Entrega tab */}
              {(activeSubTab === 'entrega' || 
                order.status === 'enviado' || 
                order.status === 'entregue' || 
                order.status === 'a_caminho' || 
                order.status === 'cancelado') && (
                <div className={`border rounded-lg p-4 mb-4 ${
                  order.status === 'cancelado' 
                    ? 'bg-red-50 border-red-200' 
                    : order.status === 'a_caminho'
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center space-x-2 mb-3">
                    {order.status === 'cancelado' ? (
                      <FiXCircle className="text-red-600" size={18} />
                    ) : (
                      <FiTruck className={
                        order.status === 'a_caminho' ? 'text-orange-600' : 'text-blue-600'
                      } size={18} />
                    )}
                    <h4 className={`font-semibold ${
                      order.status === 'cancelado' ? 'text-red-900' : 
                      order.status === 'a_caminho' ? 'text-orange-900' : 'text-blue-900'
                    }`}>
                      {order.status === 'cancelado' ? 'Entrega Cancelada' : 
                       order.status === 'a_caminho' ? 'Entrega a Caminho' : 'Informações de Entrega'}
                    </h4>
                  </div>

                  {order.status === 'cancelado' ? (
                    <div className="space-y-2">
                      <p className="text-red-800 font-medium">Motivo do cancelamento:</p>
                      <p className="text-red-700">
                        {order.cancellation_reason || "Produto indisponível no momento"}
                      </p>
                      <p className="text-red-600 text-sm">
                        Valor reembolsado em: {new Date().toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ) : order.status === 'a_caminho' ? (
                    <div className="space-y-4">
                      {/* Rastreamento em tempo real */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-orange-800 font-medium">Endereço de entrega:</p>
                          <p className="text-orange-700">{order.shipping_address}</p>
                        </div>
                        {order.tracking_number && (
                          <div>
                            <p className="text-orange-800 font-medium">Código de rastreio:</p>
                            <p className="text-orange-700 font-mono">{order.tracking_number}</p>
                          </div>
                        )}
                        {order.estimated_delivery && (
                          <div>
                            <p className="text-orange-800 font-medium">Previsão de entrega:</p>
                            <div className="flex items-center space-x-1 text-green-700">
                              <FiCalendar size={14} />
                              <span>{new Date(order.estimated_delivery).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                        )}
                        <div>
                          <p className="text-orange-800 font-medium">Entregador:</p>
                          <p className="text-orange-700">João Silva • (11) 99999-9999</p>
                        </div>
                      </div>

                      {/* Timeline de rastreamento */}
                      {trackingSteps && (
                        <div className="border-t border-orange-200 pt-3">
                          <p className="text-orange-800 font-medium mb-2">Andamento da entrega:</p>
                          <div className="space-y-2">
                            {trackingSteps.map((step, index) => (
                              <div key={index} className="flex items-start space-x-3">
                                <div className={`w-3 h-3 rounded-full mt-1 ${
                                  step.date ? 'bg-green-500' : 'bg-gray-300'
                                }`}></div>
                                <div className="flex-1">
                                  <p className={`text-sm ${
                                    step.date ? 'text-green-700 font-medium' : 'text-gray-500'
                                  }`}>
                                    {step.status === 'postado' && 'Pedido postado'}
                                    {step.status === 'em_transito' && 'Em trânsito para entrega'}
                                    {step.status === 'saiu_entrega' && 'Saiu para entrega'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {step.location} {step.date && `• ${step.date.toLocaleDateString('pt-BR')}`}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-blue-800 font-medium">Endereço de entrega:</p>
                        <p className="text-blue-700">{order.shipping_address}</p>
                      </div>
                      {order.tracking_number && (
                        <div>
                          <p className="text-blue-800 font-medium">Código de rastreio:</p>
                          <p className="text-blue-700 font-mono">{order.tracking_number}</p>
                        </div>
                      )}
                      {order.estimated_delivery && (
                        <div>
                          <p className="text-blue-800 font-medium">Previsão de entrega:</p>
                          <div className="flex items-center space-x-1 text-green-700">
                            <FiCalendar size={14} />
                            <span>{new Date(order.estimated_delivery).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      )}
                      {order.status === 'entregue' && (
                        <div>
                          <p className="text-blue-800 font-medium">Status:</p>
                          <p className="text-green-700 font-semibold">✓ Entregue com sucesso</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Order Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-200">
                <div className="flex-1">
                  {activeSubTab === 'pedidos' && (
                    <>
                      <p className="text-sm text-gray-600">
                        <strong>Endereço:</strong> {order.shipping_address}
                      </p>
                      {order.tracking_number && (
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Rastreio:</strong> {order.tracking_number}
                        </p>
                      )}
                    </>
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
                  {(order.status === "enviado" || order.status === "a_caminho" || activeSubTab === 'entrega') && (
                    <Button variant="primary" className="sm:w-auto">
                      {order.status === "entregue" ? "Avaliar Entrega" : 
                       order.status === "a_caminho" ? "Acompanhar Entregador" : "Rastrear Pedido"}
                    </Button>
                  )}
                  {order.status === "cancelado" && (
                    <Button variant="outline" className="sm:w-auto border-red-300 text-red-700 hover:bg-red-50">
                      Ver Reembolso
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Delivery Summary - Only show for "Entregas" tab */}
      {activeSubTab === 'entrega' && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {orders.filter(o => o.status === 'a_caminho').length}
              </p>
              <p className="text-sm text-orange-700">A Caminho</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">
                {orders.filter(o => o.status === 'enviado').length}
              </p>
              <p className="text-sm text-blue-700">Em Trânsito</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.status === 'entregue').length}
              </p>
              <p className="text-sm text-green-700">Entregues</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {orders.filter(o => o.status === 'cancelado').length}
              </p>
              <p className="text-sm text-red-700">Canceladas</p>
            </div>
          </div>
        </Card>
      )}

      {/* Orders Summary - Only show for "Todos os Pedidos" tab */}
      {activeSubTab === 'pedidos' && (
        <Card className="p-6 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
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
              <p className="text-2xl font-bold text-orange-600">
                {orders.filter(o => o.status === 'a_caminho').length}
              </p>
              <p className="text-sm text-gray-600">A Caminho</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {orders.filter(o => o.status === 'enviado').length}
              </p>
              <p className="text-sm text-gray-600">Enviados</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {orders.filter(o => o.status === 'cancelado').length}
              </p>
              <p className="text-sm text-gray-600">Cancelados</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default OrdersTab;