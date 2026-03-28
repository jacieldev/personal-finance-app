import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
   const session = await auth()
   if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

   const movimientos = await prisma.movimiento.findMany({
      where: { usuarioId: session.user.id },
      include: { cuenta: { select: { nombre: true } } },
      orderBy: { fecha: "desc" },
   })
   return NextResponse.json(movimientos)
}

export async function POST(req: Request) {
   const session = await auth()
   if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

   const body = await req.json()
   const movimiento = await prisma.movimiento.create({
      data: {
         fecha:       new Date(body.fecha),
         descripcion: body.descripcion,
         monto:       body.monto,
         tipo:        body.tipo,
         categoria:   body.categoria,
         cuentaId:    body.cuentaId,
         usuarioId:   session.user.id,
      },
      include: { cuenta: { select: { nombre: true } } },
   })
   return NextResponse.json(movimiento, { status: 201 })
}
