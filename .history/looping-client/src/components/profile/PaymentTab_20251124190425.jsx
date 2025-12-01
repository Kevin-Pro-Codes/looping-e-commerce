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
    <div className="w-full min-w-0 space-y-4 p-3 max-w-xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-purple-600 to-red-700 rounded-xl p-4">
        <div className="text-center">
          <div className="h-6 bg-purple-500 rounded w-40 mx-auto mb-2"></div>
          <div className="h-4 bg-purple-400 rounded w-56 mx-auto"></div>
        </div>
      </div>

      {/* Cartões Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
        <div className="h-5 bg-gray-200 rounded w-36 mx-auto mb-3"></div>
        <div className="space-y-3">
          {[1, 2].map((item) => (
            <div key={item} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PIX Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
        <div className="h-5 bg-gray-200 rounded w-28 mx-auto mb-3"></div>
        <div className="border border-green-200 bg-green-50 rounded-lg p-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-36"></div>
              <div className="h-3 bg-gray-200 rounded w-28"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Transações Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
        <div className="h-5 bg-gray-200 rounded w-40 mx-auto mb-3"></div>
        <div className="space-y-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center justify-between p-2 border border-gray-100 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                  <div className="h-2 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Resumo e Segurança Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="h-5 bg-gray-200 rounded w-28 mx-auto mb-3"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg border border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="h-5 bg-gray-200 rounded w-24 mx-auto mb-3"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg border border-gray-200">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-3 bg-gray-200 rounded w-10"></div>
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
      paymentMethod: 'Cartão Visa ****4321'
    },
    {
      id: 2,
      date: '2024-01-12',
      description: 'Camiseta Iron Maiden - Eddie Trooper',
      amount: 79.90,
      status: 'completed',
      paymentMethod: 'PIX'
    },
    {
      id: 3,
      date: '2024-01-10',
      description: 'Camiseta Nirvana - Nevermind',
      amount: 69.90,
      status: 'pending',
      paymentMethod: 'Cartão Mastercard ****8765'
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

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const getCardBrand = (number) => {
    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number)) return 'mastercard';
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

  const CardIcon = ({ brand, size = "w-10 h-10" }) => {
    const brands = {
      visa: (
        <div className={`bg-[#1A1F71] text-white rounded flex items-center justify-center ${size}`}>
          <span className="font-bold text-xs">VISA</span>
        </div>
      ),
      mastercard: (
        <div className={`bg-[#EB001B] text-white rounded flex items-center justify-center ${size}`}>
          <span className="font-bold text-xs">MC</span>
        </div>
      )
    };
    return brands[brand] || brands.visa;
  };

  const totalSpent = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  if (loading) {
    return <PaymentTabSkeleton />;
  }

  return (
    // ✅ Container principal otimizado
    <div className="w-full min-w-0 space-y-4 p-3 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-red-700 rounded-xl p-4 text-white text-center">
        <h1 className="text-xl font-bold mb-2">Looping Pagamentos</h1>
        <p className="text-purple-100 text-sm mb-3">Gerencie suas formas de pagamento</p>
        <button
          onClick={() => setShowAddCard(true)}
          className="flex items-center justify-center bg-white text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg transition-colors w-full sm:w-auto mx-auto text-sm font-medium"
        >
          <FiPlus size={16} className="mr-2" />
          Adicionar Cartão
        </button>
      </div>

      {/* Cartões de Crédito/Débito */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
          <h2 className="text-lg font-semibold text-gray-900 text-center sm:text-left">Cartões Cadastrados</h2>
          <button
            onClick={() => setShowAddCard(true)}
            className="hidden sm:flex items-center justify-center space-x-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-sm transition-colors"
          >
            <FiPlus size={14} />
            <span>Adicionar</span>
          </button>
        </div>

        <div className="space-y-3">
          {paymentMethods.filter(m => m.type !== 'pix').map((method) => (
            <div
              key={method.id}
              className={`border rounded-lg p-3 transition-all ${
                method.isDefault
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3 flex-1">
                  <CardIcon brand={method.brand} size="w-10 h-10" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 mb-1">
                      <p className="font-semibold text-gray-900 text-sm">
                        {method.type === 'credit' ? 'Cartão de Crédito' : 'Cartão de Débito'} 
                      </p>
                      {method.isDefault && (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full font-medium">
                          Padrão
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm font-mono">**** {method.lastFour}</p>
                    <p className="text-xs text-gray-500">{method.cardHolder} • Expira em {method.expiry}</p>
                    
                    {method.type === 'credit' && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span className="font-medium">Limite disponível</span>
                          <span className="font-semibold text-green-600">R$ {(method.limit - method.used).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-green-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${(method.used / method.limit) * 100}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Usado: R$ {method.used.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          <span>Total: R$ {method.limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-center sm:justify-start space-x-1 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 sm:border-none">
                  {!method.isDefault && (
                    <button
                      onClick={() => setDefaultPayment(method.id)}
                      className="p-1.5 text-gray-400 hover:text-purple-600 transition-colors bg-white rounded border border-gray-200 hover:border-purple-300"
                      title="Definir como padrão"
                    >
                      <FiStar size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => deletePaymentMethod(method.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors bg-white rounded border border-gray-200 hover:border-red-300"
                    title="Remover cartão"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PIX */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
        <h2 className="text-lg font-semibold text-gray-900 text-center sm:text-left mb-3">Chaves PIX</h2>
        <div className="space-y-3">
          {paymentMethods.filter(m => m.type === 'pix').map((method) => (
            <div key={method.id} className="border border-green-200 bg-green-50 rounded-lg p-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <SiPix size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">Chave PIX - {method.bank}</p>
                    <p className="text-gray-600 text-xs break-all mt-1">{method.key}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium">E-mail</span>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-medium">Ativa</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center sm:justify-start pt-2 sm:pt-0">
                  <button
                    onClick={() => deletePaymentMethod(method.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors bg-white rounded border border-gray-200 hover:border-red-300"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          <button className="w-full border border-dashed border-gray-300 rounded-lg p-3 text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center space-x-2 group bg-gray-50 hover:bg-gray-100">
            <FiPlus size={16} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Adicionar nova chave PIX</span>
          </button>
        </div>
      </div>

      {/* Últimas Transações */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-lg text-center sm:text-left">Minhas Compras</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mt-1 sm:mt-0">
            {transactions.length} itens
          </span>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
              <div className="flex items-center space-x-2 min-w-0 flex-1 mb-2 sm:mb-0">
                <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
                  <FiShoppingBag className="text-red-600" size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{transaction.description}</p>
                  <p className="text-xs text-gray-500">{transaction.paymentMethod}</p>
                  <p className="text-xs text-gray-400">{transaction.date}</p>
                </div>
              </div>
              <div className="text-center sm:text-right flex-shrink-0">
                <p className="font-bold text-gray-900 text-sm">R$ {transaction.amount.toFixed(2)}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(transaction.status)} font-medium inline-block mt-0.5`}>
                  {getStatusText(transaction.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resumo e Segurança */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Estatísticas Rápidas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <h3 className="font-semibold text-gray-900 text-center sm:text-left mb-3">Resumo</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-gray-700 text-sm font-medium">Total investido</span>
              <span className="font-bold text-red-600">R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg border border-purple-200">
              <span className="text-gray-700 text-sm font-medium">Compras realizadas</span>
              <span className="font-bold text-purple-600">{transactions.length}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg border border-green-200">
              <span className="text-gray-700 text-sm font-medium">Última compra</span>
              <span className="font-bold text-green-600 text-xs">15/01/2024</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-gray-700 text-sm font-medium">Método preferido</span>
              <span className="font-bold text-blue-600 text-xs">Cartão Visa</span>
            </div>
          </div>
        </div>

        {/* Segurança */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center space-x-2 mb-3">
            <FiLock className="text-green-500" size={18} />
            <h3 className="font-semibold text-gray-900">Segurança</h3>
          </div>
          <p className="text-xs text-gray-600 mb-3 leading-relaxed">
            Suas compras estão protegidas com segurança máxima.
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200">
              <span className="text-gray-700 font-medium">Pagamentos seguros</span>
              <span className="text-green-600 font-bold">Ativo</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200">
              <span className="text-gray-700 font-medium">Garantia</span>
              <span className="text-green-600 font-bold">100%</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-red-50 rounded border border-red-200">
              <span className="text-gray-700 font-medium">Proteção</span>
              <span className="text-red-600 font-bold">Ativa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Adicionar Cartão */}
      {showAddCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl w-full max-w-sm max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-3 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
              <h3 className="text-lg font-semibold text-gray-900">Adicionar Cartão</h3>
              <button
                onClick={() => setShowAddCard(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCard} className="p-3 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número do Cartão</label>
                <input
                  type="text"
                  value={formatCardNumber(newCard.number)}
                  onChange={(e) => setNewCard({
                    ...newCard,
                    number: e.target.value.replace(/\s/g, ''),
                    brand: getCardBrand(e.target.value.replace(/\s/g, ''))
                  })}
                  placeholder="1234 5678 9012 3456"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-transparent text-sm"
                  maxLength={19}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Titular</label>
                <input
                  type="text"
                  value={newCard.holder}
                  onChange={(e) => setNewCard({ ...newCard, holder: e.target.value })}
                  placeholder="JOÃO SILVA"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-transparent uppercase text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Validade</label>
                  <input
                    type="text"
                    value={newCard.expiry}
                    onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                    placeholder="MM/AA"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-transparent text-sm"
                    maxLength={5}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input
                    type="text"
                    value={newCard.cvv}
                    onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                    placeholder="123"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-transparent text-sm"
                    maxLength={3}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo do Cartão</label>
                <select
                  value={newCard.type}
                  onChange={(e) => setNewCard({ ...newCard, type: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-transparent text-sm"
                >
                  <option value="credit">Cartão de Crédito</option>
                  <option value="debit">Cartão de Débito</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddCard(false)}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-1 text-sm font-medium"
                >
                  <FiCheck size={14} />
                  <span>Adicionar</span>
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