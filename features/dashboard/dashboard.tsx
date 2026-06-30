"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Plus, Sparkles, Loader2, TrendingUp, Users, Banknote, Activity, Shield, Swords, AlertCircle, CalendarDays, Cake, Boxes
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
    aiInsights: [] as string[],
    upcomingBirthdays: [] as any[],
    upcomingExpirations: [] as any[]
  });

  const fetchData = async () => {
    const supabase = createClient();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    try {
      const { count: activeCount } = await supabase.from("members").select("*", { count: 'exact', head: true }).eq("status", "active");
      const { data: monthPayments } = await supabase.from("payments").select("amount, method").gte("paid_at", startOfMonth);
      const mRevenue = monthPayments?.reduce((acc, p) => acc + Number(p.amount), 0) || 0;

      const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();
      const { data: yearPayments } = await supabase.from("payments").select("amount, paid_at").gte("paid_at", startOfYear);
      const rawMonthlyData = Array(12).fill(0);
      yearPayments?.forEach(p => rawMonthlyData[new Date(p.paid_at).getMonth()] += Number(p.amount));
      const maxRevenue = Math.max(...rawMonthlyData, 1);
      const normalizedRevenue = rawMonthlyData.map(val => (val / maxRevenue) * 100);

      const { data: expirations } = await supabase.from("payments").select("next_due_date, members(full_name)").gte("next_due_date", now.toISOString()).order("next_due_date", { ascending: true }).limit(3);
      const { data: bdaysMembers } = await supabase.from("members").select("full_name, birth_date").not("birth_date", "is", null);
      const todayBdays = bdaysMembers?.filter(m => {
        const b = new Date(m.birth_date);
        return b.getDate() === now.getDate() && b.getMonth() === now.getMonth();
      }) || [];

      const insights = [];
      if (mRevenue > 0) insights.push(`La facturación del mes es de $${new Intl.NumberFormat("es-AR").format(mRevenue)}.`);
      if (todayBdays.length > 0) insights.push(`¡Hoy es el cumple de ${todayBdays[0].full_name}!`);
      if (expirations && expirations.length > 0) insights.push(`Tienes ${expirations.length} cuotas por vencer pronto.`);
      if (activeCount && activeCount > 10) insights.push("El flujo de miembros mantiene una ocupación sólida.");

      setStats({
        activeMembers: activeCount || 0,
        monthlyRevenue: mRevenue,
        dailyRevenue: 0,
        newMembers: 0,
        revenueByMonth: normalizedRevenue,
        rawAmountsByMonth: rawMonthlyData,
        aiInsights: insights,
        upcomingBirthdays: todayBdays,
        upcomingExpirations: expirations || []
      });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 pb-20">
      {/* Header SECUTOR GOLD */}
      <section className="flex flex-col gap-8 rounded-[2.5rem] border-b-4 border-b-primary border bg-card/40 p-10 shadow-2xl backdrop-blur md:flex-row md:items-center md:justify-between relative overflow-hidden">
        <div className="relative space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Sistema de Gestión</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-foreground uppercase italic leading-none">SECUTOR<br/><span className="text-primary">ARENA</span></h1>
          <p className="text-muted-foreground font-bold uppercase text-sm tracking-widest opacity-60 italic">Resistencia • Disciplina • Victoria</p>
        </div>
        <div className="flex flex-wrap gap-3 relative z-10">
          <Link href="/reports">
            <Button variant="secondary" className="h-16 px-8 font-black uppercase italic tracking-widest text-sm border-2">
              <TrendingUp className="mr-2 h-5 w-5" /> Métricas
            </Button>
          </Link>
          <Link href="/inventory">
            <Button variant="secondary" className="h-16 px-8 font-black uppercase italic tracking-widest text-sm border-2">
              <Boxes className="mr-2 h-5 w-5" /> Inventario
            </Button>
          </Link>
          <Link href="/members">
            <Button className="h-16 px-10 font-black uppercase italic tracking-widest text-lg shadow-xl shadow-primary/10 transition-all hover:scale-105 active:scale-95">NUEVO MIEMBRO</Button>
          </Link>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.5fr]">
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid gap-4 sm:grid-cols-2">
            <KPICard label="Miembros en Activo" value={stats.activeMembers} sub="Personas" icon={Users} />
            <KPICard label="Caja Total del Mes" value={`$${new Intl.NumberFormat("es-AR").format(stats.monthlyRevenue)}`} sub="Cobrado" icon={Banknote} />
          </div>

          {/* Gráfico de Ingresos */}
          <div className="rounded-[2rem] border bg-card/40 p-8 shadow-sm border-t-2 border-t-primary/10">
             <div className="flex items-center justify-between mb-8">
               <h2 className="text-lg font-black uppercase italic tracking-tight flex items-center gap-3"><Activity className="h-5 w-5 text-primary" /> Flujo de Fondos Real</h2>
               <Badge className="bg-primary/10 text-primary border-primary/20 font-black">ANUAL ${new Intl.NumberFormat("es-AR", {notation: 'compact'}).format(stats.rawAmountsByMonth.reduce((a,b)=>a+b,0))}</Badge>
             </div>
             <div className="flex h-64 items-end gap-3 px-2">
               {stats.revenueByMonth.map((h, i) => (
                 <div key={i} className="group relative flex-1 flex flex-col items-center gap-2">
                   <motion.div initial={{height:0}} animate={{height:`${h}%`}} className={cn("w-full rounded-t-lg transition-all duration-500", i === new Date().getMonth() ? "bg-primary shadow-[0_0_30px_rgba(var(--primary),0.3)]" : "bg-primary/20 group-hover:bg-primary/40")} />
                   <span className="text-[10px] font-black text-muted-foreground">{"EFMAMJJASOND"[i]}</span>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* AI ADVISOR */}
        <div className="rounded-[2rem] border bg-card/40 p-8 shadow-sm flex flex-col border-r-4 border-r-primary/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5"><Sparkles size={100} /></div>
          <div className="flex items-center justify-between mb-8 relative">
            <h2 className="text-xl font-black uppercase italic text-primary tracking-tighter">AI Advisor</h2>
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <div className="space-y-4 flex-1 relative">
            {stats.aiInsights.map((ins, i) => (
              <motion.div key={i} initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} transition={{delay: i*0.1}} className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                <p className="text-[11px] font-black uppercase italic leading-snug tracking-tight text-foreground/80">{ins}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-dashed">
             <div className="flex items-center justify-between mb-4">
               <span className="text-[10px] font-black uppercase text-muted-foreground">Próximos Vencimientos</span>
               <CalendarDays className="h-4 w-4 text-primary" />
             </div>
             <div className="space-y-2">
                {stats.upcomingExpirations.map((exp, i) => (
                  <div key={i} className="flex justify-between items-center text-[10px] font-bold">
                    <span className="truncate max-w-[100px] uppercase">{exp.members?.full_name}</span>
                    <span className="text-primary">{new Date(exp.next_due_date).toLocaleDateString()}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, sub, icon: Icon }: any) {
  return (
    <div className="rounded-[2rem] border bg-card/40 p-8 shadow-lg border-l-8 border-l-primary transition-all hover:shadow-xl group">
      <div className="flex items-center justify-between text-muted-foreground mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
        <Icon className="h-5 w-5 opacity-40 group-hover:opacity-100 transition-opacity text-primary" />
      </div>
      <p className="text-4xl font-black tracking-tighter italic">{value}</p>
      <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">{sub}</p>
    </div>
  );
}
