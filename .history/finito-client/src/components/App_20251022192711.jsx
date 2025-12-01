import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";
import Pagamento from "./Pagamento";
import Profile from "./Profile";
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";
import VerifyEmail from './VerifyEmail';
import VerifiedPage from './VerifyEmail';
import Loading from "./Loading";
import AdminPanel from "./AdminPanel";
import ProductDetail from "./ProductDetail";


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
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/login" element={<Login />} />
            <Route path="/loading" element={<Loading />} />           
            <Route path="/verification" element={<VerifiedPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/profile" element={<Profile />} />
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
