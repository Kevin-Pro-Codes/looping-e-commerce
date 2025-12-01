import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

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

// Protected Route Component for normal users
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
    </div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
    </div>;
  }
  
  return isAuthenticated && isAdmin ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
    </div>;
  }
  
  if (isAuthenticated) {
    return <Navigate to={isAdmin ? "/admin" : "/profile"} />;
  }
  
  return children;
};

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          {/* Navbar always visible */}
          <Navbar />

          {/* Main content with protected routes */}
          <Routes>
            {/* Public routes */}
            <Route path="/" element={
              <>
                <Home />
                <Pagamento />
                <Footer />
              </>
            } />
            
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            
            <Route path="/verification" element={
              <PublicRoute>
                <VerifyEmail />
              </PublicRoute>
            } />
            
            <Route path="/product/:id" element={<ProductDetail />} />
            
            {/* Protected admin route */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            } />
            
            {/* Protected user routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            <Route path="/loading" element={<Loading />} />
            
            {/* Catch all route - redirect based on auth status */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;