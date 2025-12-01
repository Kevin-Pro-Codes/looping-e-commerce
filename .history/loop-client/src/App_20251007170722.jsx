import React from "react";
import axios from "axios";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Pagamento from "./components/Pagamento";
import Perfil from "./Perfil";
import AppHome from "./AppHome";
import Login from "./Login";
import Registro from "./Registro";

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          {/* Navbar sempre visível */}
          <Navbar />

          {/* Conteúdo principal */}
          <Routes>
            <Route path="/" element={<AppHome />} />
            <Route path="/logar" element={<Login />} />
            <Route path="/registrar" element={<Registro />} />
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
