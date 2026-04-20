import { prisma } from "@prisma/client";

export const createGastos = async (req,res) => {
        try {
            const {nombre,  tipoGastoId} = req.body
            if(!nombre ) return res.status(400).json({error:"Nombre requerido"})
            if(!tipoGastoId ) return res.status(400).json({error:"Tipo de gasto no asociado"})
            if (typeof nombre !== "string") return res.status(400).json({error:"el nombre no es una cadena de texto"}) 
            if (typeof tipoGastoId !== "number") return res.status(400).json({error:"el tipo de gasto no es un  valor numerico"}) 
            
            const nuevoGasto = await prisma.gastos.create({data:{nombre,tipoGastoId}})
            return res.status(201).json(nuevoGasto) //201 :creacion exitosa 

        } catch (err) {
        console.error("error creando gasto : ",err)
        res.status(500).json({error:"error interno del servidor"})
        }
}

export const updateGasto = async (req,res) => {
    try {
        const{nombre,estado,tipoGastoId}= req.body
        const id = Number(req.params.id)
            if(!nombre ) return res.status(400).json({error:"Nombre requerido"})
            if(!tipoGastoId ) return res.status(400).json({error:"Tipo de gasto no asociado"})
            if(!id ) return res.status(400).json({error:" gasto no encontrado"})

            if (typeof nombre !== "string") return res.status(400).json({error:"el nombre no es una cadena de texto"}) 
            if (typeof tipoGastoId !== "number") return res.status(400).json({error:"el tipo de gasto no es un  valor numerico"}) 
            if (Number.isNaN(id)) return res.status(400).json({error:"el id no es un  valor numerico"})
            if (typeof estado !== "boolean") return res.status(400).json({error:"estado no asignado"})
            
                const gastoActualizado = await prisma.gastos.update({where:{id},data:{nombre,estado,tipoGastoId}})
                return res.status(202).json(gastoActualizado)


        } catch (err) {
        console.error("error actualizando gasto : ",err)
        res.status(500).json({error:"error interno del servidor"})
        }

}
export const deleteGasto = async (req,res) => {
    try {
        
        const id = Number(req.params.id)
            
            if(!id ) return res.status(400).json({error:" gasto no encontrado"})
            if (Number.isNaN(id) ) return res.status(400).json({error:"el id no es un  valor numerico"})
            
                const gastoEliminado = await prisma.gastos.delete({where:{id}})
                return res.status(200).json(gastoEliminado)


        } catch (err) {
        console.error("error eliminando gasto : ",err)
        res.status(500).json({error:"error interno del servidor"})
        }

}
export const getGastos = async (req,res) => {
    try {

                const gasto = await prisma.gastos.findMany({include:{tipoGastos:{select:{nombre:true}}}})
                return res.status(200).json(gasto)


        } catch (err) {
        console.error("error obteniendo gastos : ",err)
        res.status(500).json({error:"error interno del servidor"})
        }

}