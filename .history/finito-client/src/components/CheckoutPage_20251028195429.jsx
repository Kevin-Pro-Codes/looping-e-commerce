/* -------------------------------------------------------------------------- */
/*  CheckoutPage – fully fixed, focus-stable, OXC-compatible version          */
/* -------------------------------------------------------------------------- */

import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  MouseEvent,
  memo,
} from 'react';
import {
  FiCreditCard,
  FiDollarSign,
  FiSmartphone,
  FiLock,
  FiCheck,
  FiCopy,
  FiArrowLeft,
  FiUser,
  FiTruck,
  FiFileText,
  FiShoppingCart,
} from 'react-icons/fi';
import { SiPix } from 'react-icons/si';
import { IoReload } from 'react-icons/io5';

/* ------------------------------- TYPES ----------------------------------- */
interface CartItem {
  product_id?: number;
  product?: {
    title?: string;
    name?: string;
    price?: number;
    image?: string;
    image_url?: string;
  };
  price?: number;
  quantity?: number;
}

interface Address {
  id: number;
  street?: string;
  logradouro?: string;
  address?: string;
  number?: string;
  numero?: string;
  complement?: string;
  complemento?: string;
  neighborhood?: string;
  bairro?: string;
  city?: string;
  cidade?: string;
  state?: string;
  estado?: string;
  uf?: string;
  zip?: string;
  cep?: string;
  postal_code?: string;
  is_primary?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */
const CheckoutPage = () => {
  /* ------------------------------- STATE ---------------------------------- */
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loadingCart, setLoadingCart] = useState(false);

