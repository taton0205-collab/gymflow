"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, X, Loader2, Package, Tag, Hash, DollarSign } from "lucide-react";

export function AddItemForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Suplementos");
  const [stock, setStock] = useState("");
  const [minStock, setMinStock] = useState("5");
  const [price, setPrice] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    try {
      // 1. Buscamos el ID del gimnasio SECUTOR
      let { data: gyms } = await supabase.from("gyms").select("id").limit(1);

      // Si por alguna razón no hay gimnasios, usamos el ID universal que creamos en SQL
      const gymId = gyms?.[0]?.id || '00000000-0000-0000-0000-000000000000';

      // 2. Insertar el producto
      const { error } = await supabase
        .from("inventory_items")
        .insert([
          {
            gym_id: gymId,
            name: name,
            category: category,
            stock: parseInt(stock) || 0,
            minimum_stock: parseInt(minStock) || 0,
            sale_price: parseFloat(price) || 0,
            active: true
          }
        ]);

      if (error) {
        // Si sale el error de RLS, avisamos específicamente
        if (error.message.includes("row-level security")) {
          throw new Error("La base de datos sigue bloqueada. Asegúrate de correr el código SQL en Supabase.");
        }
        throw error;
      }

      alert("¡Producto registrado con éxito!");
      setIsOpen(false);
      setName(""); setStock(""); setPrice("");

      // Forzar recarga de la lista
      window.location.reload();

    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="h-16 px-10 font-black uppercase italic tracking-widest text-lg shadow-xl shadow-primary/10">
        <Plus className="mr-2 h-6 w-6" /> AGREGAR PRODUCTO
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-[2.5rem] border border-primary/20 bg-background p-8 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-primary">Nuevo Insumo</h2>
              <button onClick={() => setIsOpen(false)} className="rounded-full p-2 hover:bg-muted transition-colors"><X className="h-6 w-6" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Nombre del Producto</label>
                  <input required value={name} onChange={(e) => setName(e.target.value)} className="h-14 w-full rounded-2xl border-2 border-white/5 bg-white/[0.03] px-6 font-bold outline-none focus:border-primary/50 text-white" placeholder="Ej: Proteína Whey" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Categoría</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-14 w-full rounded-2xl border-2 border-white/5 bg-white/[0.03] px-4 font-bold outline-none text-white uppercase text-xs">
                      <option className="bg-background">Suplementos</option>
                      <option className="bg-background">Bebidas</option>
                      <option className="bg-background">Indumentaria</option>
                      <option className="bg-background">Accesorios</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Precio Venta</label>
                    <input required type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="h-14 w-full rounded-2xl border-2 border-white/5 bg-white/[0.03] px-4 font-bold outline-none focus:border-primary/50 text-white" placeholder="0.00" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Stock</label>
                    <input required type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="h-14 w-full rounded-2xl border-2 border-white/5 bg-white/[0.03] px-4 font-bold outline-none text-white" placeholder="Cant." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Mínimo</label>
                    <input required type="number" value={minStock} onChange={(e) => setMinStock(e.target.value)} className="h-14 w-full rounded-2xl border-2 border-white/5 bg-white/[0.03] px-4 font-bold outline-none text-white" />
                  </div>
                </div>
              </div>

              <Button type="submit" className="h-16 w-full text-lg font-black uppercase tracking-widest shadow-2xl skew-x-[-5deg]" disabled={loading}>
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "REGISTRAR EN ARENA"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
