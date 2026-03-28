"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Tipos ──────────────────────────────────────────────────────────────────
interface Item {
   id: number
   nombre: string
   icono?: string
}

// ── Datos iniciales ────────────────────────────────────────────────────────
const CAT_INICIALES: Item[] = [
   { id: 1,  nombre: "Alimentación"    },
   { id: 2,  nombre: "Transporte"      },
   { id: 3,  nombre: "Compras"         },
   { id: 4,  nombre: "Servicios"       },
   { id: 5,  nombre: "Entretenimiento" },
   { id: 6,  nombre: "Salud"           },
   { id: 7,  nombre: "Ingreso"         },
   { id: 8,  nombre: "Otro"            },
]

const CUENTAS_INICIALES: Item[] = [
   { id: 1, nombre: "Efectivo" },
   { id: 2, nombre: "Débito"   },
   { id: 3, nombre: "Crédito"  },
   { id: 4, nombre: "Ahorro"   },
]

const TIPOS_OBL_INICIALES: Item[] = [
   { id: 1, nombre: "Suscripcion" },
   { id: 2, nombre: "Credito"     },
   { id: 3, nombre: "Prestamo"    },
   { id: 4, nombre: "Servicio"    },
   { id: 5, nombre: "Renta"       },
   { id: 6, nombre: "Otro"        },
]

let nextId = 100

