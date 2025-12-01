import React, { useState } from 'react';
import { 
  FiCreditCard, 
  FiPlus, 
  FiTrash2, 
  FiEdit, 
  FiCheck, 
  FiLock,
  FiStar,
  FiShoppingBag,
  FiDollarSign,
  FiPieChart,
  FiX
} from 'react-icons/fi';
import { SiPix } from 'react-icons/si';

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
    },
    {
      id: 4,
      date: '2024-01-08',
      description: 'Camiseta AC/DC - High Voltage',
      amount: 75.90,
      status: 'completed',
      paymentMethod: 'Cartão Visa ****1234',
      category: 'shopping'
    },
    {
      id: 5,
      date: '2024-01-05',
      description: 'Camiseta Guns N Roses - Appetite',
      amount: 82.90,
      status: 'completed',
      paymentMethod: 'Cartão Visa ****4321',
      category: 'shopping'
    },
    {
      id: 6,
      date: '2024-01-03',
      description: 'Camiseta Black Sabbath - Paranoid',
      amount: 71.90,
      status: 'completed',
      paymentMethod: 'PIX',
      category: 'shopping'
    },
    {
      id: 7,
      date: '2024-01-01',
      description: 'Camiseta Led Zeppelin - Swan Song',
      amount: 85.90,
      status: 'completed',
      paymentMethod: 'Cartão Visa ****4321',
      category: 'shopping'
    },
    {
      id: 8,
      date: '2023-12-28',
      description: 'Camiseta Pink Floyd - Dark Side',
      amount: 88.90,
      status: 'completed',
      paymentMethod: 'Cartão Mastercard ****8765',
      category: 'shopping'
    },
    {
      id: 9,
      date: '2023-12-25',
      description: 'Camiseta Ramones - Logo Clássico',
      amount: 65.90,
      status: 'completed',
      paymentMethod: 'PIX',
      category: 'shopping'
    },
    {
      id: 10,
      date: '2023-12-22',
      description: 'Camiseta The Rolling Stones - Tongue',
      amount: 78.90,
      status: 'completed',
      paymentMethod: 'Cartão Visa ****1234',
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

  const getCategoryIcon = (category) => {
    return <FiShoppingBag className="text-blue-500" size={18} />;
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

  return (
    <div className="w-full space-y-8 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-red-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Looping Pagamentos</h1>
            <p className="text-purple-100 text-base">Gerencie suas formas de pagamento e suas camisetas de rock</p>
          </div>
          <button
            onClick={() => setShowAddCard(true)}
            className="flex items-center justify-center bg-white text-purple-600 hover:bg-purple-50 p-3 rounded-lg transition-colors w-full sm:w-auto shadow-md"
          >
            <FiPlus size={20} />
          </button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="space-y-8">
        {/* Cartões de Crédito/Débito */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h2 className="text-xl font-semibold text-gray-900">Cartões Cadastrados</h2>
            <button
              onClick={() => setShowAddCard(true)}
              className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors sm:hidden"
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
                  <div className="flex items-start lg:items-center space-x-4 flex-1">
                    <CardIcon brand={method.brand} className="w-12 h-12" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-2 mb-2">
                        <p className="font-semibold text-gray-900 text-lg">
                          {method.type === 'credit' ? 'Cartão de Crédito' : 'Cartão de Débito'} 
                          <span className="hidden lg:inline ml-2 text-purple-600">{method.brand.toUpperCase()}</span>
                        </p>
                        {method.isDefault && (
                          <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full w-fit font-medium">
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
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-green-500 h-3 rounded-full transition-all"
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

                  <div className="flex items-center justify-end lg:justify-start space-x-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100 lg:border-none">
                    {!method.isDefault && (
                      <button
                        onClick={() => setDefaultPayment(method.id)}
                        className="p-3 text-gray-400 hover:text-purple-600 transition-colors bg-white rounded-lg border border-gray-200 hover:border-purple-300"
                        title="Definir como padrão"
                      >
                        <FiStar size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => deletePaymentMethod(method.id)}
                      className="p-3 text-gray-400 hover:text-red-600 transition-colors bg-white rounded-lg border border-gray-200 hover:border-red-300"
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Chaves PIX</h2>
          <div className="space-y-4">
            {paymentMethods.filter(m => m.type === 'pix').map((method) => (
              <div
                key={method.id}
                className="border-2 border-green-200 bg-green-50 rounded-xl p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex items-center space-x-6 flex-1">
                    <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <SiPix size={28} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-lg">Chave PIX - {method.bank}</p>
                      <p className="text-gray-600 text-base break-all mt-2">{method.key}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">E-mail</span>
                        <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">Ativa</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deletePaymentMethod(method.id)}
                    className="p-3 text-gray-400 hover:text-red-600 transition-colors bg-white rounded-lg border border-gray-200 hover:border-red-300 self-end lg:self-auto"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            
            <button className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center space-x-3 group bg-gray-50 hover:bg-gray-100">
              <FiPlus size={20} className="group-hover:scale-110 transition-transform" />
              <span className="text-base font-medium">Adicionar nova chave PIX</span>
            </button>
          </div>
        </div>

        {/* Últimas Transações - CAMISETAS DE ROCK */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900 text-xl">Minhas Camisetas de Rock</h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{transactions.length} camisetas</span>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100">
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiShoppingBag className="text-red-600" size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-base">{transaction.description}</p>
                    <p className="text-sm text-gray-500 mt-1">{transaction.paymentMethod}</p>
                    <p className="text-xs text-gray-400 mt-1">{transaction.date}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="font-bold text-gray-900 text-lg">R$ {transaction.amount.toFixed(2)}</p>
                  <span className={`text-sm px-3 py-1.5 rounded-full ${getStatusColor(transaction.status)} font-medium`}>
                    {getStatusText(transaction.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumo e Segurança */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Estatísticas Rápidas */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-6 text-lg">Coleção de Rock</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-gray-700 text-base font-medium">Total investido</span>
                <span className="font-bold text-red-600 text-lg">R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                <span className="text-gray-700 text-base font-medium">Camisetas adquiridas</span>
                <span className="font-bold text-purple-600 text-lg">{transactions.length}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl border border-green-200">
                <span className="text-gray-700 text-base font-medium">Última aquisição</span>
                <span className="font-bold text-green-600 text-base">15/01/2024</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                <span className="text-gray-700 text-base font-medium">Método preferido</span>
                <span className="font-bold text-blue-600 text-base">Cartão Visa</span>
              </div>
            </div>
          </div>

          {/* Segurança */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-4 mb-4">
              <FiLock className="text-green-500" size={24} />
              <h3 className="font-semibold text-gray-900 text-lg">Segurança Rock</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">Suas compras de camisetas de rock estão protegidas com segurança máxima.</p>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-gray-700 font-medium">Pagamentos seguros</span>
                <span className="text-green-600 font-bold">Ativo</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-gray-700 font-medium">Garantia Rock</span>
                <span className="text-green-600 font-bold">100%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                <span className="text-gray-700 font-medium">Proteção Metal</span>
                <span className="text-red-600 font-bold">Ativa</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Adicionar Cartão */}
      {showAddCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="text-xl font-semibold text-gray-900">Adicionar Cartão</h3>
              <button
                onClick={() => setShowAddCard(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCard} className="p-6 space-y-6">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-3">
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
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                  maxLength={19}
                  required
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-3">
                  Nome do Titular
                </label>
                <input
                  type="text"
                  value={newCard.holder}
                  onChange={(e) => setNewCard({ ...newCard, holder: e.target.value })}
                  placeholder="JOÃO SILVA"
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase text-base"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-3">
                    Validade
                  </label>
                  <input
                    type="text"
                    value={newCard.expiry}
                    onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                    placeholder="MM/AA"
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                    maxLength={5}
                    required
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-3">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={newCard.cvv}
                    onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                    placeholder="123"
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                    maxLength={3}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-3">
                  Tipo do Cartão
                </label>
                <select
                  value={newCard.type}
                  onChange={(e) => setNewCard({ ...newCard, type: e.target.value })}
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                >
                  <option value="credit">Cartão de Crédito</option>
                  <option value="debit">Cartão de Débito</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowAddCard(false)}
                  className="flex-1 py-4 px-6 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-base font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 px-6 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center space-x-3 text-base font-medium"
                >
                  <FiCheck size={20} />
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