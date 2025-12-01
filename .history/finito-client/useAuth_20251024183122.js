import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = () => {
    try {
      // Check both localStorage (admin) and sessionStorage (normal users)
      const localStorageLoggedIn = localStorage.getItem('loggedIn') === 'true';
      const sessionStorageLoggedIn = sessionStorage.getItem('loggedIn') === 'true';
      
      const localStorageAdmin = localStorage.getItem('isAdmin') === 'true';
      const sessionStorageAdmin = sessionStorage.getItem('isAdmin') === 'true';
      
      const localStorageUser = localStorage.getItem('user');
      const sessionStorageUser = sessionStorage.getItem('user');
      
      if (localStorageLoggedIn && localStorageUser) {
        // Admin user (persistent - stays logged in)
        setIsAuthenticated(true);
        setIsAdmin(true);
        setUser(JSON.parse(localStorageUser));
        console.log("🔐 Admin session detected - persistent login");
      } else if (sessionStorageLoggedIn && sessionStorageUser) {
        // Normal user (temporary - logs out when browser closes)
        setIsAuthenticated(true);
        setIsAdmin(false);
        setUser(JSON.parse(sessionStorageUser));
        console.log("👤 Normal user session detected - temporary login");
      } else {
        // Not authenticated
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUser(null);
        console.log("🚫 No active session");
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsAuthenticated(false);
      setIsAdmin(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
    
    // Listen for auth changes across components
    window.addEventListener('loginStateChange', checkAuthStatus);
    window.addEventListener('storage', checkAuthStatus);
    
    return () => {
      window.removeEventListener('loginStateChange', checkAuthStatus);
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []);

  const login = (userData, isAdminUser = false) => {
    if (isAdminUser) {
      // Admin: Store in localStorage (persistent)
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('user', JSON.stringify(userData));
      console.log("💾 Admin login - data saved to localStorage");
    } else {
      // Normal user: Store in sessionStorage (temporary)
      sessionStorage.setItem('loggedIn', 'true');
      sessionStorage.setItem('isAdmin', 'false');
      sessionStorage.setItem('user', JSON.stringify(userData));
      console.log("💾 Normal user login - data saved to sessionStorage");
    }
    
    // Notify all components
    window.dispatchEvent(new Event('loginStateChange'));
  };

  const logout = () => {
    // Clear all storage
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('user');
    sessionStorage.removeItem('loggedIn');
    sessionStorage.removeItem('isAdmin');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    // Notify all components
    window.dispatchEvent(new Event('loginStateChange'));
    
    console.log("👋 User logged out - all storage cleared");
  };

  return {
    isAuthenticated,
    isAdmin,
    user,
    loading,
    login,
    logout,
    checkAuthStatus
  };
};