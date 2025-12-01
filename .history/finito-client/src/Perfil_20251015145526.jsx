import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

{/*
const mockUserProfile = {
  name: "João Silva",
  email: "joao.silva@email.com",
  phone: "+55 11 91234-5678",
  cpf: "123.456.789-00",
  birthDate: "1990-05-15",
  avatar: "https://i.pravatar.cc/150?img=3",
  marketingOptIn: true,
  addresses: [
    { id: 1, street: "Rua das Flores", number: "123", city: "São Paulo", state: "SP", zip: "01234-567" },
    { id: 2, street: "Avenida Brasil", number: "456", city: "Rio de Janeiro", state: "RJ", zip: "23456-789" },
  ],
  payment: [
    { id: 1, cardNumber: "**** **** **** 1234", cardName: "João Silva", expiry: "12/25" },
  ],
};
*/}  

  axios.defaults.baseURL = "http://localhost:8000";
  axios.defaults.withCredentials = true;
  axios.defaults.headers.common['Accept'] = 'application/json';
  axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
  
const mockUserProfile = {
  name: "",
  email: "",
  tel: "",
  cpf: "",
  birth_date: "",
  avatar: "",
  receber_marketing: true,
  addresses: [
    { id: 1, street: "Rua das Flores", number: "123", city: "São Paulo", state: "SP", zip: "01234-567" },
    { id: 2, street: "Avenida Brasil", number: "456", city: "São Paulo", state: "SP", zip: "23456-789" },
  ],
  payment: [
    { id: 1, cardNumber: "**** **** **** 1234", cardName: "", expiry: "" },
  ],
};

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("perfil");
  const [editAddressId, setEditAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({ street: "", number: "", city: "", state: "", zip: "" });
  const [paymentInfo, setPaymentInfo] = useState({ cardNumber: "", cardName: "", expiry: "" });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

 const navigate = useNavigate();

useEffect(() => { setUser(mockUserProfile); }, []);

useEffect(() => {
  fetchProfile();
}, []);

const fetchProfile = async () => {
  try {
    // 1️⃣ Get CSRF cookie (required for Laravel Sanctum)
    await fetch("http://localhost:8000/sanctum/csrf-cookie", {
      method: "GET",
      credentials: "include", // 🔥 allows sending/receiving cookies
    });

    // 2️⃣ Try session-based authentication first
    let res = await fetch("http://localhost:8000/api/profile", {
      method: "GET",
      credentials: "include", // 🔥 send the Sanctum cookie
      headers: {
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    // 3️⃣ Fallback: if session fails, try token auth
    if (res.status === 401) {
      const token = localStorage.getItem("token"); // previously saved API token
      if (!token) throw new Error("Not authenticated");

      res = await fetch("http://localhost:8000/api/profile", {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-Requested-With": "XMLHttpRequest",
        },
      });
    }

    // 4️⃣ Parse response
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Erro ao buscar perfil");

    // 5️⃣ Update state
    setUser(data);

  } catch (err) {
    console.error("Erro ao buscar perfil:", err.message);
    alert("Erro ao buscar perfil. Redirecionando para login...");
    navigate("/login"); // redirect to login page
  }
};


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


const saveProfile = async () => {
  if (!user?.id) {
    alert("Erro: usuário não está logado ou não possui ID! Redirecionando para login...");
    return;
  }

  try {
    console.log("Getting CSRF cookie...");
    // Call Sanctum CSRF endpoint first
    await axios.get("http://localhost:8000/sanctum/csrf-cookie", { withCredentials: true });
    console.log("CSRF cookie obtained, sending profile update...");

    // PUT to the /api/profile route (no dynamic id needed)
    const res = await axios.put(
      "http://localhost:8000/api/profile",
      {
        name: user.name,
        email: user.email,
        tel: user.tel,
        cpf: user.cpf,
        birth_date: user.birth_date,
        avatar: user.avatar,
        marketing: user.marketing,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": decodeURIComponent(
            document.cookie
              .split("; ")
              .find((row) => row.startsWith("XSRF-TOKEN="))
              ?.split("=")[1]
          ),
        },
        withCredentials: true,
      }
    );

    setUser(res.data);
    setIsEditingProfile(false);
    alert("Perfil salvo com sucesso!");
  } catch (err) {
    console.error("Error saving profile:", err.response?.data || err.message);
    alert("Erro ao salvar perfil!");
  }
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
          <li className={`cursor-pointer ${activeTab === "favoritos" ? "font-bold" : ""}`} onClick={() => setActiveTab("favoritos")}>Desejos</li>
          <li className={`cursor-pointer ${activeTab === "cupons" ? "font-bold" : ""}`} onClick={() => setActiveTab("cupons")}>Cupons & Créditos</li>
          <li className={`cursor-pointer ${activeTab === "configuracoes" ? "font-bold" : ""}`} onClick={() => setActiveTab("configuracoes")}>Configurações</li>
          <li className={`cursor-pointer ${activeTab === "suporte" ? "font-bold" : ""}`} onClick={() => setActiveTab("suporte")}>Suporte e Ajuda</li>
          <li className="cursor-pointer text-red-600" onClick={() => alert("Logout")}>Sair</li>
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
              <input type="text" name="name" value={user.name} onChange={handleProfileChange} placeholder="Nome" className="border p-2 rounded text-black" disabled={!isEditingProfile} />
              <input type="email" name="email" value={user.email} onChange={handleProfileChange} placeholder="Email" className="border p-2 rounded text-black" disabled={!isEditingProfile} />
              <input type="text" name="tel" value={user.tel} onChange={handleProfileChange} placeholder="Telefone" className="border p-2 rounded text-black" disabled={!isEditingProfile} />
              <input type="text" name="cpf" value={user.cpf} onChange={handleProfileChange} placeholder="CPF" className="border p-2 rounded text-black" disabled={!isEditingProfile} />
              <input type="text" name="birth_date" value={user.birth_date} onChange={handleProfileChange} placeholder="dd/mm/aaaa" className="border border-black p-2 rounded text-black" disabled={!isEditingProfile} />

              {isEditingProfile && (
                <button
                  onClick={saveProfile}
                  className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                >
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
            {user.addresses.map((addr) => (
              <div key={addr.id} className="border-b last:border-b-0 py-3 text-black">
                {editAddressId === addr.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <input type="text" name="street" value={addr.street} onChange={(e) => handleEditAddressChange(addr.id, e)} className="border p-2 rounded text-black"/>
                    <input type="text" name="number" value={addr.number} onChange={(e) => handleEditAddressChange(addr.id, e)} className="border p-2 rounded text-black"/>
                    <input type="text" name="city" value={addr.city} onChange={(e) => handleEditAddressChange(addr.id, e)} className="border p-2 rounded text-black"/>
                    <input type="text" name="state" value={addr.state} onChange={(e) => handleEditAddressChange(addr.id, e)} className="border p-2 rounded text-black"/>
                    <input type="text" name="zip" value={addr.zip} onChange={(e) => handleEditAddressChange(addr.id, e)} className="border p-2 rounded text-black"/>
                    <button onClick={() => setEditAddressId(null)} className="bg-green-600 text-black py-2 px-4 rounded col-span-full mt-2">Salvar</button>
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
           <form className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleAddAddress}>
  <input type="text" name="street" value={newAddress.street} onChange={handleAddressChange} placeholder="Rua" className="border p-2 rounded text-black" required/>
  <input type="text" name="number" value={newAddress.number} onChange={handleAddressChange} placeholder="Número" className="border p-2 rounded text-black" required/>
  <input type="text" name="city" value={newAddress.city} onChange={handleAddressChange} placeholder="Cidade" className="border p-2 rounded text-black" required/>
  <input type="text" name="state" value={newAddress.state} onChange={handleAddressChange} placeholder="Estado" className="border p-2 rounded text-black" required/>
  <input type="text" name="zip" value={newAddress.zip} onChange={handleAddressChange} placeholder="CEP" className="border p-2 rounded text-black" required/>
  <button type="submit" className="bg-blue-600 text-black py-2 px-4 rounded col-span-full">Adicionar</button>
</form>
          </div>
        )}

        {/* Pagamento */}
        {activeTab === "pagamento" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto text-black">
            <h2 className="text-xl font-semibold mb-4 text-black">Informações de Pagamento</h2>
            {user.payment.map((p) => (
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
              <button type="submit" className="bg-blue-600 text-black py-2 px-4 rounded col-span-full">Adicionar</button>
            </form>
          </div>
        )}

        {/* Pedidos */}
        {activeTab === "pedidos" && <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto text-black">Histórico de pedidos, status e faturas aqui</div>}

        {/* Favoritos */}
        {activeTab === "favoritos" && <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto text-black">Produtos salvos para compra futura</div>}

        {/* Cupons */}
        {activeTab === "cupons" && <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto text-black">Cupons disponíveis e pontos de fidelidade</div>}

        {/* Configurações */}
        {activeTab === "configuracoes" && <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto text-black">Alterar senha, login, notificações</div>}

        {/* Suporte */}
        {activeTab === "suporte" && <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto text-black">Chat com suporte, FAQ e contato</div>}
      </main>
    </div>
  );
};

export default ProfilePage;
