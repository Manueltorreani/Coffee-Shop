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
      if (!getToken()) {
        setLoading(false)
        return
      }

      try {
        const me = await getMe()
        setUser(me)
      } catch {
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
