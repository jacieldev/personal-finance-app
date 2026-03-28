"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Wallet, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
   const router = useRouter()
   const [email, setEmail] = useState("")
   const [password, setPassword] = useState("")
   const [showPass, setShowPass] = useState(false)
   const [error, setError] = useState("")
   const [loading, setLoading] = useState(false)

   async function handleSubmit(e: React.FormEvent) {
      e.preventDefault()
      setError("")

      if (!email || !password) {
         setError("Completa todos los campos.")
         return
      }

      setLoading(true)
      const res = await signIn("credentials", {
         email,
         password,
         redirect: false,
      })
      setLoading(false)

      if (res?.error) {
         setError("Correo o contraseña incorrectos.")
         return
      }

      router.push("/dashboard")
      router.refresh()
   }

   return (
      <div className="w-full max-w-sm rounded-2xl bg-card p-8 shadow-sm">
         {/* Ícono */}
         <div className="flex justify-center mb-6">
            <div className="flex size-14 items-center justify-center rounded-full bg-foreground text-background">
               <Wallet className="size-6" />
            </div>
         </div>

         {/* Título */}
         <h1 className="text-center text-2xl font-bold mb-1">Mis Finanzas Personales</h1>
         <p className="text-center text-sm text-muted-foreground mb-7">
            Inicia sesión para continuar
         </p>

         {/* Formulario */}
         <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
               <label className="text-sm font-medium">Correo electrónico</label>
               <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  className="rounded-xl bg-muted border-0 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20 transition-shadow"
               />
            </div>

            <div className="flex flex-col gap-1.5">
               <label className="text-sm font-medium">Contraseña</label>
               <div className="relative">
                  <input
                     type={showPass ? "text" : "password"}
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     placeholder="••••••"
                     autoComplete="current-password"
                     className="w-full rounded-xl bg-muted border-0 px-4 py-3 pr-11 text-sm outline-none focus:ring-2 focus:ring-foreground/20 transition-shadow"
                  />
                  <button
                     type="button"
                     onClick={() => setShowPass((v) => !v)}
                     className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                     {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
               </div>
            </div>

            {error && (
               <p className="text-xs text-red-500 text-center">{error}</p>
            )}

            <button
               type="submit"
               disabled={loading}
               className="mt-1 w-full rounded-xl bg-foreground py-3 text-sm font-semibold text-background hover:opacity-90 transition-opacity disabled:opacity-60"
            >
               {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
         </form>

         <div className="mt-5 border-t pt-5 text-center">
            <p className="text-sm text-muted-foreground">
               ¿No tienes cuenta?{" "}
               <Link href="/register" className="font-medium text-foreground hover:underline">
                  Regístrate
               </Link>
            </p>
         </div>
      </div>
   )
}
