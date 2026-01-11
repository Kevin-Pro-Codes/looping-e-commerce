import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";
import PaymentAd from "./Basic/PaymentAd";
import Profile from "./Basic/Profile";
import Home from "./Home";
import Login from "./Basic/Login";
import Register from "./Basic/Register";
import VerifyEmail from './Basic/VerifyEmail';
import Loading from "./Basic/Loading";
import AdminPanel from "./Basic/AdminPanel";
import ProductDetail from "./Basic/ProductDetail";
import CheckoutPage from './Basic/CheckoutPage';
import ResetPassword from './Basic/ResetPassword';
import SearchPage from './Basic/SearchPage';

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
          <Route path="/profile" element={<Profile />}>
            <Route path="wishlist" element={<Profile />} />
            <Route path="cart" element={<Profile />} />
          </Route>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;