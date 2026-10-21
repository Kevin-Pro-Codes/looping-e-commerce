import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiCreditCard, FiDollarSign, FiArrowRight, FiLock, FiCheck, FiCopy, FiArrowLeft, FiUser, FiTruck, FiCreditCard as FiCard, FiFileText, FiShoppingCart, FiCalendar, FiMapPin } from 'react-icons/fi';
import { SiPix } from 'react-icons/si';
import { IoReload } from "react-icons/io5";

// ✅ SIMPLIFIED CSRF Token Management
const CsrfTokenManager = {
  getCsrfToken: async () => {
    try {
      console.log('🔄 Fetching CSRF token...');

      const response = await fetch('/sanctum/csrf-cookie', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const cookies = document.cookie;
        const tokenMatch = cookies.match(/XSRF-TOKEN=([^;]+)/);

        if (tokenMatch && tokenMatch[1]) {
          const token = decodeURIComponent(tokenMatch[1]);
          console.log('✅ CSRF token obtained');
          return token;
        }
      }

      const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      return metaToken || 'fallback-csrf-token';

    } catch (error) {
      console.error('❌ Error getting CSRF token:', error);
      return 'fallback-csrf-token';
    }
  }
};

// ✅ Color Utility Functions
const getEnglishColorName = (colorValue) => {
  if (!colorValue || colorValue === 'undefined') return 'Não especificada';

  // Convert to lowercase and trim
  const color = colorValue.toString().toLowerCase().trim();

  // Map of color values to Portuguese names
  const colorMap = {
    // Hex codes
    '#000000': 'Preto',
    '#000': 'Preto',
    '#fff': 'Branco',
    '#ffffff': 'Branco',
    '#1e90ff': 'Azul',
    '#ff69b4': 'Rosa',
    '#ff0000': 'Vermelho',
    '#00ff00': 'Verde',
    '#0000ff': 'Azul Escuro',
    '#ffff00': 'Amarelo',
    '#ffa500': 'Laranja',
    '#800080': 'Roxo',
    '#808080': 'Cinza',
    '#964b00': 'Marrom',
    '#a52a2a': 'Marrom',
    '#c0c0c0': 'Prata',
    '#ffd700': 'Dourado',
    '#008080': 'Verde-água',
    '#4b0082': 'Anil',
    '#ee82ee': 'Violeta',
    '#ffc0cb': 'Rosa Claro',
    '#87ceeb': 'Azul Celeste',
    '#32cd32': 'Verde Lima',
    '#ff4500': 'Vermelho Alaranjado',
    '#da70d6': 'Orquídea',
    '#f0e68c': 'Cáqui',
    '#d2691e': 'Chocolate',

    // Portuguese color names
    'preto': 'Preto',
    'branco': 'Branco',
    'azul': 'Azul',
    'rosa': 'Rosa',
    'vermelho': 'Vermelho',
    'verde': 'Verde',
    'amarelo': 'Amarelo',
    'laranja': 'Laranja',
    'roxo': 'Roxo',
    'cinza': 'Cinza',
    'marrom': 'Marrom',
    'prata': 'Prata',
    'dourado': 'Dourado',
    'bege': 'Bege',
    'vinho': 'Vinho',
    'lilás': 'Lilás',
    'turquesa': 'Turquesa',
    'coral': 'Coral',

    // English color names (translate to Portuguese)
    'black': 'Preto',
    'white': 'Branco',
    'blue': 'Azul',
    'pink': 'Rosa',
    'red': 'Vermelho',
    'green': 'Verde',
    'yellow': 'Amarelo',
    'orange': 'Laranja',
    'purple': 'Roxo',
    'gray': 'Cinza',
    'grey': 'Cinza',
    'brown': 'Marrom',
    'silver': 'Prata',
    'gold': 'Dourado',
    'teal': 'Verde-água',
    'indigo': 'Anil',
    'violet': 'Violeta',
    'light pink': 'Rosa Claro',
    'sky blue': 'Azul Celeste',
    'lime green': 'Verde Lima',
    'orange red': 'Vermelho Alaranjado',
    'orchid': 'Orquídea',
    'khaki': 'Cáqui',
    'chocolate': 'Chocolate',
    'beige': 'Bege',
    'burgundy': 'Vinho',
    'lilac': 'Lilás',
    'turquoise': 'Turquesa',
    'coral': 'Coral',
  };

  // Check for exact match first
  if (colorMap[color]) {
    return colorMap[color];
  }

  // Remove # for hex code matching
  const cleanColor = color.replace('#', '');
  if (colorMap[`#${cleanColor}`]) {
    return colorMap[`#${cleanColor}`];
  }

  // Check for partial matches
  for (const [key, value] of Object.entries(colorMap)) {
    if (color.includes(key) || key.includes(color)) {
      return value;
    }
  }

  // If it's a valid hex code, keep it as hex
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(colorValue)) {
    return colorValue.toUpperCase();
  }

  // Capitalize first letter for unknown colors
  return color.charAt(0).toUpperCase() + color.slice(1);
};

const getColorForSwatch = (colorName) => {
  const colorMap = {
    'Preto': '#000000',
    'Branco': '#FFFFFF',
    'Azul': '#1E90FF',
    'Rosa': '#FF69B4',
    'Vermelho': '#FF0000',
    'Verde': '#00FF00',
    'Amarelo': '#FFFF00',
    'Laranja': '#FFA500',
    'Roxo': '#800080',
    'Cinza': '#808080',
    'Marrom': '#964B00',
    'Prata': '#C0C0C0',
    'Dourado': '#FFD700',
    'Verde-água': '#008080',
    'Anil': '#4B0082',
    'Violeta': '#EE82EE',
    'Rosa Claro': '#FFC0CB',
    'Azul Celeste': '#87CEEB',
    'Verde Lima': '#32CD32',
    'Vermelho Alaranjado': '#FF4500',
    'Orquídea': '#DA70D6',
    'Cáqui': '#F0E68C',
    'Chocolate': '#D2691E',
    'Bege': '#F5F5DC',
    'Vinho': '#800020',
    'Lilás': '#C8A2C8',
    'Turquesa': '#40E0D0',
    'Coral': '#FF7F50',
  };

  return colorMap[colorName] || '#ccc';
};

