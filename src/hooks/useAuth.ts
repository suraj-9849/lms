import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  userId: string | null;
  email: string | null;
  logout: () => Promise<void>;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    isLoading: true,
    userId: null,
    email: null,
    logout: async () => {}
  })
  const router = useRouter()

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        setAuthState({
          isLoggedIn: false,
          isLoading: false,
          userId: null,
          email: null,
          logout
        })
        toast.success('Logged out successfully')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Logout failed')
      }
    } catch (error) {
      console.error('Logout failed:', error)
      toast.error('Failed to log out. Please try again.')
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          setAuthState({
            isLoggedIn: data.isAuthenticated,
            isLoading: false,
            userId: data.userId,
            email: data.email,
            logout
          })
        } else {
          setAuthState({
            isLoggedIn: false,
            isLoading: false,
            userId: null,
            email: null,
            logout
          })
          toast.error('Authentication failed. Please log in again.')
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setAuthState({
          isLoggedIn: false,
          isLoading: false,
          userId: null,
          email: null,
          logout
        })
        toast.error('An error occurred while checking authentication.')
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  return { 
    ...authState, 
    logout 
  }
}