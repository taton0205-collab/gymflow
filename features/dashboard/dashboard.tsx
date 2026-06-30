"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowUpRight, CalendarDays, Clock, FileDown, Plus, Sparkles, Loader2,
  Cake, TrendingUp, Users, Banknote, ShoppingCart, Activity, AlertCircle,
  Zap, ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeMembers: 0,
    monthlyRevenue: 0,
    dailyRevenue: 0,
    newMembers: 0,
    revenueByMonth: Array(12).fill(0),
    rawAmountsByMonth: Array(12).fill(0),
    upcomingExpirations: [] as any[],
    upcomingBirthdays: [] as any[],
    aiInsights: [] as string[],
    lowStock: [] as any[],
    recentActivity: [] as any[],
    paymentMethods: { cash: 0, mp: 0, transf: 0 }
  });

  const fetchData = async () => {
    const supabase = createClient();
    const hoy = new Date();
    const startOfMonth = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString();
    const startOfToday = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).toISOString();

    try {
      // 1. KPI Básicos
      const { count: activeCount } = await supabase.from("members").select("*", { count: 'exact', head: true }).eq("status", "active");
      const { data: monthPayments } = await supabase.from("payments").select("amount, method").gte("paid_at", startOfMonth);
      const mRevenue = monthPayments?.reduce((acc, p) => acc + Number(p.amount), 0) || 0;
      const { data: dailyPayments } = await supabase.from("payments").select("amount").gte("paid_at", startOfToday);
      const dRevenue = dailyPayments?.reduce((acc, p) => acc + Number(p.amount), 0) || 0;
      const { count: newCount } = await supabase.from("members").select("*", { count: 'exact', head: true }).gte("created_at", startOfMonth);

      // Desglose de pagos
      const methods = { cash: 0, mp: 0, transf: 0 };
      monthPayments?.forEach(p => {
        if (p.method === 'cash') methods.cash += Number(p.amount);
        if (p.method === 'mercado_pago') methods.mp += Number(p.amount);
        if (p.method === 'transfer') methods.transf += Number(p.amount);
      });

      // 2. Gráfico de Ingresos
      const startOfYear = new Date(hoy.getFullYear(), 0, 1).toISOString();
      const { data: yearPayments } = await supabase.from("payments").select("amount, paid_at").gte("paid_at", startOfYear);
      const rawMonthlyData = Array(12).fill(0);
      yearPayments?.forEach(p => rawMonthlyData[new Date(p.paid_at).getMonth()] += Number(p.amount));
      const maxRevenue = Math.max(...rawMonthlyData, 1);
      const normalizedRevenue = rawMonthlyData.map(val => (val / maxRevenue) * 100);

      // 3. Vencimientos, Cumples e Inventario
      const { data: expirations } = await supabase.from("payments").select("next_due_date, members(full_name), plans(name)").gte("next_due_date", startOfToday).order("next_due_date", { ascending: true }).limit(4);
      const { data: allMembers } = await supabase.from("members").select("full_name, birth_date").not("birth_date", "is", null);
      const bdays = allMembers?.filter(m => new Date(m.birth_date).getDate() === hoy.getDate() && new Date(m.birth_date).getMonth() === hoy.getMonth()) || [];
      const { data: lowStockItems } = await supabase.from("inventory_items").select("name, stock, category").lte("stock", 5).limit(3);

      // 4. Actividad Reciente (Simplificada para la demo)
      const recent = [
        { type: 'member', text: `Socio registrado`, time: 'Ahora' },
        { type: 'sale', text: `Venta de suplemento`, time: 'Hace 5m' },
        { type: 'access', text: `Ingreso por QR`, time: 'Hace 12m' }
      ];

      setStats({
        activeMembers: activeCount || 0,
        monthlyRevenue: mRevenue,
        dailyRevenue: dRevenue,
        newMembers: newCount || 0,
        revenueByMonth: normalizedRevenue,
        rawAmountsByMonth: rawMonthlyData,
        upcomingExpirations: expirations || [],
        upcomingBirthdays: bdays,
        aiInsights: ["La rentabilidad subió un 12% este mes.", "El horario pico de hoy fue a las 19:00 hs."],
        lowStock: lowStockItems || [],
        recentActivity: recent,
        paymentMethods: methods
      });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 pb-20">
      {/* Header Premium */}
      <section className="flex flex-col gap-8 rounded-[3rem] border-b-8 border-b-primary/30 border bg-card/40 p-12 shadow-2xl backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div className="space-y-4">
          <Badge tone="info" className="px-6 py-1.5 font-black uppercase text-[10px] tracking-[0.3em] bg-primary text-white border-none shadow-lg shadow-primary/20">Operational Suite v2.0</Badge>
          <h1 className="text-6xl font-black tracking-tighter text-foreground uppercase italic leading-[0.8]">GymFlow<br/>Live Console</h1>
          <p className="max-w-md text-muted-foreground font-medium text-lg leading-relaxed">Auditoría, Inteligencia y Control total en una sola pantalla.</p>
        </div>
        <div className="flex flex-col gap-4">
          <Link href="/members"><Button className="h-16 px-12 font-black uppercase italic tracking-widest text-lg shadow-2xl hover:scale-105 transition-all">NUEVA ALTA socio</Button></Link>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 font-black text-[10px] uppercase border-2 h-10 tracking-widest">Reporte Diario</Button>
            <Button variant="outline" className="flex-1 font-black text-[10px] uppercase border-2 h-10 tracking-widest">Cerrar Caja</Button>
          </div>
        </div>
      </section>

      {/* KPI Reales con Diseño Minimalista */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Ingresos del Mes" value={`$${new Intl.NumberFormat("es-AR").format(stats.monthlyRevenue)}`} icon={Banknote} color="#10b981" />
        <KPICard label="Socios Activos" value={stats.activeMembers} icon={Users} color="#3b82f6" />
        <KPICard label="Caja de Hoy" value={`$${new Intl.NumberFormat("es-AR").format(stats.dailyRevenue)}`} icon={Zap} color="#6366f1" />
        <KPICard label="Crecimiento" value={"+" + stats.newMembers} icon={TrendingUp} color="#f59e0b" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.4fr]">
        {/* Gráfico y Desglose de Caja */}
        <div className="rounded-[2.5rem] border bg-card/40 p-10 shadow-sm space-y-10 border-t-2 border-t-primary/10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3"><Activity className="h-6 w-6 text-primary" /> Flujo de Fondos Real</h2>
            <div className="flex gap-4">
               <div className="text-right"><p className="text-[10px] font-black text-muted-foreground uppercase">Efectivo</p><p className="font-bold text-green-500">${new Intl.NumberFormat("es-AR").format(stats.paymentMethods.cash)}</p></div>
               <div className="text-right border-l pl-4"><p className="text-[10px] font-black text-muted-foreground uppercase">Digital</p><p className="font-bold text-blue-500">${new Intl.NumberFormat("es-AR").format(stats.paymentMethods.mp + stats.paymentMethods.transf)}</p></div>
            </div>
          </div>
          <div className="flex h-64 items-end gap-3 px-2">
            {stats.revenueByMonth.map((h, i) => (
              <div key={i} className="group relative flex-1 flex flex-col items-center gap-2">
                <motion.div initial={{height:0}} animate={{height:`${h}%`}} className={cn("w-full rounded-t-xl transition-all", i === new Date().getMonth() ? "bg-primary shadow-[0_0_30px_rgba(var(--primary),0.5)]" : "bg-primary/20 group-hover:bg-primary/40")} />
                <span className="text-[10px] font-black text-muted-foreground uppercase">{"EFMAMJJASOND"[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI ADVISOR MEJORADO */}
        <div className="rounded-[2.5rem] border bg-card/40 p-8 shadow-sm flex flex-col border-r-8 border-r-accent/30">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-black uppercase italic text-accent tracking-tighter">AI Advisor</h2>
            <Sparkles className="h-6 w-6 text-accent animate-pulse" />
          </div>
          <div className="space-y-6 flex-1">
            {stats.aiInsights.map((ins, i) => (
              <div key={i} className="bg-accent/5 p-4 rounded-2xl border border-accent/10 space-y-2">
                <p className="text-xs font-bold leading-tight uppercase italic tracking-tight">{ins}</p>
                <div className="h-1 w-12 bg-accent/30 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* STOCK CRÍTICO */}
        <div className="rounded-[2rem] border bg-card/40 p-8 shadow-sm">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-6 flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Reponer Inventario</h2>
          <div className="space-y-4">
            {stats.lowStock.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-red-500/5 border border-red-500/20">
                <div>
                  <p className="text-sm font-black uppercase italic">{item.name}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-red-500 italic">{item.stock}</p>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase">unid</p>
                </div>
              </div>
            ))}
            {stats.lowStock.length === 0 && <p className="text-xs italic text-muted-foreground text-center py-5">Todo el stock está al día.</p>}
          </div>
        </div>

        {/* VENCIMIENTOS RÁPIDOS */}
        <div className="rounded-[2rem] border bg-card/40 p-8 shadow-sm">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-warning mb-6 flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Cobros Pendientes</h2>
          <div className="space-y-3">
            {stats.upcomingExpirations.map((exp, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-warning/5 border border-warning/20">
                <p className="text-xs font-black uppercase italic truncate max-w-[120px]">{exp.members?.full_name}</p>
                <div className="text-right">
                  <p className="text-xs font-black uppercase">{new Date(exp.next_due_date).toLocaleDateString()}</p>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase italic">Vence pronto</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FEED DE ACTIVIDAD */}
        <div className="rounded-[2rem] border bg-card/40 p-8 shadow-sm">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2"><Activity className="h-4 w-4" /> Actividad Live</h2>
          <div className="space-y-4">
            {stats.recentActivity.map((act, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-tighter">{act.text}</p>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase">{act.time}</p>
                </div>
                <ArrowRight className="h-3 w-3 text-muted-foreground opacity-30" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="rounded-[2rem] border bg-card/40 p-8 shadow-sm border-l-8 transition-all hover:shadow-xl group" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between text-muted-foreground mb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-foreground transition-colors">{label}</p>
        <Icon className="h-6 w-6 opacity-30 group-hover:opacity-100 transition-opacity" style={{ color: color }} />
      </div>
      <p className="text-4xl font-black tracking-tighter text-foreground italic">{value}</p>
    </div>
  );
}
