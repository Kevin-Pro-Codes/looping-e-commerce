import React, { useState, useEffect } from 'react';
import { 
  FiCreditCard, 
  FiPlus, 
  FiTrash2, 
  FiCheck, 
  FiLock,
  FiStar,
  FiShoppingBag,
  FiX
} from 'react-icons/fi';
import { SiPix } from 'react-icons/si';

// Skeleton Loading Component
const PaymentTabSkeleton = () => {
  return (
    <div className="w-full min-w-0 space-y-6 p-4 max-w-7xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-purple-600 to-red-700 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <div className="h-8 bg-purple-500 rounded w-48 mb-2"></div>
            <div className="h-4 bg-purple-400 rounded w-64"></div>
          </div>
          <div className="w-12 h-12 bg-white rounded-lg"></div>
        </div>
      </div>

      {/* Cartões Skeleton */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
          <div className="h-7 bg-gray-200 rounded w-40"></div>
          <div className="h-10 bg-gray-200 rounded w-32 sm:hidden"></div>
        </div>
        
        <div className="space-y-4">
          {[1, 2].map((item) => (
            <div key={item} className="border-2 border-gray-200 rounded-xl p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-start lg:items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                      <div className="h-6 bg-gray-200 rounded w-40"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="flex items-center justify-end lg:justify-start space-x-3 pt-4 lg:pt-0">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PIX Skeleton */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="h-7 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="space-y-4">
          <div className="border-2 border-green-200 bg-green-50 rounded-xl p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-40"></div>
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Transações Skeleton */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-7 bg-gray-200 rounded w-48"></div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
              <div className="flex items-center space-x-4 min-w-0 flex-1">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="h-6 bg-gray-200 rounded w-16 ml-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resumo e Segurança Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="h-5 bg-gray-200 rounded w-24"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentTab = () => {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'credit',
      brand: 'visa',
      lastFour: '4321',
      cardHolder: 'JOÃO SILVA',
      expiry: '12/25',
      isDefault: true,
      limit: 5000,
      used: 1250
    },
    {
      id: 2,
      type: 'credit',
      brand: 'mastercard',
      lastFour: '8765',
      cardHolder: 'JOÃO SILVA',
      expiry: '08/26',
      isDefault: false,
      limit: 3000,
      used: 800
    },
    {
      id: 3,
      type: 'debit',
      brand: 'visa',
      lastFour: '1234',
      cardHolder: 'JOÃO SILVA',
      expiry: '05/27',
      isDefault: false,
      bank: 'Nubank'
    },
    {
      id: 4,
      type: 'pix',
      isDefault: false,
      bank: 'Itaú',
      key: 'joao.silva@email.com'
    }
  ]);

  const [transactions, setTransactions] = useState([
    {
      id: 1,
      date: '2024-01-15',
      description: 'Camiseta Metallica - Master of Puppets',
      amount: 89.90,
      status: 'completed',
      paymentMethod: 'Cartão Visa ****4321',
      category: 'shopping'
    },
    {
      id: 2,
      date: '2024-01-12',
      description: 'Camiseta Iron Maiden - Eddie Trooper',
      amount: 79.90,
      status: 'completed',
      paymentMethod: 'PIX',
      category: 'shopping'
    },
    {
      id: 3,
      date: '2024-01-10',
      description: 'Camiseta Nirvana - Nevermind',
      amount: 69.90,
      status: 'pending',
      paymentMethod: 'Cartão Mastercard ****8765',
      category: 'shopping'
    }
  ]);

  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({
    number: '',
    holder: '',
    expiry: '',
    cvv: '',
    type: 'credit',
    brand: 'visa'
  });
  const [loading, setLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const getCardBrand = (number) => {
    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    return 'visa';
  };

  const formatCardNumber = (number) => {
    return number.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    const newPaymentMethod = {
      id: Date.now(),
      type: newCard.type,
      brand: getCardBrand(newCard.number),
      lastFour: newCard.number.slice(-4),
      cardHolder: newCard.holder.toUpperCase(),
      expiry: newCard.expiry,
      isDefault: paymentMethods.length === 0,
      limit: newCard.type === 'credit' ? 5000 : undefined,
      used: 0
    };

    setPaymentMethods([...paymentMethods, newPaymentMethod]);
    setShowAddCard(false);
    setNewCard({ number: '', holder: '', expiry: '', cvv: '', type: 'credit', brand: 'visa' });
  };

  const setDefaultPayment = (id) => {
    setPaymentMethods(methods =>
      methods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
  };

  const deletePaymentMethod = (id) => {
    setPaymentMethods(methods => methods.filter(method => method.id !== id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'pending': return 'Pendente';
      case 'failed': return 'Falhou';
      default: return status;
    }
  };

  const CardIcon = ({ brand, className = "w-10 h-10" }) => {
    const brands = {
      visa: (
        <div className={`bg-[#1A1F71] text-white rounded-lg flex items-center justify-center ${className}`}>
          <span className="font-bold text-sm">VISA</span>
        </div>
      ),
      mastercard: (
        <div className={`bg-[#EB001B] text-white rounded-lg flex items-center justify-center ${className}`}>
          <span className="font-bold text-sm">MC</span>
        </div>
      ),
      amex: (
        <div className={`bg-[#2E77BC] text-white rounded-lg flex items-center justify-center ${className}`}>
          <span className="font-bold text-sm">AMEX</span>
        </div>
      )
    };

    return brands[brand] || brands.visa;
  };

  // Calcular total gasto em camisetas
  const totalSpent = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  if (loading) {
    return <PaymentTabSkeleton />;
  }

  return (
    <div className="w-full min-w-0 space-y-6 p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-red-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Looping Pagamentos</h1>
            <p className="text-purple-100 text-sm sm:text-base">Gerencie suas formas de pagamento</p>
          </div>
          <button
            onClick={() => setShowAddCard(true)}
            className="flex items-center justify-center bg-white text-purple-600 hover:bg-purple-50 px-4 py-3 rounded-lg transition-colors w-full sm:w-auto shadow-md"
          >
            <FiPlus size={20} className="sm:mr-2" />
            <span className="hidden sm:inline">Adicionar Cartão</span>
          </button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="space-y-6">
        {/* Cartões de Crédito/Débito */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <h2 className="text-xl font-semibold text-gray-900 text-center sm:text-left">Cartões Cadastrados</h2>
            <button
              onClick={() => setShowAddCard(true)}
              className="hidden sm:flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FiPlus size={16} />
              <span>Adicionar</span>
            </button>
          </div>

          <div className="space-y-4">
            {paymentMethods.filter(m => m.type !== 'pix').map((method) => (
              <div
                key={method.id}
                className={`border-2 rounded-xl p-4 transition-all ${
                  method.isDefault
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                    <div className="flex justify-center sm:justify-start">
                      <CardIcon brand={method.brand} className="w-12 h-12" />
                    </div>
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 justify-center sm:justify-start">
                        <p className="font-semibold text-gray-900 text-lg">
                          {method.type === 'credit' ? 'Cartão de Crédito' : 'Cartão de Débito'} 
                        </p>
                        {method.isDefault && (
                          <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full font-medium">
                            Padrão
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-base font-mono">**** {method.lastFour}</p>
                      <p className="text-sm text-gray-500 mt-1">{method.cardHolder} • Expira em {method.expiry}</p>
                      
                      {method.type === 'credit' && (
                        <div className="mt-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span className="font-medium">Limite disponível</span>
                            <span className="font-semibold text-green-600">R$ {(method.limit - method.used).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{ width: `${(method.used / method.limit) * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>Usado: R$ {method.used.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            <span>Total: R$ {method.limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-center lg:justify-start space-x-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100 lg:border-none">
                    {!method.isDefault && (
                      <button
                        onClick={() => setDefaultPayment(method.id)}
                        className="p-2 text-gray-400 hover:text-purple-600 transition-colors bg-white rounded-lg border border-gray-200 hover:border-purple-300"
                        title="Definir como padrão"
                      >
                        <FiStar size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => deletePaymentMethod(method.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors bg-white rounded-lg border border-gray-200 hover:border-red-300"
                      title="Remover cartão"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PIX */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center sm:text-left">Chaves PIX</h2>
          <div className="space-y-4">
            {paymentMethods.filter(m => m.type === 'pix').map((method) => (
              <div
                key={method.id}
                className="border-2 border-green-200 bg-green-50 rounded-xl p-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                    <div className="flex justify-center sm:justify-start">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <SiPix size={24} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <p className="font-semibold text-gray-900 text-lg">Chave PIX - {method.bank}</p>
                      <p className="text-gray-600 text-sm break-all mt-1">{method.key}</p>
                      <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">E-mail</span>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">Ativa</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center lg:justify-start pt-4 lg:pt-0">
                    <button
                      onClick={() => deletePaymentMethod(method.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors bg-white rounded-lg border border-gray-200 hover:border-red-300"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            <button className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center space-x-2 group bg-gray-50 hover:bg-gray-100">
              <FiPlus size={18} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Adicionar nova chave PIX</span>
            </button>
          </div>
        </div>

        {/* Últimas Transações */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 text-xl text-center sm:text-left">Minhas Compras</h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full mt-2 sm:mt-0">
              {transactions.length} itens
            </span>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 min-w-0 flex-1 mb-2 sm:mb-0">
                  <div className="flex justify-center sm:justify-start">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FiShoppingBag className="text-red-600" size={16} />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 text-center sm:text-left">
                    <p className="font-medium text-gray-900 text-sm">{transaction.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{transaction.paymentMethod}</p>
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <p className="font-bold text-gray-900">R$ {transaction.amount.toFixed(2)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)} font-medium inline-block mt-1`}>
                    {getStatusText(transaction.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumo e Segurança */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Estatísticas Rápidas */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg text-center sm:text-left">Resumo</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-gray-700 text-sm font-medium">Total gasto</span>
                <span className="font-bold text-red-600">R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl border border-purple-200">
                <span className="text-gray-700 text-sm font-medium">Compras realizadas</span>
                <span className="font-bold text-purple-600">{transactions.length}</span>
              </div>
            </div>
          </div>

          {/* Segurança */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <FiLock className="text-green-500" size={20} />
              <h3 className="font-semibold text-gray-900 text-lg">Segurança</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-gray-700 font-medium">Pagamentos seguros</span>
                <span className="text-green-600 font-bold">Ativo</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-gray-700 font-medium">Dados criptografados</span>
                <span className="text-green-600 font-bold">100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Adicionar Cartão */}
      {showAddCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="text-lg font-semibold text-gray-900">Adicionar Cartão</h3>
              <button
                onClick={() => setShowAddCard(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCard} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número do Cartão
                </label>
                <input
                  type="text"
                  value={formatCardNumber(newCard.number)}
                  onChange={(e) => setNewCard({
                    ...newCard,
                    number: e.target.value.replace(/\s/g, ''),
                    brand: getCardBrand(e.target.value.replace(/\s/g, ''))
                  })}
                  placeholder="1234 5678 9012 3456"
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  maxLength={19}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Titular
                </label>
                <input
                  type="text"
                  value={newCard.holder}
                  onChange={(e) => setNewCard({ ...newCard, holder: e.target.value })}
                  placeholder="JOÃO SILVA"
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Validade
                  </label>
                  <input
                    type="text"
                    value={newCard.expiry}
                    onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                    placeholder="MM/AA"
                    className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    maxLength={5}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={newCard.cvv}
                    onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                    placeholder="123"
                    className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    maxLength={3}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo do Cartão
                </label>
                <select
                  value={newCard.type}
                  onChange={(e) => setNewCard({ ...newCard, type: e.target.value })}
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                >
                  <option value="credit">Cartão de Crédito</option>
                  <option value="debit">Cartão de Débito</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddCard(false)}
                  className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
                >
                  <FiCheck size={16} />
                  <span>Adicionar Cartão</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTab;