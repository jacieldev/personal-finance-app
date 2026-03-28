import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
   const session = await auth()
   if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

   const { id } = await params
   const body = await req.json()

   await prisma.movimiento.updateMany({
      where: { id: Number(id), usuarioId: session.user.id },
      data: {
         fecha:       body.fecha ? new Date(body.fecha) : undefined,
         descripcion: body.descripcion,
         monto:       body.monto,
         tipo:        body.tipo,
         categoria:   body.categoria,
         cuentaId:    body.cuentaId,
      },
   })
   return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
   const session = await auth()
   if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

   const { id } = await params
   await prisma.movimiento.deleteMany({
      where: { id: Number(id), usuarioId: session.user.id },
   })
   return NextResponse.json({ ok: true })
}
