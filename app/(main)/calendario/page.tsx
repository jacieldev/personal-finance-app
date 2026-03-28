"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeft, ChevronRight, ChevronDown, Calendar, CreditCard, AlertCircle, CheckCircle2, Banknote, PanelRightClose, PanelRightOpen } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Tipos ──────────────────────────────────────────────────────────────────
interface ObligacionCal {
   id: number
   dia: number
   mes: number
   nombre: string
   tipo: string
   monto: number
   estado: string
}

// Días de quincena: 15 y 28
const DIAS_QUINCENA = [15, 28]

const DIAS_SEMANA = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"]
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

// ── Helpers ────────────────────────────────────────────────────────────────
function getDiasEnMes(year: number, month: number) {
   return new Date(year, month + 1, 0).getDate()
}

function getPrimerDiaSemana(year: number, month: number) {
   const d = new Date(year, month, 1).getDay()
   return d === 0 ? 6 : d - 1
}

// Si el día de pago cae en fin de semana, retrocede al viernes
function diaPagoEfectivo(year: number, month: number, dia: number): number {
   const diasEnMes = getDiasEnMes(year, month)
   const diaReal = Math.min(dia, diasEnMes)
   const dow = new Date(year, month, diaReal).getDay() // 0=dom, 6=sab
   if (dow === 6) return diaReal - 1  // sábado → viernes
   if (dow === 0) return diaReal - 2  // domingo → viernes
   return diaReal
}

// Dado un día del mes, determina a qué período pertenece
// Período 1: del 29 (o día después del pago anterior) al 15
// Período 2: del 16 al 28/fin de mes
function getPeriodo(dia: number, año: number, mes: number): 1 | 2 {
   const pago1 = diaPagoEfectivo(año, mes, 15)
   return dia <= pago1 ? 1 : 2
}

