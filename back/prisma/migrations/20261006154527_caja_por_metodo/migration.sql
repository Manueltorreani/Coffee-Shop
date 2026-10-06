/*
  Warnings:

  - You are about to drop the column `egresosManuales` on the `ArqueoCaja` table. All the data in the column will be lost.
  - You are about to drop the column `gastosEfectivo` on the `ArqueoCaja` table. All the data in the column will be lost.
  - You are about to drop the column `ingresosManuales` on the `ArqueoCaja` table. All the data in the column will be lost.
  - You are about to drop the column `ventasEfectivo` on the `ArqueoCaja` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "CierreMetodo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "metodo" TEXT NOT NULL,
    "montoInicial" REAL NOT NULL DEFAULT 0,
    "ventas" REAL NOT NULL,
    "ingresos" REAL NOT NULL,
    "gastos" REAL NOT NULL,
    "egresos" REAL NOT NULL,
    "montoSistema" REAL NOT NULL,
    "montoUsuario" REAL NOT NULL,
    "diferencia" REAL NOT NULL,
    "arqueoId" INTEGER NOT NULL,
    CONSTRAINT "CierreMetodo_arqueoId_fkey" FOREIGN KEY ("arqueoId") REFERENCES "ArqueoCaja" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ArqueoCaja" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fechaApertura" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaCierre" DATETIME,
    "montoInicial" REAL NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'ABIERTA',
    "montoSistema" REAL,
    "montoUsuario" REAL,
    "diferencia" REAL,
    "comentario" TEXT,
    "usuarioAperturaId" INTEGER NOT NULL,
    "usuarioCierreId" INTEGER,
    CONSTRAINT "ArqueoCaja_usuarioAperturaId_fkey" FOREIGN KEY ("usuarioAperturaId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ArqueoCaja_usuarioCierreId_fkey" FOREIGN KEY ("usuarioCierreId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ArqueoCaja" ("comentario", "diferencia", "estado", "fechaApertura", "fechaCierre", "id", "montoInicial", "montoSistema", "montoUsuario", "usuarioAperturaId", "usuarioCierreId") SELECT "comentario", "diferencia", "estado", "fechaApertura", "fechaCierre", "id", "montoInicial", "montoSistema", "montoUsuario", "usuarioAperturaId", "usuarioCierreId" FROM "ArqueoCaja";
DROP TABLE "ArqueoCaja";
ALTER TABLE "new_ArqueoCaja" RENAME TO "ArqueoCaja";
CREATE TABLE "new_MovimientoCaja" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL,
    "monto" REAL NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'Efectivo',
    "descripcion" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "arqueoId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "MovimientoCaja_arqueoId_fkey" FOREIGN KEY ("arqueoId") REFERENCES "ArqueoCaja" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MovimientoCaja_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MovimientoCaja" ("arqueoId", "createdAt", "descripcion", "id", "monto", "tipo", "userId") SELECT "arqueoId", "createdAt", "descripcion", "id", "monto", "tipo", "userId" FROM "MovimientoCaja";
DROP TABLE "MovimientoCaja";
ALTER TABLE "new_MovimientoCaja" RENAME TO "MovimientoCaja";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
