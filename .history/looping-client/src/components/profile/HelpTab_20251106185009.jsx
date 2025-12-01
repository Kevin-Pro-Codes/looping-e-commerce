import React from 'react';

const HelpTab = () => {
  return (
    <div className="text-center py-8">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Suporte e Ajuda</h3>
      <p className="text-gray-500 mb-4">Precisa de ajuda? Entre em contato com nosso suporte.</p>
      <p className="text-gray-400 text-sm">Funcionalidade em desenvolvimento</p>
    </div>
  );
};

export default HelpTab;