import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";
import PaymentAd from "./PaymentAd";
import Profile from "./Profile";
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";
import VerifyEmail from './VerifyEmail';
import Loading from "./Loading";
import AdminPanel from "./AdminPanel";
import ProductDetail from "./ProductDetail";
import CheckoutPage from './CheckoutPage';
import ResetPassword from './ResetPassword';

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        {/* REMOVE THE KEY PROP - this is what made navbar disappear */}
        <Navbar />
        
        <Routes>
          <Route path="/" element={
            <>
              <Home />
              <PaymentAd />
              <Footer />
            </>
          } />
          
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/login" element={<Login />} />
          <Route path="/loading" element={<Loading />} /> 
          <Route path="/reset-password" element={<ResetPassword />} />          
          <Route path="/verification" element={<VerifyEmail />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;