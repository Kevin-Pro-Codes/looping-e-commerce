import React, { useState } from 'react';
import { FiCreditCard, FiDollarSign, FiSmartphone, FiLock, FiCheck, FiCopy, FiArrowLeft } from 'react-icons/fi';
import { SiPix } from 'react-icons/si';

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([
    { id: 1, name: 'Tênis Esportivo Premium', price: 299.90, quantity: 1, image: '/api/placeholder/80/80' },
    { id: 2, name: 'Camiseta Básica', price: 49.90, quantity: 2, image: '/api/placeholder/80/80' }
  ]);
  
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
    neighborhood: '',
    city: '',
    state: ''
  });

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
  const [currentStep, setCurrentStep] = useState(1); // 1: Customer, 2: Shipping, 3: Payment
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  // Calculate totals
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateShipping = () => {
    return 15.90; // Fixed shipping for example
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() - discount;
  };

  // Process checkout function
  const processCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Seu carrinho está vazio');
      return;
    }

    if (!customerData.name || !customerData.email || !customerData.cpf) {
      alert('Por favor, preencha todos os dados obrigatórios');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        items: cartItems,
        subtotal: calculateSubtotal(),
        shipping: calculateShipping(),
        discount: discount,
        total: calculateTotal(),
        currency: 'BRL',
        customer: customerData,
        shipping: shippingData,
        paymentMethod: paymentMethod
      };

      // Call your Spring Boot backend
      const response = await fetch('http://localhost:8080/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Falha ao criar pagamento');
      }

      const paymentData = await response.json();
      
      if (paymentMethod === 'pix' && paymentData.pixQrCode) {
        setPixData(paymentData);
        setCurrentStep(4); // Go to PIX payment step
      } else if (paymentData.paymentUrl) {
        window.location.href = paymentData.paymentUrl;
      }

    } catch (error) {
      console.error('Erro no checkout:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
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
    navigator.clipboard.writeText(pixData.pixCode);
    alert('Código PIX copiado!');
  };

  // Steps component
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <React.Fragment key={step}>
          <div className={`flex flex-col items-center ${step <= currentStep ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
              step <= currentStep ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300'
            }`}>
              {step < currentStep ? <FiCheck size={18} /> : step}
            </div>
            <span className="text-xs mt-2 font-medium">
              {step === 1 && 'Dados Pessoais'}
              {step === 2 && 'Entrega'}
              {step === 3 && 'Pagamento'}
              {step === 4 && 'Finalizar'}
            </span>
          </div>
          {step < 4 && (
            <div className={`w-16 h-1 mx-2 ${step < currentStep ? 'bg-green-600' : 'bg-gray-300'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // Customer Info Step
  const CustomerStep = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Dados Pessoais</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome Completo *
          </label>
          <input
            type="text"
            value={customerData.name}
            onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Seu nome completo"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            value={customerData.email}
            onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
            onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
            onChange={(e) => setCustomerData({...customerData, cpf: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="000.000.000-00"
          />
        </div>
      </div>
      
      <div className="flex justify-end mt-6">
        <button
          onClick={() => setCurrentStep(2)}
          className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-lg font-semibold transition-colors"
        >
          Continuar para Entrega
        </button>
      </div>
    </div>
  );

  // Shipping Step
  const ShippingStep = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Endereço de Entrega</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CEP *
          </label>
          <input
            type="text"
            value={shippingData.cep}
            onChange={(e) => setShippingData({...shippingData, cep: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="00000-000"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rua *
          </label>
          <input
            type="text"
            value={shippingData.street}
            onChange={(e) => setShippingData({...shippingData, street: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Nome da rua"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número *
          </label>
          <input
            type="text"
            value={shippingData.number}
            onChange={(e) => setShippingData({...shippingData, number: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
            onChange={(e) => setShippingData({...shippingData, complement: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Apartmento, bloco, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bairro *
          </label>
          <input
            type="text"
            value={shippingData.neighborhood}
            onChange={(e) => setShippingData({...shippingData, neighborhood: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Seu bairro"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cidade *
          </label>
          <input
            type="text"
            value={shippingData.city}
            onChange={(e) => setShippingData({...shippingData, city: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Sua cidade"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado *
          </label>
          <select
            value={shippingData.state}
            onChange={(e) => setShippingData({...shippingData, state: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Selecione</option>
            <option value="SP">São Paulo</option>
            <option value="RJ">Rio de Janeiro</option>
            <option value="MG">Minas Gerais</option>
            {/* Add other states */}
          </select>
        </div>
      </div>
      
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentStep(1)}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <FiArrowLeft className="mr-2" />
          Voltar
        </button>
        <button
          onClick={() => setCurrentStep(3)}
          className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-lg font-semibold transition-colors"
        >
          Continuar para Pagamento
        </button>
      </div>
    </div>
  );

  // Payment Step
  const PaymentStep = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Método de Pagamento</h2>
      
      <div className="space-y-4">
        {/* PIX Option */}
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
                <span className="font-semibold">PIX</span>
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

        {/* Credit Card Option */}
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
              <span className="font-semibold">Cartão de Crédito</span>
              <p className="text-sm text-gray-600">Parcelamento em até 12x</p>
            </div>
          </div>
        </div>

        {/* Debit Card Option */}
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
              <span className="font-semibold">Cartão de Débito</span>
              <p className="text-sm text-gray-600">Pagamento à vista</p>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Card Form */}
      {paymentMethod === 'credit' && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-4">Dados do Cartão</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número do Cartão
              </label>
              <input
                type="text"
                value={cardData.number}
                onChange={(e) => setCardData({...cardData, number: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0000 0000 0000 0000"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome no Cartão
              </label>
              <input
                type="text"
                value={cardData.name}
                onChange={(e) => setCardData({...cardData, name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Como está no cartão"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Validade
              </label>
              <input
                type="text"
                value={cardData.expiry}
                onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="MM/AA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <input
                type="text"
                value={cardData.cvv}
                onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="000"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parcelas
              </label>
              <select
                value={cardData.installments}
                onChange={(e) => setCardData({...cardData, installments: parseInt(e.target.value)})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => (
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
          onClick={() => setCurrentStep(2)}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <FiArrowLeft className="mr-2" />
          Voltar
        </button>
        <button
          onClick={processCheckout}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-8 rounded-lg font-semibold transition-colors flex items-center"
        >
          {loading ? 'Processando...' : (
            <>
              <FiLock className="mr-2" />
              Finalizar Pedido
            </>
          )}
        </button>
      </div>
    </div>
  );

  // PIX Payment Step
  const PixStep = () => (
    <div className="bg-white p-8 rounded-lg shadow-md text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <SiPix size={32} className="text-green-600" />
      </div>
      
      <h2 className="text-2xl font-bold mb-2">Pagamento via PIX</h2>
      <p className="text-gray-600 mb-6">Escaneie o QR Code ou copie o código para pagar</p>
      
      {pixData && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg border-2 border-dashed border-green-300 inline-block">
            <img 
              src={pixData.pixQrCode} 
              alt="QR Code PIX" 
              className="w-64 h-64 mx-auto"
            />
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Código PIX (copie e cole no seu app)</p>
            <div className="flex items-center justify-between bg-white p-3 rounded border">
              <code className="text-sm font-mono break-all">{pixData.pixCode}</code>
              <button
                onClick={copyPixCode}
                className="ml-2 p-2 text-gray-600 hover:text-gray-800"
              >
                <FiCopy size={18} />
              </button>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              <strong>Atenção:</strong> O pedido será confirmado automaticamente após a confirmação do pagamento.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  // Order Summary Component
  const OrderSummary = () => (
    <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
      <h2 className="text-xl font-semibold mb-4">Resumo do Pedido</h2>
      
      <div className="space-y-3 mb-4">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
              {item.image && (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{item.name}</p>
              <p className="text-sm text-gray-600">Qtd: {item.quantity}</p>
            </div>
            <p className="font-semibold text-gray-900">
              R$ {(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Coupon Section */}
      <div className="border-t pt-4 mb-4">
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Cupom de desconto"
            className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
          />
          <button
            onClick={applyCoupon}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 rounded-lg text-sm font-medium"
          >
            Aplicar
          </button>
        </div>
      </div>

      {/* Totals */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>R$ {calculateSubtotal().toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Frete</span>
          <span>R$ {calculateShipping().toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Desconto</span>
            <span>- R$ {discount.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>R$ {calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>

      {paymentMethod === 'pix' && (
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
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step Indicator */}
        <StepIndicator />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 1 && <CustomerStep />}
            {currentStep === 2 && <ShippingStep />}
            {currentStep === 3 && <PaymentStep />}
            {currentStep === 4 && <PixStep />}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;