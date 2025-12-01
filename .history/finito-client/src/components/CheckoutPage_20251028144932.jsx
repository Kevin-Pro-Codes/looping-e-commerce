import React, { useState, useEffect, useCallback } from 'react';
import { FiCreditCard, FiDollarSign, FiSmartphone, FiLock, FiCheck, FiCopy, FiArrowLeft, FiUser, FiTruck, FiCreditCard as FiCard, FiFileText } from 'react-icons/fi';
import { SiPix } from 'react-icons/si';

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([
    { id: 1, name: 'Tênis Esportivo Premium', price: 299.90, quantity: 1, image: '/api/placeholder/80/80' },
    { id: 2, name: 'Camiseta Básica', price: 49.90, quantity: 2, image: '/api/placeholder/80/80' }
  ]);
  
  // Fetch user profile and addresses from API
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
  const [boletoData, setBoletoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [isAddressesLoaded, setIsAddressesLoaded] = useState(false);

  // ✅ FIXED: Using useCallback to prevent infinite re-renders
  const fetchUserProfile = useCallback(async () => {
    try {
      console.log("🔄 Fetching user profile for checkout...");
      setLoading(true);

      // 1️⃣ Get CSRF cookie first
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      // 2️⃣ Fetch profile using session cookies
      const res = await fetch("http://localhost:8000/profile", { 
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      console.log("🔥 Profile response status:", res.status);

      if (res.ok) {
        const userData = await res.json();
        console.log("✅ USER PROFILE LOADED:", userData);
        
        // Create the complete customer data object
        const updatedCustomerData = {
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.tel || userData.phone || userData.telefone || '',
          cpf: userData.cpf || userData.document || ''
        };
        
        console.log("🔄 UPDATING CUSTOMER DATA:", updatedCustomerData);
        
        // Set the state - this should trigger a re-render
        setCustomerData(updatedCustomerData);
        setIsProfileLoaded(true);
        
      } else {
        console.log("⚠️ Could not fetch user profile, using empty form");
        setIsProfileLoaded(true);
      }
    } catch (err) {
      console.error("❌ Error fetching user profile:", err.message);
      setIsProfileLoaded(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ ADDED: Missing fetchUserAddresses function
  const fetchUserAddresses = useCallback(async () => {
    try {
      console.log("🔄 Fetching user addresses...");
      
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const res = await fetch("http://localhost:8000/api/addresses", {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (res.ok) {
        const addresses = await res.json();
        console.log("✅ ADDRESSES LOADED:", addresses);
        setUserAddresses(addresses);
        
        // Auto-select first address if available
        if (addresses.length > 0) {
          setSelectedAddressId(addresses[0].id);
          const firstAddress = addresses[0];
          setShippingData({
            cep: firstAddress.zip || firstAddress.cep || '',
            street: firstAddress.street || firstAddress.logradouro || '',
            number: firstAddress.number || firstAddress.numero || '',
            complement: firstAddress.complement || firstAddress.complemento || '',
            neighborhood: firstAddress.neighborhood || firstAddress.bairro || '',
            city: firstAddress.city || firstAddress.cidade || '',
            state: firstAddress.state || firstAddress.estado || ''
          });
        }
      } else {
        console.log("⚠️ Could not fetch user addresses");
        // Set mock addresses for testing
        setUserAddresses([
          {
            id: 1,
            street: 'Rua Example',
            number: '123',
            complement: 'Apto 45',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zip: '01234-567'
          }
        ]);
      }
    } catch (err) {
      console.error("❌ Error fetching addresses:", err.message);
      // Set empty array on error
      setUserAddresses([]);
    } finally {
      setIsAddressesLoaded(true);
    }
  }, []);

  // ✅ FIXED: useEffect with proper dependencies
  useEffect(() => {
    let isMounted = true;

    const initializeData = async () => {
      if (isMounted) {
        try {
          await Promise.all([
            fetchUserProfile(),
            fetchUserAddresses()
          ]);
        } catch (error) {
          console.error("Error initializing checkout data:", error);
        }
      }
    };

    initializeData();

    return () => {
      isMounted = false;
    };
  }, [fetchUserProfile, fetchUserAddresses]);

  // ✅ ADDED: Error boundary and loading states
  const [error, setError] = useState(null);

  // Handle address selection
  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    const selectedAddress = userAddresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      setShippingData({
        cep: selectedAddress.zip || selectedAddress.cep || '',
        street: selectedAddress.street || selectedAddress.logradouro || '',
        number: selectedAddress.number || selectedAddress.numero || '',
        complement: selectedAddress.complement || selectedAddress.complemento || '',
        neighborhood: selectedAddress.neighborhood || selectedAddress.bairro || '',
        city: selectedAddress.city || selectedAddress.cidade || '',
        state: selectedAddress.state || selectedAddress.estado || ''
      });
    }
  };

  // ... rest of your functions remain the same, but add error handling:

  const processCheckout = async () => {
    if (cartItems.length === 0) {
      setError('Seu carrinho está vazio');
      return;
    }

    // Validate required fields based on current step
    if (currentStep === 1 && (!customerData.name || !customerData.email || !customerData.phone || !customerData.cpf)) {
      setError('Por favor, preencha todos os campos obrigatórios nos dados pessoais');
      return;
    }

    if (currentStep === 2 && (!shippingData.cep || !shippingData.street || !shippingData.number || !shippingData.city || !shippingData.state)) {
      setError('Por favor, preencha todos os campos obrigatórios no endereço de entrega');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ... your existing processCheckout logic
    } catch (error) {
      console.error('Erro no checkout:', error);
      setError('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ ADDED: Error display component
  const ErrorMessage = () => (
    error && (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
          </div>
        </div>
      </div>
    )
  );

  // In your return, add the error message at the top:
  return (
    <div className="min-h-screen bg-gray-50 pt-20" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step Indicator */}
        <StepIndicator />
        
        {/* ✅ ADDED: Error Display */}
        <ErrorMessage />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 1 && <CustomerStep />}
            {currentStep === 2 && <ShippingStep />}
            {currentStep === 3 && <PaymentStep />}
            {currentStep === 4 && <PixStep />}
            {currentStep === 5 && <BoletoStep />}
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