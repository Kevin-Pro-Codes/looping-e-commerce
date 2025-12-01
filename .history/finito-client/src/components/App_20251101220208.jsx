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

// Simple layout components
const LayoutWithFooter = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-grow">
      {children}
    </main>
    <Footer />
  </div>
);

const LayoutWithoutFooter = ({ children }) => (
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
          {/* Home route */}
          <Route path="/" element={
            <LayoutWithFooter>
              <Home />
              <Pagamento />
            </LayoutWithFooter>
          } />
          
          {/* Auth routes */}
          <Route path="/login" element={
            <LayoutWithoutFooter>
              <Login />
            </LayoutWithoutFooter>
          } />
          
          <Route path="/register" element={
            <LayoutWithoutFooter>
              <Register />
            </LayoutWithoutFooter>
          } />

          <Route path="/loading" element={
            <LayoutWithoutFooter>
              <Loading />
            </LayoutWithoutFooter>
          } />

          <Route path="/verification" element={
            <LayoutWithoutFooter>
              <VerifyEmail />
            </LayoutWithoutFooter>
          } />

          {/* Other routes */}
          <Route path="/product/:id" element={
            <LayoutWithFooter>
              <ProductDetail />
            </LayoutWithFooter>
          } />

          <Route path="/profile" element={
            <LayoutWithFooter>
              <Profile />
            </LayoutWithFooter>
          } />

          <Route path="/checkout" element={
            <LayoutWithFooter>
              <CheckoutPage />
            </LayoutWithFooter>
          } />

          {/* Admin route - standalone since it might have different layout */}
          <Route path="/admin" element={<AdminPanel />} />

        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;