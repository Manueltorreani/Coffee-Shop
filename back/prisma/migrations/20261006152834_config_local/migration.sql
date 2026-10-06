-- CreateTable
CREATE TABLE "ConfigLocal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "nombre" TEXT NOT NULL DEFAULT 'Coffee Shop',
    "direccion" TEXT,
    "telefono" TEXT,
    "cuit" TEXT,
    "mensajeTicket" TEXT,
    "anchoTicket" INTEGER NOT NULL DEFAULT 80,
    "imprimirAlCobrar" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);
