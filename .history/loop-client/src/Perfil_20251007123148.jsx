import React, { useState, useEffect } from "react";
import { fetchData, saveData } from "../api";

const ProfilePage = () => {
  const userId = 1; // Replace with real logged-in user ID
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("perfil");
  const [editAddressId, setEditAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({ street: "", number: "", city: "", state: "", zip: "" });
  const [paymentInfo, setPaymentInfo] = useState({ cardNumber: "", cardName: "", expiry: "" });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Fetch data whenever the tab changes
  useEffect(() => {
    async function loadData() {
      const data = await fetchData(activeTab, userId);
      setUser(data || {});
    }
    loadData();
  }, [activeTab]);

  if (!user) return <p className="text-black">Carregando perfil...</p>;

  const handleUserChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });
  const handleAddressChange = (e) => setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  const handleEditAddressChange = (id, e) => {
    setUser({
      ...user,
      addresses: user.addresses.map(addr =>
        addr.id === id ? { ...addr, [e.target.name]: e.target.value } : addr
      ),
    });
  };
  const handlePaymentChange = (e, id = null) => {
    if (id) {
      setUser({
        ...user,
        payment: user.payment.map(p => p.id === id ? { ...p, [e.target.name]: e.target.value } : p)
      });
    } else {
      setPaymentInfo({ ...paymentInfo, [e.target.name]: e.target.value });
    }
  };

  const toggleEditProfile = () => setIsEditingProfile(!isEditingProfile);

  const saveProfile = async () => {
    const res = await saveData("perfil", userId, user);
    alert(res.message || "Perfil salvo!");
  };

  const addAddress = async () => {
    const updated = { ...user, addresses: [...(user.addresses || []), { id: Date.now(), ...newAddress }] };
    setUser(updated);
    setNewAddress({ street: "", number: "", city: "", state: "", zip: "" });
    await saveData("enderecos", userId, updated);
  };

  const addPayment = async () => {
    const updated = { ...user, payment: [...(user.payment || []), { id: Date.now(), ...paymentInfo }] };
    setUser(updated);
    setPaymentInfo({ cardNumber: "", cardName: "", expiry: "" });
    await saveData("pagamento", userId, updated);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 text-black" style={{ fontFamily: "Calibri, sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-56 bg-white shadow-md p-6 mt-25 text-black">
        <h2 className="text-2xl pt-5 font-semibold mb-8 text-black">Menu</h2>
        <ul className="space-y-4">
          <li className={`cursor-pointer ${activeTab === "perfil" ? "font-bold" : ""}`} onClick={() => setActiveTab("perfil")}>Perfil</li>
          <li className={`cursor-pointer ${activeTab === "enderecos" ? "font-bold" : ""}`} onClick={() => setActiveTab("enderecos")}>Endereço</li>
          <li className={`cursor-pointer ${activeTab === "pagamento" ? "font-bold" : ""}`} onClick={() => setActiveTab("pagamento")}>Pagamento</li>
          <li className={`cursor-pointer ${activeTab === "pedidos" ? "font-bold" : ""}`} onClick={() => setActiveTab("pedidos")}>Pedidos</li>
          <li className={`cursor-pointer ${activeTab === "favoritos" ? "font-bold" : ""}`} onClick={() => setActiveTab("favoritos")}>Desejos</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 text-black pt-40">
        {/* Perfil */}
        {activeTab === "perfil" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto text-black">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-black">Informações Pessoais</h2>
              <button onClick={toggleEditProfile} className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700">
                {isEditingProfile ? "Cancelar" : "Editar"}
              </button>
            </div>
            <div className="flex flex-col space-y-4">
              <input type="text" name="name" value={user.name || ""} onChange={handleUserChange} disabled={!isEditingProfile} placeholder="Nome" className="border p-2 rounded" />
              <input type="email" name="email" value={user.email || ""} onChange={handleUserChange} disabled={!isEditingProfile} placeholder="Email" className="border p-2 rounded" />
              <input type="text" name="phone" value={user.phone || ""} onChange={handleUserChange} disabled={!isEditingProfile} placeholder="Telefone" className="border p-2 rounded" />
              <input type="text" name="cpf" value={user.cpf || ""} onChange={handleUserChange} disabled={!isEditingProfile} placeholder="CPF" className="border p-2 rounded" />
              <input type="date" name="birthDate" value={user.birthDate || ""} onChange={handleUserChange} disabled={!isEditingProfile} className="border p-2 rounded" />
              <div className="flex items-center space-x-2">
                <input type="checkbox" checked={user.marketingOptIn || false} onChange={(e) => setUser({ ...user, marketingOptIn: e.target.checked })} disabled={!isEditingProfile} />
                <label>Aceito receber e-mail</label>
              </div>
              {isEditingProfile && <button onClick={saveProfile} className="bg-green-600 text-white py-2 px-4 rounded mt-2">Salvar</button>}
            </div>
          </div>
        )}

        {/* Endereços */}
        {activeTab === "enderecos" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto text-black">
            <h2 className="text-xl font-semibold mb-4">Endereços</h2>
            {(user.addresses || []).map(addr => (
              <div key={addr.id} className="border-b last:border-b-0 py-3">
                {editAddressId === addr.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <input type="text" name="street" value={addr.street} onChange={e => handleEditAddressChange(addr.id, e)} className="border p-2 rounded" />
                    <input type="text" name="number" value={addr.number} onChange={e => handleEditAddressChange(addr.id, e)} className="border p-2 rounded" />
                    <input type="text" name="city" value={addr.city} onChange={e => handleEditAddressChange(addr.id, e)} className="border p-2 rounded" />
                    <input type="text" name="state" value={addr.state} onChange={e => handleEditAddressChange(addr.id, e)} className="border p-2 rounded" />
                    <input type="text" name="zip" value={addr.zip} onChange={e => handleEditAddressChange(addr.id, e)} className="border p-2 rounded" />
                    <button onClick={() => setEditAddressId(null)} className="bg-green-600 text-black py-2 px-4 rounded col-span-full mt-2">Salvar</button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <p>{addr.street}, {addr.number}</p>
                      <p>{addr.city} - {addr.state}, {addr.zip}</p>
                    </div>
                    <button onClick={() => setEditAddressId(addr.id)} className="text-blue-600 hover:underline">Editar</button>
                  </div>
                )}
              </div>
            ))}
            <h3 className="mt-4 mb-2 font-semibold">Adicionar Novo Endereço</h3>
            <input type="text" name="street" value={newAddress.street} onChange={handleAddressChange} placeholder="Rua" className="border p-2 rounded mb-2 w-full" />
            <input type="text" name="number" value={newAddress.number} onChange={handleAddressChange} placeholder="Número" className="border p-2 rounded mb-2 w-full" />
            <input type="text" name="city" value={newAddress.city} onChange={handleAddressChange} placeholder="Cidade" className="border p-2 rounded mb-2 w-full" />
            <input type="text" name="state" value={newAddress.state} onChange={handleAddressChange} placeholder="Estado" className="border p-2 rounded mb-2 w-full" />
            <input type="text" name="zip" value={newAddress.zip} onChange={handleAddressChange} placeholder="CEP" className="border p-2 rounded mb-2 w-full" />
            <button onClick={addAddress} className="bg-blue-600 text-white py-2 px-4 rounded">Adicionar Endereço</button>
          </div>
        )}

        {/* Pagamento */}
        {activeTab === "pagamento" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto text-black">
            <h2 className="text-xl font-semibold mb-4">Pagamentos</h2>
            {(user.payment || []).map(p => (
              <div key={p.id} className="border-b pb-3 mb-2">
                <input type="text" name="cardNumber" value={p.cardNumber} onChange={e => handlePaymentChange(e, p.id)} placeholder="Número do cartão" className="border p-2 rounded mb-2 w-full" />
                <input type="text" name="cardName" value={p.cardName} onChange={e => handlePaymentChange(e, p.id)} placeholder="Nome no cartão" className="border p-2 rounded mb-2 w-full" />
                <input type="text" name="expiry" value={p.expiry} onChange={e => handlePaymentChange(e, p.id)} placeholder="Validade (MM/AA)" className="border p-2 rounded mb-2 w-full" />
              </div>
            ))}
            <h3 className="mt-4 mb-2 font-semibold">Adicionar Novo Cartão</h3>
            <input type="text" name="cardNumber" value={paymentInfo.cardNumber} onChange={handlePaymentChange} placeholder="Número do cartão" className="border p-2 rounded mb-2 w-full" />
            <input type="text" name="cardName" value={paymentInfo.cardName} onChange={handlePaymentChange} placeholder="Nome no cartão" className="border p-2 rounded mb-2 w-full" />
            <input type="text" name="expiry" value={paymentInfo.expiry} onChange={handlePaymentChange} placeholder="Validade (MM/AA)" className="border p-2 rounded mb-2 w-full" />
            <button onClick={addPayment} className="bg-blue-600 text-white py-2 px-4 rounded">Adicionar Cartão</button>
          </div>
        )}

        {/* Pedidos */}
        {activeTab === "pedidos" && <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto text-black">Histórico de pedidos, status e faturas aqui</div>}

        {/* Favoritos */}
        {activeTab === "favoritos" && <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto text-black">Produtos salvos para compra futura</div>}
      </main>
    </div>
  );
};

export default ProfilePage;
