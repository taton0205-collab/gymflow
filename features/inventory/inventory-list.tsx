"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Loader2, Boxes, AlertTriangle, TrendingUp, ShoppingBag, ShoppingCart, Trash2, PiggyBank, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

export function InventoryList() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellingId, setSellingId] = useState<string | null>(null);
  const [realizedProfit, setRealizedProfit] = useState(0);
  const [totalSales, setTotalSales] = useState(0);

  const fetchData = async () => {
    const supabase = createClient();
    const { data: inventoryData } = await supabase.from("inventory_items").select("*").order("name", { ascending: true });
    const { data: paymentsData } = await supabase.from("payments").select("amount, cost_basis").ilike("notes", "VENTA:%");

    if (inventoryData) setItems(inventoryData);
    if (!paymentsData || paymentsData.length === 0) {
      setRealizedProfit(0);
      setTotalSales(0);
    } else {
      const profit = paymentsData.reduce((acc, p) => acc + (Number(p.amount) - Number(p.cost_basis || 0)), 0);
      setRealizedProfit(profit);
      setTotalSales(paymentsData.reduce((acc, p) => acc + Number(p.amount), 0));
    }
    setLoading(false);
  };

  const handleSell = async (item: any) => {
    if (item.stock <= 0) return alert("¡Sin stock!");
    if (!confirm(`¿Confirmar venta de ${item.name}?`)) return;
    setSellingId(item.id);
    const supabase = createClient();
    try {
      await supabase.from("payments").insert([{
        gym_id: item.gym_id,
        amount: item.sale_price,
        paid_amount: item.sale_price,
        cost_basis: item.cost || 0,
        method: "cash",
        status: "paid",
        paid_at: new Date().toISOString(),
        notes: `VENTA: ${item.name}`,
        due_date: new Date().toISOString().split('T')[0]
      }]);
      await supabase.from("inventory_items").update({ stock: item.stock - 1 }).eq("id", item.id);
      fetchData();
    } catch (e) { alert("Error"); } finally { setSellingId(null); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar permanentemente "${name}"?`)) return;
    const supabase = createClient();
    try {
      await supabase.from("inventory_items").delete().eq("id", id);
      fetchData();
    } catch (e) { alert("Error al borrar"); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div className="flex justify-center p-32"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;

  return (
    <div className="grid gap-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard label="Ventas de Productos" value={"$" + new Intl.NumberFormat("es-AR").format(totalSales)} icon={DollarSign} sub="Caja total productos" />
        <SummaryCard label="Ganancia Realizada" value={"$" + new Intl.NumberFormat("es-AR").format(realizedProfit)} icon={PiggyBank} tone="profit" sub="Beneficio acumulado" />
        <SummaryCard label="Inversión en Stock" value={"$" + new Intl.NumberFormat("es-AR").format(items.reduce((acc, i) => acc + ((i.cost || 0) * i.stock), 0))} icon={Boxes} sub="Mercadería actual" />
      </div>

      {items.length === 0 ? (
        <div className="text-center py-32 border-4 border-dashed rounded-[3rem] opacity-30 flex flex-col items-center">
          <Boxes className="h-16 w-16 mb-4" />
          <p className="text-sm font-black uppercase tracking-[0.3em]">Carga productos para empezar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const isLowStock = item.stock <= item.minimum_stock;
            const unitProfit = item.sale_price - (item.cost || 0);
            return (
              <div key={item.id} className={cn("group relative flex flex-col rounded-[2.5rem] border bg-card p-8 shadow-sm transition-all hover:shadow-2xl hover:border-primary/30", isLowStock && "border-red-500/20 bg-red-500/[0.02]")}>
                <div className="flex items-start justify-between">
                  <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center shadow-inner"><ShoppingBag className={cn("h-7 w-7 text-muted-foreground", isLowStock && "text-red-500")} /></div>
                  <button onClick={() => handleDelete(item.id, item.name)} className="h-10 w-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-8">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{item.category}</p>
                  <h3 className="text-xl font-black italic uppercase truncate text-foreground">{item.name}</h3>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="bg-green-500/10 rounded-xl p-3 border border-green-500/20">
                    <p className="text-[9px] font-black text-green-500 uppercase">Beneficio Neto</p>
                    <p className="text-lg font-black text-green-500 italic mt-1">+ ${new Intl.NumberFormat("es-AR").format(unitProfit)}</p>
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <div><p className="text-2xl font-black text-foreground italic">{item.stock}</p><p className="text-[8px] font-bold uppercase opacity-50">Stock</p></div>
                    {isLowStock && <Badge tone="danger">REPONER</Badge>}
                  </div>
                </div>
                <button onClick={() => handleSell(item)} disabled={sellingId === item.id || item.stock <= 0} className={cn("mt-6 h-14 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95", item.stock > 0 ? "bg-primary text-black" : "bg-muted text-muted-foreground")}>
                  {sellingId === item.id ? <Loader2 className="h-5 w-5 animate-spin" /> : "VENDER"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, tone, sub }: any) {
  return (
    <div className={cn("p-8 rounded-[2.5rem] border bg-card shadow-lg flex items-center justify-between transition-all border-white/5", tone === 'profit' && "border-green-500/30 bg-green-500/[0.03]")}>
      <div>
        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">{label}</p>
        <p className={cn("text-3xl font-black mt-2 italic", tone === 'profit' ? "text-green-500" : "text-foreground")}>{value}</p>
        <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">{sub}</p>
      </div>
      <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner bg-muted/10")}><Icon className={cn("h-7 w-7", tone === 'profit' ? "text-green-500" : "text-primary")} /></div>
    </div>
  );
}
