import React from 'react';
import { Button, Input } from './SharedComponents';

const ProfileTab = ({ 
  user, 
  isEditingProfile, 
  toggleEditProfile, 
  handleProfileChange, 
  saveProfile 
}) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Informações do Usuário</h2>
        <Button
          variant={isEditingProfile ? "outline" : "primary"}
          onClick={toggleEditProfile}
        >
          {isEditingProfile ? "Cancelar" : "Editar"}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nome"
          name="name"
          value={user.name || ''}
          onChange={handleProfileChange}
          placeholder="Nome"
          disabled={!isEditingProfile}
        />
        <Input
          label="Email"
          type="email"
          name="email"
          value={user.email || ''}
          onChange={handleProfileChange}
          placeholder="Email"
          disabled={!isEditingProfile}
        />
        <Input
          label="Telefone"
          name="tel"
          value={user.tel || ''}
          onChange={handleProfileChange}
          placeholder="Telefone"
          disabled={!isEditingProfile}
        />
        <Input
          label="CPF"
          name="cpf"
          value={user.cpf || ''}
          onChange={handleProfileChange}
          placeholder="CPF"
          disabled={!isEditingProfile}
        />
        <Input
          label="Data de Nascimento"
          type="date"
          name="birth_date"
          value={user.birth_date || ''}
          onChange={handleProfileChange}
          disabled={!isEditingProfile}
          className="md:col-span-2"
        />
      </div>
      {isEditingProfile && (
        <div className="flex justify-end pt-6">
          <Button onClick={saveProfile}>
            Salvar
          </Button>
        </div>
      )}
    </>
  );
};

export default ProfileTab;