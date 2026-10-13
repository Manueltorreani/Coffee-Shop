import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveToken } from "../lib/auth";
import { login, register } from '../services/auth.service'
import { useAuth } from '../context/AuthContext.jsx'
import Logo from '../assets/img/Chupete blanco.png'



export default function LoginPage(){
    const[nombre, setNombre] = useState('')
    const[email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState ('')
    const navigate = useNavigate()
    const[isRegister, setIsRegister] = useState(false)
    const { setUser } = useAuth()



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
    // fondo con el azul del logo y tarjeta blanca al centro
    <div className="min-h-screen flex items-center justify-center text-dark bg-nav">
      <div className="card" style={{ width:380, padding:24 }}>
        <div className="flex flex-col items-center gap-2 mb-4">
          <img src={Logo} alt="Surf Coffee" className="h-28" />
          <h2 className="m-0 text-xl font-medium text-dark">{isRegister ? 'Registrarse' : 'Iniciar sesión'}</h2>
        </div>

        <form onSubmit={isRegister ? handleRegister : handleLogin} style={{ display:'grid', gap:10 }}>
          {isRegister && (
            <input
              className="form-input"
              type="text"
              placeholder="Nombre"
              value={nombre}
              onChange={(e)=>setNombre(e.target.value)}
            />
          )}
          <input
            className="form-input"
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />
          <input
            className="form-input"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />

          {error && <div className="text-error text-sm">{error}</div>}

          <button className="btn-primario" type="submit">{isRegister ? "Registrarme" : "Ingresar"}</button>
        </form>
        <div style={{ marginTop:16, fontSize:14 }}>
          {isRegister ? '¿Ya tenés cuenta?' : '¿No tenés cuenta?'}&nbsp;
          <button
            className="text-primary font-medium hover:underline"
            onClick={()=>setIsRegister(!isRegister)}
          >
            {isRegister ? 'Iniciá sesión' : 'Registrate'}
          </button>
        </div>
        <div className="flex flex-col text-texto-suave">
            <p>usuario : pedro@gmail.com </p>
            <p>password : Pedro123</p>
        </div>
      </div>
    </div>
  )

}