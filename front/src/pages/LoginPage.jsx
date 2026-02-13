import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveToken } from "../lib/auth";
import { login, register } from '../services/auth.service'
import { useAuth } from '../context/AuthContext.jsx'



export default function LoginPage(){
    const[nombre, setNombre] = useState('')
    const[email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState ('')
    const navigate = useNavigate()
    const[isRegister, setIsRegister] = useState(false)
    const { setUser } = useAuth()

    useEffect(() => { window.alert("Login Page loaded")}, [])
    useEffect(() => { window.alert("Cambio de modo, ahora registrarse esta en: " + isRegister)}, [isRegister,email])

    const handleLogin = async (e) => {
      e.preventDefault()
      setError('')
      try {
        if (email && password){
        const data = await login({
          email,
          password,
        })
        if(data){
          saveToken(data.token)   // guardamos “token”
          setUser(data.user)
          navigate('/', { replace:true })
        }else{
          setError('Credenciales inválidas.')
        }
        } else {
          setError('Completá email y contraseña.')
        }

      } catch (error) {
        console.error(error.message)
      }
    }

    const handleRegister = async (e) => {
      e.preventDefault()
      setError('')
      try {
        if (email && password && nombre){
        const data = await register({
          email,
          password,
          nombre
        })
        if(data){
          saveToken(data.token)   // guardamos “token”
          setUser(data.user)
          navigate('/', { replace:true })
        }else{
          setError('Error al registrarse.')
        }
        } else {
          setError('Completá email, contraseña y nombre.')
        }

      } catch (error) {
        console.error(error.message)
      }
    }

    const handleSubmit = async (e) =>{
        e.preventDefault()
        setError('')
        // ⬇️ HOY: simulación
    // MAÑANA: llamamos al backend POST /api/auth/login con fetch
    if (email && password){
      saveToken('fake-token')   // guardamos “token”
      navigate('/', { replace:true })
    } else {
      setError('Completá usuario y contraseña.')
    }
    }

     return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'black',
      background:'var(--blue-50)'
    }}>
      <div className="card" style={{ width:380, padding:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <div style={{ width:36, height:36, borderRadius:8, background:'var(--blue-600)' }} />
          <h2 style={{ margin:0 }}>{isRegister ? 'Registrarse' : 'Iniciar sesión'}</h2>
        </div>

        <form onSubmit={isRegister ? handleRegister : handleLogin} style={{ display:'grid', gap:10, color:'black' }}>
          {isRegister && (
            <input
              style={{color:'black'}}
              className="input"
              type="text"
              placeholder="Nombre"
              value={nombre}
              onChange={(e)=>setNombre(e.target.value)}
            />
          )}
          <input
            style={{color:'black'}}
            className="input"
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />
          <input
            style={{color:'black'}}
            className="input"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />

          {error && <div style={{ color:'#b91c1c', fontSize:14 }}>{error}</div>}

          <button className="btn" type="submit">Ingresar</button>
        </form>
        <div style={{ marginTop:16, fontSize:14 }}>
          {isRegister ? '¿Ya tenés cuenta?' : '¿No tenés cuenta?'}&nbsp;
          <button
            className="btn-link"
            onClick={()=>setIsRegister(!isRegister)}
          >
            {isRegister ? 'Iniciá sesión' : 'Registrate'}
          </button>
        </div>
      </div>
    </div>
  )

}