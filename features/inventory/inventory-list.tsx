"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Loader2, Boxes, AlertTriangle, TrendingUp, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

export function InventoryList() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("inventory_items")
      .select("*")
      .order("name", { ascending: true });

    if (!error) setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
    const supabase = createClient();
    const channel = supabase.channel("inventory-sync").on("postgres_changes", { event: "*", schema: "public", table: "inventory_items" }, () => fetchInventory()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="grid gap-6">
      {/* Resumen de Stock */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard label="Total Productos" value={items.length} icon={Boxes} tone="info" />
        <SummaryCard label="Stock Bajo" value={items.filter(i => i.stock <= i.minimum_stock).length} icon={AlertTriangle} tone="danger" />
        <SummaryCard label="Valor Inventario" value={"$" + new Intl.NumberFormat("es-AR").format(items.reduce((acc, i) => acc + (i.sale_price * i.stock), 0))} icon={TrendingUp} tone="success" />
      </div>

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => {
          const isLowStock = item.stock <= item.minimum_stock;
          return (
            <div key={item.id} className={cn(
              "group relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-xl",
              isLowStock && "border-red-500/30 bg-red-500/[0.02]"
            )}>
              <div className="flex items-start justify-between">
                <div className="h-12 w-12 rounded-xl bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                  <ShoppingBag className={cn("h-6 w-6 text-muted-foreground group-hover:text-primary", isLowStock && "text-red-500")} />
                </div>
                {isLowStock && <Badge tone="danger" className="animate-pulse font-black uppercase text-[9px]">STOCK BAJO</Badge>}
              </div>

              <div className="mt-6 space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.category}</p>
                <h3 className="text-lg font-black leading-tight text-foreground truncate">{item.name}</h3>
              </div>

              <div className="mt-6 flex items-baseline justify-between">
                <p className="text-2xl font-black text-foreground">${new Intl.NumberFormat("es-AR").format(item.sale_price)}</p>
                <div className="text-right">
                  <p className={cn("text-xl font-black", isLowStock ? "text-red-500" : "text-primary")}>{item.stock}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Unidades</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-dashed flex gap-2">
                <button className="flex-1 h-10 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase hover:bg-primary hover:text-white transition-all">Vender</button>
                <button className="h-10 w-10 flex items-center justify-center rounded-lg border hover:bg-muted transition-all">...</button>
              </div>
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed rounded-3xl">
          <p className="text-muted-foreground font-bold uppercase tracking-widest">El inventario está vacío</p>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, tone }: any) {
  return (
    <div className={cn(
      "p-6 rounded-2xl border shadow-sm flex items-center justify-between",
      tone === 'danger' ? "bg-red-500/10 border-red-500/20" : "bg-card"
    )}>
      <div>
        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{label}</p>
        <p className={cn("text-2xl font-black mt-1", tone === 'danger' && "text-red-600")}>{value}</p>
      </div>
      <Icon className={cn("h-8 w-8", tone === 'danger' ? "text-red-500" : "text-primary/40")} />
    </div>
  );
}
