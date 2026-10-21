import React, { lazy, Suspense } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";
import PaymentAd from "./Basic/PaymentAd";
import Home from "./Home";
import Loading from "./Basic/Loading";

const Login = lazy(() => import("./Basic/Login"));
const Register = lazy(() => import("./Basic/Register"));
const VerifyEmail = lazy(() => import('./Basic/VerifyEmail'));
const AdminPanel = lazy(() => import("./Basic/AdminPanel"));
const ProductDetail = lazy(() => import("./Basic/ProductDetail"));
const CheckoutPage = lazy(() => import('./Basic/CheckoutPage'));
const ResetPassword = lazy(() => import('./Basic/ResetPassword'));
const SearchPage = lazy(() => import('./Basic/SearchPage'));
const Profile = lazy(() => import("./Basic/Profile"));

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Navbar />
        
        {/* Main content container with spacing for audio player and navbar */}
        <div className="pt-14 sm:pt-14">
          <Suspense fallback={<Loading />}>
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
          </Suspense>
        </div>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;