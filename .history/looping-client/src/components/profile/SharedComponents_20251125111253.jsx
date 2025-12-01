import React from 'react';

// Responsive Container Component - FIXED FOR MOBILE
export const ResponsiveContainer = ({ children, className = "" }) => (
  <div className={`w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
    {children}
  </div>
);

// Card Component - FIXED FOR MOBILE
export const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full max-w-full ${className}`}>
    {children}
  </div>
);

// Button Component
export const Button = ({ children, variant = "primary", className = "", ...props }) => {
  const baseClasses = "font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 px-4 py-2";
  
  const variants = {
    primary: "bg-green-600 text-white hover:bg-green-600 focus:ring-red-500",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  return (
    <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// Input Component
export const Input = ({ label, className = "", ...props }) => (
  <div className="space-y-2">
    {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
    <input
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${className}`}
      {...props}
    />
  </div>
);