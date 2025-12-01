import React, { useState, useEffect } from "react";

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

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("perfil");
  const [editAddressId, setEditAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({ street: "", number: "", city: "", state: "", zip: "" });
  const [paymentInfo, setPaymentInfo] = useState({ cardNumber: "", cardName: "", expiry: "" });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Wishlist state - ADDED
  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchAddresses();
    fetchWishlist();
  }, []);

   // ✅ UPDATED: No token, just session cookies
  const fetchProfile = async () => {
    try {
      console.log("🔥 Fetching profile with session cookies...");

      // 1️⃣ Get CSRF cookie first
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      // 2️⃣ Fetch profile using session cookies only
      const res = await fetch("http://localhost:8000/profile", { 
        method: "GET",
        credentials: "include", // This sends the session cookie automatically
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
        //window.location.href = '/login';
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
      
      // If authentication error, redirect to login
      if (err.message.includes('401') || err.message.includes('network')) {
        //window.location.href = '/login';
        return;
      }
      
      // Only use mock data for non-auth errors
      setUser(mockUserProfile);
    }
  };

  // ✅ UPDATED: Save profile with session cookies
  const saveProfile = async () => {
    if (!user?.id) {
      alert("Erro: usuário não está logado!");
      return;
    }

    try {
      // 1️⃣ Get CSRF cookie
      console.log("Getting CSRF cookie...");
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      // 2️⃣ Extract CSRF token from cookies
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      if (!csrfToken) throw new Error("CSRF token not found");

      // 3️⃣ Save profile with session cookies
      const res = await fetch("http://localhost:8000/profile", {
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
        //window.location.href = '/login';
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

  // ✅ UPDATED: Fetch addresses with session cookies
  const fetchAddresses = async () => {
    try {
      console.log("🔄 Fetching addresses...");

      // Get CSRF cookie first
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const res = await fetch("http://localhost:8000/addresses", {
        method: "GET",
        credentials: "include", // Session cookies sent automatically
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

  // ✅ UPDATED: Save address with session cookies
  const saveAddress = async (e) => {
    e.preventDefault();
    console.log("🚀 saveAddress triggered");

    try {
      // 1️⃣ Get CSRF cookie
      console.log("🌐 Requesting CSRF cookie...");
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      // 2️⃣ Extract CSRF token
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      if (!csrfToken) throw new Error("❌ CSRF token not found");
      console.log("🔑 CSRF token found");

      // 3️⃣ Send POST request with session cookies
      console.log("📨 Sending POST request to /addresses...", newAddress);
      const res = await fetch("http://localhost:8000/addresses", {
        method: "POST",
        credentials: "include", // Session cookies sent automatically
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
        window.location.href = '/login';
        return;
      }

      if (res.ok) {
        const newAddr = await res.json();       
        console.log("✅ Address added successfully:", newAddr);
        setUser(prev => ({ ...prev, addresses: [...prev.addresses, newAddr] }));
        setNewAddress({ street: "", number: "", city: "", state: "", zip: "" });
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

  // ✅ UPDATED: Edit address with session cookies
  const editAddress = async (id) => {
    const addressToSave = user.addresses.find((addr) => addr.id === id);
    if (!addressToSave) return alert("Endereço não encontrado!");

    try {
      // 1️⃣ Get CSRF cookie
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      // 2️⃣ Extract CSRF token
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];
      if (!csrfToken) throw new Error("CSRF token not found");

      // 3️⃣ Send PUT request with session cookies
      const res = await fetch(`http://localhost:8000/addresses/${id}`, {
        method: "PUT",
        credentials: "include", // Session cookies sent automatically
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(addressToSave),
      });

      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao atualizar endereço");
      }

      // 4️⃣ Update UI
      await fetchAddresses();
      setEditAddressId(null);
      alert("✅ Endereço atualizado com sucesso!");
    } catch (err) {
      console.error("❌ Erro ao editar endereço:", err);
      alert("Erro ao salvar endereço!");
    }
  };

  // ✅ ADDED: Fetch wishlist with session cookies
  const fetchWishlist = async () => {
    try {
      setLoadingWishlist(true);
      console.log("🔄 Fetching wishlist...");

      // 1️⃣ Get CSRF cookie first
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      // 2️⃣ Fetch wishlist using session cookies
      const res = await fetch("http://localhost:8000/api/wishlist", {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      console.log("🔥 Wishlist response status:", res.status);

      if (res.status === 401) {
        console.log("🚨 401 - Not authenticated for wishlist");
        window.location.href = '/login';
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("✅ WISHLIST LOADED:", data);
      setWishlist(data.wishlist || []);

    } catch (err) {
      console.error("❌ Error fetching wishlist:", err.message);
      setWishlist([]);
    } finally {
      setLoadingWishlist(false);
    }
  };

  // ✅ ADDED: Remove product from wishlist
  const removeFromWishlist = async (productId) => {
    try {
      console.log("🗑️ Removing product from wishlist:", productId);

      // 1️⃣ Get CSRF cookie
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      // 2️⃣ Extract CSRF token
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      if (!csrfToken) throw new Error("CSRF token not found");

      // 3️⃣ Send DELETE request
      const res = await fetch(`http://localhost:8000/api/wishlist/${productId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to remove from wishlist");
      }

      // 4️⃣ Update local state
      setWishlist(prev => prev.filter(item => item.product_id !== productId));
      console.log("✅ Product removed from wishlist");
      alert("Produto removido dos desejos!");

    } catch (err) {
      console.error("❌ Error removing from wishlist:", err);
      alert("Erro ao remover produto dos desejos!");
    }
  };

  // ✅ ADDED: Toggle product in wishlist (add/remove)
  const toggleWishlist = async (productId) => {
    try {
      console.log("🔄 Toggling wishlist for product:", productId);

      // 1️⃣ Get CSRF cookie
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      // 2️⃣ Extract CSRF token
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      if (!csrfToken) throw new Error("CSRF token not found");

      // 3️⃣ Send POST request to toggle
      const res = await fetch("http://localhost:8000/api/wishlist/toggle", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ product_id: productId }),
      });

      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to toggle wishlist");
      }

      console.log("✅ Wishlist toggled:", data);

      // Refresh wishlist if we're on the wishlist tab
      if (activeTab === "desejos") {
        fetchWishlist();
      }

      return data;

    } catch (err) {
      console.error("❌ Error toggling wishlist:", err);
      alert("Erro ao atualizar lista de desejos!");
    }
  };

  // Check authentication on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const loggedIn = localStorage.getItem('loggedIn');
    
    if (!userData || !loggedIn) {
      console.log("🚨 No user data found, redirecting to login");
      //window.location.href = '/login';
    }
  }, []);

  if (!user) return <p className="text-black">Carregando perfil...</p>;

  const handleProfileChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });
  const handleAddressChange = (e) => setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  const handleEditAddressChange = (id, e) => {
    setUser({
      ...user,
      addresses: user.addresses.map(addr =>
        addr.id === id ? { ...addr, [e.target.name]: e.target.value } : addr
      ),
    });
  };
  const handlePaymentChange = (e) => setPaymentInfo({ ...paymentInfo, [e.target.name]: e.target.value });
  const toggleEditProfile = () => setIsEditingProfile(!isEditingProfile);

  // ✅ ADDED: Wishlist Tab Component
  const WishlistTab = () => {
    if (loadingWishlist) {
      return <div className="text-center py-8 text-black">Carregando seus desejos...</div>;
    }

    if (wishlist.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">Sua lista de desejos está vazia</p>
          <p className="text-gray-400">Adicione produtos que você gosta para vê-los aqui!</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map((item) => (
          <div key={item.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-white">
            {item.product && (
              <>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg text-black">{item.product.name}</h3>
                  <button
                    onClick={() => removeFromWishlist(item.product_id)}
                    className="text-red-500 hover:text-red-700 text-lg font-bold"
                    title="Remover dos desejos"
                  >
                    ×
                  </button>
                </div>
                
                {item.product.image && (
                  <img 
                    src={item.product.image} 
                    alt={item.product.name}
                    className="w-full h-48 object-cover rounded mb-3"
                  />
                )}
                
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {item.product.description}
                </p>
                
                <div className="flex justify-between items-center mt-4">
                  <span className="text-green-600 font-bold">
                    R$ {item.product.price ? parseFloat(item.product.price).toFixed(2) : '0,00'}
                  </span>
                  <button
                    onClick={() => {/* Add to cart functionality */}}
                    className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700 text-sm"
                  >
                    Comprar
                  </button>
                </div>
              </>
            )}
            
            {!item.product && (
              <div className="text-center text-gray-500">
                <p>Produto não encontrado</p>
                <button
                  onClick={() => removeFromWishlist(item.product_id)}
                  className="text-red-500 hover:text-red-700 mt-2"
                >
                  Remover
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-100 text-black" style={{ fontFamily: "Calibri, sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-50 bg-white shadow-md p-6 mt-25 text-black">
        <h2 className="text-2xl pt-5 font-semibold mb-8 text-black">...</h2>
        <ul className="space-y-4">
          <li className={`cursor-pointer ${activeTab === "perfil" ? "font-bold" : ""}`} onClick={() => setActiveTab("perfil")}>Perfil</li>
          <li className={`cursor-pointer ${activeTab === "enderecos" ? "font-bold" : ""}`} onClick={() => setActiveTab("enderecos")}>Endereço</li>
          <li className={`cursor-pointer ${activeTab === "pagamento" ? "font-bold" : ""}`} onClick={() => setActiveTab("pagamento")}>Pagamento</li>
          <li className={`cursor-pointer ${activeTab === "pedidos" ? "font-bold" : ""}`} onClick={() => setActiveTab("pedidos")}>Pedidos</li>
          <li className={`cursor-pointer ${activeTab === "desejos" ? "font-bold" : ""}`} onClick={() => setActiveTab("desejos")}>Desejos</li>
          <li className={`cursor-pointer ${activeTab === "cupons" ? "font-bold" : ""}`} onClick={() => setActiveTab("cupons")}>Cupons & Créditos</li>
          <li className={`cursor-pointer ${activeTab === "configuracoes" ? "font-bold" : ""}`} onClick={() => setActiveTab("configuracoes")}>Configurações</li>
          <li className={`cursor-pointer ${activeTab === "suporte" ? "font-bold" : ""}`} onClick={() => setActiveTab("suporte")}>Suporte e Ajuda</li>
          <li className="cursor-pointer text-red-600" onClick={() => {
            localStorage.clear();
            //window.location.href = '/login';
          }}>Sair</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-2 text-black pt-40">
        {/* Perfil */}
        {activeTab === "perfil" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto text-black">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-black">Informações do Usuário</h2>
              <button
                onClick={toggleEditProfile}
                className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700"
              >
                {isEditingProfile ? "Cancelar" : "Editar"}
              </button>
            </div>
            <div className="flex flex-col space-y-4">
              <input type="text" name="name" value={user.name || ''} onChange={handleProfileChange} placeholder="Nome" className="border p-2 rounded text-black" disabled={!isEditingProfile} />
              <input type="email" name="email" value={user.email || ''} onChange={handleProfileChange} placeholder="Email" className="border p-2 rounded text-black" disabled={!isEditingProfile} />
              <input type="text" name="tel" value={user.tel || ''} onChange={handleProfileChange} placeholder="Telefone" className="border p-2 rounded text-black" disabled={!isEditingProfile} />
              <input type="text" name="cpf" value={user.cpf || ''} onChange={handleProfileChange} placeholder="CPF" className="border p-2 rounded text-black" disabled={!isEditingProfile} />
              <input type="date" name="birth_date" value={user.birth_date || ''} onChange={handleProfileChange} className="border p-2 rounded text-black" disabled={!isEditingProfile} />
              {isEditingProfile && (
                <button onClick={saveProfile} className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
                  Salvar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Endereços */}
        {activeTab === "enderecos" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto text-black">
            <h2 className="text-xl font-semibold mb-4 text-black">Endereços</h2>
            {user.addresses?.map((addr) => (
              <div key={addr.id} className="border-b last:border-b-0 py-3 text-black">
                {editAddressId === addr.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <input type="text" name="street" value={addr.street || ''} onChange={(e) => handleEditAddressChange(addr.id, e)} className="border p-2 rounded text-black"/>
                    <input type="text" name="number" value={addr.number || ''} onChange={(e) => handleEditAddressChange(addr.id, e)} className="border p-2 rounded text-black"/>
                    <input type="text" name="city" value={addr.city || ''} onChange={(e) => handleEditAddressChange(addr.id, e)} className="border p-2 rounded text-black"/>
                    <input type="text" name="state" value={addr.state || ''} onChange={(e) => handleEditAddressChange(addr.id, e)} className="border p-2 rounded text-black"/>
                    <input type="text" name="zip" value={addr.zip || ''} onChange={(e) => handleEditAddressChange(addr.id, e)} className="border p-2 rounded text-black"/>
                    <button onClick={() => editAddress(addr.id)} className="bg-green-600 text-white py-2 px-4 rounded col-span-full mt-2">Salvar</button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-black">{addr.street}, {addr.number}</p>
                      <p className="text-black">{addr.city} - {addr.state}, {addr.zip}</p>
                    </div>
                    <button onClick={() => setEditAddressId(addr.id)} className="text-blue-600 hover:underline">Editar</button>
                  </div>
                )}
              </div>
            ))}
            <form className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={saveAddress}>
              <input type="text" name="street" value={newAddress.street} onChange={handleAddressChange} placeholder="Rua" className="border p-2 rounded text-black" required/>
              <input type="text" name="number" value={newAddress.number} onChange={handleAddressChange} placeholder="Número" className="border p-2 rounded text-black" required/>
              <input type="text" name="city" value={newAddress.city} onChange={handleAddressChange} placeholder="Cidade" className="border p-2 rounded text-black" required/>
              <input type="text" name="state" value={newAddress.state} onChange={handleAddressChange} placeholder="Estado" className="border p-2 rounded text-black" required/>
              <input type="text" name="zip" value={newAddress.zip} onChange={handleAddressChange} placeholder="CEP" className="border p-2 rounded text-black" required/>
              <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded col-span-full">Adicionar</button>
            </form>
          </div>
        )}

        {/* Pagamento */}
        {activeTab === "pagamento" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto text-black">
            <h2 className="text-xl font-semibold mb-4 text-black">Informações de Pagamento</h2>
            {user.payment?.map((p) => (
              <div key={p.id} className="mb-4 border-b pb-3 text-black">
                <input type="text" name="cardNumber" value={p.cardNumber} onChange={(e) => setUser({
                  ...user,
                  payment: user.payment.map(pay => pay.id === p.id ? { ...pay, cardNumber: e.target.value } : pay)
                })} className="border p-2 rounded mb-2 w-full text-black"/>
                <input type="text" name="cardName" value={p.cardName} onChange={(e) => setUser({
                  ...user,
                  payment: user.payment.map(pay => pay.id === p.id ? { ...pay, cardName: e.target.value } : pay)
                })} className="border p-2 rounded mb-2 w-full text-black"/>
                <input type="text" name="expiry" value={p.expiry} onChange={(e) => setUser({
                  ...user,
                  payment: user.payment.map(pay => pay.id === p.id ? { ...pay, expiry: e.target.value } : pay)
                })} className="border p-2 rounded w-full text-black"/>
              </div>
            ))}
            <form className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => {
              e.preventDefault();
              setUser({ ...user, payment: [...user.payment, { id: Date.now(), ...paymentInfo }] });
              setPaymentInfo({ cardNumber: "", cardName: "", expiry: "" });
            }}>
              <input type="text" name="cardNumber" value={paymentInfo.cardNumber} onChange={handlePaymentChange} placeholder="Número do cartão" className="border p-2 rounded text-black" required/>
              <input type="text" name="cardName" value={paymentInfo.cardName} onChange={handlePaymentChange} placeholder="Nome no cartão" className="border p-2 rounded text-black" required/>
              <input type="text" name="expiry" value={paymentInfo.expiry} onChange={handlePaymentChange} placeholder="Validade (MM/AA)" className="border p-2 rounded text-black" required/>
              <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded col-span-full">Adicionar</button>
            </form>
          </div>
        )}

        {/* Other tabs */}
        {activeTab === "pedidos" && <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto text-black">Histórico de pedidos</div>}
        
        {/* ✅ UPDATED: Desejos Tab with Wishlist Functionality */}
        {activeTab === "desejos" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-7xl mx-auto text-black">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-black">Meus Desejos</h2>
              <div className="text-gray-500">
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'itens'}
              </div>
            </div>
            <WishlistTab />
          </div>
        )}
        
        {activeTab === "cupons" && <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto text-black">Cupons</div>}
        {activeTab === "configuracoes" && <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto text-black">Configurações</div>}
        {activeTab === "suporte" && <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto text-black">Suporte</div>}
      </main>
    </div>
  );
};

export default ProfilePage;