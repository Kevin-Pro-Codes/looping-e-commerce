import React, { useState, useEffect } from "react";

const ProfilePage = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("perfil");
  const [editAddressId, setEditAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({ street: "", number: "", city: "", state: "", zip: "" });
  const [paymentInfo, setPaymentInfo] = useState({ cardNumber: "", cardName: "", expiry: "" });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Load user from database
  useEffect(() => {
    fetch(`/api/user/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(err => console.error(err));
  }, [userId]);

  if (!user) return <p className="text-black">Carregando perfil...</p>;

  // Handlers
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
  const handlePaymentChange = (e) => setPaymentInfo({ ...paymentInfo, [e.target.name]: e.target.value });

  const toggleEditProfile = () => setIsEditingProfile(!isEditingProfile);

  // Save profile to database
  const saveProfile = async () => {
    await fetch(`/api/user/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
    setIsEditingProfile(false);
  };

  const addAddress = async (e) => {
    e.preventDefault();
    const res = await fetch(`/api/user/${userId}/address`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAddress),
    });
    const added = await res.json();
    setUser({ ...user, addresses: [...user.addresses, added] });
    setNewAddress({ street: "", number: "", city: "", state: "", zip: "" });
  };

  const updateAddress = async (id) => {
    const addr = user.addresses.find(a => a.id === id);
    await fetch(`/api/user/${userId}/address/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addr),
    });
    setEditAddressId(null);
  };

  const addPayment = async (e) => {
    e.preventDefault();
    const res = await fetch(`/api/user/${userId}/payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentInfo),
    });
    const added = await res.json();
    setUser({ ...user, payment: [...user.payment, added] });
    setPaymentInfo({ cardNumber: "", cardName: "", expiry: "" });
  };

  const updatePayment = async (id) => {
    const pay = user.payment.find(p => p.id === id);
    await fetch(`/api/user/${userId}/payment/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pay),
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100 text-black" style={{ fontFamily: "Calibri, sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-56 bg-white shadow-md p-6 mt-25 text-black">
        <h2 className="text-2xl pt-5 font-semibold mb-8 text-black">Menu</h2>
        <ul className="space-y-4">
          {["perfil","enderecos","pagamento","pedidos","favoritos","cupons","configuracoes","suporte"].map(tab => (
            <li key={tab} className={`cursor-pointer ${activeTab===tab?"font-bold":""}`} onClick={()=>setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase()+tab.slice(1)}
            </li>
          ))}
          <li className="cursor-pointer text-red-600" onClick={()=>alert("Logout")}>Sair</li>
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
              {["name","email","phone","cpf","birthDate"].map(field => (
                <input key={field} type={field==="email"?"email":field==="birthDate"?"date":"text"} name={field} value={user[field]} onChange={handleUserChange} disabled={!isEditingProfile} className="border p-2 rounded"/>
              ))}
              <div className="flex items-center space-x-2">
                <input type="checkbox" checked={user.marketingOptIn} onChange={e=>setUser({...user, marketingOptIn:e.target.checked})} disabled={!isEditingProfile}/>
                <label>Inscrever-se</label>
              </div>
              {isEditingProfile && <button onClick={saveProfile} className="bg-green-600 text-white py-2 px-4 rounded mt-2">Salvar</button>}
            </div>
          </div>
        )}

        {/* Endereços */}
        {activeTab === "enderecos" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto text-black">
            <h2 className="text-xl font-semibold mb-4 text-black">Endereços</h2>
            {user.addresses.map(addr => (
              <div key={addr.id} className="border-b last:border-b-0 py-3 text-black">
                {editAddressId === addr.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    {["street","number","city","state","zip"].map(f => (
                      <input key={f} type="text" name={f} value={addr[f]} onChange={e=>handleEditAddressChange(addr.id,e)} className="border p-2 rounded text-black"/>
                    ))}
                    <button onClick={()=>updateAddress(addr.id)} className="bg-green-600 text-black py-2 px-4 rounded col-span-full mt-2">Salvar</button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-black">{addr.street}, {addr.number}</p>
                      <p className="text-black">{addr.city} - {addr.state}, {addr.zip}</p>
                    </div>
                    <button onClick={()=>setEditAddressId(addr.id)} className="text-blue-600 hover:underline">Editar</button>
                  </div>
                )}
              </div>
            ))}
            <form className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={addAddress}>
              {["street","number","city","state","zip"].map(f => (
                <input key={f} type="text" name={f} value={newAddress[f]} onChange={handleAddressChange} placeholder={f} className="border p-2 rounded text-black" required/>
              ))}
              <button type="submit" className="bg-blue-600 text-black py-2 px-4 rounded col-span-full">Adicionar Endereço</button>
            </form>
          </div>
        )}

        {/* Pagamento */}
        {activeTab === "pagamento" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto text-black">
            <h2 className="text-xl font-semibold mb-4 text-black">Informações de Pagamento</h2>
            {user.payment.map(p => (
              <div key={p.id} className="mb-4 border-b pb-3 text-black">
                {["cardNumber","cardName","expiry"].map(f => (
                  <input key={f} type="text" name={f} value={p[f]} onChange={e => setUser({...user,payment:user.payment.map(pay => pay.id===p.id ? {...pay,[f]:e.target.value}:pay)})} className="border p-2 rounded mb-2 w-full text-black"/>
                ))}
                <button onClick={()=>updatePayment(p.id)} className="bg-green-600 text-black py-2 px-4 rounded">Salvar</button>
              </div>
            ))}
            <form className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={addPayment}>
              {["cardNumber","cardName","expiry"].map(f => (
                <input key={f} type="text" name={f} value={paymentInfo[f]} onChange={handlePaymentChange} placeholder={f} className="border p-2 rounded text-black" required/>
              ))}
              <button type="submit" className="bg-blue-600 text-black py-2 px-4 rounded col-span-full">Adicionar Cartão</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
