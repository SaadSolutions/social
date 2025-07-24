import { Instance, SnapshotIn, SnapshotOut, types, flow } from "mobx-state-tree"
import { MMKV } from "react-native-mmkv"
import { Api } from "../services/api"

const storage = new MMKV()

export const UserModel = types.model("User", {
  id: types.number,
  email: types.string,
})

export const AuthenticationStoreModel = types
  .model("AuthenticationStore")
  .props({
    token: types.maybe(types.string),
    user: types.maybe(UserModel),
    isLoading: types.optional(types.boolean, false),
  })
  .actions((self) => {
    const api = new Api()

    const setIsLoading = (value: boolean) => {
      self.isLoading = value
    }

    const setAuthData = (token: string, user: { id: number; email: string }) => {
      self.token = token
      self.user = UserModel.create(user)

      // Store in persistent storage
      storage.set("auth_token", token)
      storage.set("auth_user", JSON.stringify(user))

      // Add auth header to API
      api.apisauce.setHeader("Authorization", `Bearer ${token}`)
    }

    const clearAuthData = () => {
      self.token = undefined
      self.user = undefined

      // Clear storage
      storage.delete("auth_token")
      storage.delete("auth_user")

      // Remove auth header
      api.apisauce.deleteHeader("Authorization")
    }

    const loadStoredAuth = () => {
      setIsLoading(true)
      try {
        const storedToken = storage.getString("auth_token")
        const storedUser = storage.getString("auth_user")

        if (storedToken && storedUser) {
          const user = JSON.parse(storedUser)
          setAuthData(storedToken, user)
        }
      } catch (error) {
        console.error("Error loading stored auth:", error)
        // Clear corrupted data
        clearAuthData()
      } finally {
        setIsLoading(false)
      }
    }

    const login = flow(function* (email: string, password: string) {
      setIsLoading(true)
      try {
        const response = yield api.apisauce.post("/auth/login", {
          email,
          password,
        })

        if (response.ok && response.data) {
          const { token, user } = response.data
          setAuthData(token, user)
        } else {
          throw new Error(response.data?.msg || "Login failed")
        }
      } catch (error: any) {
        console.error("Login error:", error)
        throw new Error(error.message || "Network error during login")
      } finally {
        setIsLoading(false)
      }
    })

    const signup = flow(function* (email: string, password: string) {
      setIsLoading(true)
      try {
        const response = yield api.apisauce.post("/auth/signup", {
          email,
          password,
        })

        if (response.ok && response.data) {
          const { token, user } = response.data
          setAuthData(token, user)
        } else {
          throw new Error(response.data?.msg || "Signup failed")
        }
      } catch (error: any) {
        console.error("Signup error:", error)
        throw new Error(error.message || "Network error during signup")
      } finally {
        setIsLoading(false)
      }
    })

    const logout = () => {
      clearAuthData()
    }

    return {
      setIsLoading,
      setAuthData,
      clearAuthData,
      loadStoredAuth,
      login,
      signup,
      logout,
    }
  })
  .views((self) => ({
    get isAuthenticated() {
      return !!self.token
    },
    get currentUser() {
      return self.user
    },
  }))

export interface AuthenticationStore extends Instance<typeof AuthenticationStoreModel> {}
export interface AuthenticationStoreSnapshotOut
  extends SnapshotOut<typeof AuthenticationStoreModel> {}
export interface AuthenticationStoreSnapshotIn
  extends SnapshotIn<typeof AuthenticationStoreModel> {}
