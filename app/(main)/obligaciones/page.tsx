"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
   Plus, X, ChevronDown, CreditCard, RefreshCw,
   Tv, Dumbbell, Music2, Wifi, Car, Home, Landmark,
   MoreHorizontal, Pencil, Trash2, AlertCircle, CheckCircle2, Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ── Tipos ──────────────────────────────────────────────────────────────────
type Categoria = "Suscripcion" | "Credito" | "Prestamo" | "Servicio" | "Renta" | "Otro"
type Frecuencia = "Semanal" | "Quincenal" | "Mensual" | "Anual"
type Estado = "Activo" | "Pausado"

interface Obligacion {
   id: number
   nombre: string
   categoria: Categoria
   frecuencia: Frecuencia
   diaPago: number
   monto: number
   estado: Estado
   proximoVencimiento: string   // ISO
   pagada: boolean
}

// ── Mock data ──────────────────────────────────────────────────────────────

const CATEGORIAS: Categoria[] = ["Suscripcion", "Credito", "Prestamo", "Servicio", "Renta", "Otro"]
const FRECUENCIAS: Frecuencia[] = ["Semanal", "Quincenal", "Mensual", "Anual"]

const catIcon: Record<Categoria, React.ElementType> = {
   Suscripcion: Tv,
   Credito:     CreditCard,
   Prestamo:    Landmark,
   Servicio:    Wifi,
   Renta:       Home,
   Otro:        MoreHorizontal,
}

const catColor: Record<Categoria, string> = {
   Suscripcion: "bg-purple-50 text-purple-600",
   Credito:     "bg-orange-50 text-orange-600",
   Prestamo:    "bg-blue-50 text-blue-600",
   Servicio:    "bg-cyan-50 text-cyan-600",
   Renta:       "bg-yellow-50 text-yellow-700",
   Otro:        "bg-muted text-muted-foreground",
}

const nombreIcon: Record<string, React.ElementType> = {
   Netflix: Tv, Spotify: Music2, Gimnasio: Dumbbell,
   Internet: Wifi, Renta: Home,
   "Préstamo Personal": Landmark, "Tarjeta Crédito": CreditCard,
}

// ── Helpers ────────────────────────────────────────────────────────────────
function formatFecha(iso: string) {
   return new Date(iso + "T12:00:00").toLocaleDateString("es-MX", {
      weekday: "short", day: "numeric", month: "short", year: "numeric",
   })
}
function formatMonto(n: number) {
   return n.toLocaleString("es-MX", { minimumFractionDigits: 2 })
}
function diasRestantes(iso: string) {
   const hoy = new Date()
   hoy.setHours(0, 0, 0, 0)
   const venc = new Date(iso + "T12:00:00")
   return Math.ceil((venc.getTime() - hoy.getTime()) / 86_400_000)
}

// ── Select ─────────────────────────────────────────────────────────────────
function Select<T extends string>({ value, onChange, options, placeholder }: {
   value: T | ""; onChange: (v: T) => void; options: T[]; placeholder: string
}) {
   return (
      <div className="relative">
         <select
            value={value}
            onChange={(e) => onChange(e.target.value as T)}
            className="w-full appearance-none rounded-lg border bg-background px-3 py-2 pr-8 text-sm outline-none focus:ring-2 focus:ring-ring"
         >
            <option value="">{placeholder}</option>
            {options.map((o) => <option key={o} value={o}>{o}</option>)}
         </select>
         <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
      </div>
   )
}

// ── Toggle ─────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
   return (
      <button
         onClick={onChange}
         className={cn(
            "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
            checked ? "bg-foreground" : "bg-muted"
         )}
      >
         <span className={cn(
            "inline-block size-3.5 rounded-full bg-background shadow transition-transform",
            checked ? "translate-x-4" : "translate-x-0.5"
         )} />
      </button>
   )
}

// ── Sheet ──────────────────────────────────────────────────────────────────
function ObligacionSheet({ open, onClose, onSave, editData }: {
   open: boolean; onClose: () => void
   onSave: (o: Omit<Obligacion, "id" | "pagada">) => void
   editData?: Obligacion
}) {
   const hoy = new Date()
   const [form, setForm] = useState({
      nombre:              editData?.nombre ?? "",
      categoria:           editData?.categoria ?? "" as Categoria | "",
      frecuencia:          editData?.frecuencia ?? "Mensual" as Frecuencia,
      diaPago:             editData?.diaPago ?? 1,
      monto:               editData?.monto ?? 0,
      estado:              editData?.estado ?? "Activo" as Estado,
      proximoVencimiento:  editData?.proximoVencimiento ?? "",
   })

   function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
      setForm((p) => ({ ...p, [k]: v }))
   }

   function handleSave() {
      if (!form.nombre || !form.categoria || form.monto <= 0) return
      const prox = form.proximoVencimiento ||
         `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2,"0")}-${String(form.diaPago).padStart(2,"0")}`
      onSave({ ...form, categoria: form.categoria as Categoria, proximoVencimiento: prox })
      onClose()
   }

   return (
      <AnimatePresence>
         {open && (
            <>
               <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-40 bg-black/30"
                  onClick={onClose}
               />
               <motion.div
                  initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-background shadow-xl"
               >
                  <div className="flex items-center justify-between border-b px-5 py-4">
                     <div>
                        <h2 className="font-semibold">{editData ? "Editar obligación" : "Nueva obligación"}</h2>
                        <p className="text-xs text-muted-foreground">Pago fijo o recurrente</p>
                     </div>
                     <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
                        <X className="size-4" />
                     </button>
                  </div>

                  <div className="flex flex-col gap-4 overflow-y-auto p-5 flex-1">
                     <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Nombre</label>
                        <input
                           value={form.nombre} onChange={(e) => set("nombre", e.target.value)}
                           placeholder="Ej. Netflix"
                           className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />
                     </div>
                     <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Categoría</label>
                        <Select value={form.categoria} onChange={(v) => set("categoria", v)} options={CATEGORIAS} placeholder="Seleccionar..." />
                     </div>
                     <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Frecuencia</label>
                        <Select value={form.frecuencia} onChange={(v) => set("frecuencia", v)} options={FRECUENCIAS} placeholder="Seleccionar..." />
                     </div>
                     <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Día de pago</label>
                        <input
                           type="number" min={1} max={31}
                           value={form.diaPago}
                           onChange={(e) => set("diaPago", parseInt(e.target.value) || 1)}
                           className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />
                     </div>
                     <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Monto</label>
                        <div className="relative">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                           <input
                              type="number" min={0}
                              value={form.monto || ""}
                              onChange={(e) => set("monto", parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="w-full rounded-lg border bg-background py-2 pl-7 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                           />
                        </div>
                     </div>
                     <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Próximo vencimiento</label>
                        <input
                           type="date" value={form.proximoVencimiento}
                           onChange={(e) => set("proximoVencimiento", e.target.value)}
                           className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />
                     </div>
                     <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Estado</label>
                        <div className="grid grid-cols-2 gap-2">
                           {(["Activo", "Pausado"] as Estado[]).map((e) => (
                              <button key={e}
                                 onClick={() => set("estado", e)}
                                 className={cn(
                                    "rounded-lg border py-2 text-sm font-medium transition-colors",
                                    form.estado === e ? "bg-foreground text-background border-foreground" : "hover:bg-muted"
                                 )}
                              >{e}</button>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="border-t p-5">
                     <button
                        onClick={handleSave}
                        className="w-full rounded-lg bg-foreground py-2.5 text-sm font-medium text-background hover:opacity-90 transition-opacity"
                     >
                        {editData ? "Guardar cambios" : "Agregar obligación"}
                     </button>
                  </div>
               </motion.div>
            </>
         )}
      </AnimatePresence>
   )
}

// ── Card de obligación ─────────────────────────────────────────────────────
function ObligacionCard({ o, onToggleEstado, onEdit, onDelete, onMarcarPagada }: {
   o: Obligacion
   onToggleEstado: () => void
   onEdit: () => void
   onDelete: () => void
   onMarcarPagada: () => void
}) {
   const dias = diasRestantes(o.proximoVencimiento)
   const Icon = nombreIcon[o.nombre] ?? catIcon[o.categoria]
   const CatIcon = catIcon[o.categoria]

   const urgencia = dias < 0 ? "vencida" : dias <= 3 ? "urgente" : dias <= 7 ? "pronto" : "ok"

   return (
      <motion.div
         layout
         initial={{ opacity: 0, y: 8 }}
         animate={{ opacity: 1, y: 0 }}
         exit={{ opacity: 0, x: 20 }}
         transition={{ duration: 0.18 }}
         className={cn(
            "rounded-xl border bg-card p-5 flex flex-col gap-4 transition-opacity",
            o.estado === "Pausado" && "opacity-50"
         )}
      >
         {/* Fila superior */}
         <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
               <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", catColor[o.categoria])}>
                  <Icon className="size-4" />
               </div>
               <div>
                  <p className="font-semibold text-sm">{o.nombre}</p>
                  <p className="text-xs text-muted-foreground">{o.frecuencia} · Día {o.diaPago}</p>
               </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
               <span className="text-xs text-muted-foreground">{o.estado}</span>
               <Toggle checked={o.estado === "Activo"} onChange={onToggleEstado} />
            </div>
         </div>

         {/* Divider */}
         <div className="h-px bg-border" />

         {/* Fila inferior */}
         <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
               <span className="text-xs text-muted-foreground">Próximo vencimiento</span>
               <span className="text-sm font-medium">{formatFecha(o.proximoVencimiento)}</span>
               {/* Badge urgencia */}
               <span className={cn("mt-0.5 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  urgencia === "vencida" ? "bg-red-100 text-red-600" :
                  urgencia === "urgente" ? "bg-orange-100 text-orange-600" :
                  urgencia === "pronto"  ? "bg-yellow-100 text-yellow-700" :
                  "bg-muted text-muted-foreground"
               )}>
                  {urgencia === "vencida"  && <AlertCircle className="size-3" />}
                  {urgencia === "urgente"  && <AlertCircle className="size-3" />}
                  {urgencia === "pronto"   && <Clock className="size-3" />}
                  {urgencia === "ok"       && <RefreshCw className="size-3" />}
                  {urgencia === "vencida"  ? "Vencida" :
                   urgencia === "urgente"  ? `Vence en ${dias} día${dias === 1 ? "" : "s"}` :
                   urgencia === "pronto"   ? `En ${dias} días` :
                   `En ${dias} días`}
               </span>
            </div>

            <div className="flex flex-col items-end gap-2">
               <span className="text-2xl font-bold">${formatMonto(o.monto)}</span>
               <div className="flex items-center gap-1">
                  {/* Marcar pagada */}
                  {!o.pagada ? (
                     <button
                        onClick={onMarcarPagada}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors"
                     >
                        <CheckCircle2 className="size-3.5" /> Pagada
                     </button>
                  ) : (
                     <span className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-green-600 bg-green-50">
                        <CheckCircle2 className="size-3.5" /> Pagada
                     </span>
                  )}
                  <button onClick={onEdit} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors">
                     <Pencil className="size-3.5" />
                  </button>
                  <button onClick={onDelete} className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors">
                     <Trash2 className="size-3.5" />
                  </button>
               </div>
            </div>
         </div>
      </motion.div>
   )
}

// ── Página ─────────────────────────────────────────────────────────────────
const TABS = ["Todas", "Suscripcion", "Credito", "Prestamo", "Servicio", "Renta"] as const
type Tab = typeof TABS[number]

export default function ObligacionesPage() {
   const [items, setItems]       = useState<Obligacion[]>([])
   const [tab, setTab]           = useState<Tab>("Todas")
   const [sheetOpen, setSheetOpen] = useState(false)
   const [editando, setEditando]   = useState<Obligacion | undefined>()
   const [eliminarId, setEliminarId] = useState<number | null>(null)
   const [loading, setLoading]     = useState(true)
   const itemAEliminar = items.find((o) => o.id === eliminarId)

   async function load() {
      setLoading(true)
      const res = await fetch("/api/obligaciones")
      const data = await res.json()
      if (!Array.isArray(data)) { setLoading(false); return }
      const mapped: Obligacion[] = data.map((o: {
         id: number; nombre: string; categoria: Categoria; frecuencia: Frecuencia;
         diaPago: number; monto: number | string; estado: Estado; proximoVencimiento: string; pagada: boolean
      }) => ({
         id: o.id,
         nombre: o.nombre,
         categoria: o.categoria as Categoria,
         frecuencia: o.frecuencia as Frecuencia,
         diaPago: o.diaPago,
         monto: typeof o.monto === "string" ? parseFloat(o.monto) : o.monto,
         estado: o.estado as Estado,
         proximoVencimiento: String(o.proximoVencimiento).slice(0, 10),
         pagada: o.pagada,
      }))
      setItems(mapped)
      setLoading(false)
   }

   useEffect(() => { load() }, [])

   const filtradas = items.filter((o) => tab === "Todas" || o.categoria === tab)
      .sort((a, b) => a.proximoVencimiento.localeCompare(b.proximoVencimiento))

   const totalActivo = items.filter((o) => o.estado === "Activo").reduce((s, o) => s + o.monto, 0)
   const pendientes  = items.filter((o) => o.estado === "Activo" && !o.pagada).length
   const vencidas    = items.filter((o) => diasRestantes(o.proximoVencimiento) < 0 && !o.pagada).length

   async function handleSave(data: Omit<Obligacion, "id" | "pagada">) {
      const body = {
         nombre: data.nombre,
         categoria: data.categoria,
         frecuencia: data.frecuencia,
         diaPago: data.diaPago,
         monto: data.monto,
         estado: data.estado,
         proximoVencimiento: data.proximoVencimiento,
      }
      if (editando) {
         await fetch(`/api/obligaciones/${editando.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
         })
         setEditando(undefined)
      } else {
         await fetch("/api/obligaciones", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
         })
      }
      load()
   }

   async function toggleEstado(id: number) {
      const o = items.find((x) => x.id === id)
      if (!o) return
      await fetch(`/api/obligaciones/${id}`, {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ estado: o.estado === "Activo" ? "Pausado" : "Activo" }),
      })
      load()
   }

   async function marcarPagada(id: number) {
      await fetch(`/api/obligaciones/${id}`, {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ pagada: true }),
      })
      load()
   }

   async function eliminar(id: number) {
      await fetch(`/api/obligaciones/${id}`, { method: "DELETE" })
      setEliminarId(null)
      load()
   }

   if (loading) return (
      <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
         Cargando…
      </div>
   )

   return (
      <>
         <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
               <div>
                  <h1 className="text-3xl font-bold">Obligaciones</h1>
                  <p className="text-sm text-muted-foreground mt-1">Suscripciones, créditos y pagos fijos</p>
               </div>
               <button
                  onClick={() => { setEditando(undefined); setSheetOpen(true) }}
                  className="flex shrink-0 items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 transition-opacity"
               >
                  <Plus className="size-4" /> Nueva Obligación
               </button>
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
               <div className="rounded-xl border bg-card p-5 flex flex-col gap-1.5">
                  <span className="text-xs text-muted-foreground">Total mensual activo</span>
                  <span className="text-2xl font-bold">${formatMonto(totalActivo)}</span>
               </div>
               <div className="rounded-xl border bg-card p-5 flex flex-col gap-1.5">
                  <span className="text-xs text-muted-foreground">Pendientes de pago</span>
                  <span className="text-2xl font-bold">{pendientes}</span>
               </div>
               <div className="rounded-xl border bg-card p-5 flex flex-col gap-1.5">
                  <span className="text-xs text-muted-foreground">Vencidas</span>
                  <span className={cn("text-2xl font-bold", vencidas > 0 ? "text-red-500" : "")}>{vencidas}</span>
               </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 flex-wrap">
               {TABS.map((t) => (
                  <button
                     key={t}
                     onClick={() => setTab(t)}
                     className={cn(
                        "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                        tab === t
                           ? "bg-foreground text-background"
                           : "border hover:bg-muted text-muted-foreground"
                     )}
                  >{t}</button>
               ))}
            </div>

            {/* Grid de cards */}
            {filtradas.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <CreditCard className="size-8 mb-2 opacity-30" />
                  <p className="text-sm">Sin obligaciones en esta categoría</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <AnimatePresence>
                     {filtradas.map((o) => (
                        <ObligacionCard
                           key={o.id}
                           o={o}
                           onToggleEstado={() => toggleEstado(o.id)}
                           onEdit={() => { setEditando(o); setSheetOpen(true) }}
                           onDelete={() => setEliminarId(o.id)}
                           onMarcarPagada={() => marcarPagada(o.id)}
                        />
                     ))}
                  </AnimatePresence>
               </div>
            )}
         </div>

         <ObligacionSheet
            open={sheetOpen}
            onClose={() => { setSheetOpen(false); setEditando(undefined) }}
            onSave={handleSave}
            editData={editando}
         />

         {/* Modal confirmar eliminación */}
         <AnimatePresence>
            {eliminarId !== null && (
               <>
                  <motion.div
                     key="backdrop"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="fixed inset-0 z-40 bg-black/40"
                     onClick={() => setEliminarId(null)}
                  />
                  <motion.div
                     key="modal"
                     initial={{ opacity: 0, scale: 0.95, y: 8 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 8 }}
                     transition={{ duration: 0.18 }}
                     className="fixed inset-0 z-50 flex items-center justify-center p-4"
                  >
                     <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-xl flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                           <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                              <Trash2 className="size-5 text-red-500" />
                           </div>
                           <div>
                              <p className="font-semibold">Eliminar obligación</p>
                              <p className="text-sm text-muted-foreground">Esta acción no se puede deshacer</p>
                           </div>
                        </div>
                        {itemAEliminar && (
                           <div className="rounded-xl border bg-muted/40 px-4 py-3">
                              <p className="font-medium text-sm">{itemAEliminar.nombre}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                 {itemAEliminar.categoria} · {itemAEliminar.frecuencia} · ${formatMonto(itemAEliminar.monto)}
                              </p>
                           </div>
                        )}
                        <div className="flex gap-2 pt-1">
                           <button
                              onClick={() => setEliminarId(null)}
                              className="flex-1 rounded-xl border py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                           >
                              Cancelar
                           </button>
                           <button
                              onClick={() => eliminar(eliminarId!)}
                              className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition-colors"
                           >
                              Eliminar
                           </button>
                        </div>
                     </div>
                  </motion.div>
               </>
            )}
         </AnimatePresence>
      </>
   )
}

