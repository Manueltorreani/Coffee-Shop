import { createContext, useContext, useEffect, useState } from 'react'
import { getMe } from '../services/auth.service'
import { clearToken, getToken } from '../lib/auth'

export const AuthContext = createContext({
  user: null,
  loading: true,
})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const token = getToken();
      console.log("1. Token encontrado:", token); // DEBUG

      if (!token) {
        setLoading(false)
        return
      }

      try {
        console.log("2. Llamando a getMe..."); // DEBUG
        const me = await getMe()
        console.log("3. getMe respondió éxito:", me); // DEBUG
        setUser(me)
      } catch (error) {
        console.error("4. Error en getMe:", error); // DEBUG
        clearToken()
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  const logout = () => {
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
