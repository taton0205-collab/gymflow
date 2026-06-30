"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Plus, Sparkles, Loader2, TrendingUp, Users, Banknote, Activity, Shield, Swords
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
    rawAmountsByMonth: Array(12).fill(0)
  });

  const fetchData = async () => {
    const supabase = createClient();
    const hoy = new Date();
    const startOfMonth = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString();

    try {
      const { count: activeCount } = await supabase.from("members").select("*", { count: 'exact', head: true });
      const { data: monthPayments } = await supabase.from("payments").select("amount").gte("paid_at", startOfMonth);
      const mRevenue = monthPayments?.reduce((acc, p) => acc + Number(p.amount), 0) || 0;

      const startOfYear = new Date(hoy.getFullYear(), 0, 1).toISOString();
      const { data: yearPayments } = await supabase.from("payments").select("amount, paid_at").gte("paid_at", startOfYear);
      const rawMonthlyData = Array(12).fill(0);
      yearPayments?.forEach(p => rawMonthlyData[new Date(p.paid_at).getMonth()] += Number(p.amount));
      const maxRevenue = Math.max(...rawMonthlyData, 1);
      const normalizedRevenue = rawMonthlyData.map(val => (val / maxRevenue) * 100);

      setStats({
        activeMembers: activeCount || 0,
        monthlyRevenue: mRevenue,
        dailyRevenue: 0,
        newMembers: 0,
        revenueByMonth: normalizedRevenue,
        rawAmountsByMonth: rawMonthlyData
      });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-10">
      {/* Header SECUTOR */}
      <section className="flex flex-col gap-8 rounded-[3rem] border-b-[12px] border-b-primary border bg-card/40 p-12 shadow-2xl backdrop-blur-xl md:flex-row md:items-center md:justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-5 rotate-12 translate-x-1/4 -translate-y-1/4"><Shield size={400} /></div>
        <div className="relative space-y-4">
          <Badge tone="info" className="px-6 py-2 font-black uppercase text-[10px] tracking-[0.4em] bg-primary text-white border-none shadow-xl shadow-primary/20">ESTADO DEL COLISEO</Badge>
          <h1 className="text-8xl font-black tracking-tighter text-foreground uppercase italic leading-[0.8] drop-shadow-2xl">SECUTOR<br/><span className="text-primary underline decoration-8">ARENA</span></h1>
          <p className="max-w-md text-muted-foreground font-bold text-xl uppercase italic opacity-70">Donde se forjan los gladiadores.</p>
        </div>
        <Link href="/members" className="relative z-10"><Button className="h-20 px-16 font-black uppercase italic tracking-widest text-2xl shadow-2xl hover:scale-105 transition-all skew-x-[-12deg] rounded-none border-r-8 border-white/20">NUEVO GUERRERO</Button></Link>
      </section>

      {/* KPI Romans */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <KPICard label="Gladiadores Activos" value={stats.activeMembers} icon={Users} color="hsl(var(--primary))" />
        <KPICard label="Tributos del Mes" value={`$${new Intl.NumberFormat("es-AR").format(stats.monthlyRevenue)}`} icon={Banknote} color="hsl(var(--primary))" />
        <KPICard label="Crecimiento de Arena" value="+14%" icon={TrendingUp} color="hsl(var(--primary))" />
      </div>

      <div className="rounded-[3rem] border bg-card/40 p-12 shadow-sm space-y-12 border-t-4 border-t-primary/20">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-4"><Swords className="h-8 w-8 text-primary" /> Historia de Victorias (Ingresos)</h2>
          <div className="text-right bg-primary/10 px-8 py-3 rounded-2xl border border-primary/20"><p className="text-[10px] font-black text-primary uppercase tracking-widest">Total Anual</p><p className="text-3xl font-black text-foreground italic">${new Intl.NumberFormat("es-AR").format(stats.rawAmountsByMonth.reduce((a,b)=>a+b,0))}</p></div>
        </div>
        <div className="flex h-80 items-end gap-4 px-4">
          {stats.revenueByMonth.map((h, i) => (
            <div key={i} className="group relative flex-1 flex flex-col items-center gap-4">
              <motion.div initial={{height:0}} animate={{height:`${h}%`}} transition={{type:"spring", stiffness:100}} className={cn("w-full rounded-t-2xl transition-all duration-700", i === new Date().getMonth() ? "bg-primary shadow-[0_0_50px_rgba(var(--primary),0.6)]" : "bg-primary/10 group-hover:bg-primary/30")} />
              <span className="text-xs font-black text-muted-foreground uppercase tracking-widest italic">{"EFMAMJJASOND"[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="rounded-[2.5rem] border bg-card p-10 shadow-lg border-b-8 transition-all hover:-translate-y-2 hover:shadow-2xl group" style={{ borderBottomColor: color }}>
      <div className="flex items-center justify-between text-muted-foreground mb-8">
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">{label}</p>
        <Icon className="h-8 w-8 opacity-20 group-hover:opacity-100 transition-opacity" style={{ color }} />
      </div>
      <p className="text-5xl font-black tracking-tighter text-foreground italic uppercase leading-none">{value}</p>
    </div>
  );
}
