import React, { useState, useEffect, useCallback } from 'react';
import { FiCreditCard, FiDollarSign, FiArrowRight, FiSmartphone, FiLock, FiCheck, FiCopy, FiArrowLeft, FiUser, FiTruck, FiCreditCard as FiCard, FiFileText, FiShoppingCart, FiPackage, FiCalendar, FiMapPin } from 'react-icons/fi';
import { SiPix } from 'react-icons/si';
import { IoReload } from "react-icons/io5";
import jadlogLogo from "../assets/jadlog.png";

// ---------------------------------------------------------------------
// CSRF Token Manager (unchanged – works fine)
// ---------------------------------------------------------------------
const CsrfTokenManager = {
  getCsrfToken: async () => {
    try {
      console.log('Fetching fresh CSRF token...');
      const response = await fetch('http://localhost:8000/sanctum/csrf-cookie', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to get CSRF cookie');

      const cookies = document.cookie;
      const tokenMatch = cookies.match(/XSRF-TOKEN=([^;]+)/);
      if (tokenMatch && tokenMatch[1]) {
        const token = decodeURIComponent(tokenMatch[1]);
        console.log('CSRF token obtained');
        return token;
      }

      const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      if (metaToken) {
        console.log('CSRF token from meta tag');
        return metaToken;
      }

      throw new Error('CSRF token not found');
    } catch (error) {
      console.error('Error getting CSRF token:', error);
      throw error;
    }
  }
};

// ---------------------------------------------------------------------
// Backend API Service (unchanged)
// ---------------------------------------------------------------------
const OrderAPI = {
  createOrder: async (orderData) => {
    try {
      console.log('Getting CSRF token for order creation...');
      const csrfToken = await CsrfTokenManager.getCsrfToken();

      console.log('Sending order to backend...');
      const response = await fetch('http://localhost:8000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-XSRF-TOKEN': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend response error:', { status: response.status, statusText: response.statusText, body: errorText });
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      if (!result.success) throw new Error(result.message || 'Order creation failed');

      console.log('Order created successfully in backend');
      return result;
    } catch (error) {
      console.error('Order API Error:', error);
      throw error;
    }
  },
  updateOrderStatus: async (orderId, status, paymentStatus) => {
    try {
      const csrfToken = await CsrfTokenManager.getCsrfToken();
      const response = await fetch(`http://localhost:8000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-XSRF-TOKEN': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ status, payment_status: paymentStatus })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (!result.success) throw new Error(result.message || 'Status update failed');
      return result;
    } catch (error) {
      console.error('Order Status Update Error:', error);
      throw error;
    }
  }
};

// ---------------------------------------------------------------------
// COMPONENTS (unchanged – only minor prop-type fixes)
// ---------------------------------------------------------------------
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
          className={`flex flex-col items-center group ${step.number <= currentStep ? 'text-green-600' : 'text-gray-400'}`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${step.number <= currentStep ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 group-hover:border-gray-400'}`}>
            {step.number < currentStep ? <step.icon size={18} /> : step.number === currentStep ? <step.icon size={18} /> : step.number}
          </div>
          <span className="text-xs mt-2 font-medium">{step.label}</span>
          {step.number <= currentStep && <div className="w-2 h-2 bg-green-600 rounded-full mt-1" />}
        </button>
        {index < 3 && <div className={`w-16 h-1 mx-2 ${step.number < currentStep ? 'bg-green-600' : 'bg-gray-300'}`} />}
      </React.Fragment>
    ))}
  </div>
);

// … (CustomerStep, CepInput, JadlogShippingCalculator, ShippingStep, PaymentStep, PixStep, OrderSummary) 
// → **All of these components stay exactly the same as in your original file** 
// (they only read/write state – no changes required). 
// For brevity they are omitted here, just copy-paste them from your original file.

// ---------------------------------------------------------------------
// MAIN CheckoutPage COMPONENT
// ---------------------------------------------------------------------
const CheckoutPage = () => {
  // ------------------- STATE -------------------
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loadingCart, setLoadingCart] = useState(false);

  const [customerData, setCustomerData] = useState({ name: '', email: '', phone: '', cpf: '' });
  const [shippingData, setShippingData] = useState({
    cep: '', street: '', number: '', complement: '', hood: '', city: '', state: ''
  });
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '', installments: 1 });

  const [pixData, setPixData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [isAddressesLoaded, setIsAddressesLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // ------------------- CALCULATION HELPERS -------------------
  const calculateSubtotal = () => {
    if (cartTotal > 0) return cartTotal;
    return cartItems.reduce((sum, item) => {
      const price = item.product?.price || item.price || 0;
      const qty = item.quantity || 1;
      return sum + price * qty;
    }, 0);
  };

  const calculateShipping = () => selectedShipping?.price || 0;

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = calculateShipping();
    const base = subtotal + shipping - discount;
    return paymentMethod === 'pix' ? base * 0.95 : base;
  };

  // ------------------- FLAT ORDER PAYLOAD (the fix) -------------------
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
      return {
        product_id: item.product_id || product.id || null,
        product_name: product.title || product.name || `Produto ${item.product_id || ''}`,
        quantity: qty,
        price,
        total: price * qty
      };
    });

    const payload = {
      // Customer – required
      customer_name: (customerData.name ?? '').toString().trim(),
      customer_email: (customerData.email ?? '').toString().trim(),
      customer_phone: (customerData.phone ?? '').toString().trim(),
      customer_cpf: (customerData.cpf ?? '').toString().trim(),

      // Totals
      subtotal: Number(subtotal.toFixed(2)),
      shipping: Number(shippingCost.toFixed(2)),
      discount: Number(discountAmt.toFixed(2)),
      total: Number(total.toFixed(2)),

      // Payment & status
      payment_method: paymentMethod,
      payment_status: 'pending',
      status: 'pending',

      // Shipping address – required
      shipping_street: (shippingData.street ?? '').toString().trim(),
      shipping_number: (shippingData.number ?? '').toString().trim(),
      shipping_complement: shippingData.complement?.trim() || null,
      shipping_neighborhood: (shippingData.hood ?? '').toString().trim(),
      shipping_city: (shippingData.city ?? '').toString().trim(),
      shipping_state: (shippingData.state ?? '').toString().trim(),
      shipping_zip_code: (shippingData.cep?.replace(/\D/g, '') ?? '').toString(),

      // Items
      items,

      // Optional metadata
      metadata: {
        is_mock: true,
        coupon_applied: discount > 0 ? couponCode : null,
        platform: 'web',
        timestamp: new Date().toISOString()
      }
    };

    console.log('%c ORDER PAYLOAD → /api/orders ', 'background:#006400;color:#fff;', payload);
    return payload;
  };

  // ------------------- PROCESS CHECKOUT (uses flat payload) -------------------
  const processCheckout = async () => {
    if (cartItems.length === 0) { alert('Seu carrinho está vazio'); return; }

    // Basic validation (you already have UI checks, but keep a safety net)
    if (!customerData.name?.trim() || !customerData.email?.trim() || !customerData.phone?.trim() || !customerData.cpf?.trim()) {
      alert('Preencha todos os dados pessoais');
      return;
    }
    if (!shippingData.cep?.trim() || !shippingData.street?.trim() || !shippingData.number?.trim() ||
        !shippingData.hood?.trim() || !shippingData.city?.trim() || !shippingData.state?.trim() || !selectedShipping) {
      alert('Preencha o endereço completo e selecione o frete');
      return;
    }

    setLoading(true);
    try {
      const orderPayload = generateOrderJSON();               // ← FLAT
      const backendResult = await OrderAPI.createOrder(orderPayload);

      if (!backendResult.success) throw new Error(backendResult.message || 'Falha ao salvar pedido');

      console.log('Order saved in DB:', backendResult.data);

      if (paymentMethod === 'pix') {
        const mockPixCode = generateMockPixCode(calculateTotal());
        const mockQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(mockPixCode)}`;

        setPixData({
          pixQrCode: mockQrCodeUrl,
          pixCode: mockPixCode,
          amount: calculateTotal(),
          backendOrderId: backendResult.data.order_id,
          backendOrderNumber: backendResult.data.order_number
        });

        await OrderAPI.updateOrderStatus(backendResult.data.order_id, 'pending', 'pending');
        setCurrentStep(4);
      } else {
        await OrderAPI.updateOrderStatus(backendResult.data.order_id, 'processing', 'paid');
        alert(`Pedido #${backendResult.data.order_number} criado com sucesso!`);
        await clearCart();
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Erro: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ------------------- MOCK PIX CODE -------------------
  const generateMockPixCode = (amount) => {
    const randomId = Math.random().toString(36).substring(2, 15);
    const formatted = amount.toFixed(2);
    return `00020126580014br.gov.bcb.pix0136${randomId}520400005303986540${formatted}5802BR5913LOJA EXEMPLO6008SAO PAULO62070503***6304${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  };

  // ------------------- CLEAR CART AFTER SUCCESS -------------------
  const clearCart = async () => {
    try {
      const csrfToken = await CsrfTokenManager.getCsrfToken();
      const res = await fetch('http://localhost:8000/api/cart/clear', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-XSRF-TOKEN': csrfToken,
        },
      });
      if (res.ok) {
        console.log('Cart cleared');
        setCartItems([]);
      }
    } catch (e) { console.error('Clear cart error:', e); }
  };

  // ------------------- API FETCHERS -------------------
  const fetchCartItems = async () => {
    try {
      setLoadingCart(true);
      const res = await fetch("http://localhost:8000/api/cart", {
        method: "GET",
        credentials: "include",
        headers: { "Accept": "application/json", "X-Requested-With": "XMLHttpRequest" },
      });
      if (res.ok) {
        const data = await res.json();
        const items = data.cart || data.items || data || [];
        const total = data.total || data.subtotal || 0;
        setCartItems(items);
        setCartTotal(total);
      } else {
        setCartItems([]);
        setCartTotal(0);
      }
    } catch (e) {
      console.error("Cart fetch error:", e);
      setCartItems([]);
      setCartTotal(0);
    } finally {
      setLoadingCart(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const res = await fetch("http://localhost:8000/profile", {
        method: "GET",
        credentials: "include",
        headers: { "Accept": "application/json", "X-Requested-With": "XMLHttpRequest" },
      });
      if (res.ok) {
        const user = await res.json();
        setCustomerData({
          name: user.name || '',
          email: user.email || '',
          phone: user.tel || user.phone || user.telefone || '',
          cpf: user.cpf || user.document || ''
        });
        setIsProfileLoaded(true);
      } else { setIsProfileLoaded(true); }
    } catch (e) {
      console.error("Profile fetch error:", e);
      setIsProfileLoaded(true);
    }
  };

  const fetchUserAddresses = async () => {
    // (unchanged – keep your original implementation)
    // … (same as in your file) …
  };

  // ------------------- INITIALISATION -------------------
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      if (!mounted) return;
      setIsInitializing(true);
      try {
        await CsrfTokenManager.getCsrfToken();
        await fetchUserProfile();
        await fetchUserAddresses();
        await fetchCartItems();
      } catch (e) { console.error(e); } finally {
        if (mounted) setIsInitializing(false);
      }
    };
    init();
    return () => { mounted = false; };
  }, []);

  // ------------------- RENDER -------------------
  if (isInitializing || loadingCart) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center" style={{ fontFamily: 'Calibri, sans-serif' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">{loadingCart ? 'Carregando Carrinho...' : 'Carregando Checkout...'}</h2>
          <p className="text-gray-500">Preparando sua experiência de compra</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !loadingCart) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center" style={{ fontFamily: 'Calibri, sans-serif' }}>
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiShoppingCart size={32} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Carrinho Vazio</h2>
          <p className="text-gray-600 mb-6">Adicione produtos antes de finalizar a compra.</p>
          <button onClick={() => window.history.back()} className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors">
            Voltar para Loja
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StepIndicator currentStep={currentStep} goToStep={setCurrentStep} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 1 && (
              <CustomerStep
                customerData={customerData}
                setCustomerData={setCustomerData}
                isProfileLoaded={isProfileLoaded}
                fetchUserProfile={fetchUserProfile}
                nextStep={() => setCurrentStep(2)}
              />
            )}
            {currentStep === 2 && (
              <ShippingStep
                shippingData={shippingData}
                setShippingData={setShippingData}
                userAddresses={userAddresses}
                selectedAddressId={selectedAddressId}
                handleAddressSelect={setSelectedAddressId}
                fetchUserAddresses={fetchUserAddresses}
                selectedShipping={selectedShipping}
                onShippingSelect={setSelectedShipping}
                loadingShipping={loadingShipping}
                shippingError={shippingError}
                cartItems={cartItems}
                prevStep={() => setCurrentStep(1)}
                nextStep={() => setCurrentStep(3)}
              />
            )}
            {currentStep === 3 && (
              <PaymentStep
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                cardData={cardData}
                setCardData={setCardData}
                calculateTotal={calculateTotal}
                prevStep={() => setCurrentStep(2)}
                processCheckout={processCheckout}
                loading={loading}
              />
            )}
            {currentStep === 4 && (
              <PixStep
                pixData={pixData}
                copyPixCode={() => navigator.clipboard.writeText(pixData.pixCode).then(() => alert('Código PIX copiado!'))}
                goToStep={setCurrentStep}
              />
            )}
          </div>

          <div className="lg:col-span-1">
            <OrderSummary
              cartItems={cartItems}
              fetchCartItems={fetchCartItems}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              applyCoupon={() => {
                if (couponCode === 'DESCONTO10') {
                  setDiscount(calculateSubtotal() * 0.1);
                  alert('Cupom aplicado! 10% de desconto.');
                } else alert('Cupom inválido');
              }}
              calculateSubtotal={calculateSubtotal}
              calculateShipping={calculateShipping}
              discount={discount}
              calculateTotal={calculateTotal}
              paymentMethod={paymentMethod}
              currentStep={currentStep}
              goToStep={setCurrentStep}
              selectedShipping={selectedShipping}
              customerData={customerData}
              shippingData={shippingData}
              cardData={cardData}
              generateOrderJSON={generateOrderJSON}
              logOrderJSON={() => { console.log('ORDER JSON:', JSON.stringify(generateOrderJSON(), null, 2)); alert('JSON no console!'); }}
              downloadOrderJSON={() => {
                const json = JSON.stringify(generateOrderJSON(), null, 2);
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `order-${Date.now()}.json`; a.click();
                URL.revokeObjectURL(url);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;