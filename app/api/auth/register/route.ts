import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
   const body = await req.json()
   const { nombre, email, password } = body

   if (!nombre || !email || !password) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
   }
   if (password.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 })
   }

   const existe = await prisma.usuario.findUnique({ where: { email } })
   if (existe) {
      return NextResponse.json({ error: "El correo ya está registrado" }, { status: 409 })
   }

   const hash = await bcrypt.hash(password, 12)
   const usuario = await prisma.usuario.create({
      data: { nombre, email, password: hash },
      select: { id: true, nombre: true, email: true },
   })

   return NextResponse.json(usuario, { status: 201 })
}