export default function CalendarioPage() {
   const now = new Date()
   const HOY = { dia: now.getDate(), mes: now.getMonth(), año: now.getFullYear() }

   const [año, setAño] = useState(HOY.año)
   const [mes, setMes] = useState(HOY.mes)
   const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(null)
   const [verPeriodo, setVerPeriodo] = useState<1 | 2 | "todos">("todos")
   const [panelAbierto, setPanelAbierto] = useState(true)
   const [obligaciones, setObligaciones] = useState<ObligacionCal[]>([])

   async function load() {
      const res = await fetch("/api/obligaciones")
      const data = await res.json()
      if (!Array.isArray(data)) return
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const mapped: ObligacionCal[] = data.map((o: {
         id: number; nombre: string; categoria: string; monto: number | string;
         pagada: boolean; proximoVencimiento: string
      }) => {
         const dateStr = String(o.proximoVencimiento).slice(0, 10)
         const d = new Date(dateStr + "T12:00:00")
         const estado = o.pagada ? "Pagado" : d < today ? "Vencido" : "Pendiente"
         return {
            id: o.id,
            dia: d.getDate(),
            mes: d.getMonth(),
            nombre: o.nombre,
            tipo: o.categoria,
            monto: typeof o.monto === "string" ? parseFloat(o.monto) : o.monto,
            estado,
         }
      })
      setObligaciones(mapped)
   }

   useEffect(() => { load() }, [])

   async function marcarPagado(id: number) {
      await fetch(`/api/obligaciones/${id}`, {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ pagada: true }),
      })
      load()
   }

   const diasEnMes = getDiasEnMes(año, mes)
   const primerDia = getPrimerDiaSemana(año, mes)

   const oblMes = obligaciones.filter((o) => o.mes === mes)

   // Días efectivos de quincena en este mes
   const pagos = DIAS_QUINCENA.map((d) => ({
      diaOriginal: d,
      diaEfectivo: diaPagoEfectivo(año, mes, d),
      movido: diaPagoEfectivo(año, mes, d) !== Math.min(d, diasEnMes),
   }))

   const diasConObl = new Set(oblMes.map((o) => o.dia))
   const diasDePago = new Set(pagos.map((p) => p.diaEfectivo))

   const oblDiaSeleccionado = diaSeleccionado
      ? oblMes.filter((o) => o.dia === diaSeleccionado)
      : []

   // Filtrar por período si aplica
   const oblFiltradas = verPeriodo === "todos"
      ? oblMes
      : oblMes.filter((o) => getPeriodo(o.dia, año, mes) === verPeriodo)

   const totalPeriodo1 = oblMes.filter((o) => getPeriodo(o.dia, año, mes) === 1).reduce((s, o) => s + o.monto, 0)
   const totalPeriodo2 = oblMes.filter((o) => getPeriodo(o.dia, año, mes) === 2).reduce((s, o) => s + o.monto, 0)
   const vencidas = oblMes.filter((o) => o.estado === "Vencido").length
   const pendientes = oblMes.filter((o) => o.estado === "Pendiente").length

   function navMes(dir: number) {
      let nm = mes + dir
      let na = año
      if (nm < 0) { nm = 11; na-- }
      if (nm > 11) { nm = 0; na++ }
      setMes(nm); setAño(na); setDiaSeleccionado(null)
   }

   return (
      <div className="flex flex-col gap-6 p-6">
         {/* Header */}
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-bold">Calendario</h1>
               <p className="text-sm text-muted-foreground mt-1">Agenda de obligaciones por período</p>
            </div>
            <button
               onClick={() => setPanelAbierto((v) => !v)}
               className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
               {panelAbierto ? <PanelRightClose className="size-4" /> : <PanelRightOpen className="size-4" />}
               {panelAbierto ? "Ocultar detalle" : "Ver detalle"}
            </button>
         </div>

         {/* Cards resumen períodos */}
         <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
               <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Calendar className="size-4 text-muted-foreground" />
               </div>
               <div>
                  <p className="text-xs text-muted-foreground">Obligaciones este mes</p>
                  <p className="text-xl font-bold">{oblMes.length}</p>
               </div>
            </div>
            <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
               <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <Banknote className="size-4 text-blue-600" />
               </div>
               <div>
                  <p className="text-xs text-muted-foreground">1ª quincena (al día {pagos[0].diaEfectivo})</p>
                  <p className="text-xl font-bold">${totalPeriodo1.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
               </div>
            </div>
            <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
               <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-purple-50">
                  <Banknote className="size-4 text-purple-600" />
               </div>
               <div>
                  <p className="text-xs text-muted-foreground">2ª quincena (al día {pagos[1].diaEfectivo})</p>
                  <p className="text-xl font-bold">${totalPeriodo2.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
               </div>
            </div>
         </div>

         {/* Filtro período */}
         <div className="flex items-center gap-2">
            {([["todos", "Todos"], [1, "1ª Quincena"], [2, "2ª Quincena"]] as const).map(([val, label]) => (
               <button
                  key={val}
                  onClick={() => setVerPeriodo(val)}
                  className={cn(
                     "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors border",
                     verPeriodo === val
                        ? "bg-foreground text-background border-foreground"
                        : "text-muted-foreground hover:bg-muted"
                  )}
               >{label}</button>
            ))}
         </div>

         {/* Calendario + detalle */}
         <div className={cn("grid grid-cols-1 gap-4", panelAbierto ? "lg:grid-cols-[1fr_320px]" : "lg:grid-cols-1")}>

            {/* Calendario */}
            <div className="rounded-xl border bg-card shadow-sm">
               {/* Nav mes */}
               <div className="flex items-center justify-between px-6 py-4 border-b">
                  <button onClick={() => navMes(-1)} className="flex size-8 items-center justify-center rounded-lg hover:bg-muted transition-colors">
                     <ChevronLeft className="size-4" />
                  </button>
                  <div className="flex items-center gap-2">
                     <span className="font-semibold text-base">{MESES[mes]} {año}</span>
                     {(mes !== HOY.mes || año !== HOY.año) && (
                        <button
                           onClick={() => { setMes(HOY.mes); setAño(HOY.año); setDiaSeleccionado(null) }}
                           className="text-xs font-medium px-2 py-0.5 rounded-full border hover:bg-muted transition-colors text-muted-foreground"
                        >
                           Hoy
                        </button>
                     )}
                  </div>
                  <div className="flex items-center gap-1">
                     <button onClick={() => navMes(1)} className="flex size-8 items-center justify-center rounded-lg hover:bg-muted transition-colors">
                        <ChevronRight className="size-4" />
                     </button>
                  </div>
               </div>

               {/* Aviso si algún pago se movió */}
               {pagos.some((p) => p.movido) && (
                  <div className="mx-4 mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700 flex items-center gap-1.5">
                     <AlertCircle className="size-3.5 shrink-0" />
                     {pagos.filter((p) => p.movido).map((p) =>
                        `Pago del ${p.diaOriginal} recorrido al viernes ${p.diaEfectivo}`
                     ).join(" · ")}
                  </div>
               )}

               {/* Grid */}
               <div className="p-4">
                  <div className="grid grid-cols-7 mb-2">
                     {DIAS_SEMANA.map((d) => (
                        <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
                     ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                     {Array.from({ length: primerDia }).map((_, i) => <div key={`e-${i}`} />)}

                     {Array.from({ length: diasEnMes }).map((_, i) => {
                        const dia = i + 1
                        const tieneObl = diasConObl.has(dia)
                        const esPago = diasDePago.has(dia)
                        const esHoy = dia === HOY.dia && mes === HOY.mes && año === HOY.año
                        const seleccionado = diaSeleccionado === dia
                        const oblsDia = oblMes.filter((o) => o.dia === dia)
                        const tieneVencida = oblsDia.some((o) => o.estado === "Vencido")
                        const periodo = getPeriodo(dia, año, mes)
                        const enFiltro = verPeriodo === "todos" || periodo === verPeriodo

                        return (
                           <button
                              key={dia}
                              onClick={() => {
                                 if (tieneObl || esPago) setDiaSeleccionado(seleccionado ? null : dia)
                              }}
                              className={cn(
                                 "relative flex flex-col items-center justify-center rounded-lg py-2 text-sm transition-colors",
                                 seleccionado
                                    ? "bg-foreground text-background"
                                    : esPago
                                       ? "ring-2 ring-blue-400 ring-offset-1 font-semibold"
                                       : esHoy
                                          ? "bg-muted font-semibold"
                                          : "hover:bg-muted/60",
                                 !enFiltro && "opacity-25",
                                 !tieneObl && !esPago && "cursor-default"
                              )}
                           >
                              <span>{dia}</span>
                              {(esPago || tieneObl) && (
                                 <span className="mt-0.5 flex items-center gap-0.5">
                                    {esPago && (
                                       <span className={cn(
                                          "size-1.5 rounded-full",
                                          seleccionado ? "bg-background" : "bg-blue-500"
                                       )} />
                                    )}
                                    {tieneObl && (
                                       <span className={cn(
                                          "size-1.5 rounded-full",
                                          seleccionado ? "bg-background"
                                             : tieneVencida ? "bg-red-500"
                                                : "bg-orange-400"
                                       )} />
                                    )}
                                 </span>
                              )}
                           </button>
                        )
                     })}
                  </div>
               </div>

               {/* Leyenda */}
               <div className="flex flex-wrap items-center gap-4 px-6 py-3 border-t text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-blue-500 inline-block" /> Día de pago</span>
                  <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-red-500 inline-block" /> Vencido</span>
                  <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-orange-400 inline-block" /> Pendiente</span>
               </div>
            </div>

            {/* Panel detalle */}
            <AnimatePresence initial={false}>
               {panelAbierto && (
                  <motion.div
                     key="panel"
                     initial={{ opacity: 0, width: 0 }}
                     animate={{ opacity: 1, width: 320 }}
                     exit={{ opacity: 0, width: 0 }}
                     transition={{ duration: 0.25, ease: "easeInOut" }}
                     className="overflow-hidden shrink-0"
                  >
                     <div className="rounded-xl border bg-card shadow-sm flex flex-col h-full">
                        <div className="px-5 py-4 border-b">
                           <h2 className="font-semibold text-sm">
                              {diaSeleccionado ? `${diaSeleccionado} de ${MESES[mes]}` : "Selecciona un día"}
                           </h2>
                           <p className="text-xs text-muted-foreground mt-0.5">
                              {diaSeleccionado
                                 ? [
                                    diasDePago.has(diaSeleccionado) && "📅 Día de quincena",
                                    oblDiaSeleccionado.length > 0 && `${oblDiaSeleccionado.length} obligación(es) · ${getPeriodo(diaSeleccionado, año, mes) === 1 ? "1ª" : "2ª"} quincena`,
                                 ].filter(Boolean).join(" · ") || "Sin obligaciones"
                                 : "Toca un día del calendario"}
                           </p>
                        </div>

                        <div className="flex flex-col gap-2 p-4 flex-1">
                           {/* Día de pago */}
                           {diaSeleccionado && diasDePago.has(diaSeleccionado) && (
                              <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 mb-1">
                                 <p className="text-xs font-medium text-blue-700 flex items-center gap-1.5">
                                    <Banknote className="size-3.5" /> Día de cobro de quincena
                                 </p>
                                 {pagos.find((p) => p.diaEfectivo === diaSeleccionado)?.movido && (
                                    <p className="text-xs text-blue-600 mt-0.5 opacity-80">
                                       Movido de fin de semana al viernes
                                    </p>
                                 )}
                              </div>
                           )}

                           {!diaSeleccionado && (
                              <div className="flex flex-1 items-center justify-center py-12">
                                 <div className="text-center text-muted-foreground">
                                    <Calendar className="size-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">Ningún día seleccionado</p>
                                 </div>
                              </div>
                           )}

                           {diaSeleccionado && oblDiaSeleccionado.length === 0 && !diasDePago.has(diaSeleccionado) && (
                              <div className="flex flex-1 items-center justify-center py-12">
                                 <div className="text-center text-muted-foreground">
                                    <CheckCircle2 className="size-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">Sin obligaciones este día</p>
                                 </div>
                              </div>
                           )}

                           {oblDiaSeleccionado.map((o) => (
                              <div key={o.id} className="rounded-lg border p-3 flex flex-col gap-1.5">
                                 <div className="flex items-start justify-between gap-2">
                                    <span className="font-medium text-sm">{o.nombre}</span>
                                    <span className="font-bold text-sm shrink-0">
                                       ${o.monto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                                    </span>
                                 </div>
                                 <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs rounded-full border px-2 py-0.5 text-muted-foreground">{o.tipo}</span>
                                    <span className={cn(
                                       "text-xs rounded-full px-2 py-0.5 font-medium",
                                       o.estado === "Vencido" ? "bg-red-100 text-red-600"
                                          : o.estado === "Pagado" ? "bg-green-100 text-green-600"
                                             : "bg-orange-50 text-orange-600"
                                    )}>{o.estado}</span>
                                 </div>
                                 <button
                                    onClick={() => marcarPagado(o.id)}
                                    className="mt-1 text-xs text-muted-foreground hover:text-foreground transition-colors text-left flex items-center gap-1">
                                    <CheckCircle2 className="size-3.5" /> Marcar como pagado
                                 </button>
                              </div>
                           ))}
                        </div>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>
   )
}

