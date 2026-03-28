import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
   const session = await auth()
   if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

   const { id } = await params
   const body = await req.json()

   const obligacion = await prisma.obligacion.updateMany({
      where: { id: Number(id), usuarioId: session.user.id },
      data: {
         nombre:             body.nombre,
         categoria:          body.categoria,
         frecuencia:         body.frecuencia,
         diaPago:            body.diaPago,
         monto:              body.monto,
         estado:             body.estado,
         proximoVencimiento: body.proximoVencimiento ? new Date(body.proximoVencimiento) : undefined,
         pagada:             body.pagada,
      },
   })
   return NextResponse.json(obligacion)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
   const session = await auth()
   if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

   const { id } = await params

   await prisma.obligacion.deleteMany({
      where: { id: Number(id), usuarioId: session.user.id },
   })
   return NextResponse.json({ ok: true })
}
