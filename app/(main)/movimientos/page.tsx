"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
   Plus, Search, TrendingUp, TrendingDown, Scale,
   Pencil, Trash2, X, ChevronDown, UtensilsCrossed,
   Car, ShoppingBag, Zap, Gamepad2, HeartPulse, Banknote, MoreHorizontal,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ── Tipos ──────────────────────────────────────────────────────────────────
type Tipo = "Ingreso" | "Gasto"

interface Movimiento {
   id: number
   fecha: string
   descripcion: string
   categoria: string
   cuenta: string      // nombre de la cuenta (para mostrar)
   cuentaId: number    // id para llamadas API
   tipo: Tipo
   monto: number       // siempre positivo
}

interface CuentaSimple {
   id: number
   nombre: string
}

// ── Categorías ─────────────────────────────────────────────────────────────
const CATEGORIAS = ["Alimentación", "Transporte", "Compras", "Servicios", "Entretenimiento", "Salud", "Ingreso", "Otro"]

const catIcon: Record<string, React.ElementType> = {
   Alimentación: UtensilsCrossed,
   Transporte: Car,
   Compras: ShoppingBag,
   Servicios: Zap,
   Entretenimiento: Gamepad2,
   Salud: HeartPulse,
   Ingreso: Banknote,
   Otro: MoreHorizontal,
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

// ── Componente Select simple ───────────────────────────────────────────────
function Select({
   value, onChange, options, placeholder,
}: { value: string; onChange: (v: string) => void; options: string[]; placeholder: string }) {
   return (
      <div className="relative">
         <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full appearance-none rounded-lg border bg-background px-3 py-2 pr-8 text-sm outline-none focus:ring-2 focus:ring-ring"
         >
            <option value="">{placeholder}</option>
            {options.map((o) => <option key={o} value={o}>{o}</option>)}
         </select>
         <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
      </div>
   )
}

// ── Sheet Nuevo/Editar Movimiento ──────────────────────────────────────────
function MovimientoSheet({
   open, onClose, onSave, editData, cuentas,
}: {
   open: boolean
   onClose: () => void
   onSave: (m: Omit<Movimiento, "id">) => void
   editData?: Movimiento
   cuentas: CuentaSimple[]
}) {
   const [form, setForm] = useState<Omit<Movimiento, "id">>({
      fecha: editData?.fecha ?? new Date().toISOString().split("T")[0],
      descripcion: editData?.descripcion ?? "",
      categoria: editData?.categoria ?? "",
      cuenta: editData?.cuenta ?? "",
      cuentaId: editData?.cuentaId ?? 0,
      tipo: editData?.tipo ?? "Gasto",
      monto: editData?.monto ?? 0,
   })

   function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
      setForm((p) => ({ ...p, [k]: v }))
   }

   function setCuenta(nombre: string) {
      const c = cuentas.find((c) => c.nombre === nombre)
      setForm((p) => ({ ...p, cuenta: nombre, cuentaId: c?.id ?? 0 }))
   }

   function handleSave() {
      if (!form.descripcion || !form.categoria || !form.cuenta || form.monto <= 0) return
      onSave(form)
      onClose()
   }

   return (
      <AnimatePresence>
         {open && (
            <>
               {/* Overlay */}
               <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-40 bg-black/30"
                  onClick={onClose}
               />
               {/* Sheet */}
               <motion.div
                  initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-background shadow-xl"
               >
                  {/* Header */}
                  <div className="flex items-center justify-between border-b px-5 py-4">
                     <div>
                        <h2 className="font-semibold">{editData ? "Editar movimiento" : "Nuevo movimiento"}</h2>
                        <p className="text-xs text-muted-foreground">Completa los campos</p>
                     </div>
                     <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
                        <X className="size-4" />
                     </button>
                  </div>

                  {/* Body */}
                  <div className="flex flex-col gap-4 overflow-y-auto p-5 flex-1">
                     {/* Tipo toggle */}
                     <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Tipo</label>
                        <div className="grid grid-cols-2 gap-2">
                           {(["Gasto", "Ingreso"] as Tipo[]).map((t) => (
                              <button
                                 key={t}
                                 onClick={() => set("tipo", t)}
                                 className={cn(
                                    "rounded-lg border py-2 text-sm font-medium transition-colors",
                                    form.tipo === t
                                       ? t === "Ingreso"
                                          ? "bg-green-600 border-green-600 text-white"
                                          : "bg-red-500 border-red-500 text-white"
                                       : "hover:bg-muted"
                                 )}
                              >{t}</button>
                           ))}
                        </div>
                     </div>

                     {/* Descripción */}
                     <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Descripción</label>
                        <input
                           value={form.descripcion}
                           onChange={(e) => set("descripcion", e.target.value)}
                           placeholder="Ej. Comida rápida"
                           className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />
                     </div>

                     {/* Monto */}
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

                     {/* Fecha */}
                     <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Fecha</label>
                        <input
                           type="date" value={form.fecha}
                           onChange={(e) => set("fecha", e.target.value)}
                           className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />
                     </div>

                     {/* Categoría */}
                     <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Categoría</label>
                        <Select value={form.categoria} onChange={(v) => set("categoria", v)} options={CATEGORIAS} placeholder="Seleccionar..." />
                     </div>

                     {/* Cuenta */}
                     <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Cuenta</label>
                        <Select value={form.cuenta} onChange={setCuenta} options={cuentas.map((c) => c.nombre)} placeholder="Seleccionar..." />
                     </div>
                  </div>

                  {/* Footer */}
                  <div className="border-t p-5">
                     <button
                        onClick={handleSave}
                        className="w-full rounded-lg bg-foreground py-2.5 text-sm font-medium text-background hover:opacity-90 transition-opacity"
                     >
                        {editData ? "Guardar cambios" : "Agregar movimiento"}
                     </button>
                  </div>
               </motion.div>
            </>
         )}
      </AnimatePresence>
   )
}

