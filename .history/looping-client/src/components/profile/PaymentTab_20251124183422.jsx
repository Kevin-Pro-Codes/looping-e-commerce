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
    <div className="w-full min-w-0 space-y-4 p-3 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-purple-600 to-red-700 rounded-xl p-4">
        <div className="text-center">
          <div className="h-6 bg-purple-500 rounded w-40 mx-auto mb-2"></div>
          <div className="h-4 bg-purple-400 rounded w-56 mx-auto"></div>
        </div>
      </div>

      {/* Cartões Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
        <div className="h-5 bg-gray-200 rounded w-32 mx-auto mb-3"></div>
        <div className="space-y-3">
          {[1, 2].map((item) => (
            <div key={item} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-28"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PIX Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
        <div className="h-5 bg-gray-200 rounded w-24 mx-auto mb-3"></div>
        <div className="border border-green-200 bg-green-50 rounded-lg p-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Transações Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
        <div className="h-5 bg-gray-200 rounded w-36 mx-auto mb-3"></div>
        <div className="space-y-2">
          {[1, 2].map((item) => (
            <div key={item} className="flex items-center justify-between p-2 border border-gray-100 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-2 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Resumo Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
        <div className="h-5 bg-gray-200 rounded w-24 mx-auto mb-3"></div>
        <div className="grid grid-cols-2 gap-2">
          {[1, 2].map((item) => (
            <div key={item} className="bg-gray-50 rounded-lg p-2 text-center">
              <div className="h-4 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
            </div>
          ))}
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
      type: 'debit',
      brand: 'visa',
      lastFour: '1234',
      cardHolder: 'JOÃO SILVA',
      expiry: '05/27',
      isDefault: false,
      bank: 'Nubank'
    }
  ]);

  const [transactions, setTransactions] = useState([
    {
      id: 1,
      date: '2024-01-15',
      description: 'Camiseta Metallica',
      amount: 89.90,
      status: 'completed',
      paymentMethod: 'Cartão Visa ****4321'
    },
    {
      id: 2,
      date: '2024-01-12',
      description: 'Camiseta Iron Maiden',
      amount: 79.90,
      status: 'completed',
      paymentMethod: 'PIX'
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
    const timer = setTimeout(() => setLoading(false), 1200);
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
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  const CardIcon = ({ brand, size = "w-8 h-8" }) => {
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

  // Calcular total gasto
  const totalSpent = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  if (loading) {
    return <PaymentTabSkeleton />;
  }

  return (
    <div className="w-full min-w-0 space-y-4 p-3">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-red-700 rounded-xl p-4 text-white text-center">
        <h1 className="text-xl font-bold mb-1">Pagamentos</h1>
        <p className="text-purple-100 text-sm">Gerencie suas formas de pagamento</p>
        <button
          onClick={() => setShowAddCard(true)}
          className="mt-3 flex items-center justify-center bg-white text-purple-600 hover:bg-purple-50 px-3 py-2 rounded-lg transition-colors w-full max-w-xs mx-auto text-sm font-medium"
        >
          <FiPlus size={16} className="mr-1" />
          Adicionar Cartão
        </button>
      </div>

      {/* Cartões de Crédito/Débito */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
        <h2 className="text-lg font-semibold text-gray-900 text-center mb-3">Cartões</h2>
        <div className="space-y-2">
          {paymentMethods.filter(m => m.type !== 'pix').map((method) => (
            <div
              key={method.id}
              className={`border rounded-lg p-3 transition-all ${
                method.isDefault
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1">
                  <CardIcon brand={method.brand} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {method.type === 'credit' ? 'Crédito' : 'Débito'} •••• {method.lastFour}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{method.cardHolder}</p>
                    {method.isDefault && (
                      <span className="bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5 rounded-full">
                        Padrão
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-1">
                  {!method.isDefault && (
                    <button
                      onClick={() => setDefaultPayment(method.id)}
                      className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                      title="Definir como padrão"
                    >
                      <FiStar size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => deletePaymentMethod(method.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
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
        <h2 className="text-lg font-semibold text-gray-900 text-center mb-3">PIX</h2>
        <div className="space-y-2">
          {paymentMethods.filter(m => m.type === 'pix').map((method) => (
            <div key={method.id} className="border border-green-200 bg-green-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <SiPix size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">PIX - {method.bank}</p>
                    <p className="text-xs text-gray-600 truncate">{method.key}</p>
                  </div>
                </div>
                <button
                  onClick={() => deletePaymentMethod(method.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          
          <button className="w-full border border-dashed border-gray-300 rounded-lg p-3 text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center space-x-1 text-sm bg-gray-50">
            <FiPlus size={14} />
            <span>Adicionar PIX</span>
          </button>
        </div>
      </div>

      {/* Últimas Transações */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Minhas Compras</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {transactions.length}
          </span>
        </div>
        <div className="space-y-2">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
                  <FiShoppingBag className="text-red-600" size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{transaction.description}</p>
                  <p className="text-xs text-gray-500">{transaction.date}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-900 text-sm">R$ {transaction.amount.toFixed(2)}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(transaction.status)} font-medium`}>
                  {getStatusText(transaction.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resumo */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
        <h3 className="text-lg font-semibold text-gray-900 text-center mb-3">Resumo</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-2xl font-bold text-purple-600">{transactions.length}</p>
            <p className="text-xs text-gray-600">Compras</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-2xl font-bold text-green-600">R$ {totalSpent.toFixed(0)}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
        </div>
      </div>

      {/* Segurança */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <FiLock className="text-green-500" size={16} />
          <h3 className="text-lg font-semibold text-gray-900">Segurança</h3>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200">
            <span className="text-gray-700">Pagamentos seguros</span>
            <span className="text-green-600 font-bold">Ativo</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200">
            <span className="text-gray-700">Dados protegidos</span>
            <span className="text-green-600 font-bold">100%</span>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-transparent text-sm"
                  maxLength={19}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Titular
                </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Validade
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo do Cartão
                </label>
                <select
                  value={newCard.type}
                  onChange={(e) => setNewCard({ ...newCard, type: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-transparent text-sm"
                >
                  <option value="credit">Cartão de Crédito</option>
                  <option value="debit">Cartão de Débito</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
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