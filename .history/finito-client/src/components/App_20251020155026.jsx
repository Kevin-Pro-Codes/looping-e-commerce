import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";
import Pagamento from "./Pagamento";
import Perfil from "./Perfil";
import Home from "./Home";
import Login from "./Login";
import Registro from "./Register";
import VerifyEmail from './VerifyEmail';
import VerifiedPage from './VerifyEmail';
import Loading from "./Loading";
import AdminPanel from "./AdminPanel";


function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          {/* Navbar sempre visível */}
          <Navbar />

          {/* Conteúdo principal */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/registrar" element={<Registro />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/login" element={<Login />} />
            <Route path="/loading" element={<Loading />} />           
            <Route path="/email-verified" element={<VerifiedPage />} />
            <Route path="/perfil" element={<Perfil />} />
          </Routes>

          {/* Footer e Pagamento sempre visíveis */}
          <Pagamento />
          <Footer />
        </div>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
