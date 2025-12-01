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
  const [likes, setLikes] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchAddresses();
    fetchLikes();
    fetchCart();
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
        window.location.href = '/login';
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
        window.location.href = '/login';
        return;
      }
      
      // Only use mock data for non-auth errors
      setUser(mockUserProfile);
    }
  };

  // ✅ Fetch likes/favorites
  const fetchLikes = async () => {
    try {
      console.log("🔄 Fetching likes...");

      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const res = await fetch("http://localhost:8000/likes", {
        method: "GET",
        credentials: "include",
        headers: { 
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      console.log("🔥 Likes response status:", res.status);

      if (res.status === 401) {
        console.log("🚨 401 - Not authenticated for likes");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setLikes(data);
        console.log("✅ LIKES:", data);
      } else {
        // Mock data for demonstration
        setLikes([
          { id: 1, name: "Produto Exemplo 1", price: "R$ 99,90", image: "/api/placeholder/100/100" },
          { id: 2, name: "Produto Exemplo 2", price: "R$ 149,90", image: "/api/placeholder/100/100" },
        ]);
      }
    } catch (err) {
      console.error("❌ Error fetching likes:", err);
      // Mock data for demonstration
      setLikes([
        { id: 1, name: "Produto Exemplo 1", price: "R$ 99,90", image: "/api/placeholder/100/100" },
        { id: 2, name: "Produto Exemplo 2", price: "R$ 149,90", image: "/api/placeholder/100/100" },
      ]);
    }
  };

  // ✅ Fetch cart
  const fetchCart = async () => {
    try {
      console.log("🔄 Fetching cart...");

      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const res = await fetch("http://localhost:8000/cart", {
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
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setCart(data);
        console.log("✅ CART:", data);
      } else {
        // Mock data for demonstration
        setCart([
          { id: 1, name: "Produto Carrinho 1", price: "R$ 79,90", quantity: 2, image: "/api/placeholder/100/100" },
          { id: 2, name: "Produto Carrinho 2", price: "R$ 129,90", quantity: 1, image: "/api/placeholder/100/100" },
        ]);
      }
    } catch (err) {
      console.error("❌ Error fetching cart:", err);
      // Mock data for demonstration
      setCart([
        { id: 1, name: "Produto Carrinho 1", price: "R$ 79,90", quantity: 2, image: "/api/placeholder/100/100" },
        { id: 2, name: "Produto Carrinho 2", price: "R$ 129,90", quantity: 1, image: "/api/placeholder/100/100" },
      ]);
    }
  };

  // ✅ Remove from likes
  const removeFromLikes = async (productId) => {
    try {
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      const res = await fetch(`http://localhost:8000/likes/${productId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (res.ok) {
        setLikes(likes.filter(item => item.id !== productId));
        alert("Produto removido dos favoritos!");
      } else {
        // Fallback: remove from local state
        setLikes(likes.filter(item => item.id !== productId));
      }
    } catch (err) {
      console.error("❌ Error removing from likes:", err);
      // Fallback: remove from local state
      setLikes(likes.filter(item => item.id !== productId));
    }
  };

  // ✅ Update cart quantity
  const updateCartQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    try {
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      const res = await fetch(`http://localhost:8000/cart/${productId}`, {
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

      if (res.ok) {
        setCart(cart.map(item => 
          item.id === productId ? { ...item, quantity: newQuantity } : item
        ));
      } else {
        // Fallback: update local state
        setCart(cart.map(item => 
          item.id === productId ? { ...item, quantity: newQuantity } : item
        ));
      }
    } catch (err) {
      console.error("❌ Error updating cart:", err);
      // Fallback: update local state
      setCart(cart.map(item => 
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  // ✅ Remove from cart
  const removeFromCart = async (productId) => {
    try {
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      const res = await fetch(`http://localhost:8000/cart/${productId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (res.ok) {
        setCart(cart.filter(item => item.id !== productId));
        alert("Produto removido do carrinho!");
      } else {
        // Fallback: remove from local state
        setCart(cart.filter(item => item.id !== productId));
      }
    } catch (err) {
      console.error("❌ Error removing from cart:", err);
      // Fallback: remove from local state
      setCart(cart.filter(item => item.id !== productId));
    }
  };

  // ✅ Calculate cart total
  const calculateCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.price.replace('R$ ', '').replace(',', '.'));
      return total + (price * item.quantity);
    }, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Rest of your existing functions (saveProfile, fetchAddresses, saveAddress, editAddress, etc.)
  // ... [Keep all your existing functions exactly as they are]

  // Check authentication on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const loggedIn = localStorage.getItem('loggedIn');
    
    if (!userData || !loggedIn) {
      console.log("🚨 No user data found, redirecting to login");
      window.location.href = '/login';
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
          <li className={`cursor-pointer ${activeTab === "favoritos" ? "font-bold" : ""}`} onClick={() => setActiveTab("favoritos")}>Desejos</li>
          <li className={`cursor-pointer ${activeTab === "carrinho" ? "font-bold" : ""}`} onClick={() => setActiveTab("carrinho")}>Carrinho</li>
          <li className={`cursor-pointer ${activeTab === "cupons" ? "font-bold" : ""}`} onClick={() => setActiveTab("cupons")}>Cupons & Créditos</li>
          <li className={`cursor-pointer ${activeTab === "configuracoes" ? "font-bold" : ""}`} onClick={() => setActiveTab("configuracoes")}>Configurações</li>
          <li className={`cursor-pointer ${activeTab === "suporte" ? "font-bold" : ""}`} onClick={() => setActiveTab("suporte")}>Suporte e Ajuda</li>
          <li className="cursor-pointer text-red-600" onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
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

        {/* Favoritos/Likes */}
        {activeTab === "favoritos" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto text-black">
            <h2 className="text-xl font-semibold mb-6 text-black">Meus Favoritos</h2>
            {likes.length === 0 ? (
              <p className="text-gray-500 text-center">Nenhum produto favoritado ainda.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {likes.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-md mb-3"
                    />
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <p className="text-green-600 font-bold mb-3">{product.price}</p>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => removeFromLikes(product.id)}
                        className="flex-1 bg-red-600 text-white py-2 px-3 rounded hover:bg-red-700 text-sm"
                      >
                        Remover
                      </button>
                      <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 text-sm">
                        Comprar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Carrinho */}
        {activeTab === "carrinho" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto text-black">
            <h2 className="text-xl font-semibold mb-6 text-black">Meu Carrinho</h2>
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center">Seu carrinho está vazio.</p>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center border-b pb-4">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-md mr-4"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-green-600 font-bold">{item.price}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="ml-4 text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-xl font-bold text-green-600">{calculateCartTotal()}</span>
                  </div>
                  <button className="w-full bg-green-600 text-white py-3 px-4 rounded hover:bg-green-700 font-semibold">
                    Finalizar Compra
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Other tabs */}
        {activeTab === "pedidos" && <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto text-black">Histórico de pedidos</div>}
        {activeTab === "cupons" && <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto text-black">Cupons</div>}
        {activeTab === "configuracoes" && <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto text-black">Configurações</div>}
        {activeTab === "suporte" && <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto text-black">Suporte</div>}
      </main>
    </div>
  );
};

export default ProfilePage;