// ── Lista editable ─────────────────────────────────────────────────────────
function ListaEditable({
   titulo, descripcion, items, onAdd, onEdit, onDelete,
}: {
   titulo: string
   descripcion: string
   items: Item[]
   onAdd: (nombre: string) => void
   onEdit: (id: number, nombre: string) => void
   onDelete: (id: number) => void
}) {
   const [nuevo, setNuevo]           = useState("")
   const [editandoId, setEditandoId] = useState<number | null>(null)
   const [editVal, setEditVal]       = useState("")
   const [confirmId, setConfirmId]   = useState<number | null>(null)

   function handleAdd() {
      const trim = nuevo.trim()
      if (!trim) return
      onAdd(trim)
      setNuevo("")
   }

   function startEdit(item: Item) {
      setEditandoId(item.id)
      setEditVal(item.nombre)
      setConfirmId(null)
   }

   function saveEdit(id: number) {
      const trim = editVal.trim()
      if (trim) onEdit(id, trim)
      setEditandoId(null)
   }

   return (
      <div className="rounded-xl border bg-card shadow-sm">
         <div className="px-5 py-4 border-b">
            <h2 className="font-semibold text-sm">{titulo}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{descripcion}</p>
         </div>

         <div className="divide-y">
            {items.map((item) => (
               <div key={item.id} className="flex items-center justify-between px-5 py-3">
                  {editandoId === item.id ? (
                     <input
                        autoFocus
                        value={editVal}
                        onChange={(e) => setEditVal(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") saveEdit(item.id); if (e.key === "Escape") setEditandoId(null) }}
                        className="flex-1 rounded-lg border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring mr-2"
                     />
                  ) : (
                     <span className="text-sm">{item.nombre}</span>
                  )}

                  <div className="flex items-center gap-1 shrink-0">
                     {editandoId === item.id ? (
                        <>
                           <button onClick={() => saveEdit(item.id)} className="rounded-lg p-1.5 text-green-600 hover:bg-green-50 transition-colors">
                              <Check className="size-3.5" />
                           </button>
                           <button onClick={() => setEditandoId(null)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors">
                              <X className="size-3.5" />
                           </button>
                        </>
                     ) : confirmId === item.id ? (
                        <>
                           <button onClick={() => { onDelete(item.id); setConfirmId(null) }} className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 transition-colors font-medium">
                              Eliminar
                           </button>
                           <button onClick={() => setConfirmId(null)} className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors">
                              Cancelar
                           </button>
                        </>
                     ) : (
                        <>
                           <button onClick={() => startEdit(item)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors">
                              <Pencil className="size-3.5" />
                           </button>
                           <button onClick={() => setConfirmId(item.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors">
                              <Trash2 className="size-3.5" />
                           </button>
                        </>
                     )}
                  </div>
               </div>
            ))}
         </div>

         {/* Agregar nuevo */}
         <div className="flex items-center gap-2 px-5 py-3 border-t">
            <input
               value={nuevo}
               onChange={(e) => setNuevo(e.target.value)}
               onKeyDown={(e) => e.key === "Enter" && handleAdd()}
               placeholder={`Nueva ${titulo.toLowerCase().slice(0, -1)}…`}
               className="flex-1 rounded-lg border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button
               onClick={handleAdd}
               disabled={!nuevo.trim()}
               className="flex items-center gap-1 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90 transition-opacity disabled:opacity-40"
            >
               <Plus className="size-3.5" /> Agregar
            </button>
         </div>
      </div>
   )
}

// ── Perfil ─────────────────────────────────────────────────────────────────
function Perfil() {
   const [email, setEmail]   = useState("jaciel@gmail.com")
   const [nombre, setNombre] = useState("Jaciel")
   const [saved, setSaved]   = useState(false)

   function handleSave() {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
   }

   return (
      <div className="rounded-xl border bg-card shadow-sm">
         <div className="px-5 py-4 border-b">
            <h2 className="font-semibold text-sm">Perfil</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Información de tu cuenta</p>
         </div>
         <div className="flex flex-col gap-4 p-5">
            <div>
               <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Nombre</label>
               <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
               />
            </div>
            <div>
               <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Correo electrónico</label>
               <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
               />
            </div>
            <button
               onClick={handleSave}
               className={cn(
                  "w-full rounded-lg py-2.5 text-sm font-medium transition-all",
                  saved
                     ? "bg-green-600 text-white"
                     : "bg-foreground text-background hover:opacity-90"
               )}
            >
               {saved ? "✓ Guardado" : "Guardar cambios"}
            </button>
         </div>
      </div>
   )
}

// ── Página ─────────────────────────────────────────────────────────────────
export default function AjustesPage() {
   const [categorias, setCategorias]   = useState<Item[]>(CAT_INICIALES)
   const [cuentas, setCuentas]         = useState<Item[]>(CUENTAS_INICIALES)
   const [tiposObl, setTiposObl]       = useState<Item[]>(TIPOS_OBL_INICIALES)

   function addItem(lista: Item[], set: (v: Item[]) => void, nombre: string) {
      set([...lista, { id: nextId++, nombre }])
   }
   function editItem(lista: Item[], set: (v: Item[]) => void, id: number, nombre: string) {
      set(lista.map((i) => i.id === id ? { ...i, nombre } : i))
   }
   function deleteItem(lista: Item[], set: (v: Item[]) => void, id: number) {
      set(lista.filter((i) => i.id !== id))
   }

   return (
      <div className="flex flex-col gap-6 p-6">
         <div>
            <h1 className="text-3xl font-bold">Ajustes</h1>
            <p className="text-sm text-muted-foreground mt-1">Personaliza la aplicación</p>
         </div>

         <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Perfil */}
            <Perfil />

            {/* Categorías de movimientos */}
            <ListaEditable
               titulo="Categorías"
               descripcion="Categorías para tus movimientos"
               items={categorias}
               onAdd={(n) => addItem(categorias, setCategorias, n)}
               onEdit={(id, n) => editItem(categorias, setCategorias, id, n)}
               onDelete={(id) => deleteItem(categorias, setCategorias, id)}
            />

            {/* Tipos de cuenta */}
            <ListaEditable
               titulo="Tipos de cuenta"
               descripcion="Tipos disponibles al crear una cuenta"
               items={cuentas}
               onAdd={(n) => addItem(cuentas, setCuentas, n)}
               onEdit={(id, n) => editItem(cuentas, setCuentas, id, n)}
               onDelete={(id) => deleteItem(cuentas, setCuentas, id)}
            />

            {/* Tipos de obligación */}
            <ListaEditable
               titulo="Tipos de obligación"
               descripcion="Categorías para tus obligaciones y pagos fijos"
               items={tiposObl}
               onAdd={(n) => addItem(tiposObl, setTiposObl, n)}
               onEdit={(id, n) => editItem(tiposObl, setTiposObl, id, n)}
               onDelete={(id) => deleteItem(tiposObl, setTiposObl, id)}
            />
         </div>
      </div>
   )
}

