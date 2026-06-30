"use client";

// V1.0.1 - Fix Production Build
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, CheckCircle2, Clock, FileDown, Plus, Sparkles, UserPlus, Loader2, AlertCircle, Cake, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

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
    calendarDots: [] as number[],
    upcomingBirthdays: [] as any[],
    aiInsights: [] as string[]
  });

  const fetchData = async () => {
    const supabase = createClient();
    const hoy = new Date();
    const startOfMonth = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString();
    const startOfToday = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).toISOString();

    try {
      const { count: activeCount } = await supabase.from("members").select("*", { count: 'exact', head: true }).eq("status", "active");
      const { data: monthPayments } = await supabase.from("payments").select("amount, method").gte("paid_at", startOfMonth);
      const mRevenue = monthPayments?.reduce((acc, p) => acc + Number(p.amount), 0) || 0;
      const { data: dailyPayments } = await supabase.from("payments").select("amount").gte("paid_at", startOfToday);
      const dRevenue = dailyPayments?.reduce((acc, p) => acc + Number(p.amount), 0) || 0;
      const { count: newCount } = await supabase.from("members").select("*", { count: 'exact', head: true }).gte("created_at", startOfMonth);

      const startOfYear = new Date(hoy.getFullYear(), 0, 1).toISOString();
      const { data: yearPayments } = await supabase.from("payments").select("amount, paid_at").gte("paid_at", startOfYear);
      const rawMonthlyData = Array(12).fill(0);
      yearPayments?.forEach(p => rawMonthlyData[new Date(p.paid_at).getMonth()] += Number(p.amount));
      const maxRevenue = Math.max(...rawMonthlyData, 1);
      const normalizedRevenue = rawMonthlyData.map(val => (val / maxRevenue) * 100);

      const { data: expirations } = await supabase
        .from("payments")
        .select("next_due_date, members(full_name), plans(name)")
        .gte("next_due_date", startOfToday)
        .order("next_due_date", { ascending: true })
        .limit(10);

      const lastDayOfMonth = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString();
      const { data: monthExpirations } = await supabase
        .from("payments")
        .select("next_due_date")
        .gte("next_due_date", startOfMonth)
        .lte("next_due_date", lastDayOfMonth);
      const dots = monthExpirations?.map(p => new Date(p.next_due_date).getDate() + 1) || [];

      const { data: allMembers } = await supabase.from("members").select("full_name, birth_date").not("birth_date", "is", null);
      const todayBdays = allMembers?.filter(m => {
        const b = new Date(m.birth_date);
        return b.getDate() === hoy.getDate() && b.getMonth() === hoy.getMonth();
      }) || [];

      const { data: lowStockItems } = await supabase.from("inventory_items").select("name, stock, minimum_stock").lte("stock", 5);

      const insights: string[] = [];
      if (lowStockItems && lowStockItems.length > 0) insights.push(`Stock crítico en ${lowStockItems[0].name}.`);
      if (expirations && expirations.length > 0) insights.push(`Hay cuotas próximas a vencer.`);
      if (todayBdays.length > 0) insights.push(`Hoy cumple años ${todayBdays[0].full_name}.`);
      if (insights.length === 0) insights.push("El sistema está analizando tus datos.");

      setStats({
        activeMembers: activeCount || 0,
        monthlyRevenue: mRevenue,
        dailyRevenue: dRevenue,
        newMembers: newCount || 0,
        revenueByMonth: normalizedRevenue,
        rawAmountsByMonth: rawMonthlyData,
        upcomingExpirations: expirations || [],
        calendarDots: Array.from(new Set(dots)),
        upcomingBirthdays: todayBdays,
        aiInsights: insights
      });
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const supabase = createClient();
    const channel = supabase.channel("dashboard-realtime-final").on("postgres_changes", { event: "*", schema: "public", table: "payments" }, () => fetchData()).on("postgres_changes", { event: "*", schema: "public", table: "members" }, () => fetchData()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  const currentMonth = new Date().getMonth();

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 rounded-3xl border bg-card/40 p-10 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
        <div>
          <Badge tone="info" className="px-4 py-1 font-black uppercase tracking-widest text-[10px]">Premium Suite</Badge>
          <h1 className="mt-4 text-5xl font-black tracking-tighter md:text-7xl text-foreground uppercase italic">GymFlow Live</h1>
          <p className="mt-2 text-muted-foreground font-medium text-lg italic">Control total en tiempo real.</p>
        </div>
        <Link href="/members">
          <Button className="h-12 px-8 font-black uppercase text-xs shadow-xl">Nuevo Registro</Button>
        </Link>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Socios Activos" value={stats.activeMembers} sub="Personas" icon={Users} color="#3b82f6" />
        <MetricCard label="Caja del Mes" value={`$${new Intl.NumberFormat("es-AR").format(stats.monthlyRevenue)}`} sub="Cobrado" icon={TrendingUp} color="#10b981" />
        <MetricCard label="Caja de Hoy" value={`$${new Intl.NumberFormat("es-AR").format(stats.dailyRevenue)}`} sub="Caja hoy" icon={Banknote} color="#6366f1" />
        <MetricCard label="Nuevos" value={stats.newMembers} sub="Este mes" icon={Plus} color="#f59e0b" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.5fr]">
        <div className="rounded-2xl border bg-card/40 p-8 backdrop-blur shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-xl font-black uppercase italic">Flujo de Caja Real</h2>
            <div className="bg-primary text-white px-4 py-1 rounded-xl shadow-lg">
              <span className="text-[10px] font-black uppercase block opacity-80">Anual</span>
              <span className="text-lg font-black">${new Intl.NumberFormat("es-AR", { notation: "compact" }).format(stats.rawAmountsByMonth.reduce((a,b)=>a+b,0))}</span>
            </div>
          </div>
          <div className="flex h-64 items-end gap-3 px-4">
            {stats.revenueByMonth.map((h, i) => (
              <div key={i} className="group relative flex-1 flex flex-col items-center gap-2">
                <div className={cn("absolute -top-10 opacity-0 group-hover:opacity-100 transition-all bg-foreground text-background text-[10px] font-black px-2 py-1 rounded", i === currentMonth && "opacity-100 -top-12")}>
                  ${new Intl.NumberFormat("es-AR", {notation:"compact"}).format(stats.rawAmountsByMonth[i])}
                </div>
                <motion.div initial={{height:0}} animate={{height:`${h}%`}} className={cn("w-full rounded-t-lg transition-all", i === currentMonth ? "bg-primary shadow-[0_0_20px_rgba(var(--primary),0.4)]" : "bg-primary/20 group-hover:bg-primary/40")} />
                <span className={cn("text-[10px] font-black uppercase", i === currentMonth ? "text-primary" : "text-muted-foreground")}>{["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-card/40 p-8 backdrop-blur shadow-sm flex flex-col border-r-4 border-r-accent/30">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black uppercase italic text-accent">AI Advisor</h2>
            <Sparkles className="h-6 w-6 text-accent animate-pulse" />
          </div>
          <div className="space-y-4 flex-1">
            {stats.aiInsights.map((insight, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl bg-muted/20 border border-border/50 text-xs font-bold leading-snug">
                <div className="h-2 w-2 rounded-full bg-accent mt-1.5 shrink-0" />
                <p>{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card/40 p-8 backdrop-blur shadow-sm">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-warning mb-6">Próximos Cobros</h2>
          <div className="space-y-3">
            {stats.upcomingExpirations.length === 0 ? <p className="text-[10px] italic py-5">Sin vencimientos.</p> : stats.upcomingExpirations.map((exp, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/10 border border-border/40">
                <p className="text-xs font-black uppercase truncate max-w-[100px]">{exp.members?.full_name}</p>
                <Badge tone="warning" className="text-[8px] h-4">{new Date(exp.next_due_date).toLocaleDateString()}</Badge>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border bg-card/40 p-8 backdrop-blur shadow-sm">
          <h2 className="text-[10px] font-black uppercase tracking-widest mb-6">Renovaciones</h2>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({length: 31}, (_, i) => i + 1).map(day => (
              <div key={day} className={cn("h-8 border rounded-lg flex items-center justify-center relative", stats.calendarDots.includes(day) ? "bg-primary/20 border-primary" : "bg-muted/5 border-transparent")}>
                <span className="text-[9px] font-bold">{day}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border bg-card/40 p-8 backdrop-blur shadow-sm">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-primary mb-6">Cumpleaños</h2>
          <div className="space-y-3">
            {stats.upcomingBirthdays.length === 0 ? <p className="text-[10px] italic py-5">Nadie hoy.</p> : stats.upcomingBirthdays.map((m, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20">
                <span className="text-xs font-black uppercase truncate">{m.full_name}</span>
                <Badge tone="success">¡HOY!</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, icon: Icon, color }: any) {
  return (
    <div className="rounded-2xl border bg-card/40 p-6 backdrop-blur shadow-sm border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between text-muted-foreground mb-4">
        <p className="text-[9px] font-black uppercase tracking-widest">{label}</p>
        <Icon className="h-4 w-4 opacity-40" />
      </div>
      <p className="text-2xl font-black text-foreground">{value}</p>
      <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">{sub}</p>
    </div>
  );
}

const Users = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const Banknote = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>

function cn(...classes: any[]) { return classes.filter(Boolean).join(" "); }
