import React, { useState, useEffect } from "react";

// Mock data
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

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("perfil");
  const [editAddressId, setEditAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({ street: "", number: "", city: "", state: "", zip: "" });
  const [paymentInfo, setPaymentInfo] = useState({ cardNumber: "", cardName: "", expiry: "" });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    setUser(mockUserProfile);
  }, []);

  if (!user) return <p className="text-black">Carregando perfil...</p>;

  const handleUserChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });
  const handleAddressChange = (e) => setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  const handleEditAddressChange = (id, e) => {
    setUser({
      ...user,
      addresses: user.addresses.map(addr => addr.id === id ? { ...addr, [e.target.name]: e.target.value } : addr),
    });
  };
  const handlePaymentChange = (e, id = null) => {
    if (id) {
      setUser({
        ...user,
        payment: user.payment.map(p => p.id === id ? { ...p, [e.target.name]: e.target.value } : p),
      });
    } else {
      setPaymentInfo({ ...paymentInfo, [e.target.name]: e.target.value });
    }
  };

  const toggleEditProfile = () => setIsEditingProfile(!isEditingProfile);

  const addAddress = (e) => {
    e.preventDefault();
    setUser({ ...user, addresses: [...user.addresses, { id: Date.now(), ...newAddress }] });
    setNewAddress({ street: "", number: "", city: "", state: "", zip: "" });
  };

  const addPayment = (e) => {
    e.preventDefault();
    setUser({ ...user, payment: [...user.payment, { id: Date.now(), ...paymentInfo }] });
    setPaymentInfo({ cardNumber: "", cardName: "", expiry: "" });
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
        {activeTab==="perfil" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Informações Pessoais</h2>
              <button onClick={toggleEditProfile} className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700">
                {isEditingProfile ? "Cancelar" : "Editar"}
              </button>
            </div>
            <div className="flex flex-col space-y-4">
              <input type="text" name="name" value={user.name} onChange={handleUserChange} disabled={!isEditingProfile} placeholder="Nome" className="border p-2 rounded"/>
              <input type="email" name="email" value={user.email} onChange={handleUserChange} disabled={!isEditingProfile} placeholder="Email" className="border p-2 rounded"/>
              <input type="text" name="phone" value={user.phone} onChange={handleUserChange} disabled={!isEditingProfile} placeholder="Telefone" className="border p-2 rounded"/>
              <input type="text" name="cpf" value={user.cpf} onChange={handleUserChange} disabled={!isEditingProfile} placeholder="CPF" className="border p-2 rounded"/>
              <input type="date" name="birthDate" value={user.birthDate} onChange={handleUserChange} disabled={!isEditingProfile} className="border p-2 rounded"/>
              <div className="flex items-center space-x-2">
                <input type="checkbox" checked={user.marketingOptIn} onChange={(e)=>setUser({...user, marketingOptIn:e.target.checked})} disabled={!isEditingProfile}/>
                <label>Aceito receber e-mail</label>
              </div>
              {isEditingProfile && <button onClick={toggleEditProfile} className="bg-green-600 text-white py-2 px-4 rounded mt-2">Salvar</button>}
            </div>
          </div>
        )}

        {/* Endereços */}
        {activeTab==="enderecos" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Endereços</h2>
            {user.addresses.map(addr=>(
              <div key={addr.id} className="border-b last:border-b-0 py-3">
                {editAddressId===addr.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    {["street","number","city","state","zip"].map(field=>(
                      <input key={field} type="text" name={field} value={addr[field]} onChange={e=>handleEditAddressChange(addr.id,e)} className="border p-2 rounded"/>
                    ))}
                    <button onClick={()=>setEditAddressId(null)} className="bg-green-600 text-black py-2 px-4 rounded col-span-full mt-2">Salvar</button>
                  </div>
                ):(
                  <div className="flex justify-between items-center">
                    <div>
                      <p>{addr.street}, {addr.number}</p>
                      <p>{addr.city} - {addr.state}, {addr.zip}</p>
                    </div>
                    <button onClick={()=>setEditAddressId(addr.id)} className="text-blue-600 hover:underline">Editar</button>
                  </div>
                )}
              </div>
            ))}
            <form className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={addAddress}>
              {["street","number","city","state","zip"].map(field=>(
                <input key={field} type="text" name={field} value={newAddress[field]} onChange={handleAddressChange} placeholder={field} className="border p-2 rounded" required/>
              ))}
              <button type="submit" className="bg-blue-600 text-black py-2 px-4 rounded col-span-full">Adicionar Endereço</button>
            </form>
          </div>
        )}

        {/* Pagamento */}
        {activeTab==="pagamento" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Informações de Pagamento</h2>
            {user.payment.map(p=>(
              <div key={p.id} className="mb-4 border-b pb-3">
                <input type="text" name="cardNumber" value={p.cardNumber} onChange={e=>handlePaymentChange(e,p.id)} placeholder="Número do cartão" className="border p-2 rounded mb-2 w-full"/>
                <input type="text" name="cardName" value={p.cardName} onChange={e=>handlePaymentChange(e,p.id)} placeholder="Nome no cartão" className="border p-2 rounded mb-2 w-full"/>
                <input type="text" name="expiry" value={p.expiry} onChange={e=>handlePaymentChange(e,p.id)} placeholder="Validade (MM/AA)" className="border p-2 rounded mb-2 w-full"/>
              </div>
            ))}
            <form className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={addPayment}>
              {["cardNumber","cardName","expiry"].map(field=>(
                <input key={field} type="text" name={field} value={paymentInfo[field]} onChange={handlePaymentChange} placeholder={field} className="border p-2 rounded" required/>
              ))}
              <button type="submit" className="bg-blue-600 text-black py-2 px-4 rounded col-span-full">Adicionar Cartão</button>
            </form>
          </div>
        )}

        {/* Other Tabs */}
        {["pedidos","favoritos","cupons","configuracoes","suporte"].includes(activeTab) && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">{activeTab}</div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
