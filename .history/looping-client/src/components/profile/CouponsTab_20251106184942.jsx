import React from 'react';

const CouponsTab = () => {
  return (
    <div className="text-center py-8">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Cupons & Créditos</h3>
      <p className="text-gray-500 mb-4">Gerencie seus cupons de desconto e créditos aqui.</p>
      <p className="text-gray-400 text-sm">Funcionalidade em desenvolvimento</p>
    </div>
  );
};

export default CouponsTab;