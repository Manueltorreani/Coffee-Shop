-- CreateTable
CREATE TABLE "ArqueoCaja" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fechaApertura" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaCierre" DATETIME,
    "montoInicial" REAL NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'ABIERTA',
    "ventasEfectivo" REAL,
    "ingresosManuales" REAL,
    "gastosEfectivo" REAL,
    "egresosManuales" REAL,
    "montoSistema" REAL,
    "montoUsuario" REAL,
    "diferencia" REAL,
    "comentario" TEXT,
    "usuarioAperturaId" INTEGER NOT NULL,
    "usuarioCierreId" INTEGER,
    CONSTRAINT "ArqueoCaja_usuarioAperturaId_fkey" FOREIGN KEY ("usuarioAperturaId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ArqueoCaja_usuarioCierreId_fkey" FOREIGN KEY ("usuarioCierreId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MovimientoCaja" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL,
    "monto" REAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "arqueoId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "MovimientoCaja_arqueoId_fkey" FOREIGN KEY ("arqueoId") REFERENCES "ArqueoCaja" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MovimientoCaja_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
