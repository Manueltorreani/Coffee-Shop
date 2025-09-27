import express from 'express'
import cors from 'cors'

const app = express()

//Middlewares
app.use(cors())
app.use(express.json())

// endpoint inicial
app.get('/api/hello',(req,res)=>{
    res.json({message: 'Hola Manu tu servidor funciona '})
})

//levantar server 
const PORT = 3001
app.listen(PORT,()=>{
    console.log('Servidor escuchando en http://localhost:${PORT}')
})