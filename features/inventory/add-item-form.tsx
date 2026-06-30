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
      let { data: gyms } = await supabase.from("gyms").select("id").limit(1);
      const gymId = gyms?.[0]?.id;

      const { error } = await supabase.from("inventory_items").insert([{
        gym_id: gymId,
        name,
        category,
        stock: parseInt(stock),
        minimum_stock: parseInt(minStock),
        sale_price: parseFloat(price),
        active: true
      }]);

      if (error) throw error;

      alert("Producto agregado al inventario");
      setIsOpen(false);
      setName(""); setStock(""); setPrice("");
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="h-12 px-6 font-black shadow-lg">
        <Plus className="mr-2 h-5 w-5" /> AGREGAR PRODUCTO
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl border bg-background p-8 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Nuevo Producto</h2>
              <button onClick={() => setIsOpen(false)} className="rounded-full p-2 hover:bg-muted"><X className="h-6 w-6" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Nombre del Producto</label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input required value={name} onChange={(e) => setName(e.target.value)} className="h-12 w-full rounded-xl border bg-muted/20 pl-10 pr-4 font-bold outline-none focus:ring-2 focus:ring-primary/20" placeholder="Ej: Proteína Whey 1kg" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Categoría</label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-12 w-full rounded-xl border bg-muted/20 pl-10 pr-4 font-bold outline-none appearance-none">
                        <option>Suplementos</option>
                        <option>Bebidas</option>
                        <option>Indumentaria</option>
                        <option>Accesorios</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Precio Venta</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input required type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="h-12 w-full rounded-xl border bg-muted/20 pl-10 pr-4 font-bold outline-none" placeholder="0.00" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Stock Inicial</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input required type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="h-12 w-full rounded-xl border bg-muted/20 pl-10 pr-4 font-bold outline-none" placeholder="Cant." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Mínimo Crítico</label>
                    <div className="relative">
                      <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input required type="number" value={minStock} onChange={(e) => setMinStock(e.target.value)} className="h-12 w-full rounded-xl border bg-muted/20 pl-10 pr-4 font-bold outline-none" />
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" className="h-14 w-full text-lg font-black uppercase tracking-widest shadow-xl" disabled={loading}>
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "REGISTRAR PRODUCTO"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function AlertCircle(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  )
}
