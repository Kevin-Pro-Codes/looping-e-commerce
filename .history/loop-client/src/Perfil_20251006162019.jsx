import React, { useEffect, useState } from "react";

// Exemplo de dados simulados (pode ser substituído por fetch da API)
const mockUserProfile = {
  name: "João Silva",
  email: "joao.silva@email.com",
  phone: "+55 11 91234-5678",
  avatar: "https://i.pravatar.cc/150?img=3",
  addresses: [
    {
      id: 1,
      street: "Rua das Flores",
      number: "123",
      city: "São Paulo",
      state: "SP",
      zip: "01234-567",
    },
    {
      id: 2,
      street: "Avenida Brasil",
      number: "456",
      city: "Rio de Janeiro",
      state: "RJ",
      zip: "23456-789",
    },
  ],
};

const ProfilePage = () => {
  const [user, setUser] = useState(null);

  // Simula fetch de dados do backend
  useEffect(() => {
    // Aqui você faria fetch("/api/profile") e setaria os dados reais
    setUser(mockUserProfile);
  }, []);

  if (!user) return <p>Carregando perfil...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 pt-60">
      {/* Informações do Usuário */}
      <div className="flex items-center space-x-6 bg-white p-6 rounded-lg shadow-md mb-8">
        <img
          src={user.avatar}
          alt="Avatar"
          className="w-24 h-24 rounded-full object-cover"
        />
        <div>
          <h1 className="text-2xl font-semibold">{user.name}</h1>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-gray-600">{user.phone}</p>
        </div>
      </div>

      {/* Endereços */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Endereços</h2>
        {user.addresses.map((addr) => (
          <div
            key={addr.id}
            className="border-b last:border-b-0 py-3 flex justify-between"
          >
            <div>
              <p className="font-medium">{addr.street}, {addr.number}</p>
              <p className="text-gray-600">
                {addr.city} - {addr.state}, {addr.zip}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfilePage;