// ── Página ─────────────────────────────────────────────────────────────────
export default function MovimientosPage() {
   const [movimientos, setMovimientos] = useState<Movimiento[]>([])
   const [cuentas, setCuentas] = useState<CuentaSimple[]>([])
   const [loading, setLoading] = useState(true)
   const [sheetOpen, setSheetOpen] = useState(false)
   const [editando, setEditando] = useState<Movimiento | undefined>()
   const [deletingId, setDeletingId] = useState<number | null>(null)

   // Filtros
   const [busqueda, setBusqueda] = useState("")
   const [filtroTipo, setFiltroTipo] = useState("")
   const [filtroCuenta, setFiltroCuenta] = useState("")
   const [filtroCategoria, setFiltroCategoria] = useState("")

   async function load() {
      const [mRes, cRes] = await Promise.all([
         fetch("/api/movimientos"),
         fetch("/api/cuentas"),
      ])
      if (!mRes.ok || !cRes.ok) { setLoading(false); return }

      const mData: { id: number; fecha: string; descripcion: string; categoria: string; cuentaId: number; tipo: string; monto: number; cuenta: { nombre: string } }[] = await mRes.json()
      const cData: { id: number; nombre: string }[] = await cRes.json()

      setMovimientos(mData.map((m) => ({
         id: m.id,
         fecha: m.fecha.slice(0, 10),
         descripcion: m.descripcion,
         categoria: m.categoria,
         cuenta: m.cuenta?.nombre ?? "",
         cuentaId: m.cuentaId,
         tipo: m.tipo as Tipo,
         monto: Number(m.monto),
      })))

      setCuentas(cData.map((c) => ({ id: c.id, nombre: c.nombre })))
      setLoading(false)
   }

   useEffect(() => { load() }, [])

   const filtrados = movimientos.filter((m) => {
      if (busqueda && !m.descripcion.toLowerCase().includes(busqueda.toLowerCase())) return false
      if (filtroTipo && m.tipo !== filtroTipo) return false
      if (filtroCuenta && m.cuenta !== filtroCuenta) return false
      if (filtroCategoria && m.categoria !== filtroCategoria) return false
      return true
   }).sort((a, b) => b.fecha.localeCompare(a.fecha))

   const ingresos = movimientos.filter((m) => m.tipo === "Ingreso").reduce((s, m) => s + m.monto, 0)
   const gastos = movimientos.filter((m) => m.tipo === "Gasto").reduce((s, m) => s + m.monto, 0)
   const balance = ingresos - gastos

   async function handleSave(data: Omit<Movimiento, "id">) {
      const body = {
         fecha: data.fecha,
         descripcion: data.descripcion,
         categoria: data.categoria,
         cuentaId: data.cuentaId,
         tipo: data.tipo,
         monto: data.monto,
      }
      if (editando) {
         await fetch(`/api/movimientos/${editando.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
         })
         setEditando(undefined)
      } else {
         await fetch("/api/movimientos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
         })
      }
      await load()
   }

   function handleEdit(m: Movimiento) {
      setEditando(m)
      setSheetOpen(true)
   }

   async function handleDelete(id: number) {
      await fetch(`/api/movimientos/${id}`, { method: "DELETE" })
      setDeletingId(null)
      await load()
   }

   const hayFiltros = busqueda || filtroTipo || filtroCuenta || filtroCategoria
   const nombresCuentas = cuentas.map((c) => c.nombre)

   if (loading) return (
      <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
         Cargando…
      </div>
   )


   return (
      <>
         <div className="flex flex-col gap-6 p-6">
            <div className="flex items-start justify-between gap-4">
               <div>
                  <h1 className="text-3xl font-bold">Movimientos</h1>
                  <p className="text-sm text-muted-foreground mt-1">Gestiona tus ingresos y gastos</p>
               </div>
               <button
                  onClick={() => { setEditando(undefined); setSheetOpen(true) }}
                  className="flex shrink-0 items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 transition-opacity"
               >
                  <Plus className="size-4" /> Nuevo Movimiento
               </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
               <div className="rounded-xl border bg-card p-5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                     <span className="text-sm text-muted-foreground">Total Ingresos</span>
                     <TrendingUp className="size-4 text-green-500" />
                  </div>
                  <span className="text-2xl font-bold text-green-600">${formatMonto(ingresos)}</span>
               </div>
               <div className="rounded-xl border bg-card p-5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                     <span className="text-sm text-muted-foreground">Total Gastos</span>
                     <TrendingDown className="size-4 text-red-500" />
                  </div>
                  <span className="text-2xl font-bold text-red-500">${formatMonto(gastos)}</span>
               </div>
               <div className="rounded-xl border bg-card p-5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                     <span className="text-sm text-muted-foreground">Saldo</span>
                     <Scale className="size-4 text-muted-foreground" />
                  </div>
                  <span className={cn("text-2xl font-bold", balance >= 0 ? "text-green-600" : "text-red-500")}>
                     {balance < 0 ? "-" : ""}${formatMonto(Math.abs(balance))}
                  </span>
               </div>
            </div>

            <div className="rounded-xl border bg-card p-5">
               <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-sm">Filtros</h2>
                  {hayFiltros && (
                     <button
                        onClick={() => { setBusqueda(""); setFiltroTipo(""); setFiltroCuenta(""); setFiltroCategoria("") }}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                     >
                        Limpiar filtros
                     </button>
                  )}
               </div>
               <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                     <input
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar..."
                        className="w-full rounded-lg border bg-background py-2 pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                     />
                  </div>
                  <Select value={filtroTipo} onChange={setFiltroTipo} options={["Ingreso", "Gasto"]} placeholder="Tipo: Todos" />
                  <Select value={filtroCuenta} onChange={setFiltroCuenta} options={nombresCuentas} placeholder="Cuenta: Todas" />
                  <Select value={filtroCategoria} onChange={setFiltroCategoria} options={CATEGORIAS} placeholder="Categoría: Todas" />
               </div>
            </div>

            <div className="rounded-xl border bg-card shadow-sm">
               <div className="flex items-center justify-between px-6 py-4 border-b">
                  <div>
                     <h2 className="font-semibold text-sm">Historial</h2>
                     <p className="text-xs text-muted-foreground mt-0.5">{filtrados.length} movimiento(s)</p>
                  </div>
               </div>

               {filtrados.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                     <Scale className="size-8 mb-2 opacity-30" />
                     <p className="text-sm">Sin movimientos{hayFiltros ? " con esos filtros" : ""}</p>
                  </div>
               ) : (
                  <div className="overflow-x-auto">
                     <table className="w-full text-sm">
                        <thead>
                           <tr className="border-b text-muted-foreground text-xs">
                              <th className="px-6 py-3 text-left font-medium">Fecha</th>
                              <th className="px-6 py-3 text-left font-medium">Descripción</th>
                              <th className="px-6 py-3 text-left font-medium">Categoría</th>
                              <th className="px-6 py-3 text-left font-medium">Cuenta</th>
                              <th className="px-6 py-3 text-left font-medium">Tipo</th>
                              <th className="px-6 py-3 text-right font-medium">Monto</th>
                              <th className="px-6 py-3 text-right font-medium">Acciones</th>
                           </tr>
                        </thead>
                        <tbody>
                           <AnimatePresence initial={false}>
                              {filtrados.map((m) => {
                                 const Icon = catIcon[m.categoria] ?? MoreHorizontal
                                 const esIngreso = m.tipo === "Ingreso"
                                 return (
                                    <motion.tr
                                       key={m.id}
                                       initial={{ opacity: 0, y: -6 }}
                                       animate={{ opacity: 1, y: 0 }}
                                       exit={{ opacity: 0, x: 20 }}
                                       transition={{ duration: 0.15 }}
                                       className="border-b last:border-0 hover:bg-muted/40 transition-colors"
                                    >
                                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{formatFecha(m.fecha)}</td>
                                       <td className="px-6 py-4 font-medium">{m.descripcion}</td>
                                       <td className="px-6 py-4">
                                          <span className="flex items-center gap-1.5 text-muted-foreground">
                                             <Icon className="size-3.5 shrink-0" />
                                             {m.categoria}
                                          </span>
                                       </td>
                                       <td className="px-6 py-4 text-muted-foreground">{m.cuenta}</td>
                                       <td className="px-6 py-4">
                                          <span className={cn(
                                             "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                                             esIngreso ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                                          )}>
                                             {esIngreso ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                                             {m.tipo}
                                          </span>
                                       </td>
                                       <td className={cn("px-6 py-4 text-right font-semibold", esIngreso ? "text-green-600" : "text-red-500")}>
                                          {esIngreso ? "+" : "-"}${formatMonto(m.monto)}
                                       </td>
                                       <td className="px-6 py-4">
                                          <div className="flex items-center justify-end gap-1">
                                             {deletingId === m.id ? (
                                                <>
                                                   <button onClick={() => handleDelete(m.id)} className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 transition-colors font-medium">Confirmar</button>
                                                   <button onClick={() => setDeletingId(null)} className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors">Cancelar</button>
                                                </>
                                             ) : (
                                                <>
                                                   <button onClick={() => handleEdit(m)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors">
                                                      <Pencil className="size-3.5" />
                                                   </button>
                                                   <button onClick={() => setDeletingId(m.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors">
                                                      <Trash2 className="size-3.5" />
                                                   </button>
                                                </>
                                             )}
                                          </div>
                                       </td>
                                    </motion.tr>
                                 )
                              })}
                           </AnimatePresence>
                        </tbody>
                     </table>
                  </div>
               )}
            </div>
         </div>

         <MovimientoSheet
            open={sheetOpen}
            onClose={() => { setSheetOpen(false); setEditando(undefined) }}
            onSave={handleSave}
            editData={editando}
            cuentas={cuentas}
         />
      </>
   )
}
