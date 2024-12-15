import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  userId: string | null;
  email: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    isLoading: true,
    userId: null,
    email: null
  })
  const router = useRouter()

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
            email: data.email
          })
        } else {
          setAuthState({
            isLoggedIn: false,
            isLoading: false,
            userId: null,
            email: null
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
          email: null
        })
        toast.error('An error occurred while checking authentication.')
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  return { ...authState }
}

