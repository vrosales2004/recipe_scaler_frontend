import { defineStore } from 'pinia'
import { userAuthenticationApi } from '@/services/api'
import type { 
  UserLoginRequest, 
  UserRegisterRequest, 
  UserLoginResponse,
  UserDocOutput,
  SessionDocOutput
} from '@/services/api'

export interface AuthUser {
  id: string
  username: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AuthUser | null,
    sessionId: null as string | null,
    isAuthenticated: false,
    loading: false,
    error: null as string | null
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated && state.user !== null,
    currentUser: (state) => state.user,
    currentSessionId: (state) => state.sessionId
  },

  actions: {
    async login(credentials: UserLoginRequest) {
      this.loading = true
      this.error = null
      
      try {
        console.log('Auth: Attempting login for user:', credentials.username)
        const response: UserLoginResponse = await userAuthenticationApi.loginUser(credentials)
        console.log('Auth: Login response:', response)
        
        // Store session info
        this.sessionId = response.sessionId
        
        // Get user details with retry logic
        let userResponse = null
        let retryCount = 0
        const maxRetries = 3
        
        while (retryCount < maxRetries) {
          try {
            console.log(`Auth: Attempting to get user details (attempt ${retryCount + 1})`)
            userResponse = await userAuthenticationApi.getUserByUsername({ username: credentials.username })
            console.log('Auth: User response:', userResponse)
            
            if (userResponse && userResponse.length > 0) {
              break
            }
          } catch (userError) {
            console.warn(`Auth: User lookup failed (attempt ${retryCount + 1}):`, userError)
            if (retryCount === maxRetries - 1) {
              throw userError
            }
          }
          
          retryCount++
          if (retryCount < maxRetries) {
            console.log('Auth: Retrying user lookup in 1 second...')
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }
        
        if (userResponse && userResponse.length > 0) {
          this.user = {
            id: userResponse[0]._id,
            username: userResponse[0].username
          }
          this.isAuthenticated = true
          
          // Store in localStorage for persistence
          localStorage.setItem('sessionId', response.sessionId)
          localStorage.setItem('userId', userResponse[0]._id)
          localStorage.setItem('username', userResponse[0].username)
          
          console.log('Auth: User logged in successfully:', this.user)
        } else {
          // Fallback: Use the username from login response if user lookup fails
          console.warn('Auth: User lookup failed, using fallback user data')
          this.user = {
            id: response.user, // Use the user ID from login response
            username: credentials.username
          }
          this.isAuthenticated = true
          
          // Store in localStorage for persistence
          localStorage.setItem('sessionId', response.sessionId)
          localStorage.setItem('userId', response.user)
          localStorage.setItem('username', credentials.username)
          
          console.log('Auth: User logged in with fallback data:', this.user)
        }
      } catch (error: any) {
        console.error('Auth: Login error:', error)
        this.error = error.response?.data?.error || error.message || 'Login failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async register(userData: UserRegisterRequest) {
      this.loading = true
      this.error = null
      
      try {
        console.log('Auth: Attempting registration for user:', userData.username)
        const response = await userAuthenticationApi.registerUser(userData)
        console.log('Auth: Registration response:', response)
        
        // Wait a moment for the user to be fully created in the backend
        console.log('Auth: Waiting for user creation to complete...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Auto-login after successful registration
        console.log('Auth: Attempting auto-login after registration')
        await this.login(userData)
      } catch (error: any) {
        console.error('Auth: Registration error:', error)
        this.error = error.response?.data?.error || error.message || 'Registration failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.loading = true
      this.error = null
      
      try {
        if (this.sessionId) {
          console.log('Auth: Attempting logout for session:', this.sessionId)
          await userAuthenticationApi.logoutUser({ sessionId: this.sessionId })
          console.log('Auth: Logout successful')
        }
      } catch (error: any) {
        console.warn('Auth: Logout error (continuing anyway):', error)
      } finally {
        // Clear local state regardless of API response
        this.user = null
        this.sessionId = null
        this.isAuthenticated = false
        
        // Clear localStorage
        localStorage.removeItem('sessionId')
        localStorage.removeItem('userId')
        localStorage.removeItem('username')
        
        this.loading = false
        console.log('Auth: User logged out')
      }
    },

    async checkSession() {
      const storedSessionId = localStorage.getItem('sessionId')
      const storedUserId = localStorage.getItem('userId')
      const storedUsername = localStorage.getItem('username')
      
      if (!storedSessionId || !storedUserId || !storedUsername) {
        console.log('Auth: No stored session found')
        return false
      }
      
      this.loading = true
      this.error = null
      
      try {
        console.log('Auth: Checking session validity:', storedSessionId)
        const sessionResponse = await userAuthenticationApi.getActiveSession({ sessionId: storedSessionId })
        
        if (sessionResponse.length > 0) {
          const session = sessionResponse[0]
          console.log('Auth: Session is valid:', session)
          
          // Check if session is not expired
          if (session.expirationTime > Date.now()) {
            this.sessionId = storedSessionId
            this.user = {
              id: storedUserId,
              username: storedUsername
            }
            this.isAuthenticated = true
            console.log('Auth: Session restored successfully')
            return true
          } else {
            console.log('Auth: Session expired')
            this.clearStoredAuth()
          }
        } else {
          console.log('Auth: Session not found or invalid')
          this.clearStoredAuth()
        }
      } catch (error: any) {
        console.error('Auth: Session check error:', error)
        // Don't clear auth immediately on session check error - might be network issue
        console.log('Auth: Session check failed, but keeping stored auth for now')
        this.sessionId = storedSessionId
        this.user = {
          id: storedUserId,
          username: storedUsername
        }
        this.isAuthenticated = true
        return true
      } finally {
        this.loading = false
      }
      
      return false
    },

    clearStoredAuth() {
      this.user = null
      this.sessionId = null
      this.isAuthenticated = false
      localStorage.removeItem('sessionId')
      localStorage.removeItem('userId')
      localStorage.removeItem('username')
    },

    clearError() {
      this.error = null
    }
  }
})
