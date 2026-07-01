"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, X, Loader2, Package, Tag, Hash, DollarSign, Wallet } from "lucide-react";

export function AddItemForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Suplementos");
  const [stock, setStock] = useState("");
  const [minStock, setMinStock] = useState("5");
  const [costPrice, setCostPrice] = useState(""); // Precio de Compra
  const [salePrice, setSalePrice] = useState(""); // Precio de Venta

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    try {
      let { data: gyms } = await supabase.from("gyms").select("id").limit(1);
      const gymId = gyms?.[0]?.id || '00000000-0000-0000-0000-000000000000';

      const { error } = await supabase.from("inventory_items").insert([{
        gym_id: gymId,
        name,
        category,
        stock: parseInt(stock) || 0,
        minimum_stock: parseInt(minStock) || 0,
        cost: parseFloat(costPrice) || 0,
        sale_price: parseFloat(salePrice) || 0,
        active: true
      }]);

      if (error) throw error;

      alert("¡Producto registrado!");
      setIsOpen(false);
      resetForm();
      window.location.reload();
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName(""); setStock(""); setCostPrice(""); setSalePrice("");
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
              <button onClick={() => setIsOpen(false)} className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"><X className="h-6 w-6" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Nombre</label>
                  <input required value={name} onChange={(e) => setName(e.target.value)} className="h-14 w-full rounded-2xl border-2 border-white/5 bg-white/[0.03] px-6 font-bold outline-none focus:border-primary/50 text-white" placeholder="Ej: Creatina 300g" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Costo (Compra)</label>
                    <input required type="number" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} className="h-14 w-full rounded-2xl border-2 border-white/5 bg-white/[0.03] px-4 font-bold outline-none focus:border-green-500/50 text-white" placeholder="$0.00" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Venta (PVP)</label>
                    <input required type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} className="h-14 w-full rounded-2xl border-2 border-white/5 bg-white/[0.03] px-4 font-bold outline-none focus:border-primary/50 text-white" placeholder="$0.00" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Stock Inicial</label>
                    <input required type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="h-14 w-full rounded-2xl border-2 border-white/5 bg-white/[0.03] px-4 font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Aviso Mínimo</label>
                    <input required type="number" value={minStock} onChange={(e) => setMinStock(e.target.value)} className="h-14 w-full rounded-2xl border-2 border-white/5 bg-white/[0.03] px-4 font-bold outline-none" />
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
