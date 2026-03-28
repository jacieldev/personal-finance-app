import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
   const session = await auth()
   if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

   const obligaciones = await prisma.obligacion.findMany({
      where: { usuarioId: session.user.id },
      orderBy: { proximoVencimiento: "asc" },
   })
   return NextResponse.json(obligaciones)
}

export async function POST(req: Request) {
   const session = await auth()
   if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

   const body = await req.json()
   const obligacion = await prisma.obligacion.create({
      data: {
         nombre:             body.nombre,
         categoria:          body.categoria,
         frecuencia:         body.frecuencia,
         diaPago:            body.diaPago,
         monto:              body.monto,
         estado:             body.estado ?? "Activo",
         proximoVencimiento: new Date(body.proximoVencimiento),
         pagada:             false,
         usuarioId:          session.user.id,
      },
   })
   return NextResponse.json(obligacion, { status: 201 })
}
