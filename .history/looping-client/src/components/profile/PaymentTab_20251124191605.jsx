import React, { useState, useEffect } from 'react';
import { 
  FiPlus, 
  FiLock,
  FiShoppingBag,
  FiX,
  FiCheck,
  FiShield
} from 'react-icons/fi';
import { SiPix } from 'react-icons/si';

// Skeleton Loading Component
const PaymentTabSkeleton = () => {
  return (
    <div className="w-full min-w-0 space-y-4 p-3 max-w-xl mx-auto animate-pulse">
      <div className="bg-gradient-to-r from-green-600 to-blue-700 rounded-xl p-4">
        <div className="text-center">
          <div className="h-6 bg-green-500 rounded w-40 mx-auto mb-2"></div>
          <div className="h-4 bg-green-400 rounded w-56 mx-auto"></div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
        <div className="h-5 bg-gray-200 rounded w-36 mx-auto mb-3"></div>
        <div className="space-y-3">
          {[1].map((item) => (
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
  const [loading, setLoading] = useState(true);
  const [pixKeys, setPixKeys] = useState([]);

  // Simular carregamento
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      
      // Dados mockados das chaves PIX
      setPixKeys([
        {
          id: 1,
          type: 'email',
          key: 'cliente@email.com',
          isDefault: true,
          createdAt: '2024-01-15'
        },
        {
          id: 2,
          type: 'cpf',
          key: '123.456.789-00',
          isDefault: false,
          createdAt: '2024-01-10'
        }
      ]);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Adicionar nova chave PIX
  const addPixKey = () => {
    const newKey = {
      id: Date.now(),
      type: 'email',
      key: 'nova.chave@email.com',
      isDefault: false,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setPixKeys(prev => [...prev, newKey]);
    alert('Chave PIX adicionada com sucesso!');
  };

  // Remover chave PIX
  const removePixKey = (id) => {
    if (!window.confirm('Tem certeza que deseja remover esta chave PIX?')) return;
    
    setPixKeys(prev => prev.filter(key => key.id !== id));
    alert('Chave PIX removida!');
  };

  // Definir chave PIX como padrão
  const setDefaultPix = (id) => {
    setPixKeys(prev =>
      prev.map(key => ({
        ...key,
        isDefault: key.id === id
      }))
    );
    alert('Chave PIX definida como padrão!');
  };

  if (loading) {
    return <PaymentTabSkeleton />;
  }

  return (
    <div className="w-full min-w-0 space-y-4 p-3 max-w-2xl mx-auto">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-700 rounded-xl p-4 text-white text-center">
        <div className="flex items-center justify-center mb-2">
          <SiPix size={32} className="mr-3" />
          <h1 className="text-2xl font-bold">Looping PIX</h1>
        </div>
        <p className="text-green-100 text-sm mb-3">Pagamentos instantâneos e seguros</p>
        <button
          onClick={addPixKey}
          className="flex items-center justify-center bg-white text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg transition-colors text-sm font-medium mx-auto"
        >
          <FiPlus size={16} className="mr-2" />
          Adicionar Chave PIX
        </button>
      </div>

      {/* Seção PIX */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <h2 className="text-lg font-semibold text-gray-900 text-center sm:text-left">
            Minhas Chaves PIX
          </h2>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {pixKeys.length} chaves cadastradas
          </span>
        </div>

        {pixKeys.length === 0 ? (
          <div className="text-center py-8">
            <SiPix className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-500 mb-4">Nenhuma chave PIX cadastrada</p>
            <button
              onClick={addPixKey}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Adicionar Primeira Chave
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {pixKeys.map((pix) => (
              <div
                key={pix.id}
                className={`border rounded-lg p-4 transition-all ${
                  pix.isDefault
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <SiPix size={24} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">
                          Chave PIX - {pix.type.toUpperCase()}
                        </p>
                        {pix.isDefault && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                            Padrão
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm font-mono break-all">{pix.key}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Cadastrada em {pix.createdAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center sm:justify-start space-x-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 sm:border-none">
                    {!pix.isDefault && (
                      <button
                        onClick={() => setDefaultPix(pix.id)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors bg-white rounded-lg border border-gray-200 hover:border-green-300"
                        title="Definir como padrão"
                      >
                        <FiCheck size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => removePixKey(pix.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors bg-white rounded-lg border border-gray-200 hover:border-red-300"
                      title="Remover chave"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vantagens do PIX */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3 text-center">Por que usar PIX?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <FiCheck className="text-white" size={16} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">Instantâneo</h4>
              <p className="text-xs text-gray-600">Pagamentos confirmados em segundos</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <FiCheck className="text-white" size={16} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">Sem Taxas</h4>
              <p className="text-xs text-gray-600">Nenhum custo adicional para você</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <FiCheck className="text-white" size={16} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">24/7</h4>
              <p className="text-xs text-gray-600">Disponível a qualquer hora</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <FiShield className="text-white" size={16} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">Seguro</h4>
              <p className="text-xs text-gray-600">Transações protegidas pelo Banco Central</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tipos de Chave PIX */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3 text-center">Tipos de Chave PIX</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
          <div className="p-3 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 font-bold text-xs">@</span>
            </div>
            <h4 className="font-semibold text-gray-900 text-xs">E-mail</h4>
          </div>
          <div className="p-3 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-purple-600 font-bold text-xs">#</span>
            </div>
            <h4 className="font-semibold text-gray-900 text-xs">CPF/CNPJ</h4>
          </div>
          <div className="p-3 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-red-600 font-bold text-xs">📱</span>
            </div>
            <h4 className="font-semibold text-gray-900 text-xs">Celular</h4>
          </div>
          <div className="p-3 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-yellow-600 font-bold text-xs">🔑</span>
            </div>
            <h4 className="font-semibold text-gray-900 text-xs">Aleatória</h4>
          </div>
        </div>
      </div>

      {/* Segurança */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <FiShield className="text-green-500" size={20} />
          <h3 className="font-semibold text-gray-900">Segurança PIX</h3>
        </div>
        <div className="text-center">
          <p className="text-gray-600 text-sm mb-4">
            Todas as transações PIX são protegidas pelo Banco Central do Brasil e utilizam 
            criptografia de última geração para garantir sua segurança.
          </p>
          <div className="flex justify-center space-x-4 text-xs text-gray-500">
            <span className="bg-gray-100 px-2 py-1 rounded">🔒 Criptografado</span>
            <span className="bg-gray-100 px-2 py-1 rounded">🏦 Regulado pelo BC</span>
            <span className="bg-gray-100 px-2 py-1 rounded">🛡️ Protegido</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentTab;