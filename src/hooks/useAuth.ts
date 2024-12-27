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
    logout: async () => {},
  });
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setAuthState((prev) => ({
          ...prev,
          isLoggedIn: false,
          userId: null,
          email: null,
        }));
        toast.success('Logged out successfully');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Logout failed');
      }
    } catch (error:unknown) {
      console.error('Logout failed:', error);
      toast.error('Failed to log out. Please try again.');
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // This route helps t
        const response = await fetch('/api/auth/check', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setAuthState({
            isLoggedIn: data.isAuthenticated,
            isLoading: false,
            userId: data.userId,
            email: data.email,
            logout,
          });
        } else {
          setAuthState((prev) => ({
            ...prev,
            isLoggedIn: false,
            isLoading: false,
            userId: null,
            email: null,
          }));
          toast.error('Authentication failed. Please log in again.');
          router.push('/login');
        }
      } catch (error:unknown) {
        console.error('Auth check failed:', error);
        setAuthState((prev) => ({
          ...prev,
          isLoggedIn: false,
          isLoading: false,
          userId: null,
          email: null,
        }));
        toast.error('An error occurred while checking authentication.');
        router.push('/login');
      }
    };

    checkAuth();
  }, [router, logout]);

  return {
    ...authState,
    logout,
  };
}
