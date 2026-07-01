"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Loader2, Boxes, AlertTriangle, TrendingUp, ShoppingBag, ShoppingCart, Trash2, PiggyBank } from "lucide-react";
import { cn } from "@/lib/utils";

export function InventoryList() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellingId, setSellingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchInventory = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("inventory_items")
      .select("*")
      .order("name", { ascending: true });

    if (!error) setItems(data || []);
    setLoading(false);
  };

  const handleSell = async (item: any) => {
    if (item.stock <= 0) return alert("¡Sin stock disponible!");
    if (!confirm(`¿Confirmar venta de ${item.name} por $${item.sale_price}?`)) return;

    setSellingId(item.id);
    const supabase = createClient();

    try {
      // 1. Registrar el Pago
      await supabase.from("payments").insert([{
        gym_id: item.gym_id,
        amount: item.sale_price,
        paid_amount: item.sale_price,
        method: "cash",
        status: "paid",
        paid_at: new Date().toISOString(),
        notes: `VENTA: ${item.name}`,
        due_date: new Date().toISOString().split('T')[0]
      }]);

      // 2. Descontar stock
      await supabase.from("inventory_items").update({ stock: item.stock - 1 }).eq("id", item.id);

      alert("¡Venta completada!");
      fetchInventory();
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSellingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar permanentemente "${name}"?`)) return;
    setDeletingId(id);
    const supabase = createClient();
    try {
      await supabase.from("inventory_items").delete().eq("id", id);
      setItems(items.filter(item => item.id !== id));
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  const totalValue = items.reduce((acc, i) => acc + (i.sale_price * i.stock), 0);
  const totalProfit = items.reduce((acc, i) => acc + ((i.sale_price - (i.cost || 0)) * i.stock), 0);

  if (loading) return <div className="flex justify-center p-32"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;

  return (
    <div className="grid gap-8">
      {/* Resumen Financiero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard label="Inversión en Stock" value={"$" + new Intl.NumberFormat("es-AR").format(items.reduce((acc, i) => acc + ((i.cost || 0) * i.stock), 0))} icon={Boxes} />
        <SummaryCard label="Venta Proyectada" value={"$" + new Intl.NumberFormat("es-AR").format(totalValue)} icon={TrendingUp} />
        <SummaryCard label="Ganancia Total Neta" value={"$" + new Intl.NumberFormat("es-AR").format(totalProfit)} icon={PiggyBank} tone="profit" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => {
          const isLowStock = item.stock <= item.minimum_stock;
          const unitProfit = item.sale_price - (item.cost || 0);
          const profitMargin = item.sale_price > 0 ? Math.round((unitProfit / item.sale_price) * 100) : 0;

          return (
            <div key={item.id} className={cn(
              "group relative flex flex-col rounded-[2.5rem] border bg-card p-8 shadow-sm transition-all hover:shadow-2xl hover:border-primary/20",
              isLowStock && "border-red-500/20 bg-red-500/[0.02]"
            )}>
              <div className="flex items-start justify-between">
                <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center shadow-inner">
                  <ShoppingBag className={cn("h-7 w-7 text-muted-foreground", isLowStock && "text-red-500")} />
                </div>
                <button onClick={() => handleDelete(item.id, item.name)} className="h-8 w-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-8">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{item.category}</p>
                <h3 className="text-xl font-black italic uppercase truncate text-foreground">{item.name}</h3>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-muted-foreground border-b border-dashed pb-2">
                   <span>Costo: ${new Intl.NumberFormat("es-AR").format(item.cost || 0)}</span>
                   <span>Venta: ${new Intl.NumberFormat("es-AR").format(item.sale_price)}</span>
                </div>

                {/* MOSTRAR GANANCIA */}
                <div className="bg-green-500/10 rounded-xl p-3 border border-green-500/20">
                  <div className="flex justify-between items-center">
                    <p className="text-[9px] font-black text-green-500 uppercase">Ganancia x Unidad</p>
                    <Badge className="bg-green-500 text-white font-black text-[8px] h-4">+{profitMargin}%</Badge>
                  </div>
                  <p className="text-lg font-black text-green-500 italic mt-1">+ ${new Intl.NumberFormat("es-AR").format(unitProfit)}</p>
                </div>

                <div className="flex justify-between items-center px-1">
                  <div>
                    <p className="text-2xl font-black text-foreground italic">{item.stock}</p>
                    <p className="text-[8px] font-bold uppercase opacity-50">Stock Actual</p>
                  </div>
                  {isLowStock && <Badge tone="danger" className="animate-pulse">REPONER</Badge>}
                </div>
              </div>

              <button
                onClick={() => handleSell(item)}
                disabled={sellingId === item.id || item.stock <= 0}
                className={cn(
                  "mt-6 h-14 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95",
                  item.stock > 0 ? "bg-primary text-primary-foreground hover:scale-105" : "bg-muted text-muted-foreground"
                )}
              >
                {sellingId === item.id ? <Loader2 className="h-5 w-5 animate-spin" /> : "VENDER"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, tone }: any) {
  return (
    <div className={cn(
      "p-8 rounded-[2.5rem] border bg-card shadow-lg flex items-center justify-between transition-all",
      tone === 'profit' ? "border-green-500/30 bg-green-500/[0.03]" : "border-white/5"
    )}>
      <div>
        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">{label}</p>
        <p className={cn("text-3xl font-black mt-2 italic", tone === 'profit' ? "text-green-500" : "text-foreground")}>{value}</p>
      </div>
      <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner bg-muted/10")}>
        <Icon className={cn("h-7 w-7", tone === 'profit' ? "text-green-500" : "text-primary")} />
      </div>
    </div>
  );
}
