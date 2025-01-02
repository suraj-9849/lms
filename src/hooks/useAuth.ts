import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { AuthState } from '@/utils/Interfaces';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    isLoading: true,
    userId: null,
    email: null,
    logout: async () => { },
  });
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setAuthState(prev => ({
          ...prev,
          isLoggedIn: false,
          userId: null,
          email: null,
        }));
        toast.success('Logged out successfully');
        router.push('/login');
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
    }
  }, [router]);

  const checkAuth = useCallback(async () => {
    try {
      console.log('Checking authentication status...');
      const response = await fetch('/api/auth/check', {
        credentials: 'include',
      });

      const data = await response.json();
      console.log('Auth check response:', data);

      if (response.ok && data.isAuthenticated) {
        setAuthState(prev => ({
          ...prev,
          isLoggedIn: true,
          isLoading: false,
          userId: data.userId,
          email: data.email,
          logout,
        }));
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoggedIn: false,
          isLoading: false,
          userId: null,
          email: null,
          logout,
        }));
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState(prev => ({
        ...prev,
        isLoggedIn: false,
        isLoading: false,
        userId: null,
        email: null,
        logout,
      }));
    }
  }, [logout]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return authState;
}