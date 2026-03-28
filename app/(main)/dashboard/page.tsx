"use client"

import { useEffect, useState } from "react"
import { Calendar, DollarSign, TrendingDown, TrendingUp, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Vencimiento {
   id: number
   fecha: string
   nombre: string
   tipo: string
   monto: string
   montoNum: number
   estado: "Vencido" | "Pendiente" | "Pagado"
}

function formatFechaCorta(iso: string) {
   return new Date(iso + "T12:00:00").toLocaleDateString("es-MX", {
      weekday: "short", day: "numeric", month: "short", year: "numeric",
   })
}

export default function DashboardPage() {
   const [vencimientos, setVencimientos] = useState<Vencimiento[]>([])
   const [gastos, setGastos] = useState(0)
   const [ingresos, setIngresos] = useState(0)
   const [saldoTotal, setSaldoTotal] = useState(0)
   const [loading, setLoading] = useState(true)

   async function load() {
      const [oblRes, movRes, cuentasRes] = await Promise.all([
         fetch("/api/obligaciones"),
         fetch("/api/movimientos"),
         fetch("/api/cuentas"),
      ])
      if (!oblRes.ok || !movRes.ok || !cuentasRes.ok) { setLoading(false); return }

      const obligaciones = await oblRes.json()
      const movimientos: { tipo: string; monto: number }[] = await movRes.json()
      const cuentas: { saldoInicial: number }[] = await cuentasRes.json()

      const hoy = new Date()
      const mapped: Vencimiento[] = obligaciones.map((o: {
         id: number; nombre: string; categoria: string; monto: number;
         proximoVencimiento: string; pagada: boolean;
      }) => {
         const fechaVenc = new Date(o.proximoVencimiento)
         let estado: "Vencido" | "Pendiente" | "Pagado" = "Pendiente"
         if (o.pagada) estado = "Pagado"
         else if (fechaVenc < hoy) estado = "Vencido"
         const isoDate = fechaVenc.toISOString().slice(0, 10)
         return {
            id: o.id,
            fecha: formatFechaCorta(isoDate),
            nombre: o.nombre,
            tipo: o.categoria,
            monto: `$${o.monto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
            montoNum: o.monto,
            estado,
         }
      })
      setVencimientos(mapped)

      const gastoTotal = movimientos.filter((m) => m.tipo === "Gasto").reduce((s, m) => s + Number(m.monto), 0)
      const ingresoTotal = movimientos.filter((m) => m.tipo === "Ingreso").reduce((s, m) => s + Number(m.monto), 0)
      setGastos(gastoTotal)
      setIngresos(ingresoTotal)

      const saldoBase = cuentas.reduce((s, c) => s + Number(c.saldoInicial), 0)
      setSaldoTotal(saldoBase + ingresoTotal - gastoTotal)
      setLoading(false)
   }

   useEffect(() => { load() }, [])

   async function marcarPagado(id: number) {
      await fetch(`/api/obligaciones/${id}`, {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ pagada: true }),
      })
      setVencimientos((prev) => prev.map((v) => v.id === id ? { ...v, estado: "Pagado" } : v))
   }

   const pendientes = vencimientos.filter((v) => v.estado !== "Pagado")
   const totalPendiente = pendientes.reduce((s, v) => s + v.montoNum, 0)

   const proximaPendiente = vencimientos
      .filter((v) => v.estado === "Pendiente")
      .sort((a, b) => a.fecha.localeCompare(b.fecha))[0]

   const stats = [
      {
         label: "Próximo Pago",
         value: proximaPendiente ? proximaPendiente.montoNum.toLocaleString("es-MX", { minimumFractionDigits: 2 }) : "—",
         sub: proximaPendiente?.fecha ?? "Sin obligaciones pendientes",
         icon: Calendar,
         iconColor: "text-muted-foreground",
      },
      {
         label: "Obligaciones Pendientes",
         value: `$${totalPendiente.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
         sub: `${pendientes.length} obligación(es) sin pagar`,
         icon: TrendingDown,
         iconColor: "text-red-500",
      },
      {
         label: "Gastos del Período",
         value: `$${gastos.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
         sub: "Gastos registrados",
         icon: TrendingUp,
         iconColor: "text-orange-500",
      },
      {
         label: "Saldo Estimado",
         value: `$${saldoTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
         sub: "Ingresos − Gastos + Saldo inicial",
         icon: DollarSign,
         iconColor: "text-muted-foreground",
         valueColor: saldoTotal >= 0 ? "text-green-600" : "text-red-500",
      },
   ]

   if (loading) return (
      <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
         Cargando…
      </div>
   )

   return (
      <div className="flex flex-col gap-6 p-6">
         {/* Header */}
         <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
               Resumen de tus finanzas personales
            </p>
         </div>

         {/* Stat Cards */}
         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
               <div
                  key={stat.label}
                  className="rounded-xl border bg-card p-5 shadow-sm flex flex-col gap-2"
               >
                  <div className="flex items-center justify-between">
                     <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                     <stat.icon className={`size-4 ${stat.iconColor}`} />
                  </div>
                  <span className={`text-2xl font-bold ${stat.valueColor ?? ""}`}>
                     {stat.value}
                  </span>
                  <span className="text-xs text-muted-foreground">{stat.sub}</span>
               </div>
            ))}
         </div>

         {/* Próximos Vencimientos */}
         <div className="rounded-xl border bg-card shadow-sm">
            <div className="px-6 py-4 border-b">
               <h2 className="text-base font-semibold">Próximos Vencimientos</h2>
               <p className="text-sm text-muted-foreground">Obligaciones pendientes de pago</p>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-sm">
                  <thead>
                     <tr className="border-b text-muted-foreground">
                        <th className="px-6 py-3 text-left font-medium">Fecha</th>
                        <th className="px-6 py-3 text-left font-medium">Nombre</th>
                        <th className="px-6 py-3 text-left font-medium">Tipo</th>
                        <th className="px-6 py-3 text-right font-medium">Monto</th>
                        <th className="px-6 py-3 text-left font-medium">Estado</th>
                        <th className="px-6 py-3 text-right font-medium">Acción</th>
                     </tr>
                  </thead>
                  <tbody>
                     {vencimientos.map((v) => (
                        <tr key={v.id} className={cn("border-b last:border-0 transition-colors", v.estado === "Pagado" ? "opacity-50" : "hover:bg-muted/40")}>
                           <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{v.fecha}</td>
                           <td className="px-6 py-4 font-medium">{v.nombre}</td>
                           <td className="px-6 py-4 text-muted-foreground">{v.tipo}</td>
                           <td className="px-6 py-4 text-right font-medium">{v.monto}</td>
                           <td className="px-6 py-4">
                              <span className={cn(
                                 "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                 v.estado === "Vencido"  ? "bg-red-500 text-white" :
                                 v.estado === "Pagado"   ? "bg-green-100 text-green-700" :
                                 "bg-muted text-muted-foreground"
                              )}>
                                 {v.estado}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-right">
                              {v.estado !== "Pagado" ? (
                                 <button
                                    onClick={() => marcarPagado(v.id)}
                                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                 >
                                    <CheckCircle2 className="size-3.5" />
                                    Marcar como pagado
                                 </button>
                              ) : (
                                 <span className="inline-flex items-center gap-1.5 text-xs text-green-600">
                                    <CheckCircle2 className="size-3.5" />
                                    Pagado
                                 </span>
                              )}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   )
}
