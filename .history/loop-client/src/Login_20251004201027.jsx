import React, { useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // You'll need to install this: npm install jwt-decode

export default function Logar() {
  // ... your existing state and functions

  useEffect(() => {
    // Load Google Identity Services
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleGoogleLogin = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your actual client ID
        callback: handleGoogleSuccess,
      });
      
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback: render button manually if one-tap is skipped
          window.google.accounts.id.renderButton(
            document.getElementById('googleButtonContainer'),
            { 
              theme: 'outline', 
              size: 'large',
              width: '100%',
              text: 'continue_with'
            }
          );
        }
      });
    }
  };

  return (
    // ... your existing JSX
    <div className="flex flex-col space-y-3 mb-6">
      <button 
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center bg-white border border-black text-black py-2 rounded-md hover:bg-gray-100 transition"
      >
        <img src={gmailLogo} alt="Google" className="w-5 h-5 mr-3" />
        Continuar com Google
      </button>
      <div id="googleButtonContainer" className="hidden"></div>
      {/* ... rest of your buttons */}
    </div>
    // ... rest of your JSX
  );
}