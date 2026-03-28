import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
   const session = await auth()
   if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

   const cuentas = await prisma.cuenta.findMany({
      where: { usuarioId: session.user.id },
      include: {
         movimientos: { orderBy: { fecha: "desc" }, take: 3 },
      },
   })
   return NextResponse.json(cuentas)
}

export async function POST(req: Request) {
   const session = await auth()
   if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

   const body = await req.json()
   const cuenta = await prisma.cuenta.create({
      data: {
         nombre:       body.nombre,
         tipo:         body.tipo,
         saldoInicial: body.saldoInicial,
         color:        body.color ?? "#6366f1",
         usuarioId:    session.user.id,
      },
   })
   return NextResponse.json(cuenta, { status: 201 })
}
