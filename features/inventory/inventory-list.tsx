"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Loader2, Boxes, AlertTriangle, TrendingUp, ShoppingBag, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

export function InventoryList() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellingId, setSellingId] = useState<string | null>(null);

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
      // 1. Descontar stock
      const { error: stockError } = await supabase
        .from("inventory_items")
        .update({ stock: item.stock - 1 })
        .eq("id", item.id);

      if (stockError) throw stockError;

      // 2. Registrar el ingreso en pagos (como venta de producto)
      const { error: paymentError } = await supabase.from("payments").insert([{
        gym_id: item.gym_id,
        amount: item.sale_price,
        paid_amount: item.sale_price,
        method: "cash",
        status: "paid",
        paid_at: new Date().toISOString(),
        notes: `Venta: ${item.name}`,
        due_date: new Date().toISOString().split('T')[0]
      }]);

      if (paymentError) throw paymentError;

      alert("¡Venta registrada y stock actualizado!");
      fetchInventory();
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSellingId(null);
    }
  };

  useEffect(() => {
    fetchInventory();
    const supabase = createClient();
    const channel = supabase.channel("inventory-realtime").on("postgres_changes", { event: "*", schema: "public", table: "inventory_items" }, () => fetchInventory()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard label="Total Productos" value={items.length} icon={Boxes} tone="info" />
        <SummaryCard label="Stock Bajo" value={items.filter(i => i.stock <= i.minimum_stock).length} icon={AlertTriangle} tone="danger" />
        <SummaryCard label="Valor en Estantería" value={"$" + new Intl.NumberFormat("es-AR").format(items.reduce((acc, i) => acc + (i.sale_price * i.stock), 0))} icon={TrendingUp} tone="success" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => {
          const isLowStock = item.stock <= item.minimum_stock;
          return (
            <div key={item.id} className={cn(
              "group relative flex flex-col rounded-[2rem] border bg-card p-6 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-1",
              isLowStock && "border-red-500/30 bg-red-500/[0.02]"
            )}>
              <div className="flex items-start justify-between">
                <div className="h-14 w-14 rounded-2xl bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors shadow-inner">
                  <ShoppingBag className={cn("h-7 w-7 text-muted-foreground group-hover:text-primary", isLowStock && "text-red-500")} />
                </div>
                {isLowStock && <Badge tone="danger" className="animate-pulse font-black uppercase text-[8px] tracking-tighter">REPOSICIÓN URGENTE</Badge>}
              </div>

              <div className="mt-8 space-y-1">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-70">{item.category}</p>
                <h3 className="text-xl font-black leading-tight text-foreground truncate italic uppercase">{item.name}</h3>
              </div>

              <div className="mt-8 flex items-baseline justify-between border-t border-dashed pt-4">
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">Precio Venta</p>
                  <p className="text-2xl font-black text-foreground">${new Intl.NumberFormat("es-AR").format(item.sale_price)}</p>
                </div>
                <div className="text-right">
                  <p className={cn("text-2xl font-black italic", isLowStock ? "text-red-500" : "text-primary")}>{item.stock}</p>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Stock</p>
                </div>
              </div>

              <button
                onClick={() => handleSell(item)}
                disabled={sellingId === item.id || item.stock <= 0}
                className={cn(
                  "mt-6 h-14 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95",
                  item.stock > 0
                    ? "bg-primary text-white hover:bg-primary/90 shadow-primary/20"
                    : "bg-muted text-muted-foreground cursor-not-allowed shadow-none"
                )}
              >
                {sellingId === item.id ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    {item.stock > 0 ? "Vender Ahora" : "Sin Stock"}
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-32 border-4 border-dashed rounded-[3rem] opacity-40">
          <Boxes className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground">Depósito Vacío</p>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, tone }: any) {
  return (
    <div className={cn(
      "p-8 rounded-[2rem] border shadow-sm flex items-center justify-between transition-all hover:shadow-xl",
      tone === 'danger' ? "bg-red-500/10 border-red-500/20" : "bg-card border-b-4 border-b-primary/10"
    )}>
      <div>
        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">{label}</p>
        <p className={cn("text-3xl font-black mt-2 italic", tone === 'danger' ? "text-red-600" : "text-foreground")}>{value}</p>
      </div>
      <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner bg-background")}>
        <Icon className={cn("h-7 w-7", tone === 'danger' ? "text-red-500" : "text-primary")} />
      </div>
    </div>
  );
}
