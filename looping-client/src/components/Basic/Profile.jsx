import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import ProfileTab from '../User/ProfileTab';
import AddressesTab from '../User/AddressesTab';
import OrdersTab from '../User/OrdersTab';
import WishlistTab from '../User/WishlistTab';
import CartTab from '../User/CartTab';
import CouponsTab from '../User/CouponsTab';
import PaymentTab from '../User/PaymentTab';
import ConfigurationTab from '../User/ConfigurationTab';
import HelpTab from '../User/HelpTab';
import MobileNavigation from '../User/MobileNavigation';
import DesktopSidebar from '../User/DesktopSidebar';
import { ResponsiveContainer, Card } from '../User/SharedComponents';

const recoverSession = async () => {
  try {
    console.log("🔄 Attempting session recovery...");
    
    await fetch("/sanctum/csrf-cookie", {
      method: "GET",
      credentials: "include",
    });

    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("XSRF-TOKEN="))
      ?.split("=")[1];

    if (!csrfToken) {
      throw new Error("No CSRF token available");
    }

    const testResponse = await fetch("/api/user", {
      method: "GET",
      credentials: "include",
      headers: {
        "Accept": "application/json",
        "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    if (testResponse.status === 401) {
      throw new Error("Session expired");
    }

    console.log("✅ Session recovered successfully");
    return true;
  } catch (error) {
    console.error("❌ Session recovery failed:", error);
    return false;
  }
};

const ProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(location.pathname === "/profile/cart" ? "carrinho" : "perfil");
  const [editAddressId, setEditAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({ street: "", number: "", hood: "", complement: "", city: "", state: "", zip: "" });
  const [paymentInfo, setPaymentInfo] = useState({ cardNumber: "", cardName: "", expiry: "" });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  const [cart, setCart] = useState(null);
  const [loadingCart, setLoadingCart] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const mockUserProfile = {
    name: "",
    email: "",
    tel: "",
    cpf: "",
    birth_date: "",
    avatar: "",
    marketing: true,
    addresses: [],
    payment: [],
  };

  const deleteAddress = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este endereço?")) {
      return;
    }

    try {
      console.log("🗑️ Deleting address:", id);

      await fetch("/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      if (!csrfToken) throw new Error("CSRF token not found");

      const res = await fetch(`/addresses/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (res.status === 401) {
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete address");
      }

      setUser(prev => ({
        ...prev,
        addresses: prev.addresses.filter(addr => addr.id !== id)
      }));

      console.log("✅ Address deleted successfully");
      alert("Endereço excluído com sucesso!");

    } catch (err) {
      console.error("❌ Error deleting address:", err);
      alert("Erro ao excluir endereço!");
    }
  };

  const fetchProfile = async () => {
    try {
      console.log("🔥 Fetching profile with session cookies...");

      await fetch("/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const res = await fetch("/profile", { 
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      console.log("🔥 Profile response status:", res.status);

      if (res.status === 401) {
        console.log("🚨 401 - Not authenticated");
        localStorage.removeItem('user');
        localStorage.removeItem('loggedIn');
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("✅ PROFILE LOADED:", data);
      setUser(data);

    } catch (err) {
      console.error("Erro ao buscar perfil:", err.message);
      
      if (err.message.includes('401') || err.message.includes('network')) {
        return;
      }
      
      setUser(mockUserProfile);
    }
  };

  const saveProfile = async () => {
    if (!user?.id) {
      alert("Erro: usuário não está logado!");
      return;
    }

    try {
      console.log("Getting CSRF cookie...");
      await fetch("/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      if (!csrfToken) throw new Error("CSRF token not found");

      const res = await fetch("/profile", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          tel: user.tel,
          cpf: user.cpf,
          birth_date: user.birth_date,
          avatar: user.avatar,
          marketing: user.marketing,
        }),      
      });

      const data = await res.json();
      
      if (res.status === 401) {
        return;
      }

      if (!res.ok) throw new Error(data.message || "Erro ao salvar");

      console.log("✅ PROFILE SAVED:", data);
      setUser(data);
      setIsEditingProfile(false);
      alert("Perfil salvo com sucesso!");

    } catch (err) {
      console.error("Erro ao salvar:", err.message);
      alert("Error!");
    }
  };

  const fetchAddresses = async () => {
    try {
      console.log("🔄 Fetching addresses...");

      await fetch("/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const res = await fetch("/addresses", {
        method: "GET",
        credentials: "include",
        headers: { 
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      console.log("🔥 Addresses response status:", res.status);

      if (res.status === 401) {
        console.log("🚨 401 - Not authenticated for addresses");
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch addresses");

      setUser(prev => ({ ...prev, addresses: data }));
      console.log("✅ ADDRESSES:", data);
    } catch (err) {
      console.error("❌ Error fetching addresses:", err);
    }
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    console.log("🚀 saveAddress triggered");

    try {
      console.log("🌐 Requesting CSRF cookie...");
      await fetch("/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      if (!csrfToken) throw new Error("❌ CSRF token not found");
      console.log("🔑 CSRF token found");

      console.log("📨 Sending POST request to /addresses...", newAddress);
      const res = await fetch("/addresses", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(newAddress),
      });

      console.log("📬 Response status:", res.status);

      if (res.status === 401) {
        return;
      }

      if (res.ok) {
        const newAddr = await res.json();       
        console.log("✅ Address added successfully:", newAddr);
        setUser(prev => ({ ...prev, addresses: [...prev.addresses, newAddr] }));
        setNewAddress({ street: "", number: "", hood: "", complement: "", city: "", state: "", zip: "" });
        alert("Endereço adicionado!");
      } else {
        const data = await res.json();
        console.warn("⚠️ Failed to add address:", data);
        alert(data.message || "Erro ao adicionar endereço!");
      }
    } catch (err) {
      console.error("❌ Error in saveAddress:", err);
      alert("Erro ao adicionar endereço!");
    }
  };

  const editAddress = async (id) => {
    const addressToSave = user.addresses.find((addr) => addr.id === id);
    if (!addressToSave) return alert("Endereço não encontrado!");

    try {
      await fetch("/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];
      if (!csrfToken) throw new Error("CSRF token not found");

      const res = await fetch(`/addresses/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(addressToSave),
      });

      if (res.status === 401) {
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao atualizar endereço");
      }

      await fetchAddresses();
      setEditAddressId(null);
      alert("✅ Endereço atualizado com sucesso!");
    } catch (err) {
      console.error("❌ Erro ao editar endereço:", err);
      alert("Erro ao salvar endereço!");
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      console.log("🔄 Fetching orders...");

      await fetch("/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const res = await fetch("/api/infos", {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      console.log("🔥 Orders response status:", res.status);

      if (res.status === 401) {
        console.log("🚨 401 - Not authenticated for orders");
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        console.error("🚨 Orders API error:", errorData);
        setOrders([]);
        return;
      }

      const data = await res.json();
      console.log("✅ ORDERS LOADED:", data);
      
      setOrders(data.data || data.orders || data || []);

    } catch (err) {
      console.error("❌ Error fetching orders:", err.message);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      entregue: "bg-green-100 text-green-800",
      processando: "bg-yellow-100 text-yellow-800",
      enviado: "bg-blue-100 text-blue-800",
      cancelado: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status) => {
    const texts = {
      entregue: "Entregue",
      processando: "Processando",
      enviado: "Enviado",
      cancelado: "Cancelado"
    };
    return texts[status] || status;
  };

  const fetchWishlist = async () => {
    try {
      setLoadingWishlist(true);
      console.log("🔄 STARTING fetchWishlist with Native MongoDB...");
  
      const sessionValid = await recoverSession();
      if (!sessionValid) {
        throw new Error("Session invalid - please login again");
      }
  
      await fetch("/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });
  
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];
  
      const wishlistUrl = "/api/wishlist";
      
      const res = await fetch(wishlistUrl, {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
          "X-Requested-With": "XMLHttpRequest",
        },
      });
  
      console.log("🔥 MongoDB Wishlist response status:", res.status);
  
      if (res.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
        return;
      }
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`MongoDB Error: ${errorData.message || 'Unknown error'}`);
      }
  
      const data = await res.json();
      console.log("✅ NATIVE MONGODB WISHLIST RESPONSE:", data);
      
      const wishlistData = data.wishlist || [];
      setWishlist(wishlistData);
  
    } catch (err) {
      console.error("❌ Error fetching Native MongoDB wishlist:", err.message);
      
      if (err.message.includes('Session invalid') || err.message.includes('401')) {
        localStorage.clear();
        window.location.href = '/login';
        return;
      }
      
      alert("Erro ao carregar lista de desejos: " + err.message);
      setWishlist([]);
    } finally {
      setLoadingWishlist(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      console.log("🗑️ Removing product from wishlist:", productId);

      await fetch("/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      if (!csrfToken) throw new Error("CSRF token not found");

      const res = await fetch(`/api/wishlist/${productId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (res.status === 401) {
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to remove from wishlist");
      }

      setWishlist(prev => prev.filter(item => item.product_id !== productId));
      console.log("✅ Product removed from wishlist");
      alert("Produto removido dos desejos!");

    } catch (err) {
      console.error("❌ Error removing from wishlist:", err);
      alert("Erro ao remover produto dos desejos!");
    }
  };

  const fetchCart = async () => {
    try {
      setLoadingCart(true);
      console.log("🔄 Fetching cart from MongoDB...");
    
      await fetch("/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });
    
      const res = await fetch("/api/cart", {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });
    
      console.log("🔥 Cart response status:", res.status);
    
      if (res.status === 401) {
        console.log("🚨 401 - Not authenticated for cart");
        setCart([]);
        return;
      }
    
      if (!res.ok) {
        const errorData = await res.json();
        console.error("🚨 Cart API error:", errorData);
        throw new Error(`Cart Error: ${errorData.message || 'Unknown error'}`);
      }
    
      const data = await res.json();
      console.log("✅ CART LOADED:", data);
      
      setCart(data.cart || []);
      setCartTotal(data.total || 0);
    
    } catch (err) {
      console.error("❌ Error fetching cart:", err.message);
      setCart([]);
      setCartTotal(0);
    } finally {
      setLoadingCart(false);
    }
  };
  
  const updateCartQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
  
    try {
      await fetch("/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });
  
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];
  
      if (!csrfToken) throw new Error("CSRF token not found");
  
      const res = await fetch(`/api/cart/${productId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });
  
      if (res.status === 401) {
        return;
      }
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update cart quantity");
      }
  
      const updatedCart = cart.map(item => 
        item.product_id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      );
      setCart(updatedCart);
      
      const newTotal = updatedCart.reduce((sum, item) => {
        const product = item.product || { price: 0 };
        return sum + (product.price * item.quantity);
      }, 0);
      setCartTotal(newTotal);
  
      console.log("✅ Cart quantity updated");
  
    } catch (err) {
      console.error("❌ Error updating cart quantity:", err);
      alert("Erro ao atualizar quantidade!");
    }
  };
  
  const removeFromCart = async (productId) => {
    try {
      await fetch("/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });
  
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];
  
      if (!csrfToken) throw new Error("CSRF token not found");
  
      const res = await fetch(`/api/cart/${productId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });
  
      if (res.status === 401) {
        return;
      }
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to remove from cart");
      }
  
      const updatedCart = cart.filter(item => item.product_id !== productId);
      setCart(updatedCart);
      
      const newTotal = updatedCart.reduce((sum, item) => {
        const product = item.product || { price: 0 };
        return sum + (product.price * item.quantity);
      }, 0);
      setCartTotal(newTotal);
      
      console.log("✅ Product removed from cart");
      alert("Produto removido do carrinho!");
  
    } catch (err) {
      console.error("❌ Error removing from cart:", err);
      alert("Erro ao remover produto do carrinho!");
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetchProfile();
        await fetchAddresses();
        await fetchWishlist();
        await fetchCart();
        await fetchOrders();
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };
    
    initializeData();
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const loggedIn = localStorage.getItem('loggedIn');
    
    if (!userData || !loggedIn) {
      console.log("🚨 No user data found, redirecting to login");
    }
  }, []);

  useEffect(() => {
    if (location.pathname === "/profile/cart") {
      setActiveTab("carrinho");
    }
  }, [location.pathname]);

  if (!user) return <p className="text-black p-4 lg:p-8">Carregando perfil...</p>;

  const handleProfileChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });
  const handleAddressChange = (e) => setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  const handleEditAddressChange = (id, e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      addresses: prev.addresses.map(addr =>
        addr.id === id ? { ...addr, [name]: value } : addr
      ),
    }));
  };
  const handlePaymentChange = (e) => setPaymentInfo({ ...paymentInfo, [e.target.name]: e.target.value });
  const toggleEditProfile = () => setIsEditingProfile(!isEditingProfile);

  const handleLogout = async () => {
    try {
      await fetch("/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      
      document.cookie.split(";").forEach(cookie => {
        document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
      });
      
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-black" style={{ fontFamily: "Calibri, sans-serif" }}>
      <MobileNavigation 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        user={user}
      />

      <div className="flex">
        <DesktopSidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
        />

        <main className="flex-1 lg:ml-0 min-h-screen w-full max-w-full overflow-x-hidden">
          <div className="lg:hidden pt-16"></div>
          
          <div className="p-4 lg:p-8 w-full max-w-full">
            {activeTab === "perfil" && (
              <ResponsiveContainer className="max-w-2xl">
                <Card className="p-6">
                  <ProfileTab 
                    user={user}
                    isEditingProfile={isEditingProfile}
                    toggleEditProfile={toggleEditProfile}
                    handleProfileChange={handleProfileChange}
                    saveProfile={saveProfile}
                  />
                </Card>
              </ResponsiveContainer>
            )}

            {activeTab === "enderecos" && (
              <ResponsiveContainer className="max-w-3xl">
                <Card className="p-6">
                  <AddressesTab 
                    user={user}
                    editAddressId={editAddressId}
                    setEditAddressId={setEditAddressId}
                    newAddress={newAddress}
                    handleEditAddressChange={handleEditAddressChange}
                    handleAddressChange={handleAddressChange}
                    saveAddress={saveAddress}
                    editAddress={editAddress}
                    deleteAddress={deleteAddress}
                  />
                </Card>
              </ResponsiveContainer>
            )}

            {activeTab === "pedidos" && (
              <ResponsiveContainer className="max-w-6xl">
                <Card className="p-6">
                  <OrdersTab 
                    setActiveTab={setActiveTab}
                    getStatusColor={getStatusColor}
                    getStatusText={getStatusText}
                  />
                </Card>
              </ResponsiveContainer>
            )}

            {activeTab === "desejos" && (
              <ResponsiveContainer className="max-w-6xl">
                <Card className="p-6">
                  <WishlistTab 
                    wishlist={wishlist}
                    loadingWishlist={loadingWishlist}
                    fetchWishlist={fetchWishlist}
                    removeFromWishlist={removeFromWishlist}
                  />
                </Card>
              </ResponsiveContainer>
            )}

            {activeTab === "carrinho" && (
              <ResponsiveContainer className="max-w-6xl">
                <Card className="p-6">
                  <CartTab 
                    cart={cart}
                    loadingCart={loadingCart}
                    updateCartQuantity={updateCartQuantity}
                    removeFromCart={removeFromCart}
                    cartTotal={cartTotal}
                  />
                </Card>
              </ResponsiveContainer>
            )}

            {/* FIXED PAYMENT TAB - No wrappers for better mobile support */}
            {activeTab === "pagamentos" && (
              <div className="w-full max-w-full">
                <PaymentTab />
              </div>
            )}

            {activeTab === "cupons" && (
              <ResponsiveContainer className="max-w-3xl">
                <Card className="p-6">
                  <CouponsTab />
                </Card>
              </ResponsiveContainer>
            )}

            {activeTab === "configuracoes" && (
              <ResponsiveContainer className="max-w-3xl">
                <Card className="p-6">
                  <ConfigurationTab />
                </Card>
              </ResponsiveContainer>
            )}

            {activeTab === "suporte" && (
              <ResponsiveContainer className="max-w-3xl">
                <Card className="p-6">
                  <HelpTab />
                </Card>
              </ResponsiveContainer>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;