// ✅ SIMPLIFIED Backend API Service
const OrderAPI = {
  createOrder: async (orderData) => {
    try {
      const csrfToken = await CsrfTokenManager.getCsrfToken();

      const response = await fetch('/api/infos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Order creation failed');
      }

      return result;
    } catch (error) {
      console.error('❌ Order API Error:', error);
      throw error;
    }
  },

  updateOrderStatus: async (orderId, status, paymentStatus) => {
    try {
      const csrfToken = await CsrfTokenManager.getCsrfToken();

      const response = await fetch(`/api/infos/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({
          status: status,
          payment_status: paymentStatus
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Status update failed');
      }

      return result;
    } catch (error) {
      console.error('❌ Order Status Update Error:', error);
      throw error;
    }
  }
};

// ✅ Step Indicator Component
const StepIndicator = ({ currentStep, goToStep }) => (
  <div className="flex items-center justify-center mb-8 mt-10" style={{ fontFamily: 'Calibri, sans-serif' }}>
    {[
      { number: 1, label: 'Dados', icon: FiUser },
      { number: 2, label: 'Entrega', icon: FiTruck },
      { number: 3, label: 'Pagamento', icon: FiCard },
      { number: 4, label: 'Confirmação', icon: FiCheck }
    ].map((step, index) => (
      <React.Fragment key={step.number}>
        <button
          onClick={() => goToStep(step.number)}
          className={`flex flex-col items-center group ${step.number <= currentStep ? 'text-green-600' : 'text-gray-400'
            }`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${step.number <= currentStep
              ? 'bg-green-600 border-green-600 text-white'
              : 'border-gray-300 group-hover:border-gray-400'
            }`}>
            {step.number < currentStep ? (
              <step.icon size={18} />
            ) : step.number === currentStep ? (
              <step.icon size={18} />
            ) : (
              step.number
            )}
          </div>
          <span className="text-xs mt-2 font-medium">
            {step.label}
          </span>
          {step.number <= currentStep && (
            <div className="w-2 h-2 bg-green-600 rounded-full mt-1" />
          )}
        </button>
        {index < 3 && (
          <div className={`w-16 h-1 mx-2 ${step.number < currentStep ? 'bg-green-600' : 'bg-gray-300'
            }`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

// ✅ CustomerStep Component
const CustomerStep = ({
  customerData,
  setCustomerData,
  isProfileLoaded,
  fetchUserProfile,
  nextStep
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Dados Pessoais</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Passo 1 de 4</span>
          <button
            onClick={fetchUserProfile}
            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors flex items-center gap-1"
          >
            <IoReload size={12} />
            Recarregar
          </button>
        </div>
      </div>

      {!isProfileLoaded ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seus dados...</p>
        </div>
      ) : (
        <>
          {customerData.name && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Dados do Perfil Carregados</h3>
              <div className="border-2 border-green-500 bg-green-50 rounded-lg p-4 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-20">Nome:</span>
                        <span className="text-green-900 font-semibold -ml-7">{customerData.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-20">E-mail:</span>
                        <span className="text-green-900 font-semibold -ml-7">{customerData.email}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-20">Telefone:</span>
                        <span className="text-green-900 font-semibold -ml-3.5">{customerData.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-20">CPF:</span>
                        <span className="text-green-900 font-semibold -ml-11">{customerData.cpf}</span>
                      </div>
                    </div>
                    <p className="text-sm text-green-700 mt-3">
                      Seus dados foram carregados automaticamente. Você pode editá-los abaixo se necessário.
                    </p>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-green-500 bg-green-500 flex items-center justify-center ml-4 flex-shrink-0">
                    <FiCheck size={14} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                value={customerData.name}
                onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail *
              </label>
              <input
                type="email"
                value={customerData.email}
                onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone *
              </label>
              <input
                type="tel"
                value={customerData.phone}
                onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF *
              </label>
              <input
                type="text"
                value={customerData.cpf}
                onChange={(e) => setCustomerData(prev => ({ ...prev, cpf: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                placeholder="000.000.000-00"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={nextStep}
              disabled={!customerData.name || !customerData.email || !customerData.phone || !customerData.cpf}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-8 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              Continuar para Entrega
              <FiArrowRight />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ✅ CEP Input Component
const CepInput = ({
  cep,
  onCepChange,
  loading,
  shippingData,
  onAutoFillAddress
}) => {
  const [isValidCep, setIsValidCep] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleCepChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    let formattedCep = value;

    if (value.length > 5) {
      formattedCep = value.substring(0, 5) + '-' + value.substring(5, 8);
    }

    onCepChange(formattedCep);

    const hasValidLength = value.length === 8;
    setIsValidCep(hasValidLength);

    if (value.length > 0 && !hasValidLength && value.length < 8) {
      setShowError(false);
    } else {
      setShowError(value.length > 0 && !hasValidLength);
    }
  };

  const handleCepBlur = () => {
    const cleanCep = cep.replace(/\D/g, '');
    const hasValidLength = cleanCep.length === 8;

    setShowError(cleanCep.length > 0 && !hasValidLength);

    if (hasValidLength) {
      onAutoFillAddress(cep);
    }
  };

  const getMissingDigits = () => {
    const cleanCep = cep.replace(/\D/g, '');
    return 8 - cleanCep.length;
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <FiMapPin className="text-blue-600" size={20} />
        <h3 className="text-lg font-semibold text-gray-800">Calcular Frete</h3>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Digite seu CEP
          </label>
          <div className="relative">
            <input
              type="text"
              value={cep}
              onChange={handleCepChange}
              onBlur={handleCepBlur}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black pr-24"
              placeholder="00000-000"
              maxLength={9}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              {loading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              )}
            </div>
          </div>

          {showError && (
            <p className="text-red-500 text-xs mt-1">CEP deve ter 8 dígitos</p>
          )}

          {cep && cep.replace(/\D/g, '').length > 0 && cep.replace(/\D/g, '').length < 8 && !showError && (
            <p className="text-gray-500 text-xs mt-1">
              Digite mais {getMissingDigits()} dígito{getMissingDigits() !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {shippingData.cep && isValidCep && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <FiCheck className="text-green-600" size={16} />
            <span className="text-green-800 text-sm font-medium">
              CEP {shippingData.cep} válido
            </span>
          </div>
          {shippingData.city && shippingData.state && (
            <p className="text-green-700 text-sm mt-1">
              {shippingData.city} - {shippingData.state}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ✅ ShippingStep Component
const ShippingStep = ({
  shippingData,
  setShippingData,
  userAddresses,
  selectedAddressId,
  handleAddressSelect,
  fetchUserAddresses,
  selectedShipping,
  onShippingSelect,
  cartItems,
  prevStep,
  nextStep
}) => {
  const [cepLoading, setCepLoading] = useState(false);

  const fetchAddressByCEP = async (cep) => {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length !== 8) return;

    setCepLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setShippingData(prev => ({
          ...prev,
          street: data.logradouro || '',
          hood: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || '',
          cep: data.cep || cleanCEP
        }));
      } else {
        console.log('CEP não encontrado');
      }
    } catch (error) {
      console.error('Error fetching CEP:', error);
    } finally {
      setCepLoading(false);
    }
  };

  const handleCepChange = (cep) => {
    setShippingData(prev => ({ ...prev, cep }));
  };

  const handleCepBlur = () => {
    const cleanCep = shippingData.cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      fetchAddressByCEP(shippingData.cep);
    }
  };

  // Mock shipping options
  const shippingOptions = [
    {
      id: 'economy',
      name: 'Entrega Econômica',
      company: 'Transportadora',
      price: 15.90,
      delivery_time: '5-8',
      delivery_range: { min: 5, max: 8 },
      custom_delivery_time: '5 a 8 dias úteis',
      description: 'Entrega econômica'
    },
    {
      id: 'express',
      name: 'Entrega Expressa',
      company: 'Transportadora',
      price: 29.90,
      delivery_time: '2-3',
      delivery_range: { min: 2, max: 3 },
      custom_delivery_time: '2 a 3 dias úteis',
      description: 'Entrega rápida'
    }
  ];

  const canProceed = shippingData.cep && shippingData.street && shippingData.number &&
    shippingData.city && shippingData.state && selectedShipping;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Endereço de Entrega</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Passo 2 de 4</span>
          <button
            onClick={fetchUserAddresses}
            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors flex items-center gap-1"
          >
            <IoReload size={12} />
            Recarregar
          </button>
        </div>
      </div>

      <CepInput
        cep={shippingData.cep}
        onCepChange={handleCepChange}
        loading={cepLoading}
        shippingData={shippingData}
        onAutoFillAddress={fetchAddressByCEP}
      />

      {userAddresses.length > 0 && selectedAddressId && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Endereços Carregados</h3>
          <div className="border-2 border-green-500 bg-green-50 rounded-lg p-4 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-20">Rua:</span>
                    <span className="text-green-900 font-semibold -ml-11">{shippingData.street}</span>
                  </div>

                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-20">Número:</span>
                    <span className="text-green-900 font-semibold -ml-4">{shippingData.number}</span>
                  </div>

                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-20">Complemento:</span>
                    <span className="text-green-900 font-semibold ml-6">
                      {shippingData.complement || <span className="text-gray-400 italic">Nenhum</span>}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-19">Bairro:</span>
                    <span className="text-green-900 font-semibold -ml-6">{shippingData.hood}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-20">Cidade:</span>
                    <span className="text-green-900 font-semibold -ml-6">{shippingData.city}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-20">Estado:</span>
                    <span className="text-green-900 font-semibold -ml-6">{shippingData.state}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-20">CEP:</span>
                    <span className="text-green-900 font-semibold -ml-11">{shippingData.cep}</span>
                  </div>
                </div>
                <p className="text-sm text-green-700 mt-3">
                  Seu endereço foi carregado automaticamente. Você pode selecionar outro abaixo ou editar manualmente.
                </p>
              </div>
              <div className="w-6 h-6 rounded-full border-2 border-green-500 bg-green-500 flex items-center justify-center ml-4 flex-shrink-0">
                <FiCheck size={14} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {userAddresses.length === 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-center">
            Nenhum endereço salvo encontrado. Preencha os dados de entrega abaixo.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rua *
          </label>
          <input
            type="text"
            value={shippingData.street}
            onChange={(e) => setShippingData(prev => ({ ...prev, street: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
            placeholder="Nome da Rua"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número *
          </label>
          <input
            type="text"
            value={shippingData.number}
            onChange={(e) => setShippingData(prev => ({ ...prev, number: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
            placeholder="123"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Complemento
          </label>
          <input
            type="text"
            value={shippingData.complement}
            onChange={(e) => setShippingData(prev => ({ ...prev, complement: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
            placeholder="Apartamento, bloco, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bairro *
          </label>
          <input
            type="text"
            value={shippingData.hood}
            onChange={(e) => setShippingData(prev => ({ ...prev, hood: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
            placeholder="Bairro"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cidade *
          </label>
          <input
            type="text"
            value={shippingData.city}
            onChange={(e) => setShippingData(prev => ({ ...prev, city: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
            placeholder="Cidade"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado *
          </label>
          <select
            value={shippingData.state}
            onChange={(e) => setShippingData(prev => ({ ...prev, state: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
          >
            <option value="">Selecione</option>
            <option value="AC">Acre</option>
            <option value="AL">Alagoas</option>
            <option value="AP">Amapá</option>
            <option value="AM">Amazonas</option>
            <option value="BA">Bahia</option>
            <option value="CE">Ceará</option>
            <option value="DF">Distrito Federal</option>
            <option value="ES">Espírito Santo</option>
            <option value="GO">Goiás</option>
            <option value="MA">Maranhão</option>
            <option value="MT">Mato Grosso</option>
            <option value="MS">Mato Grosso do Sul</option>
            <option value="MG">Minas Gerais</option>
            <option value="PA">Pará</option>
            <option value="PB">Paraíba</option>
            <option value="PR">Paraná</option>
            <option value="PE">Pernambuco</option>
            <option value="PI">Piauí</option>
            <option value="RJ">Rio de Janeiro</option>
            <option value="RN">Rio Grande do Norte</option>
            <option value="RS">Rio Grande do Sul</option>
            <option value="RO">Rondônia</option>
            <option value="RR">Roraima</option>
            <option value="SC">Santa Catarina</option>
            <option value="SP">São Paulo</option>
            <option value="SE">Sergipe</option>
            <option value="TO">Tocantins</option>
          </select>
        </div>
      </div>

      {/* Shipping Options */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-black mb-4">Opções de Entrega</h3>

        <div className="space-y-3">
          {shippingOptions.map((shipping) => (
            <div
              key={shipping.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${selectedShipping?.id === shipping.id
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
                }`}
              onClick={() => onShippingSelect(shipping)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 flex-shrink-0 ${selectedShipping?.id === shipping.id
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                    }`}>
                    {selectedShipping?.id === shipping.id && (
                      <FiCheck size={12} className="text-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-black">{shipping.name}</span>
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                        {shipping.company}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <FiCalendar size={14} />
                        <span>{shipping.custom_delivery_time}</span>
                      </div>
                      {shipping.description && (
                        <span className="text-xs text-gray-500">{shipping.description}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right pl-4">
                  <div className="font-bold text-lg text-black">
                    R$ {shipping.price.toFixed(2)}
                  </div>
                  {shipping.id === 'economy' && (
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                      Mais econômico
                    </span>
                  )}
                  {shipping.id === 'express' && (
                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                      Mais rápido
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={prevStep}
          className="flex items-center text-gray-600 hover:text-gray-800 py-3 px-6 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          Voltar para Dados Pessoais
        </button>
        <button
          onClick={nextStep}
          disabled={!canProceed}
          className={`py-3 px-8 rounded-lg font-semibold transition-colors flex items-center ${canProceed
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
        >
          {selectedShipping ? (
            <>
              Continuar para Pagamento
              <span className="ml-2 text-sm font-normal">
                (+ R$ {selectedShipping.price.toFixed(2)} frete)
              </span>
            </>
          ) : (
            'Selecione o frete'
          )}
        </button>
      </div>
    </div>
  );
};

// ✅ PaymentStep Component
const PaymentStep = ({
  paymentMethod,
  setPaymentMethod,
  cardData,
  setCardData,
  calculateTotal,
  prevStep,
  processCheckout,
  loading
}) => (
  <div className="bg-white p-6 rounded-lg shadow-md" style={{ fontFamily: 'Calibri, sans-serif' }}>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold text-black">Forma de Pagamento</h2>
      <span className="text-sm text-gray-500">Passo 3 de 4</span>
    </div>

    <div className="space-y-4">
      <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'pix' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
        }`} onClick={() => setPaymentMethod('pix')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'pix' ? 'border-green-500 bg-green-500' : 'border-gray-300'
              }`}>
              {paymentMethod === 'pix' && <FiCheck size={14} className="text-white" />}
            </div>
            <SiPix size={24} className="text-green-600" />
            <div>
              <span className="font-semibold text-black">PIX</span>
              <p className="text-sm text-gray-600">Pagamento instantâneo</p>
            </div>
          </div>
          {paymentMethod === 'pix' && (
            <div className="text-green-600 font-semibold">
              5% de desconto
            </div>
          )}
        </div>
      </div>

      <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'boleto' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
        }`} onClick={() => setPaymentMethod('boleto')}>
        <div className="flex items-center space-x-3">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'boleto' ? 'border-green-500 bg-green-500' : 'border-gray-300'
            }`}>
            {paymentMethod === 'boleto' && <FiCheck size={14} className="text-white" />}
          </div>
          <FiFileText size={20} className="text-gray-600" />
          <div>
            <span className="font-semibold text-black">Boleto Bancário</span>
            <p className="text-sm text-gray-600">Vencimento em 3 dias úteis</p>
          </div>
        </div>
      </div>

      <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'credit' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
        }`} onClick={() => setPaymentMethod('credit')}>
        <div className="flex items-center space-x-3">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'credit' ? 'border-green-500 bg-green-500' : 'border-gray-300'
            }`}>
            {paymentMethod === 'credit' && <FiCheck size={14} className="text-white" />}
          </div>
          <FiCreditCard size={20} className="text-gray-600" />
          <div>
            <span className="font-semibold text-black">Cartão de Crédito</span>
            <p className="text-sm text-gray-600">Parcelamento em até 12x</p>
          </div>
        </div>
      </div>

      <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'debit' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
        }`} onClick={() => setPaymentMethod('debit')}>
        <div className="flex items-center space-x-3">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'debit' ? 'border-green-500 bg-green-500' : 'border-gray-300'
            }`}>
            {paymentMethod === 'debit' && <FiCheck size={14} className="text-white" />}
          </div>
          <FiDollarSign size={20} className="text-gray-600" />
          <div>
            <span className="font-semibold text-black">Cartão de Débito</span>
            <p className="text-sm text-gray-600">Pagamento à vista</p>
          </div>
        </div>
      </div>
    </div>

    {paymentMethod === 'credit' && (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-4 text-black">Dados do Cartão</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              value={cardData.number}
              onChange={(e) => setCardData(prev => ({ ...prev, number: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
              placeholder="Número do Cartão"
            />
          </div>

          <div className="md:col-span-2">
            <input
              type="text"
              value={cardData.name}
              onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
              placeholder="Nome no Cartão"
            />
          </div>

          <div>
            <input
              type="text"
              value={cardData.expiry}
              onChange={(e) => setCardData(prev => ({ ...prev, expiry: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
              placeholder="Validade (MM/AA)"
            />
          </div>

          <div>
            <input
              type="text"
              value={cardData.cvv}
              onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
              placeholder="CVV"
            />
          </div>

          <div className="md:col-span-2">
            <select
              value={cardData.installments}
              onChange={(e) => setCardData(prev => ({ ...prev, installments: parseInt(e.target.value) }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                <option key={num} value={num}>
                  {num}x de R$ {(calculateTotal() / num).toFixed(2)} sem juros
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    )}

    <div className="flex justify-between mt-6">
      <button
        onClick={prevStep}
        className="flex items-center text-gray-600 hover:text-gray-800 py-3 px-6 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
      >
        <FiArrowLeft className="mr-2" />
        Voltar para Entrega
      </button>
      <button
        onClick={processCheckout}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-8 rounded-lg font-semibold transition-colors flex items-center gap-2"
      >
        {loading ? 'Processando...' : (
          <>
            <FiLock />
            {paymentMethod === 'pix' ? 'Gerar PIX' :
              paymentMethod === 'boleto' ? 'Gerar Boleto' : 'Finalizar Pedido'}
          </>
        )}
      </button>
    </div>
  </div>
);

// ✅ BoletoStep Component
const BoletoStep = ({ boletoData, goToStep }) => {
  const [paymentStatus, setPaymentStatus] = useState('pending');

  React.useEffect(() => {
    if (!boletoData) return;
    if (boletoData.paymentStatus === 'success') {
      setPaymentStatus('success');
    }
  }, [boletoData]);

  const handleContinue = () => {
    alert(`✅ Pedido #${boletoData?.backendOrderNumber} finalizado com Boleto!`);
    window.location.href = '/';
  };

  const copyBarcode = () => {
    if (boletoData?.barcode) {
      navigator.clipboard.writeText(boletoData.barcode);
      alert('Código de barras copiado!');
    }
  };

  const amount = parseFloat(boletoData?.amount) || 0;

  return (
    <div className="bg-white p-8 rounded-lg shadow-md text-center" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">📄</span>
      </div>
      
      <h2 className="text-2xl font-bold mb-2 text-black">Pagamento via Boleto</h2>
      <p className="text-gray-600 mb-6">Imprima seu boleto ou copie o código para pagar</p>
      
      {boletoData ? (
        <div className="space-y-6">
          {paymentStatus === 'success' ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="text-green-800 text-xl font-bold">Pagamento Confirmado!</span>
              </div>
              <p className="text-green-700 mb-4">
                Seu pedido <strong>#{boletoData.backendOrderNumber}</strong> foi confirmado.<br />
                Valor: <strong>R$ {amount.toFixed(2)}</strong>
              </p>
              <button
                onClick={handleContinue}
                className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                Continuar
              </button>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-sm text-blue-700 mb-1">Valor a pagar</p>
                <p className="text-2xl font-bold text-blue-800">
                  R$ {amount.toFixed(2)}
                </p>
              </div>

              {boletoData.pdfUrl && (
                <div className="text-center">
                  <a 
                    href={boletoData.pdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Visualizar / Imprimir Boleto
                  </a>
                </div>
              )}
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2 text-center">
                  Ou copie o código de barras
                </p>
                <div className="flex items-center justify-between bg-white p-3 rounded border">
                  <code className="text-sm font-mono break-all flex-1 text-left text-black text-xs">
                    {boletoData.barcode || 'Gerando código...'}
                  </code>
                  <button
                    onClick={copyBarcode}
                    className="ml-2 p-2 text-gray-600 hover:text-gray-800 flex-shrink-0 font-medium"
                    title="Copiar código de barras"
                  >
                    Copiar
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <button
                  onClick={() => goToStep(3)}
                  className="flex items-center text-gray-600 hover:text-gray-800 py-2 px-4 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
                >
                  Alterar Pagamento
                </button>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">
                    Aguardando confirmação...
                  </p>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-black">Gerando boleto...</p>
        </div>
      )}
    </div>
  );
};

// ✅ PixStep Component
const PixStep = ({ pixData, copyPixCode, goToStep }) => {
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [isMock, setIsMock] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');

  useEffect(() => {
    if (!pixData) return;

    setIsMock(pixData.transactionId?.includes('mock') || pixData.paymentIntentId?.includes('mock'));

    const autoSuccessTimer = setTimeout(async () => {
      setPaymentStatus('success');

      if (pixData.backendOrderId) {
        try {
          await OrderAPI.updateOrderStatus(pixData.backendOrderId, 'processing', 'paid');
          console.log('💰 PIX Payment Complete - Database updated');
        } catch (error) {
          console.error('Error updating database:', error);
        }
      }
    }, Infinity);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      clearTimeout(autoSuccessTimer);
    };
  }, [pixData]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleContinue = () => {
    const orderNumber = pixData.backendOrderNumber || 'seu pedido';
    alert(`✅ Pagamento PIX confirmado com sucesso! Pedido #${orderNumber} finalizado.`);
    window.location.href = '/';
  };

  const amount = parseFloat(pixData?.amount) || 0;

  return (
    <div className="bg-white p-8 rounded-lg shadow-md text-center" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <SiPix size={32} className="text-green-600" />
      </div>

      <h2 className="text-2xl font-bold mb-2 text-black">Pagamento via PIX</h2>
      <p className="text-gray-600 mb-6">Escaneie o QR Code ou copie o código para pagar</p>

      {isMock && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-purple-700 font-semibold">🧪 MODO DE TESTE</span>
            <span className="text-purple-600 text-sm">Pagamento automático em 10 segundos</span>
          </div>
        </div>
      )}

      {pixData ? (
        <div className="space-y-6">
          {paymentStatus === 'success' ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <FiCheck size={24} className="text-green-600" />
                <span className="text-green-800 text-xl font-bold">Pagamento Confirmado!</span>
              </div>
              <p className="text-green-700 mb-4">
                Seu pedido <strong>#{pixData.backendOrderNumber}</strong> foi confirmado.<br />
                Valor: <strong>R$ {amount.toFixed(2)}</strong>
              </p>
              <button
                onClick={handleContinue}
                className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                Continuar
                <FiArrowRight />
              </button>
            </div>
          ) : (
            <>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-yellow-800 font-semibold">Tempo restante:</span>
                  <span className={`text-lg font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-yellow-700'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                {timeLeft < 300 && (
                  <p className="text-red-600 text-sm text-center mt-2">
                    ⚠️ Código expira em breve!
                  </p>
                )}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-sm text-green-700 mb-1">Valor a pagar</p>
                <p className="text-2xl font-bold text-green-800">
                  R$ {amount.toFixed(2)}
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">Escaneie com seu aplicativo bancário</p>
                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-green-300 inline-block">
                  <img
                    src={pixData.pixQrCode}
                    alt="QR Code PIX"
                    className="w-64 h-64 mx-auto"
                    onError={(e) => {
                      e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixData.pixCode || 'CODIGO_PIX')}`;
                    }}
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2 text-center">
                  Ou copie o código PIX e cole em seu aplicativo bancário
                </p>
                <div className="flex items-center justify-between bg-white p-3 rounded border">
                  <code className="text-sm font-mono break-all flex-1 text-left text-black text-xs">
                    {pixData.pixCode}
                  </code>
                  <button
                    onClick={copyPixCode}
                    className="ml-2 p-2 text-gray-600 hover:text-gray-800 flex-shrink-0"
                    title="Copiar código PIX"
                  >
                    <FiCopy size={18} />
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Como pagar:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Opção 1:</strong> Abra seu app bancário, escolha "Pagar com PIX" e escaneie o QR Code</li>
                  <li>• <strong>Opção 2:</strong> Copie o código acima e cole no campo "Código PIX" do seu banco</li>
                  {isMock && (
                    <li>• <strong>🧪 Modo Teste:</strong> Pagamento será confirmado automaticamente</li>
                  )}
                </ul>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => goToStep(3)}
                  className="flex items-center text-gray-600 hover:text-gray-800 py-2 px-4 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
                >
                  <FiArrowLeft className="mr-2" />
                  Alterar Forma de Pagamento
                </button>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">
                    {isMock ? 'Confirmando pagamento automaticamente...' : 'Aguardando confirmação do pagamento...'}
                  </p>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-black">Gerando código PIX...</p>
        </div>
      )}
    </div>
  );
};

// ✅ OrderSummary Component - FIXED with unique keys
const OrderSummary = ({
  cartItems,
  couponCode,
  setCouponCode,
  applyCoupon,
  calculateSubtotal,
  calculateShipping,
  discount,
  calculateTotal,
  paymentMethod,
  currentStep,
  goToStep,
  selectedShipping,
  isUsingSelectedItems,
  navigate
}) => {

  // ✅ Function to generate unique ID for each item
  const generateUniqueItemId = (item, index) => {
    const productId = item.product_id || item.id || `item-${index}`;
    const variantId = item.variant_id || item.product_variant?.id || 'default';
    const size = item.size || item.selectedSize || item.tamanho || 'no-size';
    const color = item.color || item.selectedColor || item.cor || 'no-color';
    const timestamp = item.added_at || Date.now();

    return `item-${productId}-${variantId}-${size}-${color}-${timestamp}`;
  };

  // ✅ UPDATED getProductDetails function with Portuguese color mapping
  const getProductDetails = (item) => {
    const product = item.product || {};

    // Extract size with multiple fallbacks
    const size = item.size ||
      item.selectedSize ||
      item.variant_size ||
      item.product_variant?.size ||
      item.variant?.size ||
      product.size ||
      (item.options && (item.options.size || item.options.tamanho)) ||
      item.attributes?.size ||
      item.metadata?.size ||
      'Não especificado';

    // Extract raw color and convert to Portuguese name  
    const rawColor = item.color ||
      item.selectedColor ||
      item.variant_color ||
      item.product_variant?.color ||
      item.variant?.color ||
      product.color ||
      (item.options && (item.options.color || item.options.cor)) ||
      item.attributes?.color ||
      item.metadata?.color ||
      null;

    // Convert to Portuguese color name
    const color = getEnglishColorName(rawColor);

    return {
      id: item.id || item.product_id || `item-${Date.now()}`,
      name: product.title || product.name || item.product_name || `Produto ${item.product_id || ''}`,
      price: product.price || item.price || 0,
      image: product.image || product.image_url || item.image || product.images?.[0] || null,
      quantity: item.quantity || 1,
      size: size,
      color: color,
      rawColor: rawColor, // Keep original for color swatch
      variant_id: item.variant_id || item.product_variant?.id || null,
      sku: product.sku || item.sku || null
    };
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md sticky top-24" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-black">Resumo do Pedido</h2>
        <div className="flex items-center gap-2">
          {isUsingSelectedItems && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'}
            </span>
          )}
          <button
            onClick={() => navigate('/cart')}
            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors flex items-center gap-1"
            title="Alterar itens selecionados"
          >
            <FiShoppingCart size={12} />
            Alterar Itens
          </button>
        </div>
      </div>

      {isUsingSelectedItems && cartItems.length > 0 && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <FiCheck className="text-green-600" size={16} />
            <span className="text-green-800 text-sm font-medium">
              {cartItems.length} {cartItems.length === 1 ? 'item selecionado' : 'itens selecionados'} do carrinho
            </span>
          </div>
        </div>
      )}

      <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className="text-center py-4">
            <FiShoppingCart className="mx-auto text-gray-300 mb-2" size={24} />
            <p className="text-gray-500 text-sm">Nenhum item no carrinho</p>
          </div>
        ) : (
          cartItems.map((item, index) => {
            const product = getProductDetails(item);
            const itemTotal = product.price * product.quantity;

            return (
              <div
                key={generateUniqueItemId(item, index)}
                className="flex items-start space-x-4 pb-3 border-b border-gray-100 last:border-b-0 transition-all duration-200 hover:bg-gray-50 p-2 rounded"
              >
                <div className="w-35 h-35 bg-white rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border-2 border-gray-100 shadow-lg">
                  {product.image ? (
                    <div className="w-full h-full flex items-center justify-center p-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain"
                        style={{
                          imageRendering: 'auto',
                          transform: 'translateZ(0)'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = document.createElement('div');
                          fallback.className = 'text-gray-500 text-xs text-center p-4';
                          fallback.textContent = 'Sem imagem';
                          e.target.parentNode.appendChild(fallback);
                        }}
                      />
                    </div>
                  ) : (
                    <span className="text-gray-500 text-xs text-center">Sem imagem</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm leading-tight mb-1">{product.name}</p>

                  {(product.size || product.color) && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {product.size && product.size !== 'Não especificado' && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          Tamanho: {product.size}
                        </span>
                      )}
                      {product.color && product.color !== 'Não especificada' && (
                        <div className="flex items-center gap-1">
                          <div
                            className="w-3 h-3 rounded-full border border-gray-300 shadow-sm"
                            style={{
                              backgroundColor: getColorForSwatch(product.color),
                              borderColor: (product.color === 'Branco' || product.color === '#FFFFFF') ? '#ccc' : 'transparent'
                            }}
                            title={product.color}
                          ></div>
                          <span className="text-xs text-gray-600">Cor: {product.color}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Qtd: {product.quantity}</p>
                      <p className="text-sm font-semibold text-gray-900">
                        R$ {product.price.toFixed(2)} cada
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">
                      R$ {itemTotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t pt-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Itens no carrinho:</span>
          <span className="font-semibold text-black">{cartItems.length}</span>
        </div>
      </div>

      <div className="border-t pt-4 mb-4">
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Cupom de desconto"
            className="flex-1 p-2 border border-gray-300 rounded-lg text-sm text-black"
          />
          <button
            onClick={applyCoupon}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 rounded-lg text-sm font-medium"
          >
            Aplicar
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-black">
          <span>Subtotal</span>
          <span>R$ {calculateSubtotal().toFixed(2)}</span>
        </div>

        {selectedShipping ? (
          <div className="flex justify-between text-black">
            <span>
              Frete {selectedShipping.name}
              {selectedShipping.custom_delivery_time && (
                <span className="text-xs text-gray-500 block">
                  {selectedShipping.custom_delivery_time}
                </span>
              )}
            </span>
            <span>R$ {selectedShipping.price.toFixed(2)}</span>
          </div>
        ) : (
          <div className="flex justify-between text-black">
            <span>Frete</span>
            <span className="text-gray-500">A calcular</span>
          </div>
        )}

        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Desconto</span>
            <span>- R$ {discount.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between font-bold text-lg text-black">
            <span>Total</span>
            <span>R$ {calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>

      {paymentMethod === 'pix' && currentStep < 4 && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center text-green-700">
            <SiPix className="mr-2" />
            <span className="font-semibold">5% de desconto no PIX</span>
          </div>
          <p className="text-green-600 text-sm mt-1">
            Economize R$ {(calculateTotal() * 0.05).toFixed(2)}
          </p>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-2">Navegação Rápida:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => goToStep(1)}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
          >
            Dados Pessoais
          </button>
          <button
            onClick={() => goToStep(2)}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
          >
            Entrega
          </button>
          <button
            onClick={() => goToStep(3)}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
          >
            Pagamento
          </button>
          {currentStep === 4 && (
            <button
              onClick={() => goToStep(4)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
            >
              PIX
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ✅ Main CheckoutPage Component
const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ CART ITEMS: Load instantly from location state
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);

  // ✅ USER DATA: Load asynchronously
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: ''
  });
  const [shippingData, setShippingData] = useState({
    cep: '',
    street: '',
    number: '',
    complement: '',
    hood: '',
    city: '',
    state: ''
  });
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    installments: 1
  });
  const [pixData, setPixData] = useState(null);
  const [boletoData, setBoletoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // ✅ LOADING STATES: Separate for different data types
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [isAddressesLoaded, setIsAddressesLoaded] = useState(false);
  const [isUserDataLoading, setIsUserDataLoading] = useState(true);

  // ✅ 1. INSTANT: Load cart items from location state
  useEffect(() => {
    console.log("📍 Location state:", location.state);

    if (location.state?.selectedCartItems) {
      console.log("🛒 Using SELECTED items from cart:", location.state.selectedCartItems);
      setCartItems(location.state.selectedCartItems);
      setCartTotal(location.state.selectedItemsTotal || 0);
    } else {
      console.log("⚠️ No selected items found in location state");
      setCartItems([]);
    }
  }, [location.state]);

  // ✅ 2. ASYNC: Load user data (profile, addresses)
  useEffect(() => {
    let isMounted = true;

    const loadUserData = async () => {
      if (!isMounted) return;

      try {
        setIsUserDataLoading(true);
        console.log("🔄 Loading user data asynchronously...");

        // Get CSRF token first
        await CsrfTokenManager.getCsrfToken();

        // Load user profile and addresses in parallel
        await Promise.all([
          fetchUserProfile(),
          fetchUserAddresses()
        ]);

        console.log("✅ User data loaded successfully");
      } catch (error) {
        console.error("❌ Error loading user data:", error);
      } finally {
        if (isMounted) {
          setIsUserDataLoading(false);
        }
      }
    };

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, []);

  // ✅ Helper function
  const isUsingSelectedItems = () => {
    return !!location.state?.selectedCartItems;
  };

  const saveOrderToBackend = async (orderData) => {
    try {
      console.log('🔄 Saving order to backend database...');

      const result = await OrderAPI.createOrder(orderData);

      if (result.success) {
        console.log('✅ Order saved to database:', result.data);
        return {
          success: true,
          orderId: result.data.order_id,
          orderNumber: result.data.order_number,
          data: result.data
        };
      } else {
        console.error('❌ Backend order creation failed:', result.message);
        return {
          success: false,
          error: result.message
        };
      }
    } catch (error) {
      console.error('❌ Error saving order to backend:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  const generateMockPixCode = (amount) => {
    const randomId = Math.random().toString(36).substring(2, 15);
    const formattedAmount = amount.toFixed(2);

    return `00020126580014br.gov.bcb.pix0136${randomId}520400005303986540${formattedAmount}5802BR5913LOJA EXEMPLO6008SAO PAULO62070503***6304${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  };

  // ✅ Enhanced PIX Processing
  const processPixPayment = async (orderId, orderData) => {
    try {
      const csrfToken = await CsrfTokenManager.getCsrfToken();

      console.log('🔄 Generating PIX payment for order:', orderId);

      const response = await fetch('/api/pix/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({
          order_id: orderId,
          amount: orderData.total,
          payer_name: orderData.customer_name,
          payer_cpf: orderData.customer_cpf,
        })
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ PIX API Error:', result);
        throw new Error(result.message || `HTTP ${response.status}`);
      }

      if (!result.success) {
        throw new Error(result.message || 'PIX generation failed');
      }

      console.log('✅ PIX generated successfully:', result.data);
      return result.data;

    } catch (error) {
      console.error('❌ PIX Generation Error:', error);
      throw error;
    }
  };

  const processBoletoPayment = async (orderId, orderData) => {
    try {
      const csrfToken = await CsrfTokenManager.getCsrfToken();
      
      console.log('🔄 Generating Boleto payment for order:', orderId);
      
      const response = await fetch('/api/boleto/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({
          order_id: orderId,
          amount: orderData.total,
          payer_name: orderData.customer_name,
          payer_cpf: orderData.customer_cpf,
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Boleto API Error:', result);
        throw new Error(result.message || `HTTP ${response.status}`);
      }
      
      if (!result.success) {
        throw new Error(result.message || 'Boleto generation failed');
      }
      
      console.log('✅ Boleto generated successfully:', result.data);
      return result.data;
      
    } catch (error) {
      console.error('❌ Boleto Generation Error:', error);
      throw error;
    }
  };

  // ✅ Enhanced Checkout Process
  const processCheckout = async () => {

    setLoading(true);

    try {
      const orderPayload = generateOrderJSON();
      console.log('%c ORDER PAYLOAD → /api/orders ', 'background:#006400;color:#fff;font-weight:bold;', orderPayload);

      // 1. Create order in database
      const backendResult = await saveOrderToBackend(orderPayload);

      if (!backendResult.success) {
        throw new Error(backendResult.message || 'Failed to save order');
      }

      console.log('✅ Order created in database:', backendResult.data);
      const orderId = backendResult.data.order_id;
      const orderNumber = backendResult.data.order_number;

      // 2. Handle PIX payment
      if (paymentMethod === 'pix') {
        const pixResult = await processPixPayment(orderId, orderPayload);

        setPixData({
          pixQrCode: pixResult.pix_qr_code,
          pixCode: pixResult.pix_code,
          amount: pixResult.amount,
          backendOrderId: orderId,
          backendOrderNumber: orderNumber,
          transactionId: pixResult.transaction_id,
          expiresAt: pixResult.expires_at
        });

        setCurrentStep(4);

        // Start polling for payment status
        startPaymentStatusPolling(orderId, 'pix');

      } else if (paymentMethod === 'boleto') {
        const boletoResult = await processBoletoPayment(orderId, orderPayload);
        
        setBoletoData({
          barcode: boletoResult.barcode,
          pdfUrl: boletoResult.pdf_url,
          amount: boletoResult.amount,
          backendOrderId: orderId,
          backendOrderNumber: orderNumber,
          transactionId: boletoResult.transaction_id,
          expiresAt: boletoResult.expires_at
        });

        setCurrentStep(4);
        
        // Start polling for payment status
        startPaymentStatusPolling(orderId, 'boleto');

      } else {
        // Handle other payment methods
        await OrderAPI.updateOrderStatus(orderId, 'processing', 'paid');
        alert(`Pedido #${orderNumber} criado com sucesso!`);
        await clearCart();
        window.location.href = '/';
      }

    } catch (error) {
      console.error('Checkout error:', error);
      alert('Erro no checkout: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const startPaymentStatusPolling = (orderId, type = 'pix') => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/${type}/status/${orderId}`, {
          credentials: 'include',
        });

        if (response.ok) {
          const result = await response.json();

          if (result.success && result.data.status === 'paid') {
            clearInterval(pollInterval);

            // Update order status to paid
            await OrderAPI.updateOrderStatus(orderId, 'processing', 'paid');

            // Update UI to show success
            if (type === 'pix') {
              setPixData(prev => ({ ...prev, paymentStatus: 'success' }));
            } else {
              setBoletoData(prev => ({ ...prev, paymentStatus: 'success' }));
            }

            console.log(`💰 ${type.toUpperCase()} Payment Complete - Database updated`);
          } else if (result.data.status === 'expired') {
            clearInterval(pollInterval);
            alert(`Pagamento ${type.toUpperCase()} expirou. Por favor, tente novamente.`);
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 5000);

    setTimeout(() => {
      clearInterval(pollInterval);
    }, 30 * 60 * 1000);
  };

  const clearCart = async () => {
    try {
      const csrfToken = await CsrfTokenManager.getCsrfToken();

      const response = await fetch('/api/cart/clear', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-XSRF-TOKEN': csrfToken,
        },
      });

      if (response.ok) {
        console.log('🛒 Cart cleared after successful order');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const calculateSubtotal = () => {
    if (cartTotal > 0) {
      return cartTotal;
    }

    return cartItems.reduce((total, item) => {
      const price = item.product?.price || item.price || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  };

  const calculateShipping = () => {
    return selectedShipping ? selectedShipping.price : 0;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = calculateShipping();
    const total = subtotal + shipping - discount;
    const discountedTotal = paymentMethod === 'pix' ? total * 0.95 : total;
    return discountedTotal;
  };


  const generateOrderJSON = () => {
    const subtotal = calculateSubtotal();
    const shippingCost = calculateShipping();
    const rawTotal = subtotal + shippingCost - discount;
    const total = paymentMethod === 'pix' ? rawTotal * 0.95 : rawTotal;
    const discountAmt = paymentMethod === 'pix' ? rawTotal * 0.05 : discount;

    const items = cartItems.map(item => {
      const product = item.product || {};
      const price = Number(product.price || item.price || 0);
      const qty = Number(item.quantity || 1);

      const size = item.size ||
        item.selectedSize ||
        item.variant_size ||
        item.product_variant?.size ||
        item.variant?.size ||
        product.size ||
        (item.options && (item.options.size || item.options.tamanho)) ||
        item.attributes?.size ||
        item.metadata?.size ||
        'Not specified';

      const rawColor = item.color ||
        item.selectedColor ||
        item.variant_color ||
        item.product_variant?.color ||
        item.variant?.color ||
        product.color ||
        (item.options && (item.options.color || item.options.cor)) ||
        item.attributes?.color ||
        item.metadata?.color ||
        null;

      const color = getEnglishColorName(rawColor);

      return {

        product_name: product.title || product.name || `Product ${item.product_id || ''}`,
        quantity: qty,
        price: price,
        total: price * qty,
        size: size,
        color: color,
        image: product.image || product.image_url || item.image || null,

      };
    });

    const payload = {
      customer_name: (customerData.name ?? '').toString().trim(),
      customer_email: (customerData.email ?? '').toString().trim(),
      customer_phone: (customerData.phone ?? '').toString().trim(),
      customer_cpf: (customerData.cpf ?? '').toString().trim(),

      subtotal: Number(subtotal.toFixed(2)),
      shipping: Number(shippingCost.toFixed(2)),
      discount: Number(discountAmt.toFixed(2)),
      total: Number(total.toFixed(2)),

      payment_method: paymentMethod,
      payment_status: 'pending',
      status: 'pending',
      shipping_street: (shippingData.street ?? '').toString().trim(),
      shipping_number: (shippingData.number ?? '').toString().trim(),
      shipping_complement: (shippingData.complement ?? null),
      shipping_neighborhood: (shippingData.hood ?? '').toString().trim(),
      shipping_city: (shippingData.city ?? '').toString().trim(),
      shipping_state: (shippingData.state ?? '').toString().trim(),
      shipping_zip_code: (shippingData.cep?.replace(/\D/g, '') ?? '').toString(),

      items: items,

      metadata: {
        is_mock: true,
        coupon_applied: discount > 0 ? couponCode : null,
        platform: 'web',
        timestamp: new Date().toISOString(),
        selected_items_only: isUsingSelectedItems()
      }
    };

    console.log('%c ORDER PAYLOAD → /api/infos ', 'background:#006400;color:#fff;', payload);

    // ✅ Verify order of properties in first item
    if (items.length > 0) {
      console.log('%c ITEM PROPERTIES ORDER:', 'background:#4a5568;color:#fff;font-weight:bold;', Object.keys(items[0]));
    }

    return payload;
  };

  const fetchUserProfile = async () => {
    try {
      console.log("🔄 Fetching user profile...");

      const res = await fetch("/profile", {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (res.ok) {
        const userData = await res.json();
        console.log("✅ USER PROFILE LOADED:", userData);

        const updatedCustomerData = {
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.tel || userData.phone || userData.telefone || '',
          cpf: userData.cpf || userData.document || ''
        };

        setCustomerData(updatedCustomerData);
        setIsProfileLoaded(true);

      } else {
        console.log("⚠️ Could not fetch user profile, using empty form");
        setIsProfileLoaded(true);
      }
    } catch (err) {
      console.error("❌ Error fetching user profile:", err.message);
      setIsProfileLoaded(true);
    }
  };

  const fetchUserAddresses = async () => {
    try {
      console.log("🔄 Fetching user addresses...");

      const possibleEndpoints = [
        '/addresses',
        '/api/address'
      ];

      let addresses = [];

      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`🔍 Trying endpoint: ${endpoint}`);
          const res = await fetch(endpoint, {
            method: "GET",
            credentials: "include",
            headers: {
              "Accept": "application/json",
              "X-Requested-With": "XMLHttpRequest",
            },
          });

          if (res.ok) {
            const data = await res.json();
            console.log(`✅ ADDRESSES LOADED from ${endpoint}:`, data);

            if (Array.isArray(data)) {
              addresses = data;
            } else if (data.data && Array.isArray(data.data)) {
              addresses = data.data;
            } else if (data.addresses && Array.isArray(data.addresses)) {
              addresses = data.addresses;
            } else {
              addresses = [];
            }

            break;
          }
        } catch (err) {
          console.log(`❌ Endpoint ${endpoint} error:`, err.message);
          continue;
        }
      }

      if (addresses.length === 0) {
        console.log("⚠️ No addresses found from APIs");
        addresses = [];
      }

      setUserAddresses(addresses);

      if (addresses.length > 0) {
        const primaryAddress = addresses.find(addr => addr.is_primary) || addresses[0];
        setSelectedAddressId(primaryAddress.id);

        setShippingData({
          cep: primaryAddress.zip || primaryAddress.cep || primaryAddress.postal_code || '',
          street: primaryAddress.street || primaryAddress.logradouro || primaryAddress.address || '',
          number: primaryAddress.number || primaryAddress.numero || '',
          complement: primaryAddress.complement || primaryAddress.complemento || '',
          hood: primaryAddress.hood || primaryAddress.bairro || '',
          city: primaryAddress.city || primaryAddress.cidade || '',
          state: primaryAddress.state || primaryAddress.estado || primaryAddress.uf || ''
        });
      }

    } catch (err) {
      console.error("❌ Error fetching addresses:", err.message);
      setUserAddresses([]);
    } finally {
      setIsAddressesLoaded(true);
    }
  };

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    const selectedAddress = userAddresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      setShippingData({
        cep: selectedAddress.zip || selectedAddress.cep || selectedAddress.postal_code || '',
        street: selectedAddress.street || selectedAddress.logradouro || selectedAddress.address || '',
        number: selectedAddress.number || selectedAddress.numero || '',
        complement: selectedAddress.complement || selectedAddress.complemento || '',
        hood: selectedAddress.hood || selectedAddress.bairro || '',
        city: selectedAddress.city || selectedAddress.cidade || '',
        state: selectedAddress.state || selectedAddress.estado || selectedAddress.uf || ''
      });
    }
  };

  const handleShippingSelect = (shipping) => {
    setSelectedShipping(shipping);
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const applyCoupon = () => {
    if (couponCode === 'DESCONTO10') {
      setDiscount(calculateSubtotal() * 0.1);
      alert('Cupom aplicado! 10% de desconto.');
    } else {
      alert('Cupom inválido');
    }
  };

  const copyPixCode = () => {
    if (pixData) {
      navigator.clipboard.writeText(pixData.pixCode);
      alert('Código PIX copiado!');
    }
  };

  // ✅ Only show loading for user data, cart loads instantly
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center" style={{ fontFamily: 'Calibri, sans-serif' }}>
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiShoppingCart size={32} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isUsingSelectedItems() ? 'Itens Não Encontrados' : 'Carrinho Vazio'}
          </h2>
          <p className="text-gray-600 mb-6">
            {isUsingSelectedItems()
              ? "Os itens selecionados não estão mais disponíveis. Volte ao carrinho e selecione os itens novamente."
              : "Seu carrinho está vazio. Adicione produtos antes de finalizar a compra."
            }
          </p>
          <button
            onClick={() => navigate('/cart')}
            className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
          >
            Voltar ao Carrinho
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StepIndicator currentStep={currentStep} goToStep={goToStep} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 1 && (
              <CustomerStep
                customerData={customerData}
                setCustomerData={setCustomerData}
                isProfileLoaded={isProfileLoaded}
                fetchUserProfile={fetchUserProfile}
                nextStep={nextStep}
              />
            )}
            {currentStep === 2 && (
              <ShippingStep
                shippingData={shippingData}
                setShippingData={setShippingData}
                userAddresses={userAddresses}
                selectedAddressId={selectedAddressId}
                handleAddressSelect={handleAddressSelect}
                fetchUserAddresses={fetchUserAddresses}
                selectedShipping={selectedShipping}
                onShippingSelect={handleShippingSelect}
                cartItems={cartItems}
                prevStep={prevStep}
                nextStep={nextStep}
              />
            )}
            {currentStep === 3 && (
              <PaymentStep
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                cardData={cardData}
                setCardData={setCardData}
                calculateTotal={calculateTotal}
                prevStep={prevStep}
                processCheckout={processCheckout}
                loading={loading}
              />
            )}
            {currentStep === 4 && paymentMethod === 'pix' && (
              <PixStep
                pixData={pixData}
                copyPixCode={copyPixCode}
                goToStep={goToStep}
              />
            )}
            {currentStep === 4 && paymentMethod === 'boleto' && (
              <BoletoStep
                boletoData={boletoData}
                goToStep={goToStep}
              />
            )}
          </div>

          <div className="lg:col-span-1">
            <OrderSummary
              cartItems={cartItems}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              applyCoupon={applyCoupon}
              calculateSubtotal={calculateSubtotal}
              calculateShipping={calculateShipping}
              discount={discount}
              calculateTotal={calculateTotal}
              paymentMethod={paymentMethod}
              currentStep={currentStep}
              goToStep={goToStep}
              selectedShipping={selectedShipping}
              isUsingSelectedItems={isUsingSelectedItems()}
              navigate={navigate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;