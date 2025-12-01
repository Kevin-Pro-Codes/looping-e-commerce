import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthStatus();
    
    // Listen for auth changes
    window.addEventListener('loginStateChange', checkAuthStatus);
    window.addEventListener('storage', checkAuthStatus);
    
    return () => {
      window.removeEventListener('loginStateChange', checkAuthStatus);
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []);

  const checkAuthStatus = () => {
    // Check both localStorage (admin) and sessionStorage (normal users)
    const localStorageLoggedIn = localStorage.getItem('loggedIn') === 'true';
    const sessionStorageLoggedIn = sessionStorage.getItem('loggedIn') === 'true';
    
    const localStorageAdmin = localStorage.getItem('isAdmin') === 'true';
    const sessionStorageAdmin = sessionStorage.getItem('isAdmin') === 'true';
    
    const localStorageUser = localStorage.getItem('user');
    const sessionStorageUser = sessionStorage.getItem('user');
    
    if (localStorageLoggedIn && localStorageUser) {
      // Admin user (persistent)
      setIsAuthenticated(true);
      setIsAdmin(true);
      setUser(JSON.parse(localStorageUser));
      console.log("🔐 Admin session detected");
    } else if (sessionStorageLoggedIn && sessionStorageUser) {
      // Normal user (temporary)
      setIsAuthenticated(true);
      setIsAdmin(false);
      setUser(JSON.parse(sessionStorageUser));
      console.log("👤 Normal user session detected");
    } else {
      // Not authenticated
      setIsAuthenticated(false);
      setIsAdmin(false);
      setUser(null);
      console.log("🚫 No active session");
    }
  };

  const logout = () => {
    if (isAdmin) {
      // Clear admin data from localStorage
      localStorage.removeItem('loggedIn');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('user');
    } else {
      // Clear normal user data from sessionStorage
      sessionStorage.removeItem('loggedIn');
      sessionStorage.removeItem('isAdmin');
      sessionStorage.removeItem('user');
    }
    
    // Clear token if exists
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    // Notify all components
    window.dispatchEvent(new Event('loginStateChange'));
    
    console.log("👋 User logged out");
  };

  return {
    isAuthenticated,
    isAdmin,
    user,
    checkAuthStatus,
    logout
  };
};