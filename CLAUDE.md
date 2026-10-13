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
- **Catálogo dentro de otra pantalla (modal)**: si un catálogo pertenece a otra entidad (ej. `Category` → `Product`), no tiene pantalla propia: se gestiona en un modal desde la pantalla dueña. Ver "Categorías dentro de Productos".
- **Modal reutilizable**: `ModalModified` (`children`, `onClose`, `titulo` opcional). No crear otro componente de modal.

## Lecciones aprendidas (no repetir estos errores)
- Prisma: el nombre del modelo en el controller debe coincidir **exactamente** con el schema (singular vs plural).
- Al agregar `@unique` a datos existentes: `npx prisma migrate reset` y después `npx prisma migrate dev --name <nombre>`.
- React: `useEffect` **no** puede ser async; usar una función async interna.
- `forwardRef((props, ref) => ...)`: el orden es **(props, ref)**.
- `useImperativeHandle` necesita el wrapper `forwardRef`.
- Git: `back/prisma/dev.db` debe estar en `.gitignore`. Después de un pull que cambie `package.json`, correr `npm install` en `back` y `front`.
- Git: `back/node_modules` también está fuera del repo (`git rm -r --cached`). Después de un pull con migraciones nuevas, correr `npx prisma migrate dev` en `back`.
- Las rutas que usa el front con `PATCH` necesitan `PATCH` en `methods` del CORS (`server.js`).
- Prisma: `npx prisma generate` (y el generate de `migrate dev`) falla con `EPERM` si el back está corriendo. Frenar el back, regenerar y volver a levantarlo.
- Agregar un campo **con `@default`** a un modelo con datos no necesita `migrate reset`: alcanza con `npx prisma migrate dev --name <nombre>`.
- React: un `<button>` dentro de un `<form>` hace submit por defecto. Usar `type="button"` y renderizar los modales **fuera** del `<form>`.

## Estado actual
- ✅ Módulo Gastos: CRUD completo con edición en modal; `Gastos` tiene `paymentMethod` (texto, igual que `Order`).
- ✅ Módulo Ventas: el usuario sale del token, empleados pueden vender, no se cobra sin método de pago, imprime ticket y comanda.
- ✅ **Módulo Configuración**: métodos de pago, usuarios (crear/editar/activar, rol), datos del local (`ConfigLocal`, una sola fila) e impresión (`window.print()` + `@media print`, papel 58/80 mm).
- ✅ **Módulo Caja**: abrir, movimientos manuales, cierre con diferencia, historial (admin).
- ✅ **Sistema de diseño** Surf Coffee aplicado a todo el front (ver sección al final).
- ✅ **Categorías dentro de Productos**: modal con listar, crear, editar y activar/desactivar. Ya no existe la pantalla Categorías.
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

## Categorías dentro de Productos — implementado
- `Category`: `nombre` (`@unique`) y `estado` (boolean, default `true`). Migración `category_estado`.
- **Back** (`products.controller.js`, rutas `/products/cat`): `createCategory` y `updateCategory` hacen `trim()`, aceptan `estado` y responden `P2002` → **409**. En `updateCategory`, `nombre` y `estado` son opcionales (se puede cambiar solo el estado).
- **Front** (`components/Categorias/`), mismo patrón que TipoGasto:
  - `CategoriasPanel`: tabla con `forwardRef` + `useImperativeHandle` (expone `fetchData`).
  - `CategoriasForm`: crear/editar, error 409 inline.
  - `CategoriasGestion`: contenedor con el `useRef` del panel (hace el rol de `GastosPage`); avisa hacia afuera con `onChange`.
- **Editar sin modal sobre modal**: el lápiz carga la fila en el mismo form. `CategoriasGestion` le pone `key` al form para que React lo cree de nuevo con esos datos.
- **El modal vive en `ProductsPage`**. Lo abren dos botones "Categorías": uno siempre visible junto al título y otro junto al select del `ProductForm` (prop `onAbrirCategorias`).
- **Refresco del select**: `ProductsPage` guarda `categoriasVersion` (número) y lo sube cuando cambian las categorías o se cierra el modal. `ProductForm` lo recibe por prop y lo usa como dependencia del `useEffect` que carga las categorías. También se recarga la tabla de productos.
- **Categoría inactiva**: no aparece en el select de productos, salvo que el producto en edición ya la tenga. No se borran categorías desde el modal (la ruta `DELETE` existe en el back pero no se usa).

