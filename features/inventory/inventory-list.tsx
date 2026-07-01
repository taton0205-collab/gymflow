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
      // 1. Registrar la venta en la tabla de pagos (sin obligar a que sea un miembro)
      const { error: paymentError } = await supabase.from("payments").insert([{
        gym_id: item.gym_id,
        amount: item.sale_price,
        paid_amount: item.sale_price,
        method: "cash",
        status: "paid",
        paid_at: new Date().toISOString(),
        notes: `VENTA MOSTRADOR: ${item.name}`,
        due_date: new Date().toISOString().split('T')[0]
      }]);

      if (paymentError) throw paymentError;

      // 2. Descontar stock
      const { error: stockError } = await supabase
        .from("inventory_items")
        .update({ stock: item.stock - 1 })
        .eq("id", item.id);

      if (stockError) throw stockError;

      alert("¡Venta completada y stock actualizado!");
      fetchInventory();
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSellingId(null);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard label="Total Variedad" value={items.length} icon={Boxes} tone="info" />
        <SummaryCard label="Stock Crítico" value={items.filter(i => i.stock <= i.minimum_stock).length} icon={AlertTriangle} tone="danger" />
        <SummaryCard label="Valor Inventario" value={"$" + new Intl.NumberFormat("es-AR").format(items.reduce((acc, i) => acc + (i.sale_price * i.stock), 0))} icon={TrendingUp} tone="success" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => {
          const isLowStock = item.stock <= item.minimum_stock;
          return (
            <div key={item.id} className={cn(
              "group relative flex flex-col rounded-[2rem] border bg-card p-6 shadow-sm transition-all hover:shadow-2xl",
              isLowStock && "border-red-500/30 bg-red-500/[0.02]"
            )}>
              <div className="flex items-start justify-between">
                <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center shadow-inner">
                  <ShoppingBag className={cn("h-7 w-7 text-muted-foreground", isLowStock && "text-red-500")} />
                </div>
                {isLowStock && <Badge tone="danger" className="animate-pulse font-black uppercase text-[8px]">STOCK BAJO</Badge>}
              </div>

              <div className="mt-8 space-y-1">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{item.category}</p>
                <h3 className="text-xl font-black italic uppercase truncate">{item.name}</h3>
              </div>

              <div className="mt-8 pt-4 border-t border-dashed flex justify-between items-center">
                <p className="text-2xl font-black">${new Intl.NumberFormat("es-AR").format(item.sale_price)}</p>
                <div className="text-right">
                  <p className={cn("text-2xl font-black", isLowStock ? "text-red-500" : "text-primary")}>{item.stock}</p>
                  <p className="text-[8px] font-bold uppercase opacity-50">unid</p>
                </div>
              </div>

              <button
                onClick={() => handleSell(item)}
                disabled={sellingId === item.id || item.stock <= 0}
                className={cn(
                  "mt-6 h-14 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95",
                  item.stock > 0 ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground"
                )}
              >
                {sellingId === item.id ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    {item.stock > 0 ? "Vender" : "Agotado"}
                  </>
                )}
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
    <div className={cn("p-8 rounded-[2rem] border bg-card shadow-sm flex items-center justify-between", tone === 'danger' && "border-red-500/20")}>
      <div>
        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">{label}</p>
        <p className={cn("text-3xl font-black mt-2 italic", tone === 'danger' ? "text-red-600" : "text-foreground")}>{value}</p>
      </div>
      <div className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner bg-background">
        <Icon className={cn("h-7 w-7", tone === 'danger' ? "text-red-500" : "text-primary")} />
      </div>
    </div>
  );
}
