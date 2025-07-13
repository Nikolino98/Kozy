
import { useState, useEffect } from 'react';
import { getAdminSession, isAdminAuthenticated, logoutAdmin, type Admin } from '@/lib/auth';

export const useAdmin = () => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const session = getAdminSession();
      const authenticated = isAdminAuthenticated();
      
      setAdmin(session);
      setIsAuthenticated(authenticated);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const logout = () => {
    logoutAdmin();
    setAdmin(null);
    setIsAuthenticated(false);
  };

  return {
    admin,
    isAuthenticated,
    isLoading,
    logout
  };
};
