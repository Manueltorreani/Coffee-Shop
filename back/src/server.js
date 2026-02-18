// src/server.js
import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'

// 1) Routers (usa controllers + store/Prisma) 
// de productos, auth y orders
import authRouter from './routes/auth.routes.js'
import productsRouter from './routes/products.routes.js'
import ordersRouter from './routes/orders.routes.js'

const app = express()
const PORT = 3001

// 2) Cargar definición de Swagger (OpenAPI)
const swaggerDoc = YAML.load('./swagger.yml')

// 3) Middlewares base (el ORDEN importa)

// 3.a) Parsear JSON del body ANTES de las rutas
app.use(express.json()) // para que lo que yo recibo en el body lo parseo como obj js

// 3.b) CORS (una sola configuración nunca es suficiente pero al menos ayuda )
app.use(
  cors({
<<<<<<< HEAD
    origin: 'http://localhost:5173', // tu front local
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
=======
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
>>>>>>> a451081cda24c735c7da7cfc6415c0cfb91869f6
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// 3.c) Logger simple (útil para ver qué llega y con qué body) -> (para ver que llega el token en headers, por ejemplo o ver que manda el front)
app.use((req, res, next) => {
  const now = new Date().toISOString()
  const origin = req.headers.origin || 'sin-origin'
  console.log(`[${now}] ${req.method} ${req.originalUrl}  origin:${origin}`)

  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Body recibido:', req.body)
  }

  // Continuamos al siguiente middleware o ruta
  next()// Sin esto, el request se quedaría colgado y no llegaría a las rutas
})

// 4) Rutas de la API

// 4.a) Documentación Swagger (antes o después de routes da igual)
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDoc, { swaggerOptions: { persistAuthorization: true } })
)

// 4.b) Rutas

app.use('/api/auth', authRouter)       // Login y Register, Update, Delete (protegidas update y delete con JWT)
app.use('/api/products', productsRouter) // Productos (protegidas las de escritura con JWT)
app.use('/api/orders', ordersRouter)     // Pedidos (protegidas con JWT)

// 4.c) Endpoints de ejemplo / utilitarios para testear salud servidor
app.get('/api/hello', (_req, res) => {
  res.json({ message: 'Hola Manu tu servidor funciona' })
})

app.get('/api/echo', (req, res) => {
  res.json({
    message: 'Echo',
    origin: req.headers.origin || null,
    headers: {
      'content-type': req.headers['content-type'] || null,
      authorization: req.headers['authorization'] || null,
    },
  })
})

// Endpoint protegido de ejemplo (usa header Authorization)
app.get('/api/protected', (req, res) => {
  const auth = req.headers['authorization']
  console.log('AUTH HEADER →', auth)
  if (!auth) {
    return res
      .status(401)
      .json({ error: 'no autorizado : falta header Authorization' })
  }
  res.json({ ok: true, userFromHeader: auth })
})

// 5) Error handler (último middleware)
// Si algún controller hace throw o falla algo, terminamos acá con 500
app.use((err, _req, res, _next) => {
  console.error('ERROR HANDLER :', err)
  res.status(500).json({ error: 'Error interno del servidor' })
})

// 6) Levantar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
})
