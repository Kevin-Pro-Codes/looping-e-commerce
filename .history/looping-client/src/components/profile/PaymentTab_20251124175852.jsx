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
      cardHolder: 'KEVIN SANTOS',
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
      cardHolder: 'KEVIN SANTOS',
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
      cardHolder: 'KEVIN SANTOS',
      expiry: '05/27',
      isDefault: false,
      bank: 'Nubank'
    },
    {
      id: 4,
      type: 'pix',
      isDefault: false,
      bank: 'Itaú',
      key: 'kevin.santos@email.com'
    }
  ]);

  const [transactions, setTransactions] = useState([
    {
      id: 1,
      date: '2024-01-15',
      description: 'Compra Online - Looping Store',
      amount: 249.90,
      status: 'completed',
      paymentMethod: 'Cartão Visa ****4321',
      category: 'shopping'
    },
    {
      id: 2,
      date: '2024-01-12',
      description: 'Assinatura Premium',
      amount: 29.90,
      status: 'completed',
      paymentMethod: 'PIX',
      category: 'subscription'
    },
    {
      id: 3,
      date: '2024-01-10',
      description: 'Restaurante',
      amount: 89.50,
      status: 'pending',
      paymentMethod: 'Cartão Mastercard ****8765',
      category: 'food'
    },
    {
      id: 4,
      date: '2024-01-08',
      description: 'Supermercado',
      amount: 156.30,
      status: 'completed',
      paymentMethod: 'Cartão Visa ****1234',
      category: 'groceries'
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
    switch (category) {
      case 'shopping': return <FiShoppingBag className="text-blue-500" size={16} />;
      case 'subscription': return <FiStar className="text-purple-500" size={16} />;
      case 'food': return <FiPieChart className="text-orange-500" size={16} />;
      case 'groceries': return <FiShoppingBag className="text-green-500" size={16} />;
      default: return <FiDollarSign className="text-gray-500" size={16} />;
    }
  };

  const CardIcon = ({ brand, className = "w-8 h-8" }) => {
    const brands = {
      visa: (
        <div className={`bg-[#1A1F71] text-white rounded flex items-center justify-center ${className}`}>
          <span className="font-bold text-xs">VISA</span>
        </div>
      ),
      mastercard: (
        <div className={`bg-[#EB001B] text-white rounded flex items-center justify-center ${className}`}>
          <span className="font-bold text-xs">MC</span>
        </div>
      ),
      amex: (
        <div className={`bg-[#2E77BC] text-white rounded flex items-center justify-center ${className}`}>
          <span className="font-bold text-xs">AMEX</span>
        </div>
      )
    };

    return brands[brand] || brands.visa;
  };

  return (
    <div className="w-full space-y-6 p-4 sm:p-6">
      {/* Header Simplificado */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-xl sm:text-2xl font-bold mb-2">Meus Pagamentos</h1>
            <p className="text-blue-100 text-sm sm:text-base">Gerencie suas formas de pagamento e visualize suas transações</p>
          </div>
          <button
            onClick={() => setShowAddCard(true)}
            className="flex items-center justify-center space-x-2 bg-white text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg transition-colors w-full sm:w-auto"
          >
            <FiPlus size={18} />
            <span></span>
          </button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Coluna Esquerda - Métodos de Pagamento */}
        <div className="xl:col-span-2 space-y-6">
          {/* Cartões de Crédito/Débito */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Cartões Cadastrados</h2>
              <button
                onClick={() => setShowAddCard(true)}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors sm:hidden"
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
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start sm:items-center space-x-4">
                      <CardIcon brand={method.brand} className="w-10 h-10 sm:w-8 sm:h-8" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 text-sm sm:text-base">
                            {method.type === 'credit' ? 'Cartão de Crédito' : 'Cartão de Débito'} 
                            <span className="hidden sm:inline"> {method.brand.toUpperCase()}</span>
                          </p>
                          {method.isDefault && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full w-fit">
                              Padrão
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">**** {method.lastFour}</p>
                        <p className="text-xs sm:text-sm text-gray-500">{method.cardHolder} • Expira em {method.expiry}</p>
                        
                        {method.type === 'credit' && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1">
                              <span>Limite disponível</span>
                              <span>R$ {(method.limit - method.used).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all"
                                style={{ width: `${(method.used / method.limit) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end sm:justify-start space-x-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 sm:border-none">
                      {!method.isDefault && (
                        <button
                          onClick={() => setDefaultPayment(method.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Definir como padrão"
                        >
                          <FiStar size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => deletePaymentMethod(method.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Remover cartão"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PIX */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Chaves PIX</h2>
            <div className="space-y-4">
              {paymentMethods.filter(m => m.type === 'pix').map((method) => (
                <div
                  key={method.id}
                  className="border-2 border-green-200 bg-green-50 rounded-xl p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <SiPix size={20} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">Chave PIX - {method.bank}</p>
                        <p className="text-gray-600 text-sm break-all">{method.key}</p>
                        <p className="text-xs text-gray-500">Tipo: E-mail</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deletePaymentMethod(method.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors self-end sm:self-auto"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              
              <button className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center space-x-2">
                <FiPlus size={16} />
                <span className="text-sm sm:text-base">Adicionar nova chave PIX</span>
              </button>
            </div>
          </div>
        </div>

        {/* Coluna Direita - Transações e Estatísticas */}
        <div className="space-y-6">
          {/* Estatísticas Rápidas */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Resumo do Mês</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Gastos totais</span>
                <span className="font-semibold text-red-600 text-sm">R$ 525,60</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Cartão principal</span>
                <span className="font-semibold text-gray-900 text-sm">Visa ****4321</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Próxima fatura</span>
                <span className="font-semibold text-blue-600 text-sm">R$ 249,90</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Vencimento</span>
                <span className="font-semibold text-gray-900 text-sm">15/02/2024</span>
              </div>
            </div>
          </div>

          {/* Últimas Transações */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Últimas Transações</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {getCategoryIcon(transaction.category)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{transaction.description}</p>
                      <p className="text-xs text-gray-500 truncate">{transaction.paymentMethod}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="font-semibold text-gray-900 text-xs sm:text-sm">R$ {transaction.amount.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                      {getStatusText(transaction.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Segurança */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center space-x-3 mb-3">
              <FiLock className="text-green-500" size={16} />
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Segurança</h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-4">Seus dados de pagamento estão protegidos com criptografia de ponta a ponta.</p>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Verificação em duas etapas</span>
                <span className="text-green-600 font-semibold">Ativa</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Notificações</span>
                <span className="text-green-600 font-semibold">Ativas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Adicionar Cartão */}
      {showAddCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900"></h3>
              <button
                onClick={() => setShowAddCard(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCard} className="p-4 sm:p-6 space-y-4">
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                  placeholder="KEVIN SANTOS"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Validade
                  </label>
                  <input
                    type="text"
                    value={newCard.expiry}
                    onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                    placeholder="MM/AA"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="credit">Cartão de Crédito</option>
                  <option value="debit">Cartão de Débito</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddCard(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm"
                >
                  <FiCheck size={16} />
                  <span></span>
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