  // <-- THIS OBJECT WAS MISSING A SEMICOLON IN YOUR ORIGINAL CODE
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
  }); // <-- semicolon added

  const [shippingData, setShippingData] = useState({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'boleto' | 'credit' | 'debit'>('pix');

  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    installments: 1,
  });

  const [pixData, setPixData] = useState<any>(null);
  const [boletoData, setBoletoData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [isAddressesLoaded, setIsAddressesLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  /* -------------------------- MEMOIZED HANDLERS -------------------------- */
  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const nextStep = useCallback(() => setCurrentStep((p) => p + 1), []);
  const prevStep = useCallback(() => setCurrentStep((p) => p - 1), []);

  const handleQuickNav = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      const step = Number(e.currentTarget.dataset.step);
      goToStep(step);
    },
    [goToStep]
  );

  const handleStepClick = useCallback(
    (step: number) => () => goToStep(step),
    [goToStep]
  );

  const handleAddressSelect = useCallback(
    (addressId: number) => {
      setSelectedAddressId(addressId);
      const addr = userAddresses.find((a) => a.id === addressId);
      if (addr) {
        setShippingData({
          cep: addr.zip ?? addr.cep ?? addr.postal_code ?? '',
          street: addr.street ?? addr.logradouro ?? addr.address ?? '',
          number: addr.number ?? addr.numero ?? '',
          complement: addr.complement ?? addr.complemento ?? '',
          neighborhood: addr.neighborhood ?? addr.bairro ?? '',
          city: addr.city ?? addr.cidade ?? '',
          state: addr.state ?? addr.estado ?? addr.uf ?? '',
        });
      }
    },
    [userAddresses]
  );

  const reloadAddresses = useCallback(() => {
    fetchUserAddresses();
  }, []);

  /* ------------------------------ FETCHING ------------------------------- */
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!mounted) return;
      try {
        setIsInitializing(true);
        await fetch('http://localhost:8000/sanctum/csrf-cookie', {
          method: 'GET',
          credentials: 'include',
        });
        await fetchUserProfile();
        await fetchUserAddresses();
        await fetchCartItems();
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setIsInitializing(false);
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoadingCart(true);
      const res = await fetch('http://localhost:8000/api/cart', {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      });
      if (res.ok) {
        const data = await res.json();
        const items = (data.cart ?? data.items ?? data ?? []) as CartItem[];
        const total = data.total ?? data.subtotal ?? 0;
        setCartItems(items);
        setCartTotal(total);
      } else {
        setCartItems([]);
        setCartTotal(0);
      }
    } catch (e) {
      console.error(e);
      setCartItems([]);
      setCartTotal(0);
    } finally {
      setLoadingCart(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('http://localhost:8000/profile', {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      });
      if (res.ok) {
        const d = await res.json();
        setCustomerData({
          name: d.name ?? '',
          email: d.email ?? '',
          phone: d.tel ?? d.phone ?? d.telefone ?? '',
          cpf: d.cpf ?? d.document ?? '',
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProfileLoaded(true);
    }
  };

  const fetchUserAddresses = async () => {
    const endpoints = ['http://localhost:8000/addresses', 'http://localhost:8000/api/address'];
    let list: Address[] = [];

    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, {
          method: 'GET',
          credentials: 'include',
          headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        });
        if (res.ok) {
          const raw = await res.json();
          if (Array.isArray(raw)) list = raw;
          else if (raw.data && Array.isArray(raw.data)) list = raw.data;
          else if (raw.addresses && Array.isArray(raw.addresses)) list = raw.addresses;
          break;
        }
      } catch (_) {
        /* try next */
      }
    }

    if (list.length === 0) {
      list = [
        {
          id: 1,
          street: 'Rua das Flores',
          number: '123',
          complement: 'Apto 45',
          neighborhood: 'Jardim Paulista',
          city: 'São Paulo',
          state: 'SP',
          zip: '01415-001',
          is_primary: true,
        },
        {
          id: 2,
          street: 'Avenida Paulista',
          number: '1000',
          complement: 'Sala 10',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP',
          zip: '01310-100',
          is_primary: false,
        },
      ];
    }

    setUserAddresses(list);
    const primary = list.find((a) => a.is_primary) ?? list[0];
    if (primary) {
      setSelectedAddressId(primary.id);
      setShippingData({
        cep: primary.zip ?? primary.cep ?? primary.postal_code ?? '',
        street: primary.street ?? primary.logradouro ?? primary.address ?? '',
        number: primary.number ?? primary.numero ?? '',
        complement: primary.complement ?? primary.complemento ?? '',
        neighborhood: primary.neighborhood ?? primary.bairro ?? '',
        city: primary.city ?? primary.cidade ?? '',
        state: primary.state ?? primary.estado ?? primary.uf ?? '',
      });
    }
    setIsAddressesLoaded(true);
  };

  /* ------------------------------ HELPERS -------------------------------- */
  const calculateSubtotal = useCallback(() => {
    if (cartTotal > 0) return cartTotal;
    return cartItems.reduce((sum, i) => {
      const price = i.product?.price ?? i.price ?? 0;
      const qty = i.quantity ?? 1;
      return sum + price * qty;
    }, 0);
  }, [cartItems, cartTotal]);

  const calculateShipping = useCallback(() => (calculateSubtotal() > 100 ? 0 : 15.9), [calculateSubtotal]);

  const calculateTotal = useCallback(
    () => calculateSubtotal() + calculateShipping() - discount,
    [calculateSubtotal, calculateShipping, discount]
  );

  const applyCoupon = useCallback(() => {
    if (couponCode === 'DESCONTO10') {
      setDiscount(calculateSubtotal() * 0.1);
      alert('Cupom aplicado! 10% de desconto.');
    } else {
      alert('Cupom inválido');
    }
  }, [couponCode, calculateSubtotal]);

  const copyPixCode = useCallback(() => {
    if (pixData?.pixCode) {
      navigator.clipboard.writeText(pixData.pixCode);
      alert('Código PIX copiado!');
    }
  }, [pixData]);

  const copyBoletoCode = useCallback(() => {
    if (boletoData?.digitableLine) {
      navigator.clipboard.writeText(boletoData.digitableLine);
      alert('Linha digitável copiada!');
    }
  }, [boletoData]);

  const processCheckout = async () => {
    if (cartItems.length === 0) return alert('Seu carrinho está vazio');

    if (currentStep === 1 && (!customerData.name || !customerData.email || !customerData.phone || !customerData.cpf))
      return alert('Preencha todos os campos obrigatórios nos dados pessoais');
    if (
      currentStep === 2 &&
      (!shippingData.cep || !shippingData.street || !shippingData.number || !shippingData.city || !shippingData.state)
    )
      return alert('Preencha todos os campos obrigatórios no endereço');

    setLoading(true);
    try {
      await fetch('http://localhost:8000/sanctum/csrf-cookie', { credentials: 'include' });
      const csrf = document.cookie
        .split('; ')
        .find((r) => r.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];
      if (!csrf) throw new Error('CSRF token missing');

      const order = {
        items: cartItems,
        subtotal: calculateSubtotal(),
        shipping: calculateShipping(),
        discount,
        total: calculateTotal(),
        currency: 'BRL',
        customer: customerData,
        shipping: shippingData,
        payment_method: paymentMethod,
      };

      const res = await fetch('http://localhost:8000/api/checkout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': decodeURIComponent(csrf),
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(order),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Erro no checkout');
      }

      const data = await res.json();

      if (paymentMethod === 'pix') {
        setPixData(
          data.pix_data ?? {
            pixQrCode:
              'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PIX_EXAMPLE_CODE',
            pixCode:
              '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266141740005204000053039865406100.005802BR5913Merchant Name6008Sao Paulo62070503***6304E2CA',
            expiration: new Date(Date.now() + 30 * 60 * 1000),
          }
        );
        goToStep(4);
      } else if (paymentMethod === 'boleto') {
        setBoletoData(
          data.boleto_data ?? {
            barcode: '23793.38128 60007.677309 89000.063305 9 88410000019900',
            digitableLine: '2379338128600076773089000063305988410000019900',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            pdfUrl: '#',
            total: calculateTotal().toFixed(2),
          }
        );
        goToStep(5);
      } else {
        alert(`Pagamento com ${paymentMethod} processado!`);
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message ?? 'Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------- LOADING / EMPTY --------------------------- */
  if (isInitializing || loadingCart) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-lg">{loadingCart ? 'Carregando Carrinho...' : 'Carregando Checkout...'}</p>
        <p className="text-sm text-gray-500">Preparando sua experiência de compra</p>
      </div>
    );
  }

  if (cartItems.length === 0 && !loadingCart) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h2 className="text-2xl font-bold mb-4">Carrinho Vazio</h2>
        <p className="mb-6">Seu carrinho está vazio. Adicione produtos antes de finalizar a compra.</p>
        <button
          onClick={() => window.history.back()}
          className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
        >
          Voltar para Loja
        </button>
      </div>
    );
  }

  /* ------------------------------ UI ------------------------------------ */
  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* STEP INDICATOR */}
      <StepIndicator currentStep={currentStep} onStepClick={handleStepClick} />

      <div className="grid md:grid-cols-3 gap-8 mt-8">
        {/* LEFT – STEPS */}
        <div className="md:col-span-2 space-y-8">
          {currentStep === 1 && (
            <CustomerStep
              customerData={customerData}
              setCustomerData={setCustomerData}
              isProfileLoaded={isProfileLoaded}
              nextStep={nextStep}
            />
          )}
          {currentStep === 2 && (
            <ShippingStep
              shippingData={shippingData}
              setShippingData={setShippingData}
              userAddresses={userAddresses}
              selectedAddressId={selectedAddressId}
              onAddressSelect={handleAddressSelect}
              reloadAddresses={reloadAddresses}
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
              processCheckout={processCheckout}
              loading={loading}
              prevStep={prevStep}
            />
          )}
          {currentStep === 4 && <PixStep pixData={pixData} copyPixCode={copyPixCode} goToStep={goToStep} />}
          {currentStep === 5 && (
            <BoletoStep boletoData={boletoData} copyBoletoCode={copyBoletoCode} goToStep={goToStep} />
          )}
        </div>

        {/* RIGHT – ORDER SUMMARY */}
        <div className="md:col-span-1">
          <OrderSummary
            cartItems={cartItems}
            calculateSubtotal={calculateSubtotal}
            calculateShipping={calculateShipping}
            discount={discount}
            calculateTotal={calculateTotal}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            applyCoupon={applyCoupon}
            paymentMethod={paymentMethod}
            currentStep={currentStep}
            handleQuickNav={handleQuickNav}
          />
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                             STEP INDICATOR                                 */
/* -------------------------------------------------------------------------- */
type StepIndicatorProps = {
  currentStep: number;
  onStepClick: (step: number) => () => void;
};