## Sistema de diseño (marca Surf Coffee)
Todo vive en **un solo archivo**: `front/src/index.css` (Tailwind v4, sin `tailwind.config.js`). La fuente se carga con un `<link>` en `front/index.html`.

### Tokens (bloque `@theme`)
Cada `--color-x` genera las clases `bg-x`, `text-x`, `border-x`, etc. Los colores se nombran por su **función**, no por su tono.

| Token | Hex | Uso |
|---|---|---|
| `primary` | `#00A0C8` | botones principales, links, ítem activo del menú |
| `primary-hover` | `#007EA5` | hover de lo anterior |
| `primary-suave` | `#E5F5FA` | cabecera de tablas, fondo de pestañas, hover suave |
| `secondary` | `#006B96` | badges de marca, borde de foco |
| `nav` | `#005F8A` | sidebar, topbar, fondo del login |
| `dark` | `#003B4F` | texto principal, fondos oscuros |
| `fondo` | `#F2F7F9` | fondo de la app |
| `superficie` | `#FFFFFF` | tarjetas, modales |
| `borde` | `#D9E3E8` | bordes de tarjetas y filas |
| `borde-fuerte` | `#B8C7CF` | bordes de inputs |
| `texto-suave` | `#5B7480` | texto secundario, labels (más claro: `text-texto-suave/70`) |
| `exito` / `exito-suave` | `#18794E` / `#E3F4EA` | activo, ingreso, diferencia 0 |
| `error` / `error-suave` | `#C8323C` / `#FBE6E7` | errores, inactivo, egreso, faltante |
| `aviso` / `aviso-suave` | `#9A5B00` / `#FCF0D9` | pendiente, sobrante de caja |

### Tipografía
- **Archivo** (Google Fonts), semi-expandida: `font-stretch: 112.5%` en `body`.
- Cuerpo en **Regular (400)**; títulos `h1`–`h3` en **Medium Italic (500)** desde `@layer base`, sin clases.
- Solo están cargados los pesos 400 y 500: para énfasis usar `font-medium`. **No usar** `font-semibold`, `font-bold` ni `font-black` (el navegador simula la negrita y se ve mal).

### Clases reutilizables (`@layer components`)
| Elemento | Clases |
|---|---|
| Botones | `btn-primario`, `btn-secundario`, `btn-peligro` |
| Botones de ícono (tablas) | `btn-icono` + `btn-icono-editar` / `btn-icono-borrar` |
| Formularios | `form-card`, `form-titulo`, `form-campo`, `form-input`, `form-error` |
| Tablas | `tabla-card`, `tabla-head`, `tabla-fila`, `tabla-celda` (solo padding; la alineación va aparte) |
| Badges | `badge` + una variante: `badge-exito`, `badge-error`, `badge-aviso`, `badge-neutro`, `badge-marca` |
| Pestañas | `tabs`, `tab`, `tab-activo` |
| Modales | `modal-fondo`, `modal-caja` (los usan `ModalModified` y `ModalLoading`) |
| Otros | `card` (tarjeta genérica), `titulo-pagina` (el `h1` de cada página) |

### Reglas
- **Prohibido** escribir hex sueltos o colores crudos de Tailwind (`gray-500`, `red-600`, `bg-white`…) en los `.jsx`: usar siempre un token. Única excepción: blanco sobre fondos de color (`text-white`, `text-white/85`, `hover:bg-white/10`). En props que no aceptan clases (ej. gráficos de recharts) usar `var(--color-primary)`.
- Si un conjunto de clases se repite en más de un archivo, va a `index.css` como clase con `@apply`, no se copia.
- No crear otros archivos `.css`.
- **Radios**: controles (botones, inputs) `rounded-xl`; tarjetas y modales `rounded-2xl`; badges `rounded-full`.
- Un `border` siempre lleva color (`border-borde`): en Tailwind v4, sin color toma el del texto.
- Estado activo/inactivo: `badge-exito` / `badge-error`. Badges que no indican estado (rol, categoría): `badge-marca` o `badge-neutro`.
- Excepción: `Ticket.jsx` usa estilos inline y monospace porque es para impresión térmica; no sigue este sistema.
- `#root` tiene `text-align: center` heredado de la plantilla de Vite: el texto queda centrado salvo que se indique `text-left` / `text-right`.
- En tareas de diseño se toca **solo estilo** (CSS, `className`, colores): no lógica, estado, props ni estructura.
