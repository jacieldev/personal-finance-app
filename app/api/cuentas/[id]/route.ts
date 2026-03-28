import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
   const session = await auth()
   if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

   const { id } = await params
   const body = await req.json()

   await prisma.cuenta.updateMany({
      where: { id: Number(id), usuarioId: session.user.id },
      data: {
         nombre:       body.nombre,
         tipo:         body.tipo,
         saldoInicial: body.saldoInicial,
         color:        body.color,
      },
   })
   return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
   const session = await auth()
   if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

   const { id } = await params
   await prisma.cuenta.deleteMany({
      where: { id: Number(id), usuarioId: session.user.id },
   })
   return NextResponse.json({ ok: true })
}
