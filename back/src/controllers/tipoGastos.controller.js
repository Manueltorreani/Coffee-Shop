import { prisma } from "@prisma/client";

export const createTipoGastos = async (req,res) => {
        try {
            const {nombre } = req.body
            if(!nombre ) return res.status(400).json({error:"Nombre requerido"})
            if (typeof nombre !== "string") return res.status(400).json({error:"el nombre no es una cadena de texto"}) 

            const nuevoTipoGasto = await prisma.tipoGastos.create({data:{nombre}})
            return res.status(201).json(nuevoTipoGasto) //201 :creacion exitosa 

        } catch (err) {
        console.error("error creando tipo de gasto : ",err)
        res.status(500).json({error:"error interno del servidor"})
        }
}

/*model TipoGasto {
  id          Int         @id @default(autoincrement())
  nombre      String
  gastos    Gastos []
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  estado    Boolean   @default(true)
}*/
export const updateTipoGasto = async (req,res) => {
    try {
        const{nombre,estado}= req.body
        const id = Number(req.params.id)
            if(!nombre ) return res.status(400).json({error:"Nombre requerido"})
            if(!id ) return res.status(400).json({error:" gasto no encontrado"})

            if (typeof nombre !== "string") return res.status(400).json({error:"el nombre no es una cadena de texto"}) 
            if (Number.isNaN(id)) return res.status(400).json({error:"el id no es un  valor numerico"})
            if (typeof estado !== "boolean") return res.status(400).json({error:"estado no asignado"})
            
                const gastoTipoActualizado = await prisma.tipoGastos.update({where:{id},data:{nombre,estado}})
                return res.status(202).json(gastoTipoActualizado)


        } catch (err) {
        console.error("error actualizando tipo de gasto : ",err)
        res.status(500).json({error:"error interno del servidor"})
        }

}
export const deleteTipoGasto = async (req,res) => {
    try {
        
        const id = Number(req.params.id)
            
            if(!id ) return res.status(400).json({error:" gasto no encontrado"})
            if (Number.isNaN(id) ) return res.status(400).json({error:"el id no es un  valor numerico"})
            
                const gastoTipoEliminado = await prisma.tipoGastos.delete({where:{id}})
                return res.status(200).json(gastoTipoEliminado)


        } catch (err) {
        console.error("error eliminando tipo de gasto : ",err)
        res.status(500).json({error:"error interno del servidor"})
        }

}
export const getTipoGastos = async (req,res) => {
    try {

                const tipoGasto = await prisma.tipoGastos.findMany()
                return res.status(200).json(tipoGasto)
        } catch (err) {
        console.error("error obteniendo tipo de gastos : ",err)
        res.status(500).json({error:"error interno del servidor"})
        }

}

