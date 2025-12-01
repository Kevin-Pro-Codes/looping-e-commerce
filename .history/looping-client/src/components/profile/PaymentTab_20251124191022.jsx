import React, { useState, useEffect } from 'react';
import { 
  FiCreditCard, 
  FiPlus, 
  FiTrash2, 
  FiCheck, 
  FiLock,
  FiStar,
  FiShoppingBag,
  FiX,
  FiExternalLink
} from 'react-icons/fi';
import { SiPix } from 'react-icons/si';

// Skeleton Loading Component
const PaymentTabSkeleton = () => {
  return (
    <div className="w-full min-w-0 space-y-4 p-3 max-w-xl mx-auto animate-pulse">
      <div className="bg-gradient-to-r from-purple-600 to-red-700 rounded-xl p-4">
        <div className="text-center">
          <div className="h-6 bg-purple-500 rounded w-40 mx-auto mb-2"></div>
          <div className="h-4 bg-purple-400 rounded w-56 mx-auto"></div>
        </div>
      </div>
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
    </div>
  );
};

const PaymentTab = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Simular carregamento de métodos de pagamento do Stripe
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        setLoading(true);
        
        // Simular API call para buscar métodos do Stripe
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Dados mockados - na prática viriam do Stripe
        const mockPaymentMethods = [
          {
            id: 'pm_1ABC123',
            type: 'card',
            card: {
              brand: 'visa',
              last4: '4242',
              exp_month: 12,
              exp_year: 2025
            },
            isDefault: true
          },
          {
            id: 'pm_1DEF456',
            type: 'card',
            card: {
              brand: 'mastercard',
              last4: '8888',
              exp_month: 8,
              exp_year: 2026
            },
            isDefault: false
          }
        ];

        setPaymentMethods(mockPaymentMethods);
        
        // Simular transações
        const mockTransactions = [
          {
            id: 'pi_1XYZ789',
            date: '2024-01-15',
            description: 'Camiseta Metallica - Master of Puppets',
            amount: 89.90,
            status: 'succeeded',
            paymentMethod: 'Cartão Visa ****4242'
          },
          {
            id: 'pi_2ABC123',
            date: '2024-01-12',
            description: 'Camiseta Iron Maiden - Eddie Trooper',
            amount: 79.90,
            status: 'succeeded',
            paymentMethod: 'PIX'
          }
        ];
        
        setTransactions(mockTransactions);
        
      } catch (error) {
        console.error('Erro ao carregar métodos de pagamento:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPaymentMethods();
  }, []);

  // Integração com Stripe - Adicionar método de pagamento
  const handleStripeIntegration = async () => {
    try {
      setProcessing(true);
      
      // Na prática, você criaria um Setup Intent no backend
      // e redirecionaria para o Stripe Elements ou Checkout
      
      // Simulação de integração com Stripe
      console.log('Iniciando integração com Stripe...');
      
      // Aqui você implementaria:
      // 1. Criar Setup Intent no backend
      // 2. Inicializar Stripe Elements
      // 3. Coletar dados do cartão de forma segura
      // 4. Confirmar o Setup Intent
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular sucesso
      alert('Integração com Stripe - Em desenvolvimento');
      
    } catch (error) {
      console.error('Erro na integração com Stripe:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setProcessing(false);
      setShowStripeForm(false);
    }
  };

  // Remover método de pagamento do Stripe
  const detachPaymentMethod = async (paymentMethodId) => {
    if (!window.confirm('Tem certeza que deseja remover este cartão?')) {
      return;
    }

    try {
      // Na prática, você chamaria sua API para detach no Stripe
      console.log('Removendo método:', paymentMethodId);
      
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPaymentMethods(prev => 
        prev.filter(method => method.id !== paymentMethodId)
      );
      
      alert('Cartão removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover cartão:', error);
      alert('Erro ao remover cartão.');
    }
  };

  // Definir método padrão
  const setDefaultPayment = async (paymentMethodId) => {
    try {
      // Na prática, você atualizaria no Stripe Customer
      console.log('Definindo padrão:', paymentMethodId);
      
      setPaymentMethods(prev =>
        prev.map(method => ({
          ...method,
          isDefault: method.id === paymentMethodId
        }))
      );
      
      alert('Método de pagamento definido como padrão!');
    } catch (error) {
      console.error('Erro ao definir método padrão:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'succeeded': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'succeeded': return 'Concluído';
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
      ),
      amex: (
        <div className={`bg-[#016FD0] text-white rounded flex items-center justify-center ${size}`}>
          <span className="font-bold text-xs">AMEX</span>
        </div>
      )
    };
    return brands[brand] || brands.visa;
  };

  const totalSpent = transactions
    .filter(t => t.status === 'succeeded')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  if (loading) {
    return <PaymentTabSkeleton />;
  }

  return (
    <div className="w-full min-w-0 space-y-4 p-3 max-w-2xl mx-auto">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-red-700 rounded-xl p-4 text-white text-center">
        <h1 className="text-xl font-bold mb-2">Looping Pagamentos</h1>
        <p className="text-purple-100 text-sm mb-3">Pagamentos seguros com Stripe</p>
        <button
          onClick={() => setShowStripeForm(true)}
          disabled={processing}
          className="flex items-center justify-center bg-white text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg transition-colors w-full sm:w-auto mx-auto text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiPlus size={16} className="mr-2" />
          {processing ? 'Processando...' : 'Adicionar Cartão'}
        </button>
      </div>

      {/* Cartões do Stripe */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <h2 className="text-lg font-semibold text-gray-900 text-center sm:text-left">
            Meus Cartões
          </h2>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {paymentMethods.length} cartões
          </span>
        </div>

        {paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <FiCreditCard className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-500 mb-4">Nenhum cartão cadastrado</p>
            <button
              onClick={() => setShowStripeForm(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Adicionar Primeiro Cartão
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`border rounded-lg p-4 transition-all ${
                  method.isDefault
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 flex-1">
                    <CardIcon brand={method.card.brand} size="w-12 h-12" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">
                          Cartão de Crédito {method.card.brand.charAt(0).toUpperCase() + method.card.brand.slice(1)}
                        </p>
                        {method.isDefault && (
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
                            Padrão
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 font-mono text-sm">**** {method.card.last4}</p>
                      <p className="text-xs text-gray-500">
                        Expira em {String(method.card.exp_month).padStart(2, '0')}/{method.card.exp_year}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center sm:justify-start space-x-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 sm:border-none">
                    {!method.isDefault && (
                      <button
                        onClick={() => setDefaultPayment(method.id)}
                        className="p-2 text-gray-400 hover:text-purple-600 transition-colors bg-white rounded-lg border border-gray-200 hover:border-purple-300"
                        title="Definir como padrão"
                      >
                        <FiStar size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => detachPaymentMethod(method.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors bg-white rounded-lg border border-gray-200 hover:border-red-300"
                      title="Remover cartão"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Integração PIX */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Pagamento com PIX</h2>
        <div className="border border-green-200 bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <SiPix size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">PIX Instantâneo</p>
              <p className="text-gray-600 text-sm mt-1">
                Gere um QR code na finalização da compra para pagamento instantâneo
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                  Disponível 24h
                </span>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                  Sem taxas
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Histórico de Transações */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 text-lg">Histórico de Pagamentos</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mt-1 sm:mt-0">
            {transactions.length} transações
          </span>
        </div>
        
        {transactions.length === 0 ? (
          <div className="text-center py-6">
            <FiShoppingBag className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-500">Nenhuma transação encontrada</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                <div className="flex items-center space-x-3 min-w-0 flex-1 mb-2 sm:mb-0">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiShoppingBag className="text-red-600" size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{transaction.description}</p>
                    <p className="text-xs text-gray-500">{transaction.paymentMethod}</p>
                    <p className="text-xs text-gray-400">{transaction.date}</p>
                  </div>
                </div>
                <div className="text-center sm:text-right flex-shrink-0">
                  <p className="font-bold text-gray-900">R$ {transaction.amount.toFixed(2)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)} font-medium inline-block mt-1`}>
                    {getStatusText(transaction.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Segurança e Informações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-3">
            <FiLock className="text-green-500" size={20} />
            <h3 className="font-semibold text-gray-900">Segurança Stripe</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200">
              <span className="text-gray-700 font-medium">Dados criptografados</span>
              <span className="text-green-600 font-bold">Ativo</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200">
              <span className="text-gray-700 font-medium">Certificação PCI</span>
              <span className="text-green-600 font-bold">Nível 1</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-blue-50 rounded border border-blue-200">
              <span className="text-gray-700 font-medium">Proteção Stripe</span>
              <span className="text-blue-600 font-bold">Ativa</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Resumo</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-200">
              <span className="text-gray-700 font-medium">Total gasto</span>
              <span className="font-bold text-red-600">R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-purple-50 rounded border border-purple-200">
              <span className="text-gray-700 font-medium">Compras realizadas</span>
              <span className="font-bold text-purple-600">{transactions.length}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200">
              <span className="text-gray-700 font-medium">Método preferido</span>
              <span className="font-bold text-green-600 text-xs">
                {paymentMethods.find(m => m.isDefault)?.card.brand.toUpperCase() || 'Nenhum'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Integração Stripe */}
      {showStripeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
              <h3 className="text-lg font-semibold text-gray-900">Adicionar Cartão</h3>
              <button
                onClick={() => setShowStripeForm(false)}
                disabled={processing}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-4">
              <div className="text-center mb-6">
                <FiCreditCard className="mx-auto text-purple-600 mb-3" size={48} />
                <h4 className="font-semibold text-gray-900 mb-2">Pagamento Seguro com Stripe</h4>
                <p className="text-gray-600 text-sm">
                  Seus dados de cartão são processados diretamente pelo Stripe e nunca armazenados em nossos servidores.
                </p>
              </div>

              {/* Aqui você integraria o Stripe Elements */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
                <p className="text-gray-500 text-sm mb-3">
                  Integração com Stripe Elements
                </p>
                <div className="flex justify-center space-x-2 mb-3">
                  <div className="w-10 h-6 bg-[#1A1F71] rounded"></div>
                  <div className="w-10 h-6 bg-[#EB001B] rounded"></div>
                  <div className="w-10 h-6 bg-[#016FD0] rounded"></div>
                </div>
                <p className="text-xs text-gray-400">
                  Campos seguros para número do cartão, CVV e validade
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-start space-x-2">
                  <FiLock className="text-blue-500 mt-0.5 flex-shrink-0" size={16} />
                  <p className="text-blue-800 text-xs">
                    <strong>Segurança máxima:</strong> Seus dados são criptografados e processados pelo Stripe, 
                    líder mundial em pagamentos online.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStripeForm(false)}
                  disabled={processing}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleStripeIntegration}
                  disabled={processing}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 font-medium disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <FiExternalLink size={16} />
                      <span>Continuar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTab;