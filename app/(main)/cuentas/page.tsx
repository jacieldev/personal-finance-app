"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
   Plus, X, ChevronDown, Settings, Wallet, CreditCard,
   Landmark, PiggyBank, TrendingDown, TrendingUp, ArrowUpRight, ArrowDownLeft, Pencil, Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ── Tipos ──────────────────────────────────────────────────────────────────
type TipoCuenta = "Efectivo" | "Débito" | "Crédito" | "Ahorro" | "Inversión"

interface Cuenta {
   id: number
   nombre: string
   tipo: TipoCuenta
   balanceInicial: number
   color: string   // clase Tailwind para el fondo del ícono
}

interface Movimiento {
   id: number
   cuentaId: number
   descripcion: string
   fecha: string
   monto: number      // negativo = gasto, positivo = ingreso
}

// ── Color map: CSS class ↔ hex ─────────────────────────────────────────────
const COLOR_MAP: { label: string; css: string; hex: string }[] = [
   { label: "Gris",    css: "bg-slate-100 text-slate-600",  hex: "#94a3b8" },
   { label: "Azul",    css: "bg-blue-50 text-blue-600",     hex: "#2563eb" },
   { label: "Naranja", css: "bg-orange-50 text-orange-600", hex: "#ea580c" },
   { label: "Verde",   css: "bg-green-50 text-green-600",   hex: "#16a34a" },
   { label: "Morado",  css: "bg-purple-50 text-purple-600", hex: "#9333ea" },
   { label: "Rosa",    css: "bg-pink-50 text-pink-600",     hex: "#db2777" },
]

function hexToCss(hex: string): string {
   return COLOR_MAP.find((c) => c.hex === hex)?.css ?? COLOR_MAP[0].css
}

function cssToHex(css: string): string {
   return COLOR_MAP.find((c) => c.css === css)?.hex ?? COLOR_MAP[0].hex
}

const TIPOS: TipoCuenta[] = ["Efectivo", "Débito", "Crédito", "Ahorro", "Inversión"]

const tipoIcon: Record<TipoCuenta, React.ElementType> = {
   Efectivo:  Wallet,
   Débito:    CreditCard,
   Crédito:   CreditCard,
   Ahorro:    PiggyBank,
   Inversión: Landmark,
}

// ── Helpers ────────────────────────────────────────────────────────────────
function formatMonto(n: number, signo = false) {
   const abs = Math.abs(n).toLocaleString("es-MX", { minimumFractionDigits: 2 })
   if (!signo) return `$${abs}`
   return n >= 0 ? `+$${abs}` : `-$${abs}`
}
function formatFecha(iso: string) {
   return new Date(iso + "T12:00:00").toLocaleDateString("es-MX", {
      weekday: "short", day: "numeric", month: "short", year: "numeric",
   })
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

// ── Sheet nueva cuenta ─────────────────────────────────────────────────────
function CuentaSheet({ open, onClose, onSave, editData }: {
   open: boolean; onClose: () => void
   onSave: (c: Omit<Cuenta, "id">) => void
   editData?: Cuenta
}) {
   const [form, setForm] = useState({
      nombre:          editData?.nombre ?? "",
      tipo:            editData?.tipo ?? "" as TipoCuenta | "",
      balanceInicial:  editData?.balanceInicial ?? 0,
      color:           editData?.color ?? "bg-slate-100 text-slate-600",
   })

   function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
      setForm((p) => ({ ...p, [k]: v }))
   }

   function handleSave() {
      if (!form.nombre || !form.tipo) return
      onSave({ ...form, tipo: form.tipo as TipoCuenta })
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
                        <h2 className="font-semibold">{editData ? "Editar cuenta" : "Nueva cuenta"}</h2>
                        <p className="text-xs text-muted-foreground">Efectivo, banco, tarjeta…</p>
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
                           placeholder="Ej. Efectivo"
                           className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />
                     </div>
                     <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Tipo</label>
                        <Select value={form.tipo} onChange={(v) => set("tipo", v)} options={TIPOS} placeholder="Seleccionar..." />
                     </div>
                     <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Saldo inicial</label>
                        <div className="relative">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                           <input
                              type="number"
                              value={form.balanceInicial || ""}
                              onChange={(e) => set("balanceInicial", parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="w-full rounded-lg border bg-background py-2 pl-7 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                           />
                        </div>
                     </div>
                     <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Color</label>
                        <div className="flex flex-wrap gap-2">
                           {COLOR_MAP.map((c) => (
                              <button
                                 key={c.css}
                                 onClick={() => set("color", c.css)}
                                 className={cn(
                                    "rounded-lg px-3 py-1.5 text-xs font-medium border transition-all",
                                    c.css,
                                    form.color === c.css ? "ring-2 ring-foreground ring-offset-1" : ""
                                 )}
                              >
                                 {c.label}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="border-t p-5">
                     <button
                        onClick={handleSave}
                        className="w-full rounded-lg bg-foreground py-2.5 text-sm font-medium text-background hover:opacity-90 transition-opacity"
                     >
                        {editData ? "Guardar cambios" : "Agregar cuenta"}
                     </button>
                  </div>
               </motion.div>
            </>
         )}
      </AnimatePresence>
   )
}

// ── Card de cuenta ─────────────────────────────────────────────────────────
function CuentaCard({ cuenta, movimientos, onEdit, onDelete }: {
   cuenta: Cuenta
   movimientos: Movimiento[]
   onEdit: () => void
   onDelete: () => void
}) {
   const [confirmDelete, setConfirmDelete] = useState(false)
   const Icon = tipoIcon[cuenta.tipo]

   const variacion = movimientos.reduce((s, m) => s + m.monto, 0)
   const balance   = cuenta.balanceInicial + variacion

   const recientes = [...movimientos]
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
      .slice(0, 3)

   const ingresos = movimientos.filter((m) => m.monto > 0).reduce((s, m) => s + m.monto, 0)
   const gastos   = movimientos.filter((m) => m.monto < 0).reduce((s, m) => s + Math.abs(m.monto), 0)

   return (
      <motion.div
         layout
         initial={{ opacity: 0, y: 8 }}
         animate={{ opacity: 1, y: 0 }}
         exit={{ opacity: 0, x: 20 }}
         transition={{ duration: 0.18 }}
         className="rounded-xl border bg-card shadow-sm flex flex-col"
      >
         {/* Header */}
         <div className="flex items-center justify-between p-5 pb-3">
            <div className="flex items-center gap-3">
               <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", cuenta.color)}>
                  <Icon className="size-4" />
               </div>
               <div>
                  <p className="font-semibold text-sm">{cuenta.nombre}</p>
                  <p className="text-xs text-muted-foreground">{cuenta.tipo}</p>
               </div>
            </div>
            <div className="flex items-center gap-1">
               <button onClick={onEdit} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors">
                  <Settings className="size-3.5" />
               </button>
               {confirmDelete ? (
                  <>
                     <button onClick={onDelete} className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 transition-colors font-medium">Eliminar</button>
                     <button onClick={() => setConfirmDelete(false)} className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors">Cancelar</button>
                  </>
               ) : (
                  <button onClick={() => setConfirmDelete(true)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors">
                     <Trash2 className="size-3.5" />
                  </button>
               )}
            </div>
         </div>

         <div className="px-5 pb-4">
            {/* Saldo actual */}
               <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Saldo actual</p>
               <p className={cn("text-2xl font-bold", balance < 0 ? "text-red-500" : "")}>
                  {balance < 0 ? "-" : ""}${Math.abs(balance).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
               </p>
            </div>

            {/* Balance inicial + variación */}
            <div className="flex gap-4 mb-4">
               <div>
                  <p className="text-xs text-muted-foreground">Saldo inicial</p>
                  <p className="text-sm font-medium">${cuenta.balanceInicial.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
               </div>
               <div>
                  <p className="text-xs text-muted-foreground">Variación</p>
                  <p className={cn("text-sm font-medium flex items-center gap-0.5", variacion >= 0 ? "text-green-600" : "text-red-500")}>
                     {variacion >= 0
                        ? <TrendingUp className="size-3.5" />
                        : <TrendingDown className="size-3.5" />
                     }
                     ${Math.abs(variacion).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </p>
               </div>
            </div>

            {/* Mini stats ingresos/gastos */}
            {(ingresos > 0 || gastos > 0) && (
               <div className="flex gap-2 mb-4">
                  {ingresos > 0 && (
                     <div className="flex items-center gap-1.5 rounded-lg bg-green-50 px-2.5 py-1.5 flex-1">
                        <ArrowUpRight className="size-3.5 text-green-600 shrink-0" />
                        <div>
                           <p className="text-[10px] text-green-700">Ingresos</p>
                           <p className="text-xs font-semibold text-green-700">${ingresos.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
                        </div>
                     </div>
                  )}
                  {gastos > 0 && (
                     <div className="flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 flex-1">
                        <ArrowDownLeft className="size-3.5 text-red-500 shrink-0" />
                        <div>
                           <p className="text-[10px] text-red-600">Gastos</p>
                           <p className="text-xs font-semibold text-red-500">${gastos.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
                        </div>
                     </div>
                  )}
               </div>
            )}

            {/* Divider */}
            {recientes.length > 0 && <div className="h-px bg-border mb-3" />}

            {/* Movimientos recientes */}
            {recientes.length > 0 && (
               <div className="flex flex-col gap-0.5">
                  <p className="text-xs font-medium mb-2">Movimientos Recientes</p>
                  {recientes.map((m) => (
                     <div key={m.id} className="flex items-center justify-between py-1.5">
                        <div>
                           <p className="text-sm font-medium leading-tight">{m.descripcion}</p>
                           <p className="text-xs text-muted-foreground">{formatFecha(m.fecha)}</p>
                        </div>
                        <span className={cn(
                           "text-xs font-semibold rounded-full px-2.5 py-1",
                           m.monto < 0 ? "bg-muted text-foreground" : "bg-green-50 text-green-700"
                        )}>
                           {formatMonto(m.monto, true)}
                        </span>
                     </div>
                  ))}
               </div>
            )}

            {recientes.length === 0 && (
               <p className="text-xs text-muted-foreground text-center py-2">Sin movimientos aún</p>
            )}
         </div>
      </motion.div>
   )
}

// ── Página ─────────────────────────────────────────────────────────────────
export default function CuentasPage() {
   const [cuentas, setCuentas]     = useState<Cuenta[]>([])
   const [movimientos, setMovimientos] = useState<Movimiento[]>([])
   const [loading, setLoading]     = useState(true)
   const [sheetOpen, setSheetOpen] = useState(false)
   const [editando, setEditando]   = useState<Cuenta | undefined>()

   async function load() {
      const [cRes, mRes] = await Promise.all([
         fetch("/api/cuentas"),
         fetch("/api/movimientos"),
      ])
      if (!cRes.ok || !mRes.ok) { setLoading(false); return }

      const cData: { id: number; nombre: string; tipo: string; saldoInicial: number; color: string }[] = await cRes.json()
      const mData: { id: number; cuentaId: number; descripcion: string; fecha: string; monto: number; tipo: string }[] = await mRes.json()

      setCuentas(cData.map((c) => ({
         id: c.id,
         nombre: c.nombre,
         tipo: c.tipo as TipoCuenta,
         balanceInicial: Number(c.saldoInicial),
         color: hexToCss(c.color),
      })))

      setMovimientos(mData.map((m) => ({
         id: m.id,
         cuentaId: m.cuentaId,
         descripcion: m.descripcion,
         fecha: m.fecha.slice(0, 10),
         monto: m.tipo === "Ingreso" ? Number(m.monto) : -Number(m.monto),
      })))

      setLoading(false)
   }

   useEffect(() => { load() }, [])

   const balanceTotal = cuentas.reduce((sum, c) => {
      const var_ = movimientos.filter((m) => m.cuentaId === c.id).reduce((s, m) => s + m.monto, 0)
      return sum + c.balanceInicial + var_
   }, 0)

   async function handleSave(data: Omit<Cuenta, "id">) {
      if (editando) {
         await fetch(`/api/cuentas/${editando.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               nombre: data.nombre,
               tipo: data.tipo,
               saldoInicial: data.balanceInicial,
               color: cssToHex(data.color),
            }),
         })
         setEditando(undefined)
      } else {
         await fetch("/api/cuentas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               nombre: data.nombre,
               tipo: data.tipo,
               saldoInicial: data.balanceInicial,
               color: cssToHex(data.color),
            }),
         })
      }
      await load()
   }

   async function eliminar(id: number) {
      await fetch(`/api/cuentas/${id}`, { method: "DELETE" })
      await load()
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
                  <h1 className="text-3xl font-bold">Cuentas</h1>
                  <p className="text-sm text-muted-foreground mt-1">Gestiona tus cuentas y tarjetas</p>
               </div>
               <button
                  onClick={() => { setEditando(undefined); setSheetOpen(true) }}
                  className="flex shrink-0 items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 transition-opacity"
               >
                  <Plus className="size-4" /> Nueva Cuenta
               </button>
            </div>

            {/* Balance total */}
            <div className="rounded-xl border bg-card p-6">
               <p className="text-sm font-medium text-muted-foreground">Saldo Total</p>
               <p className="text-xs text-muted-foreground mb-3">Suma de todas tus cuentas</p>
               <p className={cn("text-4xl font-bold", balanceTotal < 0 ? "text-red-500" : "text-green-600")}>
                  {balanceTotal < 0 ? "-" : ""}${Math.abs(balanceTotal).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
               </p>
            </div>

            {/* Grid de cuentas */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
               <AnimatePresence>
                  {cuentas.map((c) => (
                     <CuentaCard
                        key={c.id}
                        cuenta={c}
                        movimientos={movimientos.filter((m) => m.cuentaId === c.id)}
                        onEdit={() => { setEditando(c); setSheetOpen(true) }}
                        onDelete={() => eliminar(c.id)}
                     />
                  ))}
               </AnimatePresence>
            </div>
         </div>

         <CuentaSheet
            open={sheetOpen}
            onClose={() => { setSheetOpen(false); setEditando(undefined) }}
            onSave={handleSave}
            editData={editando}
         />
      </>
   )
}

