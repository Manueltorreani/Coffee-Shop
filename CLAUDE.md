# Coffee Shop — Contexto para Claude Code

## Sobre el proyecto
- App full-stack para gestión de un coffee shop. Proyecto de aprendizaje con **defensa final en diciembre 2026**.
- Trabajo colaborativo con Git/GitHub (otra persona trabaja en la rama `brandon-dev`).
- Me comunico en **español**. Respondé siempre en español.

## Stack
- **Front** (`front/`): React + Vite + Tailwind CSS.
- **Back** (`back/`): Node.js + Prisma ORM sobre SQLite (`back/prisma/dev.db`).
- Autenticación con `bcryptjs` (agregada en `brandon-dev`).

## Forma de trabajo (IMPORTANTE)
Tengo que **defender este proyecto**, así que necesito entender cada línea:
1. **Antes de escribir código, explicá el plan** (qué archivos vas a tocar y por qué) y esperá mi OK.
2. Trabajá **por pasos chicos**: un modelo, un endpoint o un componente a la vez.
3. Después de cada cambio, explicá **qué hiciste y por qué**, en términos que pueda repetir en la defensa.
4. Si hay decisiones de diseño, planteame las opciones con pros y contras y **dejame decidir**.
5. Para lógica nueva o importante, preferí guiarme con preguntas y pistas en vez de darme todo resuelto.
6. Respetá los patrones existentes del proyecto; no introduzcas librerías nuevas sin consultarme.

## Patrones establecidos (seguirlos en módulos nuevos)
- **CRUD tipo/entidad**: `TipoGasto` → `Gasto`. Mismo patrón para catálogos nuevos.
- **Auto-refresh form ↔ tabla**: la página padre (ej. `GastosPage`) usa `useRef`; el panel/tabla se envuelve en `forwardRef` y expone `refresh` con `useImperativeHandle`; el form llama al refresh tras crear o editar.
- **Campo `estado`** (boolean activo/inactivo) mostrado como badge en las tablas.
- **Nombres únicos**: `@unique` en el schema; el error Prisma `P2002` se responde como **HTTP 409** y se muestra inline en el form.

## Lecciones aprendidas (no repetir estos errores)
- Prisma: el nombre del modelo en el controller debe coincidir **exactamente** con el schema (singular vs plural).
- Al agregar `@unique` a datos existentes: `npx prisma migrate reset` y después `npx prisma migrate dev --name <nombre>`.
- React: `useEffect` **no** puede ser async; usar una función async interna.
- `forwardRef((props, ref) => ...)`: el orden es **(props, ref)**.
- `useImperativeHandle` necesita el wrapper `forwardRef`.
- Git: `back/prisma/dev.db` debe estar en `.gitignore`. Después de un pull que cambie `package.json`, correr `npm install` en `back` y `front`.
- Git: `back/node_modules` también está fuera del repo (`git rm -r --cached`). Después de un pull con migraciones nuevas, correr `npx prisma migrate dev` en `back`.
- Las rutas que usa el front con `PATCH` necesitan `PATCH` en `methods` del CORS (`server.js`).

## Estado actual
- ✅ Módulo Gastos: CRUD completo con edición en modal; `Gastos` tiene `paymentMethod` (texto, igual que `Order`).
- ✅ Módulo Ventas: el usuario sale del token, empleados pueden vender, no se cobra sin método de pago, imprime ticket y comanda.
- ✅ **Módulo Configuración**: métodos de pago, usuarios (crear/editar/activar, rol), datos del local (`ConfigLocal`, una sola fila) e impresión (`window.print()` + `@media print`, papel 58/80 mm).
- ✅ **Módulo Caja**: abrir, movimientos manuales, cierre con diferencia, historial (admin).
- ⏳ Después: probar todo de punta a punta en el navegador, preparar la defensa.

## Roles
- Empleado (no admin): Ventas y Caja (abrir, movimientos, cerrar).
- Admin: todo, más productos, categorías, gastos, configuración e historial de arqueos.

## Diseño del módulo Caja (estilo Fudo) — implementado
- **Dos modelos**: `ArqueoCaja` (sesión de apertura → cierre) y `MovimientoCaja` (detalle).
- `MovimientoCaja` = **solo ingresos/egresos manuales**: tipo (INGRESO/EGRESO), monto (positivo), descripcion, userId, arqueoId, createdAt.
- **No se relacionan `Gastos` ni `Order` con el arqueo**: se filtran por `createdAt` entre apertura y cierre.
- **Efectivo** = `paymentMethod` igual a "Efectivo" (sin importar mayúsculas). El método de pago se tiene que llamar así.
- Fórmula: `monto sistema = monto inicial + ventas efectivo + ingresos manuales − gastos efectivo − egresos manuales`.
- `diferencia = monto contado por el usuario − monto sistema` (negativo = falta plata).
- `ArqueoCaja`: fechaApertura, fechaCierre, montoInicial, estado (ABIERTA/CERRADA), usuarioApertura/usuarioCierre (dos relaciones con nombre a `User`), y la **foto del cierre**: ventasEfectivo, ingresosManuales, gastosEfectivo, egresosManuales, montoSistema, montoUsuario, diferencia, comentario.
- Reglas: no puede haber dos cajas abiertas (409), no se registran movimientos sin caja abierta, no se borran movimientos de una caja cerrada.
