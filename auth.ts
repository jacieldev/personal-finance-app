import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
   providers: [
      Credentials({
         credentials: {
            email:    { label: "Email",      type: "email" },
            password: { label: "Contraseña", type: "password" },
         },
         async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) return null

            const usuario = await prisma.usuario.findUnique({
               where: { email: credentials.email as string },
            })
            if (!usuario) return null

            const valid = await bcrypt.compare(
               credentials.password as string,
               usuario.password,
            )
            if (!valid) return null

            return { id: usuario.id, name: usuario.nombre, email: usuario.email }
         },
      }),
   ],
   pages: {
      signIn: "/login",
   },
   callbacks: {
      jwt({ token, user }) {
         if (user) token.id = user.id
         return token
      },
      session({ session, token }) {
         if (token.id) session.user.id = token.id as string
         return session
      },
      authorized({ auth, request }) {
         const isLoggedIn = !!auth?.user
         const { pathname } = request.nextUrl
         const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register")
         if (isAuthPage) {
            // Si ya está autenticado, redirigir al dashboard
            if (isLoggedIn) return Response.redirect(new URL("/dashboard", request.nextUrl))
            return true
         }
         // Ruta protegida: redirigir a login si no autenticado
         return isLoggedIn
      },
   },
})
