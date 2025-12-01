import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppHome from "./AppHome";
import Login from "./Login";
import Registro from "./Registro";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Pagamento from "./components/Pagamento";

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        {/* Navbar always visible */}
        <Navbar />

        {/* Main content */}
        
          <Routes>
            <Route path="/" element={<AppHome />} />

<GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
     <Route path="/logar" element={<Login />} />
    </GoogleOAuthProvider>
          

            <Route path="/registrar" element={<Registro />} />
          </Routes>
   
        {/* Footer & Pagamento always visible */}
        <Pagamento />
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
