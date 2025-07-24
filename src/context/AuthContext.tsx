import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react"
import { MMKV } from "react-native-mmkv"
import { Api } from "../services/api"

// Initialize MMKV storage
const storage = new MMKV()

interface User {
  id: number
  email: string
}

interface AuthResponse {
  token: string
  user: User
}

interface AuthContextType {
  token: string | null
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const api = useMemo(() => new Api(), [])

  // Load token from storage on app start
  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        const storedToken = storage.getString("auth_token")
        const storedUser = storage.getString("auth_user")

        if (storedToken && storedUser) {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Error loading stored auth:", error)
        // Clear corrupted data
        storage.delete("auth_token")
        storage.delete("auth_user")
      } finally {
        setIsLoading(false)
      }
    }

    loadStoredAuth()
  }, [])

  // Add auth header to API requests when token is available
  useEffect(() => {
    if (token) {
      api.apisauce.setHeader("Authorization", `Bearer ${token}`)
    } else {
      api.apisauce.deleteHeader("Authorization")
    }
  }, [token, api])

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await api.apisauce.post<AuthResponse>("/auth/login", {
        email,
        password,
      })

      if (response.ok && response.data) {
        const { token: newToken, user: newUser } = response.data

        // Update state
        setToken(newToken)
        setUser(newUser)

        // Store in persistent storage
        storage.set("auth_token", newToken)
        storage.set("auth_user", JSON.stringify(newUser))
      } else {
        throw new Error((response.data as any)?.msg || "Login failed")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      throw new Error(error.message || "Network error during login")
    }
  }

  const signup = async (email: string, password: string): Promise<void> => {
    try {
      const response = await api.apisauce.post<AuthResponse>("/auth/signup", {
        email,
        password,
      })

      if (response.ok && response.data) {
        const { token: newToken, user: newUser } = response.data

        // Update state
        setToken(newToken)
        setUser(newUser)

        // Store in persistent storage
        storage.set("auth_token", newToken)
        storage.set("auth_user", JSON.stringify(newUser))
      } else {
        throw new Error((response.data as any)?.msg || "Signup failed")
      }
    } catch (error: any) {
      console.error("Signup error:", error)
      throw new Error(error.message || "Network error during signup")
    }
  }

  const logout = () => {
    // Clear state
    setToken(null)
    setUser(null)

    // Clear storage
    storage.delete("auth_token")
    storage.delete("auth_user")

    // Remove auth header
    api.apisauce.deleteHeader("Authorization")
  }

  const value: AuthContextType = {
    token,
    user,
    isLoading,
    login,
    signup,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
