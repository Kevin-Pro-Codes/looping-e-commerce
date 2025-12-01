import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Axios default configuration
axios.defaults.baseURL = "http://localhost:8000";
axios.defaults.withCredentials = true; // send cookies
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Mock fallback profile (optional)
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

  const navigate = useNavigate();

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  // -----------------------------
  // Fetch Profile
  // -----------------------------
  const fetchProfile = async () => {
    try {
      // 1️⃣ Get CSRF cookie from Laravel Sanctum
      await axios.get("/sanctum/csrf-cookie");

      // 2️⃣ Request user profile
      const res = await axios.get("/api/profile");
      setUser(res.data);
    } catch (err) {
      console.error("Erro ao buscar perfil:", err.response?.data || err.message);
      alert("Erro ao buscar perfil. Redirecionando para login...");
      navigate("/login");
    }
  };

  // -----------------------------
  // Handle Profile Form
  // -----------------------------
  const handleProfileChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });
  const toggleEditProfile = () => setIsEditingProfile(!isEditingProfile);

  const saveProfile = async () => {
    if (!user) return;

    try {
      // Ensure CSRF cookie
      await axios.get("/sanctum/csrf-cookie");

      // PUT to /api/profile
      const res = await axios.put("/api/profile", {
        name: user.name,
        email: user.email,
        tel: user.tel,
        cpf: user.cpf,
        birth_date: user.birth_date,
        avatar: user.avatar,
        marketing: user.marketing,
      });

      setUser(res.data);
      setIsEditingProfile(false);
      alert("Perfil salvo com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar perfil:", err.response?.data || err.message);
      alert("Erro ao salvar perfil!");
    }
  };

  // -----------------------------
  // Handle Addresses
  // -----------------------------
  const handleAddressChange = (e) => setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  const handleEditAddressChange = (id, e) => {
    setUser({
      ...user,
      addresses: user.addresses.map(addr =>
        addr.id === id ? { ...addr, [e.target.name]: e.target.value } : addr
      ),
    });
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await axios.get("/sanctum/csrf-cookie");
      const res = await axios.post("/api/addresses", newAddress);
      setUser({ ...user, addresses: [...user.addresses, res.data] });
      setNewAddress({ street: "", number: "", city: "", state: "", zip: "" });
    } catch (err) {
      console.error("Erro ao adicionar endereço:", err.response?.data || err.message);
      alert("Erro ao adicionar endereço!");
    }
  };

  // -----------------------------
  // Handle Payment
  // -----------------------------
  const handlePaymentChange = (e) => setPaymentInfo({ ...paymentInfo, [e.target.name]: e.target.value });

  const addPayment = (e) => {
    e.preventDefault();
    setUser({ ...user, payment: [...user.payment, { id: Date.now(), ...paymentInfo }] });
    setPaymentInfo({ cardNumber: "", cardName: "", expiry: "" });
  };

  if (!user) return <p className="text-black">Carregando perfil...</p>;

  return (
    <div className="flex min-h-screen bg-gray-100 text-black" style={{ fontFamily: "Calibri, sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-50 bg-white shadow-md p-6 mt-25">
        <h2 className="text-2xl pt-5 font-semibold mb-8">Menu</h2>
        <ul className="space-y-4">
          <li className={`cursor-pointer ${activeTab === "perfil" ? "font-bold" : ""}`} onClick={() => setActiveTab("perfil")}>Perfil</li>
          <li className={`cursor-pointer ${activeTab === "enderecos" ? "font-bold" : ""}`} onClick={() => setActiveTab("enderecos")}>Endereço</li>
          <li className={`cursor-pointer ${activeTab === "pagamento" ? "font-bold" : ""}`} onClick={() => setActiveTab("pagamento")}>Pagamento</li>
          <li className={`cursor-pointer text-red-600`} onClick={() => alert("Logout")}>Sair</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-2 text-black pt-40">
        {/* Perfil */}
        {activeTab === "perfil" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Informações do Usuário</h2>
              <button onClick={toggleEditProfile} className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700">
                {isEditingProfile ? "Cancelar" : "Editar"}
              </button>
            </div>
            <div className="flex flex-col space-y-4">
              <input type="text" name="name" value={user.name} onChange={handleProfileChange} placeholder="Nome" className="border p-2 rounded" disabled={!isEditingProfile} />
              <input type="email" name="email" value={user.email} onChange={handleProfileChange} placeholder="Email" className="border p-2 rounded" disabled={!isEditingProfile} />
              <input type="text" name="tel" value={user.tel} onChange={handleProfileChange} placeholder="Telefone" className="border p-2 rounded" disabled={!isEditingProfile} />
              <input type="text" name="cpf" value={user.cpf} onChange={handleProfileChange} placeholder="CPF" className="border p-2 rounded" disabled={!isEditingProfile} />
              <input type="text" name="birth_date" value={user.birth_date} onChange={handleProfileChange} placeholder="dd/mm/aaaa" className="border p-2 rounded" disabled={!isEditingProfile} />

              {isEditingProfile && (
                <button onClick={saveProfile} className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">Salvar</button>
              )}
            </div>
          </div>
        )}

        {/* Endereços */}
        {activeTab === "enderecos" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Endereços</h2>
            {user.addresses.map((addr) => (
              <div key={addr.id} className="border-b last:border-b-0 py-3">
                {editAddressId === addr.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <input type="text" name="street" value={addr.street} onChange={(e) => handleEditAddressChange(addr.id, e)} className="border p-2 rounded"/>
                    <input type="text" name="number" value={addr.number} onChange={(e) => handleEditAddressChange(addr.id, e)} className="border p-2 rounded"/>
                    <input type="text" name="city" value={addr.city} onChange={(e) => handleEditAddressChange(addr.id, e)} className="border p-2 rounded"/>
                    <input type="text" name="state" value={addr.state} onChange={(e) => handleEditAddressChange(addr.id, e)} className="border p-2 rounded"/>
                    <input type="text" name="zip" value={addr.zip} onChange={(e) => handleEditAddressChange(addr.id, e)} className="border p-2 rounded"/>
                    <button onClick={() => setEditAddressId(null)} className="bg-green-600 py-2 px-4 rounded col-span-full mt-2">Salvar</button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{addr.street}, {addr.number}</p>
                      <p>{addr.city} - {addr.state}, {addr.zip}</p>
                    </div>
                    <button onClick={() => setEditAddressId(addr.id)} className="text-blue-600 hover:underline">Editar</button>
                  </div>
                )}
              </div>
            ))}
            <form className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleAddAddress}>
              <input type="text" name="street" value={newAddress.street} onChange={handleAddressChange} placeholder="Rua" className="border p-2 rounded" required/>
              <input type="text" name="number" value={newAddress.number} onChange={handleAddressChange} placeholder="Número" className="border p-2 rounded" required/>
              <input type="text" name="city" value={newAddress.city} onChange={handleAddressChange} placeholder="Cidade" className="border p-2 rounded" required/>
              <input type="text" name="state" value={newAddress.state} onChange={handleAddressChange} placeholder="Estado" className="border p-2 rounded" required/>
              <input type="text" name="zip" value={newAddress.zip} onChange={handleAddressChange} placeholder="CEP" className="border p-2 rounded" required/>
              <button type="submit" className="bg-blue-600 py-2 px-4 rounded col-span-full">Adicionar</button>
            </form>
          </div>
        )}

        {/* Pagamento */}
        {activeTab === "pagamento" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Informações de Pagamento</h2>
            {user.payment.map((p) => (
              <div key={p.id} className="mb-4 border-b pb-3">
                <input type="text" name="cardNumber" value={p.cardNumber} onChange={(e) => setUser({
                  ...user,
                  payment: user.payment.map(pay => pay.id === p.id ? { ...pay, cardNumber: e.target.value } : pay)
                })} className="border p-2 rounded mb-2 w-full"/>
                <input type="text" name="cardName" value={p.cardName} onChange={(e) => setUser({
                  ...user,
                  payment: user.payment.map(pay => pay.id === p.id ? { ...pay, cardName: e.target.value } : pay)
                })} className="border p-2 rounded mb-2 w-full"/>
                <input type="text" name="expiry" value={p.expiry} onChange={(e) => setUser({
                  ...user,
                  payment: user.payment.map(pay => pay.id === p.id ? { ...pay, expiry: e.target.value } : pay)
                })} className="border p-2 rounded w-full"/>
              </div>
            ))}
            <form className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={addPayment}>
              <input type="text" name="cardNumber" value={paymentInfo.cardNumber} onChange={handlePaymentChange} placeholder="Número do cartão" className="border p-2 rounded" required/>
              <input type="text" name="cardName" value={paymentInfo.cardName} onChange={handlePaymentChange} placeholder="Nome no cartão" className="border p-2 rounded" required/>
              <input type="text" name="expiry" value={paymentInfo.expiry} onChange={handlePaymentChange} placeholder="Validade (MM/AA)" className="border p-2 rounded" required/>
              <button type="submit" className="bg-blue-600 py-2 px-4 rounded col-span-full">Adicionar</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
