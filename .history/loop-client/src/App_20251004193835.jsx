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
    <GoogleOAuthProvider clientId={process.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          {/* Navbar always visible */}
          <Navbar />

          {/* Main content */}
          <Routes>
            <Route path="/" element={<AppHome />} />
            <Route path="/logar" element={<Login />} />
            <Route path="/registrar" element={<Registro />} />
          </Routes>

          {/* Footer & Pagamento always visible */}
          <Pagamento />
          <Footer />
        </div>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
