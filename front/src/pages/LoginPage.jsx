import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveToken } from "../lib/auth";

export default function LoginPage(){
    const[email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState ('')
    const navigate = useNavigate()

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
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--blue-50)'
    }}>
      <div className="card" style={{ width:380, padding:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <div style={{ width:36, height:36, borderRadius:8, background:'var(--blue-600)' }} />
          <h2 style={{ margin:0 }}>Iniciar sesión</h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'grid', gap:10 }}>
          <input
            className="input"
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />
          <input
            className="input"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />

          {error && <div style={{ color:'#b91c1c', fontSize:14 }}>{error}</div>}

          <button className="btn" type="submit">Ingresar</button>
        </form>
      </div>
    </div>
  )

}