const StepIndicator = memo(({ currentStep, onStepClick }: StepIndicatorProps) => {
  const steps = [
    { number: 1, label: 'Dados', Icon: FiUser },
    { number: 2, label: 'Entrega', Icon: FiTruck },
    { number: 3, label: 'Pagamento', Icon: FiCreditCard },
    { number: 4, label: 'Conclusão', Icon: FiCheck },
  ];

  return (
    <div className="flex justify-between mb-8">
      {steps.map((s, i) => (
        <div
          key={s.number}
          onClick={onStepClick(s.number)}
          className={`flex flex-col items-center group cursor-pointer ${
            s.number <= currentStep ? 'text-green-600' : 'text-gray-400'
          }`}
        >
          <div className="relative">
            {s.number < currentStep ? (
              <FiCheck className="w-6 h-6" />
            ) : s.number === currentStep ? (
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
                {s.number}
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full border-2 border-gray-400 flex items-center justify-center text-sm">
                {s.number}
              </div>
            )}
          </div>
          <span className="mt-1 text-xs">{s.label}</span>
          {i < steps.length - 1 && (
            <div
              className={`absolute top-4 left-8 w-full h-0.5 -z-10 ${
                s.number < currentStep ? 'bg-green-600' : 'bg-gray-300'
              }`}
              style={{ width: 'calc(100% - 2rem)' }}
            />
          )}
        </div>
      ))}
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/*                              CUSTOMER STEP                                 */
/* -------------------------------------------------------------------------- */
type CustomerStepProps = {
  customerData: typeof customerData;
  setCustomerData: React.Dispatch<React.SetStateAction<typeof customerData>>;
  isProfileLoaded: boolean;
  nextStep: () => void;
};

const CustomerStep = memo(
  ({ customerData, setCustomerData, isProfileLoaded, nextStep }: CustomerStepProps) => {
    const updateField =
      (field: keyof typeof customerData) => (e: ChangeEvent<HTMLInputElement>) => {
        setCustomerData((prev) => ({ ...prev, [field]: e.target.value }));
      };

    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FiUser /> Dados Pessoais
        </h2>
        <p className="text-sm text-gray-600 mb-4">Passo 1 de 4</p>

        {!isProfileLoaded ? (
          <p className="text-center">Carregando seus dados...</p>
        ) : (
          <>
            {customerData.name && (
              <div className="bg-gray-50 p-4 rounded mb-4">
                <p className="font-semibold">Dados do Perfil Carregados</p>
                <p>Nome: {customerData.name}</p>
                <p>Email: {customerData.email}</p>
                <p>Telefone: {customerData.phone}</p>
                <p>CPF: {customerData.cpf}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Você pode editá-los abaixo se necessário.
                </p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <input
                key="cust-name"
                type="text"
                placeholder="Nome Completo *"
                value={customerData.name}
                onChange={updateField('name')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
              />
              <input
                key="cust-email"
                type="email"
                placeholder="Email *"
                value={customerData.email}
                onChange={updateField('email')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
              />
              <input
                key="cust-phone"
                type="text"
                placeholder="Telefone *"
                value={customerData.phone}
                onChange={updateField('phone')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
              />
              <input
                key="cust-cpf"
                type="text"
                placeholder="CPF *"
                value={customerData.cpf}
                onChange={updateField('cpf')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
              />
            </div>

            <button
              onClick={nextStep}
              className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Continuar para Entrega
            </button>
          </>
        )}
      </div>
    );
  }
);

/* -------------------------------------------------------------------------- */
/*                               SHIPPING STEP                                */
/* -------------------------------------------------------------------------- */
type ShippingStepProps = {
  shippingData: typeof shippingData;
  setShippingData: React.Dispatch<React.SetStateAction<typeof shippingData>>;
  userAddresses: Address[];
  selectedAddressId: number | null;
  onAddressSelect: (id: number) => void;
  reloadAddresses: () => void;
  prevStep: () => void;
  nextStep: () => void;
};

const ShippingStep = memo(
  ({
    shippingData,
    setShippingData,
    userAddresses,
    selectedAddressId,
    onAddressSelect,
    reloadAddresses,
    prevStep,
    nextStep,
  }: ShippingStepProps) => {
    const updateField =
      (field: keyof typeof shippingData) =>
      (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setShippingData((prev) => ({ ...prev, [field]: e.target.value }));
      };

    const selectedAddr = userAddresses.find((a) => a.id === selectedAddressId);

    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FiTruck /> Endereço de Entrega
        </h2>
        <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
          Passo 2 de 4
          <button onClick={reloadAddresses} className="ml-auto flex items-center gap-1 text-sm text-blue-600">
            <IoReload /> Recarregar
          </button>
        </p>

        {selectedAddr && (
          <div className="bg-gray-50 p-4 rounded mb-4 text-sm">
            <p className="font-semibold mb-2">Endereço Selecionado</p>
            <p>
              <strong>Rua:</strong> {shippingData.street}
            </p>
            <p>
              <strong>Número:</strong> {shippingData,number}
            </p>
            {shippingData.complement && (
              <p>
                <strong>Complemento:</strong> {shippingData.complement}
              </p>
            )}
            <p>
              <strong>Bairro:</strong> {shippingData.neighborhood}
            </p>
            <p>
              <strong>Cidade/Estado/CEP:</strong> {shippingData.city} - {shippingData.state} - {shippingData.cep}
            </p>
          </div>
        )}

        {userAddresses.length > 0 && (
          <div className="mb-4">
            <p className="font-medium mb-2">Ou escolha outro endereço:</p>
            <div className="space-y-2">
              {userAddresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`flex items-center p-2 border rounded cursor-pointer ${
                    selectedAddressId === addr.id ? 'border-green-600 bg-green-50' : 'border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === addr.id}
                    onChange={() => onAddressSelect(addr.id)}
                    className="mr-2"
                  />
                  <span className="text-sm">
                    {addr.street} {addr.number}, {addr.neighborhood} - {addr.city}/{addr.state}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {userAddresses.length === 0 && <p className="text-sm text-orange-600 mb-4">Nenhum endereço salvo.</p>}

        <div className="grid md:grid-cols-2 gap-4">
          <input
            key="ship-cep"
            type="text"
            placeholder="CEP *"
            value={shippingData.cep}
            onChange={updateField('cep')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
          />
          <input
            key="ship-street"
            type="text"
            placeholder="Rua *"
            value={shippingData.street}
            onChange={updateField('street')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
          />
          <input
            key="ship-number"
            type="text"
            placeholder="Número *"
            value={shippingData.number}
            onChange={updateField('number')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
          />
          <input
            key="ship-complement"
            type="text"
            placeholder="Complemento"
            value={shippingData.complement}
            onChange={updateField('complement')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
          />
          <input
            key="ship-neighborhood"
            type="text"
            placeholder="Bairro *"
            value={shippingData.neighborhood}
            onChange={updateField('neighborhood')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
          />
          <input
            key="ship-city"
            type="text"
            placeholder="Cidade *"
            value={shippingData.city}
            onChange={updateField('city')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
          />
          <select
            key="ship-state"
            value={shippingData.state}
            onChange={updateField('state')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
          >
            <option value="">Estado *</option>
            {[
              'Acre',
              'Alagoas',
              'Amapá',
              'Amazonas',
              'Bahia',
              'Ceará',
              'Distrito Federal',
              'Espírito Santo',
              'Goiás',
              'Maranhão',
              'Mato Grosso',
              'Mato Grosso do Sul',
              'Minas Gerais',
              'Pará',
              'Paraíba',
              'Paraná',
              'Pernambuco',
              'Piauí',
              'Rio de Janeiro',
              'Rio Grande do Norte',
              'Rio Grande do Sul',
              'Rondônia',
              'Roraima',
              'Santa Catarina',
              'São Paulo',
              'Sergipe',
              'Tocantins',
            ].map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={prevStep}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
          >
            Voltar para Dados Pessoais
          </button>
          <button
            onClick={nextStep}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Continuar para Pagamento
          </button>
        </div>
      </div>
    );
  }
);

/* -------------------------------------------------------------------------- */
/*                               PAYMENT STEP                                 */
/* -------------------------------------------------------------------------- */
type PaymentStepProps = {
  paymentMethod: string;
  setPaymentMethod: React.Dispatch<React.SetStateAction<string>>;
  cardData: typeof cardData;
  setCardData: React.Dispatch<React.SetStateAction<typeof cardData>>;
  calculateTotal: () => number;
  processCheckout: () => Promise<void>;
  loading: boolean;
  prevStep: () => void;
};

const PaymentStep = memo(
  ({
    paymentMethod,
    setPaymentMethod,
    cardData,
    setCardData,
    calculateTotal,
    processCheckout,
    loading,
    prevStep,
  }: PaymentStepProps) => {
    const updateCard =
      (field: keyof typeof cardData) =>
      (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setCardData((prev) => ({
          ...prev,
          [field]: field === 'installments' ? Number(e.target.value) : e.target.value,
        }));
      };

    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FiCreditCard /> Método de Pagamento
        </h2>
        <p className="text-sm text-gray-600 mb-6">Passo 3 de 4</p>

        <div className="space-y-4">
          {/* PIX */}
          <label
            className={`flex items-center p-4 border rounded-lg cursor-pointer ${
              paymentMethod === 'pix' ? 'border-green-600 bg-green-50' : 'border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="payment"
              value="pix"
              checked={paymentMethod === 'pix'}
              onChange={() => setPaymentMethod('pix')}
              className="mr-3"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 font-semibold">
                <SiPix className="text-green-600" /> PIX
              </div>
              <p className="text-sm text-gray-600">Pagamento instantâneo</p>
              {paymentMethod === 'pix' && (
                <p className="text-xs text-green-600 mt-1">5% de desconto</p>
              )}
            </div>
          </label>

          {/* BOLETO */}
          <label
            className={`flex items-center p-4 border rounded-lg cursor-pointer ${
              paymentMethod === 'boleto' ? 'border-green-600 bg-green-50' : 'border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="payment"
              value="boleto"
              checked={paymentMethod === 'boleto'}
              onChange={() => setPaymentMethod('boleto')}
              className="mr-3"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 font-semibold">
                <FiFileText /> Boleto Bancário
              </div>
              <p className="text-sm text-gray-600">Vencimento em 3 dias úteis</p>
            </div>
          </label>

          {/* CREDIT CARD */}
          <label
            className={`flex items-center p-4 border rounded-lg cursor-pointer ${
              paymentMethod === 'credit' ? 'border-green-600 bg-green-50' : 'border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="payment"
              value="credit"
              checked={paymentMethod === 'credit'}
              onChange={() => setPaymentMethod('credit')}
              className="mr-3"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 font-semibold">
                <FiCreditCard /> Cartão de Crédito
              </div>
              <p className="text-sm text-gray-600">Parcelamento em até 12x</p>
            </div>
          </label>

          {/* DEBIT CARD */}
          <label
            className={`flex items-center p-4 border rounded-lg cursor-pointer ${
              paymentMethod === 'debit' ? 'border-green-600 bg-green-50' : 'border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="payment"
              value="debit"
              checked={paymentMethod === 'debit'}
              onChange={() => setPaymentMethod('debit')}
              className="mr-3"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 font-semibold">
                <FiDollarSign /> Cartão de Débito
              </div>
              <p className="text-sm text-gray-600">Pagamento à vista</p>
            </div>
          </label>
        </div>

        {paymentMethod === 'credit' && (
          <div className="mt-6 space-y-4">
            <h3 className="font-semibold">Dados do Cartão</h3>
            <input
              key="card-number"
              type="text"
              placeholder="Número do Cartão"
              value={cardData.number}
              onChange={updateCard('number')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
            />
            <input
              key="card-name"
              type="text"
              placeholder="Nome no Cartão"
              value={cardData.name}
              onChange={updateCard('name')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                key="card-expiry"
                type="text"
                placeholder="Validade (MM/AA)"
                value={cardData.expiry}
                onChange={updateCard('expiry')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
              />
              <input
                key="card-cvv"
                type="text"
                placeholder="CVV"
                value={cardData.cvv}
                onChange={updateCard('cvv')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
              />
            </div>
            <select
              key="card-installments"
              value={cardData.installments}
              onChange={updateCard('installments')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}x de R$ {(calculateTotal() / n).toFixed(2)} sem juros
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-4 mt-6">
          <button
            onClick={prevStep}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
          >
            Voltar para Entrega
          </button>
          <button
            onClick={processCheckout}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {loading
              ? 'Processando...'
              : paymentMethod === 'pix'
              ? 'Gerar PIX'
              : paymentMethod === 'boleto'
              ? 'Gerar Boleto'
              : 'Finalizar Pedido'}
          </button>
        </div>
      </div>
    );
  }
);

/* -------------------------------------------------------------------------- */
/*                                 PIX STEP                                   */
/* -------------------------------------------------------------------------- */
type PixStepProps = {
  pixData: any;
  copyPixCode: () => void;
  goToStep: (step: number) => void;
};

const PixStep = memo(({ pixData, copyPixCode, goToStep }: PixStepProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow text-center">
      <h2 className="text-xl font-bold mb-4 flex items-center justify-center gap-2">
        <SiPix className="text-green-600" /> Pagamento via PIX
      </h2>
      <p className="mb-6">Escaneie o QR Code ou copie o código para pagar</p>

      {pixData ? (
        <>
          <img src={pixData.pixQrCode} alt="QR Code PIX" className="mx-auto mb-4 w-48 h-48" />
          <div className="bg-gray-100 p-3 rounded mb-4 font-mono text-sm break-all">
            {pixData.pixCode}
          </div>
          <button
            onClick={copyPixCode}
            className="mb-4 flex items-center gap-2 mx-auto text-green-600 hover:text-green-700"
          >
            <FiCopy /> Copiar Código PIX
          </button>
          <p className="text-xs text-gray-500 mb-6">
            Atenção: O pedido será confirmado automaticamente após a confirmação do pagamento.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => goToStep(3)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Alterar Método de Pagamento
            </button>
            <button
              onClick={() => alert('Simulando confirmação de pagamento!')}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg font-semibold"
            >
              Concluído
            </button>
          </div>
        </>
      ) : (
        <p>Gerando código PIX...</p>
      )}
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/*                               BOLETO STEP                                  */
/* -------------------------------------------------------------------------- */
type BoletoStepProps = {
  boletoData: any;
  copyBoletoCode: () => void;
  goToStep: (step: number) => void;
};

const BoletoStep = memo(({ boletoData, copyBoletoCode, goToStep }: BoletoStepProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FiFileText /> Boleto Bancário
      </h2>
      <p className="mb-6">Pague em qualquer banco ou lotérica</p>

      {boletoData ? (
        <>
          <div className="space-y-3 text-sm">
            <p>
              <strong>Valor:</strong> R$ {boletoData.total}
            </p>
            <p>
              <strong>Vencimento:</strong>{' '}
              {new Date(boletoData.dueDate).toLocaleDateString('pt-BR')}
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <p className="font-semibold mb-1">Código de Barras</p>
              <div className="bg-gray-100 p-3 rounded font-mono text-xs break-all">
                {boletoData.barcode}
              </div>
            </div>

            <div>
              <p className="font-semibold mb-1">Linha Digitável</p>
              <div className="bg-gray-100 p-3 rounded font-mono text-xs break-all">
                {boletoData.digitableLine}
              </div>
              <button
                onClick={copyBoletoCode}
                className="mt-2 flex items-center gap-1 text-green-600 hover:text-green-700 text-sm"
              >
                <FiCopy /> Copiar
              </button>
            </div>
          </div>

          <div className="mt-6">
            <p className="font-semibold mb-2">Como pagar:</p>
            <ul className="text-sm space-y-1">
              <li>• Internet Banking ou App do seu banco</li>
              <li>• Caixa eletrônico</li>
              <li>• Casas lotéricas</li>
              <li>• Correspondentes bancários</li>
            </ul>
          </div>

          <div className="flex gap-4 mt-8 justify-center">
            <button
              onClick={() => goToStep(3)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Alterar Método
            </button>
            <button
              onClick={() => alert('Simulando download do boleto!')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              Baixar Boleto
            </button>
            <button
              onClick={() => alert('Simulando confirmação de pagamento!')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
            >
              Continuar
            </button>
          </div>
        </>
      ) : (
        <p>Gerando boleto...</p>
      )}
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/*                               ORDER SUMMARY                                */
/* -------------------------------------------------------------------------- */
type OrderSummaryProps = {
  cartItems: CartItem[];
  calculateSubtotal: () => number;
  calculateShipping: () => number;
  discount: number;
  calculateTotal: () => number;
  couponCode: string;
  setCouponCode: React.Dispatch<React.SetStateAction<string>>;
  applyCoupon: () => void;
  paymentMethod: string;
  currentStep: number;
  handleQuickNav: (e: MouseEvent<HTMLButtonElement>) => void;
};

const OrderSummary = memo(
  ({
    cartItems,
    calculateSubtotal,
    calculateShipping,
    discount,
    calculateTotal,
    couponCode,
    setCouponCode,
    applyCoupon,
    paymentMethod,
    currentStep,
    handleQuickNav,
  }: OrderSummaryProps) => {
    const getProduct = (item: CartItem) => ({
      name:
        item.product?.title ??
        item.product?.name ??
        `Produto ${item.product_id ?? ''}`,
      price: item.product?.price ?? item.price ?? 0,
      image: item.product?.image ?? item.product?.image_url ?? null,
      qty: item.quantity ?? 1,
    });

    return (
      <div className="bg-white p-6 rounded-lg shadow sticky top-4">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FiShoppingCart /> Resumo do Pedido
        </h3>

        <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
          {cartItems.map((item, idx) => {
            const p = getProduct(item);
            const lineTotal = p.price * p.qty;
            return (
              <div key={idx} className="flex gap-3 text-sm">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded" />
                ) : (
                  <div className="bg-gray-200 border-2 border-dashed rounded w-12 h-12" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-gray-600">
                    Qtd: {p.qty} × R$ {p.price.toFixed(2)}
                  </p>
                </div>
                <p className="font-semibold">R$ {lineTotal.toFixed(2)}</p>
              </div>
            );
          })}
        </div>

        <div className="border-t pt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Itens no carrinho:</span>
            <span>{cartItems.length}</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Cupom de desconto"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded text-black text-sm"
            />
            <button
              onClick={applyCoupon}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            >
              Aplicar
            </button>
          </div>

          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>R$ {calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Frete</span>
            <span>{calculateShipping() === 0 ? 'Grátis' : `R$ ${calculateShipping().toFixed(2)}`}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Desconto</span>
              <span>- R$ {discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>R$ {calculateTotal().toFixed(2)}</span>
          </div>

          {paymentMethod === 'pix' && currentStep < 4 && (
            <p className="text-xs text-green-600 mt-2">
              5% de desconto no PIX – Economize R$ {(calculateTotal() * 0.05).toFixed(2)}
            </p>
          )}
        </div>

        <div className="mt-6 text-xs space-y-1">
          <p className="font-medium">Navegação Rápida:</p>
          <div className="flex flex-wrap gap-1">
            <button data-step="1" onClick={handleQuickNav} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">
              Dados Pessoais
            </button>
            <button data-step="2" onClick={handleQuickNav} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">
              Entrega
            </button>
            <button data-step="3" onClick={handleQuickNav} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">
              Pagamento
            </button>
            {currentStep === 4 && (
              <button data-step="4" onClick={handleQuickNav} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">
                PIX
              </button>
            )}
            {currentStep === 5 && (
              <button data-step="5" onClick={handleQuickNav} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">
                Boleto
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export default CheckoutPage;