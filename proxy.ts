import { auth } from "@/auth"
export { auth as proxy }

export const config = {
   matcher: [
      // Excluir archivos estáticos, imágenes, y rutas de API de auth
      "/((?!_next/static|_next/image|favicon.ico|api/auth|api/register).*)",
   ],
}
