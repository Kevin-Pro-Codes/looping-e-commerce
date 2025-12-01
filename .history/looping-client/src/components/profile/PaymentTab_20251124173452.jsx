import React from 'react';

const PaymentTab = () => {
  return (
    <div className="text-center py-8">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Pagamentos</h3>
      <p className="text-gray-500 mb-4">Gerencie seus métodos de pagamento e formas de pagamento aqui.</p>
      <p className="text-gray-400 text-sm">Funcionalidade em desenvolvimento</p>
    </div>
  );
};

export default PaymentTab;