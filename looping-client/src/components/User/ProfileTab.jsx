import React from 'react';
import { Button, Input } from './SharedComponents';

const ProfileTab = ({ 
  user, 
  isEditingProfile, 
  toggleEditProfile, 
  handleProfileChange, 
  saveProfile 
}) => {
  // Check if user data is still loading
  const isLoading = !user || Object.keys(user).length === 0;

  // Skeleton component for input fields
  const SkeletonInput = ({ label }) => (
    <div className="space-y-2">
      {label && <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>}
      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
    </div>
  );

  // Skeleton for button
  const SkeletonButton = () => (
    <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
  );

  if (isLoading) {
    return (
      <>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="h-7 bg-gray-200 rounded w-48 animate-pulse"></div>
          <SkeletonButton />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonInput label={true} />
          <SkeletonInput label={true} />
          <SkeletonInput label={true} />
          <SkeletonInput label={true} />
          <div className="md:col-span-2">
            <SkeletonInput label={true} />
          </div>
        </div>
      </>
    );
  }

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