import React, { useState, useEffect } from "react";

const ProfilePage = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("perfil");
  const [editAddressId, setEditAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({ street: "", number: "", city: "", state: "", zip: "" });
  const [paymentInfo, setPaymentInfo] = useState({ cardNumber: "", cardName: "", expiry: "" });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    // Fetch user by ID
    fetch(`/api/user/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(err => console.error(err));
  }, [userId]);

  if (!user) return <p>Loading profile...</p>;

  // Handlers remain almost the same but with API calls
  const handleUserChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });
  const toggleEditProfile = () => setIsEditingProfile(!isEditingProfile);

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
    const addedAddress = await res.json();
    setUser({ ...user, addresses: [...user.addresses, addedAddress] });
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
    const newPay = await res.json();
    setUser({ ...user, payment: [...user.payment, newPay] });
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

  // Everything else (tabs, inputs, etc.) stays the same
  return (
    <div className="flex min-h-screen bg-gray-100 text-black">
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
        {activeTab==="perfil" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Informações Pessoais</h2>
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
                <label>Aceito receber e-mail</label>
              </div>
              {isEditingProfile && <button onClick={saveProfile} className="bg-green-600 text-white py-2 px-4 rounded mt-2">Salvar</button>}
            </div>
          </div>
        )}

        {/* Addresses and Payments sections remain similar but call addAddress/updateAddress and addPayment/updatePayment */}
      </main>
    </div>
  );
};

export default ProfilePage;
