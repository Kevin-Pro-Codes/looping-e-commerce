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
      
      const response = await fetch('http://localhost:8000/sanctum/csrf-cookie', {
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
  if (!colorValue || colorValue === 'undefined') return 'Not specified';
  
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
    
    // Portuguese color names (keep as is)
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
      
      const response = await fetch('http://localhost:8000/api/infos', {
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
      
      const response = await fetch(`http://localhost:8000/api/infos/${orderId}/status`, {
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
      { number: 4, label: 'Conclusão', icon: FiCheck }
    ].map((step, index) => (
      <React.Fragment key={step.number}>
        <button
          onClick={() => goToStep(step.number)}
          className={`flex flex-col items-center group ${
            step.number <= currentStep ? 'text-green-600' : 'text-gray-400'
          }`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
            step.number <= currentStep 
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
          <div className={`w-16 h-1 mx-2 ${
            step.number < currentStep ? 'bg-green-600' : 'bg-gray-300'
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
        <h2 className="text-xl font-semibold">Personal Data</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Step 1 of 4</span>
          <button 
            onClick={fetchUserProfile}
            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
          >
            Reload
          </button>
        </div>
      </div>
      
      {!isProfileLoaded ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your data...</p>
        </div>
      ) : (
        <>
          {customerData.name && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Profile Data Loaded</h3>
              <div className="border-2 border-green-500 bg-green-50 rounded-lg p-4 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-19">Name:</span>
                        <span className="text-green-900 font-semibold -ml-6">{customerData.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-19">Email:</span>
                        <span className="text-green-900 font-semibold -ml-7">{customerData.email}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-19">Phone:</span>
                        <span className="text-green-900 font-semibold -ml-3">{customerData.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-19">CPF:</span>
                        <span className="text-green-900 font-semibold -ml-11">{customerData.cpf}</span>
                      </div>
                    </div>
                    <p className="text-sm text-green-700 mt-3">
                      Your data was loaded automatically. You can edit them below if needed.
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
                Full Name *
              </label>
              <input
                type="text"
                value={customerData.name}
                onChange={(e) => setCustomerData(prev => ({...prev, name: e.target.value}))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                placeholder="Your full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={customerData.email}
                onChange={(e) => setCustomerData(prev => ({...prev, email: e.target.value}))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                value={customerData.phone}
                onChange={(e) => setCustomerData(prev => ({...prev, phone: e.target.value}))}
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
                onChange={(e) => setCustomerData(prev => ({...prev, cpf: e.target.value}))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                placeholder="000.000.000-00"
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              onClick={nextStep}
              disabled={!customerData.name || !customerData.email || !customerData.phone || !customerData.cpf}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-8 rounded-lg font-semibold transition-colors"
            >
              Continue to Delivery
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
        <h3 className="text-lg font-semibold text-gray-800">Calculate Shipping</h3>
      </div>
      
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter your ZIP Code
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
            <p className="text-red-500 text-xs mt-1">ZIP Code must have 8 digits</p>
          )}
          
          {cep && cep.replace(/\D/g, '').length > 0 && cep.replace(/\D/g, '').length < 8 && !showError && (
            <p className="text-gray-500 text-xs mt-1">
              Enter {getMissingDigits()} more digit{getMissingDigits() !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {shippingData.cep && isValidCep && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <FiCheck className="text-green-600" size={16} />
            <span className="text-green-800 text-sm font-medium">
              ZIP Code {shippingData.cep} valid
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
        console.log('ZIP Code not found');
      }
    } catch (error) {
      console.error('Error fetching ZIP Code:', error);
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
      name: 'Economy Delivery',
      company: 'Carrier',
      price: 15.90,
      delivery_time: '5-8',
      delivery_range: { min: 5, max: 8 },
      custom_delivery_time: '5 to 8 business days',
      description: 'Economy delivery'
    },
    {
      id: 'express',
      name: 'Express Delivery',
      company: 'Carrier',
      price: 29.90,
      delivery_time: '2-3',
      delivery_range: { min: 2, max: 3 },
      custom_delivery_time: '2 to 3 business days',
      description: 'Fast delivery'
    }
  ];

  const canProceed = shippingData.cep && shippingData.street && shippingData.number && 
                   shippingData.city && shippingData.state && selectedShipping;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Delivery Address</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Step 2 of 4</span>
          <button 
            onClick={fetchUserAddresses}
            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
          >
            Reload
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
          <h3 className="text-lg font-medium text-gray-900 mb-3">Addresses Loaded</h3>
          <div className="border-2 border-green-500 bg-green-50 rounded-lg p-4 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-20">Street:</span>
                    <span className="text-green-900 font-semibold -ml-11">{shippingData.street}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-20">Number:</span>
                    <span className="text-green-900 font-semibold -ml-4">{shippingData.number}</span>
                  </div>

                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-20">Complement:</span>
                    <span className="text-green-900 font-semibold ml-6">
                      {shippingData.complement || <span className="text-gray-400 italic">None</span>}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-19">Neighborhood:</span>
                    <span className="text-green-900 font-semibold -ml-6">{shippingData.hood}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-20">City:</span>
                    <span className="text-green-900 font-semibold -ml-6">{shippingData.city}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-20">State:</span>
                    <span className="text-green-900 font-semibold -ml-6">{shippingData.state}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-20">ZIP Code:</span>
                    <span className="text-green-900 font-semibold -ml-11">{shippingData.cep}</span>
                  </div>
                </div>
                <p className="text-sm text-green-700 mt-3">
                  Your address was loaded automatically. You can select another below or edit manually.
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
            No saved addresses found. Fill in your delivery details below.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street *
          </label>
          <input
            type="text"
            value={shippingData.street}
            onChange={(e) => setShippingData(prev => ({...prev, street: e.target.value}))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
            placeholder="Street Name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number *
          </label>
          <input
            type="text"
            value={shippingData.number}
            onChange={(e) => setShippingData(prev => ({...prev, number: e.target.value}))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
            placeholder="123"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Complement
          </label>
          <input
            type="text"
            value={shippingData.complement}
            onChange={(e) => setShippingData(prev => ({...prev, complement: e.target.value}))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
            placeholder="Apartment, block, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Neighborhood *
          </label>
          <input
            type="text"
            value={shippingData.hood}
            onChange={(e) => setShippingData(prev => ({...prev, hood: e.target.value}))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
            placeholder="Neighborhood"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <input
            type="text"
            value={shippingData.city}
            onChange={(e) => setShippingData(prev => ({...prev, city: e.target.value}))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
            placeholder="City"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State *
          </label>
          <select
            value={shippingData.state}
            onChange={(e) => setShippingData(prev => ({...prev, state: e.target.value}))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
          >
            <option value="">Select</option>
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
        <h3 className="text-lg font-semibold text-black mb-4">Delivery Options</h3>
        
        <div className="space-y-3">
          {shippingOptions.map((shipping) => (
            <div
              key={shipping.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedShipping?.id === shipping.id 
                  ? 'border-blue-500 bg-blue-50 shadow-sm' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onShippingSelect(shipping)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 flex-shrink-0 ${
                    selectedShipping?.id === shipping.id 
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
                      Most economical
                    </span>
                  )}
                  {shipping.id === 'express' && (
                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                      Fastest
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
          Back to Personal Data
        </button>
        <button
          onClick={nextStep}
          disabled={!canProceed}
          className={`py-3 px-8 rounded-lg font-semibold transition-colors flex items-center ${
            canProceed 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {selectedShipping ? (
            <>
              Continue to Payment
              <span className="ml-2 text-sm font-normal">
                (+ R$ {selectedShipping.price.toFixed(2)} shipping)
              </span>
            </>
          ) : (
            'Select shipping'
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
      <h2 className="text-xl font-semibold text-black">Payment Method</h2>
      <span className="text-sm text-gray-500">Step 3 of 4</span>
    </div>
    
    <div className="space-y-4">
      <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
        paymentMethod === 'pix' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
      }`} onClick={() => setPaymentMethod('pix')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              paymentMethod === 'pix' ? 'border-green-500 bg-green-500' : 'border-gray-300'
            }`}>
              {paymentMethod === 'pix' && <FiCheck size={14} className="text-white" />}
            </div>
            <SiPix size={24} className="text-green-600" />
            <div>
              <span className="font-semibold text-black">PIX</span>
              <p className="text-sm text-gray-600">Instant payment</p>
            </div>
          </div>
          {paymentMethod === 'pix' && (
            <div className="text-green-600 font-semibold">
              5% discount
            </div>
          )}
        </div>
      </div>

      <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
        paymentMethod === 'boleto' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
      }`} onClick={() => setPaymentMethod('boleto')}>
        <div className="flex items-center space-x-3">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            paymentMethod === 'boleto' ? 'border-green-500 bg-green-500' : 'border-gray-300'
          }`}>
            {paymentMethod === 'boleto' && <FiCheck size={14} className="text-white" />}
          </div>
          <FiFileText size={20} className="text-gray-600" />
          <div>
            <span className="font-semibold text-black">Bank Slip</span>
            <p className="text-sm text-gray-600">Due in 3 business days</p>
          </div>
        </div>
      </div>

      <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
        paymentMethod === 'credit' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
      }`} onClick={() => setPaymentMethod('credit')}>
        <div className="flex items-center space-x-3">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            paymentMethod === 'credit' ? 'border-green-500 bg-green-500' : 'border-gray-300'
          }`}>
            {paymentMethod === 'credit' && <FiCheck size={14} className="text-white" />}
          </div>
          <FiCreditCard size={20} className="text-gray-600" />
          <div>
            <span className="font-semibold text-black">Credit Card</span>
            <p className="text-sm text-gray-600">Installments up to 12x</p>
          </div>
        </div>
      </div>

      <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
        paymentMethod === 'debit' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
      }`} onClick={() => setPaymentMethod('debit')}>
        <div className="flex items-center space-x-3">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            paymentMethod === 'debit' ? 'border-green-500 bg-green-500' : 'border-gray-300'
          }`}>
            {paymentMethod === 'debit' && <FiCheck size={14} className="text-white" />}
          </div>
          <FiDollarSign size={20} className="text-gray-600" />
          <div>
            <span className="font-semibold text-black">Debit Card</span>
            <p className="text-sm text-gray-600">Payment in full</p>
          </div>
        </div>
      </div>
    </div>

    {paymentMethod === 'credit' && (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-4 text-black">Card Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              value={cardData.number}
              onChange={(e) => setCardData(prev => ({...prev, number: e.target.value}))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
              placeholder="Card Number"
            />
          </div>
          
          <div className="md:col-span-2">
            <input
              type="text"
              value={cardData.name}
              onChange={(e) => setCardData(prev => ({...prev, name: e.target.value}))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
              placeholder="Name on Card"
            />
          </div>

          <div>
            <input
              type="text"
              value={cardData.expiry}
              onChange={(e) => setCardData(prev => ({...prev, expiry: e.target.value}))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
              placeholder="Expiry (MM/YY)"
            />
          </div>

          <div>
            <input
              type="text"
              value={cardData.cvv}
              onChange={(e) => setCardData(prev => ({...prev, cvv: e.target.value}))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
              placeholder="CVV"
            />
          </div>

          <div className="md:col-span-2">
            <select
              value={cardData.installments}
              onChange={(e) => setCardData(prev => ({...prev, installments: parseInt(e.target.value)}))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
            >
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => (
                <option key={num} value={num}>
                  {num}x of R$ {(calculateTotal() / num).toFixed(2)} no interest
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
        Back to Delivery
      </button>
      <button
        onClick={processCheckout}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-8 rounded-lg font-semibold transition-colors flex items-center"
      >
        {loading ? 'Processing...' : (
          <>
            <FiLock className="mr-2" />
            {paymentMethod === 'pix' ? 'Generate PIX' : 
             paymentMethod === 'boleto' ? 'Generate Bank Slip' : 'Complete Order'}
          </>
        )}
      </button>
    </div>
  </div>
);

// ✅ PixStep Component - FIXED
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
    }, 10000);

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
    const orderNumber = pixData.backendOrderNumber || 'your order';
    alert(`✅ PIX payment confirmed successfully! Order #${orderNumber} completed.`);
    window.location.href = '/';
  };

  // FIX: Ensure amount is treated as a number
  const amount = parseFloat(pixData?.amount) || 0;

  return (
    <div className="bg-white p-8 rounded-lg shadow-md text-center" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <SiPix size={32} className="text-green-600" />
      </div>
      
      <h2 className="text-2xl font-bold mb-2 text-black">Payment via PIX</h2>
      <p className="text-gray-600 mb-6">Scan the QR Code or copy the code to pay</p>
      
      {isMock && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-purple-700 font-semibold">🧪 TEST MODE</span>
            <span className="text-purple-600 text-sm">Automatic payment in 10 seconds</span>
          </div>
        </div>
      )}
      
      {pixData ? (
        <div className="space-y-6">
          {paymentStatus === 'success' ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <FiCheck size={24} className="text-green-600" />
                <span className="text-green-800 text-xl font-bold">Payment Confirmed!</span>
              </div>
              <p className="text-green-700 mb-4">
                Your order <strong>#{pixData.backendOrderNumber}</strong> was confirmed.<br />
                Amount: <strong>R$ {amount.toFixed(2)}</strong>
              </p>
              <button
                onClick={handleContinue}
                className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Continue <FiArrowRight className="ml-1" />
              </button>
            </div>
          ) : (
            <>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-yellow-800 font-semibold">Time remaining:</span>
                  <span className={`text-lg font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-yellow-700'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                {timeLeft < 300 && (
                  <p className="text-red-600 text-sm text-center mt-2">
                    ⚠️ Code expires soon!
                  </p>
                )}
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-sm text-green-700 mb-1">Amount to pay</p>
                <p className="text-2xl font-bold text-green-800">
                  R$ {amount.toFixed(2)}
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">Scan with your banking app</p>
                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-green-300 inline-block">
                  <img 
                    src={pixData.pixQrCode} 
                    alt="QR Code PIX" 
                    className="w-64 h-64 mx-auto"
                    onError={(e) => {
                      e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixData.pixCode || 'PIX_CODE')}`;
                    }}
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2 text-center">
                  Or copy the PIX code and paste in your banking app
                </p>
                <div className="flex items-center justify-between bg-white p-3 rounded border">
                  <code className="text-sm font-mono break-all flex-1 text-left text-black text-xs">
                    {pixData.pixCode}
                  </code>
                  <button
                    onClick={copyPixCode}
                    className="ml-2 p-2 text-gray-600 hover:text-gray-800 flex-shrink-0"
                    title="Copy PIX code"
                  >
                    <FiCopy size={18} />
                  </button>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">How to pay:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Option 1:</strong> Open your banking app, choose "Pay with PIX" and scan the QR Code</li>
                  <li>• <strong>Option 2:</strong> Copy the code above and paste in the "PIX Code" field of your bank</li>
                  {isMock && (
                    <li>• <strong>🧪 Test Mode:</strong> Payment will be confirmed automatically</li>
                  )}
                </ul>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => goToStep(3)}
                  className="flex items-center text-gray-600 hover:text-gray-800 py-2 px-4 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
                >
                  <FiArrowLeft className="mr-2" />
                  Change Payment Method
                </button>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">
                    {isMock ? 'Confirming payment automatically...' : 'Waiting for payment confirmation...'}
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
          <p className="text-black">Generating PIX code...</p>
        </div>
      )}
    </div>
  );
};

// ✅ OrderSummary Component - UPDATED with Portuguese Color Names
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
                'Not specified';
    
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
      name: product.title || product.name || item.product_name || `Product ${item.product_id || ''}`,
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
        <h2 className="text-xl font-semibold text-black">Order Summary</h2>
        <div className="flex items-center gap-2">
          {isUsingSelectedItems && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              {cartItems.length} {cartItems.length === 1 ? 'selected' : 'selected'}
            </span>
          )}
          <button 
            onClick={() => navigate('/cart')}
            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
            title="Change selected items"
          >
            Change Items
          </button>
        </div>
      </div>
      
      {isUsingSelectedItems && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <FiCheck className="text-green-600" size={16} />
            <span className="text-green-800 text-sm font-medium">
              {cartItems.length} {cartItems.length === 1 ? 'item selected' : 'items selected'} from cart
            </span>
          </div>
        </div>
      )}
      
      <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
        {cartItems.map((item, index) => {
          const product = getProductDetails(item);
          const itemTotal = product.price * product.quantity;

          return (
            <div key={item.id || index} className="flex items-start space-x-4 pb-3 border-b border-gray-100 last:border-b-0">
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
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  </div>
                ) : (
                  <span className="text-gray-500 text-xs text-center">No image</span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm leading-tight mb-1">{product.name}</p>
                
                {(product.size || product.color) && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {product.size && product.size !== 'Not specified' && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        Size: {product.size}
                      </span>
                    )}
                    {product.color && product.color !== 'Not specified' && (
                      <div className="flex items-center gap-1">
                        <div 
                          className="w-3 h-3 rounded-full border border-gray-300 shadow-sm"
                          style={{ 
                            backgroundColor: getColorForSwatch(product.color),
                            borderColor: (product.color === 'Branco' || product.color === '#FFFFFF') ? '#ccc' : 'transparent'
                          }}
                          title={product.color}
                        ></div>
                        <span className="text-xs text-gray-600">Color: {product.color}</span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Qty: {product.quantity}</p>
                    <p className="text-sm font-semibold text-gray-900">
                      R$ {product.price.toFixed(2)} each
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">
                    R$ {itemTotal.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t pt-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Items in cart:</span>
          <span className="font-semibold text-black">{cartItems.length}</span>
        </div>
      </div>

      <div className="border-t pt-4 mb-4">
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Discount coupon"
            className="flex-1 p-2 border border-gray-300 rounded-lg text-sm text-black"
          />
          <button
            onClick={applyCoupon}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 rounded-lg text-sm font-medium"
          >
            Apply
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
              Shipping {selectedShipping.name}
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
            <span>Shipping</span>
            <span className="text-gray-500">To calculate</span>
          </div>
        )}
        
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
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
            <span className="font-semibold">5% discount on PIX</span>
          </div>
          <p className="text-green-600 text-sm mt-1">
            Save R$ {(calculateTotal() * 0.05).toFixed(2)}
          </p>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-2">Quick Navigation:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => goToStep(1)}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
          >
            Personal Data
          </button>
          <button
            onClick={() => goToStep(2)}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
          >
            Delivery
          </button>
          <button
            onClick={() => goToStep(3)}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
          >
            Payment
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
      
      const response = await fetch('http://localhost:8000/api/pix/generate', {
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

  const syncStockAfterPayment = async (orderId, paymentMethod) => {
    try {
      console.log(`🔄 Syncing stock for ${paymentMethod} payment, order: ${orderId}`);
      
      // First, update order payment status
      const updateResponse = await fetch(`http://localhost:8000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: 'processing',
          payment_status: 'paid'
        })
      });
  
      if (!updateResponse.ok) {
        throw new Error('Failed to update order status');
      }
  
      // Then sync stock automatically
      const stockResponse = await fetch(`http://localhost:8000/api/orders/${orderId}/sync-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
  
      const stockData = await stockResponse.json();
      
      if (stockData.success) {
        console.log(`✅ Stock synced for ${paymentMethod} payment`);
        return { success: true, message: stockData.message };
      } else if (stockData.already_synced) {
        console.log('ℹ️ Stock already synced');
        return { success: true, message: 'Stock already synced' };
      } else {
        console.log('⚠️ Stock sync note:', stockData.message);
        return { success: false, message: stockData.message };
      }
  
    } catch (error) {
      console.error('❌ Stock sync error:', error);
      return { success: false, error: error.message };
    }
  };

 // ✅ Enhanced Checkout Process with Stock Sync
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
      startPaymentStatusPolling(orderId);

    } else {
      // Handle other payment methods (credit card, boleto, debit card)
      // For non-PIX payments, sync stock immediately
      await syncStockAfterPayment(orderId, paymentMethod);
      
      alert(`✅ Order #${orderNumber} created successfully! Stock has been updated.`);
      await clearCart();
      
      // Redirect to thank you page
      navigate('/order-success', { 
        state: { 
          orderId: orderId,
          orderNumber: orderNumber,
          paymentMethod: paymentMethod
        }
      });
    }

  } catch (error) {
    console.error('Checkout error:', error);
    alert('Checkout error: ' + error.message);
  } finally {
    setLoading(false);
  }
};

 // ✅ Payment Status Polling with Stock Sync
const startPaymentStatusPolling = (orderId) => {
  const pollInterval = setInterval(async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/pix/status/${orderId}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data.status === 'paid') {
          clearInterval(pollInterval);
          
          // Sync stock when PIX is paid
          const stockResult = await syncStockAfterPayment(orderId, 'pix');
          
          if (stockResult.success) {
            // Update UI to show success
            setPixData(prev => ({
              ...prev,
              paymentStatus: 'success'
            }));
            
            console.log('💰 PIX Payment Complete - Stock synced');
            
            // Wait 3 seconds then redirect
            setTimeout(() => {
              navigate('/order-success', { 
                state: { 
                  orderId: orderId,
                  orderNumber: pixData?.backendOrderNumber,
                  paymentMethod: 'pix'
                }
              });
            }, 3000);
          }
        } else if (result.data.status === 'expired') {
          clearInterval(pollInterval);
          alert('PIX payment expired. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  }, 5000); // Check every 5 seconds

  // Stop polling after 30 minutes
  setTimeout(() => {
    clearInterval(pollInterval);
  }, 30 * 60 * 1000);
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
  

  // ✅ UPDATED generateOrderJSON with Portuguese Color Names
  const generateOrderJSON = () => {
    const subtotal      = calculateSubtotal();
    const shippingCost  = calculateShipping();
    const rawTotal      = subtotal + shippingCost - discount;
    const total         = paymentMethod === 'pix' ? rawTotal * 0.95 : rawTotal;
    const discountAmt   = paymentMethod === 'pix' ? rawTotal * 0.05 : discount;

    const items = cartItems.map(item => {
      const product = item.product || {};
      const price   = Number(product.price || item.price || 0);
      const qty     = Number(item.quantity || 1);

      // Extract size
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
      
      const color = getEnglishColorName(rawColor);

      return {
        product_id:   item.product_id || product.id || null,
        product_name: product.title || product.name || `Product ${item.product_id || ''}`,
        quantity:     qty,
        price:        price,
        total:        price * qty,
        // ✅ CRITICAL: Include color and size for admin panel (now in Portuguese)
        size: size,
        color: color,
        // Also save the original color value if needed
        original_color: rawColor,
        image: product.image || product.image_url || item.image || null,
        variant_id: item.variant_id || item.product_variant?.id || null,
        sku: product.sku || item.sku || null
      };
    });

    const payload = {
      customer_name:  (customerData.name   ?? '').toString().trim(),
      customer_email: (customerData.email  ?? '').toString().trim(),
      customer_phone: (customerData.phone  ?? '').toString().trim(),
      customer_cpf:   (customerData.cpf    ?? '').toString().trim(),

      subtotal:      Number(subtotal.toFixed(2)),
      shipping:      Number(shippingCost.toFixed(2)),
      discount:      Number(discountAmt.toFixed(2)),
      total:         Number(total.toFixed(2)),

      payment_method: paymentMethod,
      payment_status: 'pending',
      status:         'pending',

      shipping_street:        (shippingData.street        ?? '').toString().trim(),
      shipping_number:        (shippingData.number        ?? '').toString().trim(),
      shipping_complement:    (shippingData.complement    ?? null),
      shipping_neighborhood:  (shippingData.hood          ?? '').toString().trim(),
      shipping_city:          (shippingData.city          ?? '').toString().trim(),
      shipping_state:         (shippingData.state         ?? '').toString().trim(),
      shipping_zip_code:      (shippingData.cep?.replace(/\D/g, '') ?? '').toString(),

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
    return payload;
  };

  const fetchUserProfile = async () => {
    try {
      console.log("🔄 Fetching user profile...");

      const res = await fetch("http://localhost:8000/profile", { 
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
        'http://localhost:8000/addresses',
        'http://localhost:8000/api/address'
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
      alert('Coupon applied! 10% discount.');
    } else {
      alert('Invalid coupon');
    }
  };

  const copyPixCode = () => {
    if (pixData) {
      navigator.clipboard.writeText(pixData.pixCode);
      alert('PIX code copied!');
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
            {isUsingSelectedItems() ? 'Items Not Found' : 'Empty Cart'}
          </h2>
          <p className="text-gray-600 mb-6">
            {isUsingSelectedItems() 
              ? "The selected items are no longer available. Please return to the cart and select items again."
              : "Your cart is empty. Add products before completing the purchase."
            }
          </p>
          <button
            onClick={() => navigate('/cart')}
            className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
          >
            Back to Cart
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
            {currentStep === 4 && (
              <PixStep 
                pixData={pixData}
                copyPixCode={copyPixCode}
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