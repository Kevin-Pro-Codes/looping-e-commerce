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
import Loading from "./Loading";
import AdminPanel from "./AdminPanel";
import ProductDetail from "./ProductDetail";
import CheckoutPage from './CheckoutPage';

// Create a Layout component that includes Navbar + Footer
const MainLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-grow">
      {children}
    </main>
    <Footer />
  </div>
);

// Layout without Footer for specific pages
const AuthLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-grow">
      {children}
    </main>
  </div>
);

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          {/* Home route with Navbar + Home + Pagamento + Footer */}
          <Route path="/" element={
            <MainLayout>
              <Home />
              <Pagamento />
            </MainLayout>
          } />
          
          {/* Auth routes with Navbar only */}
          <Route path="/login" element={
            <AuthLayout>
              <Login />
            </AuthLayout>
          } />
          
          <Route path="/register" element={
            <AuthLayout>
              <Register />
            </AuthLayout>
          } />

          <Route path="/loading" element={
            <AuthLayout>
              <Loading />
            </AuthLayout>
          } />

          <Route path="/verification" element={
            <AuthLayout>
              <VerifyEmail />
            </AuthLayout>
          } />

          {/* Other routes with full layout */}
          <Route path="/product/:id" element={
            <MainLayout>
              <ProductDetail />
            </MainLayout>
          } />

          <Route path="/profile" element={
            <MainLayout>
              <Profile />
            </MainLayout>
          } />

          <Route path="/checkout" element={
            <MainLayout>
              <CheckoutPage />
            </MainLayout>
          } />

          {/* Admin route (you might want a different layout for admin) */}
          <Route path="/admin" element={<AdminPanel />} />

        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;