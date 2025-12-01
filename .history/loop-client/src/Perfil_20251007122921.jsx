import React, { useState, useEffect } from "react";
import { fetchData, saveData } from "../api/api";

const ProfilePage = () => {
  const userId = 1; // Replace with actual logged-in user ID
  const [activeTab, setActiveTab] = useState("perfil");
  const [data, setData] = useState({});
  const [editAddressId, setEditAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({ street: "", number: "", city: "", state: "", zip: "" });
  const [newPayment, setNewPayment] = useState({ cardNumber: "", cardName: "", expiry: "" });

  // Fetch data whenever the tab changes
  useEffect(() => {
    fetchData(activeTab, userId).then(res => setData(res || {}));
  }, [activeTab]);

  const handleChange = (field, value) => {
    setData({ ...data, [field]: value });
  };

  const handleAddressChange = (field, value, id = null) => {
    if (id) {
      setData({
        ...data,
        addresses: data.addresses.map(addr => addr.id === id ? { ...addr, [field]: value } : addr)
      });
    } else {
      setNewAddress({ ...newAddress, [field]: value });
    }
  };

  const handlePaymentChange = (field, value, id = null) => {
    if (id) {
      setData({
        ...data,
        payment: data.payment.map(pay => pay.id === id ? { ...pay, [field]: value } : pay)
      });
    } else {
      setNewPayment({ ...newPayment, [field]: value });
    }
  };

  const handleSave = () => {
    saveData(activeTab, userId, data).then(res => alert(res.message));
  };

  const addNewAddress = () => {
    const id = Date.now();
    const updated = { ...data, addresses: [...(data.addresses || []), { id, ...newAddress }] };
    setData(updated);
    setNewAddress({ street: "", number: "", city: "", state: "", zip: "" });
    saveData("enderecos", userId, updated);
  };

  const addNewPayment = () => {
    const id = Date.now();
    const updated = { ...data, payment: [...(data.payment || []), { id, ...newPayment }] };
    setData(updated);
    setNewPayment({ cardNumber: "", cardName: "", expiry: "" });
    saveData("pagamentos", userId, updated);
  };

  if (!data) return <p>Loading...</p>;

  return (
    <div className="flex min-h-screen bg-gray-100 text-black" style={{ fontFamily: "Calibri, sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-56 bg-white shadow-md p-6 mt-25 text-black">
        <h2 className="text-2xl pt-5 font-semibold mb-8 text-black">Menu</h2>
        <ul className="space-y-4">
          <li className={`cursor-pointer ${activeTab === "perfil" ? "font-bold" : ""}`} onClick={() => setActiveTab("perfil")}>Perfil</li>
          <li className={`cursor-pointer ${activeTab === "enderecos" ? "font-bold" : ""}`} onClick={() => setActiveTab("enderecos")}>Endereço</li>
          <li className={`cursor-pointer ${activeTab === "pagamentos" ? "font-bold" : ""}`} onClick={() => setActiveTab("pagamentos")}>Pagamento</li>
          <li className={`cursor-pointer ${activeTab === "pedidos" ? "font-bold" : ""}`} onClick={() => setActiveTab("pedidos")}>Pedidos</li>
          <li className={`cursor-pointer ${activeTab === "desejos" ? "font-bold" : ""}`} onClick={() => setActiveTab("desejos")}>Desejos</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 text-black pt-20">
        {/* Perfil */}
        {activeTab === "perfil" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto text-black">
            <h2 className="text-xl font-semibold mb-4">Informações Pessoais</h2>
            <div className="flex flex-col space-y-4">
              <input type="text" value={data.name || ""} onChange={e => handleChange("name", e.target.value)} placeholder="Nome" className="border p-2 rounded" />
              <input type="text" value={data.phone || ""} onChange={e => handleChange("phone", e.target.value)} placeholder="Telefone" className="border p-2 rounded" />
              <input type="text" value={data.cpf || ""} onChange={e => handleChange("cpf", e.target.value)} placeholder="CPF" className="border p-2 rounded" />
              <input type="date" value={data.birthDate || ""} onChange={e => handleChange("birthDate", e.target.value)} className="border p-2 rounded" />
              <div className="flex items-center space-x-2">
                <input type="checkbox" checked={data.marketingOptIn || false} onChange={e => handleChange("marketingOptIn", e.target.checked)} />
                <label>Aceito receber e-mail</label>
              </div>
              <button onClick={handleSave} className="bg-green-600 text-white py-2 px-4 rounded mt-2">Salvar</button>
            </div>
          </div>
        )}

        {/* Endereços */}
        {activeTab === "enderecos" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto text-black">
            <h2 className="text-xl font-semibold mb-4">Endereços</h2>
            {(data.addresses || []).map(addr => (
              <div key={addr.id} className="border-b last:border-b-0 py-3">
                <input type="text" value={addr.street} onChange={e => handleAddressChange("street", e.target.value, addr.id)} placeholder="Rua" className="border p-2 rounded mb-2 w-full" />
                <input type="text" value={addr.number} onChange={e => handleAddressChange("number", e.target.value, addr.id)} placeholder="Número" className="border p-2 rounded mb-2 w-full" />
                <input type="text" value={addr.city} onChange={e => handleAddressChange("city", e.target.value, addr.id)} placeholder="Cidade" className="border p-2 rounded mb-2 w-full" />
                <input type="text" value={addr.state} onChange={e => handleAddressChange("state", e.target.value, addr.id)} placeholder="Estado" className="border p-2 rounded mb-2 w-full" />
                <input type="text" value={addr.zip} onChange={e => handleAddressChange("zip", e.target.value, addr.id)} placeholder="CEP" className="border p-2 rounded mb-2 w-full" />
              </div>
            ))}
            <h3 className="mt-4 mb-2 font-semibold">Adicionar Novo Endereço</h3>
            <input type="text" value={newAddress.street} onChange={e => handleAddressChange("street", e.target.value)} placeholder="Rua" className="border p-2 rounded mb-2 w-full" />
            <input type="text" value={newAddress.number} onChange={e => handleAddressChange("number", e.target.value)} placeholder="Número" className="border p-2 rounded mb-2 w-full" />
            <input type="text" value={newAddress.city} onChange={e => handleAddressChange("city", e.target.value)} placeholder="Cidade" className="border p-2 rounded mb-2 w-full" />
            <input type="text" value={newAddress.state} onChange={e => handleAddressChange("state", e.target.value)} placeholder="Estado" className="border p-2 rounded mb-2 w-full" />
            <input type="text" value={newAddress.zip} onChange={e => handleAddressChange("zip", e.target.value)} placeholder="CEP" className="border p-2 rounded mb-2 w-full" />
            <button onClick={addNewAddress} className="bg-blue-600 text-white py-2 px-4 rounded">Adicionar Endereço</button>
          </div>
        )}

        {/* Pagamentos */}
        {activeTab === "pagamentos" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto text-black">
            <h2 className="text-xl font-semibold mb-4">Pagamentos</h2>
            {(data.payment || []).map(pay => (
              <div key={pay.id} className="border-b pb-3 mb-2">
                <input type="text" value={pay.cardNumber} onChange={e => handlePaymentChange("cardNumber", e.target.value, pay.id)} placeholder="Número do cartão" className="border p-2 rounded mb-2 w-full" />
                <input type="text" value={pay.cardName} onChange={e => handlePaymentChange("cardName", e.target.value, pay.id)} placeholder="Nome no cartão" className="border p-2 rounded mb-2 w-full" />
                <input type="text" value={pay.expiry} onChange={e => handlePaymentChange("expiry", e.target.value, pay.id)} placeholder="Validade (MM/AA)" className="border p-2 rounded mb-2 w-full" />
              </div>
            ))}
            <h3 className="mt-4 mb-2 font-semibold">Adicionar Novo Cartão</h3>
            <input type="text" value={newPayment.cardNumber} onChange={e => handlePaymentChange("cardNumber", e.target.value)} placeholder="Número do cartão" className="border p-2 rounded mb-2 w-full" />
            <input type="text" value={newPayment.cardName} onChange={e => handlePaymentChange("cardName", e.target.value)} placeholder="Nome no cartão" className="border p-2 rounded mb-2 w-full" />
            <input type="text" value={newPayment.expiry} onChange={e => handlePaymentChange("expiry", e.target.value)} placeholder="Validade (MM/AA)" className="border p-2 rounded mb-2 w-full" />
            <button onClick={addNewPayment} className="bg-blue-600 text-white py-2 px-4 rounded">Adicionar Cartão</button>
          </div>
        )}

        {/* Pedidos */}
        {activeTab === "pedidos" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto text-black">
            <h2 className="text-xl font-semibold mb-4">Pedidos</h2>
            {(data.pedidos || []).length > 0 ? (
              data.pedidos.map(order => (
                <div key={order.id} className="border-b py-2">
                  <p>Produto: {order.product}</p>
                  <p>Status: {order.status}</p>
                  <p>Total: R${order.total}</p>
                </div>
              ))
            ) : (
              <p>Nenhum pedido encontrado.</p>
            )}
          </div>
        )}

        {/* Desejos */}
        {activeTab === "desejos" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto text-black">
            <h2 className="text-xl font-semibold mb-4">Desejos</h2>
            {(data.desejos || []).length > 0 ? (
              data.desejos.map(item => <p key={item.id}>{item.product}</p>)
            ) : (
              <p>Nenhum item na lista de desejos.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
