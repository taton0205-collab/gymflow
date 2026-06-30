"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Plus, Sparkles, Loader2, TrendingUp, Users, Banknote, Activity, Shield,
  AlertCircle, CalendarDays, Cake, Boxes, QrCode, CreditCard, ArrowUpRight,
  CheckCircle2, Clock, Filter, ShoppingCart
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Period = 'day' | 'week' | 'month' | 'year';

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('month');
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    paidCuotas: 0,
    pendingCuotas: 0,
    revenue: 0,
    dailyRevenue: 0,
    weeklyRevenue: 0,
    newMembers: 0,
    todayAttendance: 0,
    popularPlans: [] as any[],
    upcomingExpirations: [] as any[],
    expiredPayments: [] as any[],
    revenueChart: [] as number[],
    aiInsights: [] as string[]
  });

  const fetchData = async () => {
    const supabase = createClient();
    const now = new Date();

    // Calcular rangos de tiempo
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();

    try {
      // 1. Miembros (Totales, Activos, Inactivos)
      const { data: members } = await supabase.from("members").select("status, created_at");
      const total = members?.length || 0;
      const active = members?.filter(m => m.status === 'active').length || 0;
      const inactive = total - active;
      const newThisMonth = members?.filter(m => new Date(m.created_at) >= new Date(startOfMonth)).length || 0;

      // 2. Pagos (Ingresos por periodos)
      const { data: payments } = await supabase.from("payments").select("*");
      const dailyRev = payments?.filter(p => p.paid_at >= startOfToday).reduce((acc, p) => acc + Number(p.amount), 0) || 0;
      const weeklyRev = payments?.filter(p => p.paid_at >= startOfWeek).reduce((acc, p) => acc + Number(p.amount), 0) || 0;
      const monthlyRev = payments?.filter(p => p.paid_at >= startOfMonth).reduce((acc, p) => acc + Number(p.amount), 0) || 0;

      const paidCount = payments?.filter(p => p.status === 'paid').length || 0;
      const pendingCount = (payments?.length || 0) - paidCount;

      // 3. Asistencia hoy
      const { count: attendanceToday } = await supabase
        .from("attendance_logs")
        .select("*", { count: 'exact', head: true })
        .gte("checked_in_at", startOfToday);

      // 4. Planes más populares
      const { data: plansData } = await supabase.from("members").select("plans(name)");
      const planCounts: any = {};
      plansData?.forEach(p => {
        const name = p.plans?.name || "Sin Plan";
        planCounts[name] = (planCounts[name] || 0) + 1;
      });
      const popular = Object.entries(planCounts).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count).slice(0, 3);

      // 5. Próximos Vencimientos y Pagos Vencidos
      const todayISO = new Date().toISOString();
      const { data: upcoming } = await supabase
        .from("payments")
        .select("next_due_date, members(full_name)")
        .gte("next_due_date", todayISO)
        .order("next_due_date", { ascending: true })
        .limit(5);

      const { data: expired } = await supabase
        .from("payments")
        .select("next_due_date, members(full_name), amount")
        .lt("next_due_date", todayISO)
        .neq("status", "paid")
        .limit(5);

      // 6. Chart Data (Ingresos últimos 7 días o meses)
      const chartData = Array(7).fill(0); // Demo simplificada

      // 7. AI Insights
      const insights = [];
      if (attendanceToday && attendanceToday > 0) insights.push(`¡Hoy ingresaron ${attendanceToday} miembros al coliseo!`);
      if (pendingCount > 0) insights.push(`Atención: Hay ${pendingCount} pagos pendientes de cobro.`);
      if (expired && expired.length > 0) insights.push(`Tienes ${expired.length} tributos vencidos que requieren acción.`);

      setStats({
        totalMembers: total,
        activeMembers: active,
        inactiveMembers: inactive,
        paidCuotas: paidCount,
        pendingCuotas: pendingCount,
        revenue: monthlyRev,
        dailyRevenue: dailyRev,
        weeklyRevenue: weeklyRev,
        newMembers: newThisMonth,
        todayAttendance: attendanceToday || 0,
        popularPlans: popular,
        upcomingExpirations: upcoming || [],
        expiredPayments: expired || [],
        revenueChart: [40, 65, 45, 90, 55, 80, 70], // Datos simulados para el gráfico visual
        aiInsights: insights
      });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    const supabase = createClient();
    // Suscripción Real-time
    const channel = supabase.channel("dashboard-master")
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "members" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance_logs" }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Cargando Inteligencia Secutor...</p>
    </div>
  );

  return (
    <div className="space-y-10 pb-24">
      {/* SECCIÓN 1: CABECERA & ACCESOS RÁPIDOS */}
      <section className="relative overflow-hidden rounded-[3.5rem] border border-primary/20 bg-card/30 p-10 shadow-2xl backdrop-blur-3xl border-b-[12px] border-b-primary/40">
        <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <Badge className="bg-primary/10 text-primary border-primary/20 font-black px-4 py-1 uppercase tracking-[0.3em] text-[9px]">SaaS Master Dashboard v3.0</Badge>
            <h1 className="text-7xl font-black uppercase italic tracking-tighter text-foreground leading-[0.8]">SECUTOR<br/><span className="text-primary underline decoration-8 underline-offset-4">ARENA</span></h1>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2 text-muted-foreground font-black uppercase text-[10px] tracking-widest italic">
                 <Clock className="h-4 w-4 text-primary" /> Hoy: {new Date().toLocaleDateString()}
               </div>
               <div className="h-4 w-px bg-border" />
               <div className="flex items-center gap-2 text-green-500 font-black uppercase text-[10px] tracking-widest italic animate-pulse">
                 <CheckCircle2 className="h-4 w-4" /> Sistema Online
               </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap lg:justify-end">
            <QuickAction href="/members" icon={Plus} label="Socio" />
            <QuickAction href="/payments" icon={CreditCard} label="Cobrar" />
            <QuickAction href="/plans" icon={CalendarDays} label="Rango" />
            <QuickAction href="/access" icon={QrCode} label="Escanear" primary />
          </div>
        </div>
        <div className="absolute -right-20 -top-20 opacity-5 rotate-12"><Shield size={400} /></div>
      </section>

      {/* SECCIÓN 2: KPIs INTERACTIVOS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Miembros"
          value={stats.activeMembers}
          sub={`Total: ${stats.totalMembers}`}
          icon={Users}
          color="#3b82f6"
          onClick={() => {}}
        />
        <KPICard
          label="Caja Mes"
          value={`$${new Intl.NumberFormat("es-AR").format(stats.revenue)}`}
          sub={`Hoy: $${new Intl.NumberFormat("es-AR").format(stats.dailyRevenue)}`}
          icon={Banknote}
          color="#10b981"
          onClick={() => {}}
        />
        <KPICard
          label="Asistencia"
          value={stats.todayAttendance}
          sub="Personas hoy"
          icon={Activity}
          color="#6366f1"
          onClick={() => {}}
        />
        <KPICard
          label="Tributos"
          value={stats.pendingCuotas}
          sub="Pagos pendientes"
          icon={AlertCircle}
          color="#f59e0b"
          status={stats.pendingCuotas > 0 ? "warning" : "success"}
          onClick={() => {}}
        />
      </div>

      {/* SECCIÓN 3: GRÁFICO & INTELIGENCIA */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.5fr]">
        <div className="group rounded-[3rem] border border-white/5 bg-card/40 p-10 shadow-lg backdrop-blur-xl transition-all hover:border-primary/20">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-2xl font-black uppercase italic italic tracking-tighter flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-primary" /> Rendimiento de Caja
              </h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">Flujo financiero en tiempo real</p>
            </div>
            <div className="flex bg-muted/20 p-1 rounded-xl border border-white/5">
              {(['day', 'week', 'month', 'year'] as Period[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all",
                    period === p ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p === 'day' ? 'Hoy' : p === 'week' ? 'Sem' : p === 'month' ? 'Mes' : 'Año'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex h-72 items-end gap-3 px-4">
            {stats.revenueChart.map((h, i) => (
              <div key={i} className="group relative flex-1 flex flex-col items-center gap-4">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  className={cn(
                    "w-full rounded-t-2xl transition-all duration-700",
                    i === stats.revenueChart.length - 1 ? "bg-primary shadow-[0_0_40px_rgba(var(--primary),0.4)]" : "bg-primary/20 group-hover:bg-primary/40"
                  )}
                />
                <div className="h-1 w-full bg-border rounded-full opacity-20" />
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-center justify-center gap-8 border-t border-dashed pt-8">
             <ChartLegend label="Ingresos" color="hsl(var(--primary))" />
             <ChartLegend label="Meta" color="rgba(255,255,255,0.1)" />
          </div>
        </div>

        <div className="rounded-[3rem] border border-primary/20 bg-primary/5 p-8 shadow-2xl flex flex-col border-r-8 border-r-primary">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-xl font-black uppercase italic text-primary tracking-tighter">AI Core</h2>
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <div className="space-y-6 flex-1">
            {stats.aiInsights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative flex gap-4 p-5 rounded-2xl bg-card/60 border border-white/5 hover:border-primary/30 transition-all shadow-sm"
              >
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0 shadow-[0_0_10px_rgba(var(--primary),1)]" />
                <p className="text-[11px] font-bold leading-relaxed uppercase italic text-foreground/80">{insight}</p>
                <ArrowUpRight className="absolute top-2 right-2 h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-all" />
              </motion.div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-6 font-black text-[9px] uppercase tracking-widest text-primary border border-primary/10 h-10 hover:bg-primary/5">Consultar Oráculo</Button>
        </div>
      </div>

      {/* SECCIÓN 4: DETALLES CRÍTICOS */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* VENCIMIENTOS */}
        <DetailPanel title="Cobros Inminentes" icon={CalendarDays} color="hsl(var(--warning))">
          {stats.upcomingExpirations.length === 0 ? <EmptyDetail /> : stats.upcomingExpirations.map((exp, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/10 border border-white/5 hover:bg-muted/20 transition-all">
              <div>
                <p className="text-xs font-black uppercase truncate max-w-[140px]">{exp.members?.full_name}</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase italic tracking-tighter">Vence en {Math.ceil((new Date(exp.next_due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} días</p>
              </div>
              <Badge variant="outline" className="text-[9px] font-black border-warning/30 text-warning">{new Date(exp.next_due_date).toLocaleDateString()}</Badge>
            </div>
          ))}
        </DetailPanel>

        {/* PAGOS VENCIDOS */}
        <DetailPanel title="Tributos Vencidos" icon={AlertCircle} color="#ef4444">
          {stats.expiredPayments.length === 0 ? <EmptyDetail /> : stats.expiredPayments.map((exp, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all">
              <div>
                <p className="text-xs font-black uppercase truncate max-w-[140px]">{exp.members?.full_name}</p>
                <p className="text-[10px] font-black text-red-500 italic">${new Intl.NumberFormat("es-AR").format(exp.amount)}</p>
              </div>
              <Button size="icon" className="h-8 w-8 rounded-lg bg-red-500 shadow-lg shadow-red-500/20"><CreditCard className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
        </DetailPanel>

        {/* POPULARIDAD */}
        <DetailPanel title="Rangos Populares" icon={Zap} color="hsl(var(--primary))">
           {stats.popularPlans.map((p, i) => (
             <div key={i} className="space-y-2">
               <div className="flex justify-between text-[10px] font-black uppercase">
                 <span>{p.name}</span>
                 <span className="text-primary italic">{Math.round((p.count / stats.totalMembers) * 100) || 0}%</span>
               </div>
               <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden border border-white/5 shadow-inner">
                 <motion.div
                   initial={{ width: 0 }}
                   animate={{ width: `${(p.count / stats.totalMembers) * 100}%` }}
                   className="h-full bg-primary"
                 />
               </div>
             </div>
           ))}
        </DetailPanel>
      </div>
    </div>
  );
}

function QuickAction({ href, icon: Icon, label, primary }: any) {
  return (
    <Link href={href}>
      <button className={cn(
        "flex items-center gap-3 px-6 py-4 rounded-2xl font-black uppercase italic tracking-widest text-[11px] transition-all active:scale-95 shadow-xl",
        primary
          ? "bg-primary text-white shadow-primary/20 hover:scale-105"
          : "bg-white/5 border border-white/10 text-foreground hover:bg-white/10"
      )}>
        <Icon className={cn("h-4 w-4", primary ? "text-white" : "text-primary")} /> {label}
      </button>
    </Link>
  );
}

function KPICard({ label, value, sub, icon: Icon, color, status }: any) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="rounded-[2.5rem] border border-white/5 bg-card/40 p-8 shadow-lg backdrop-blur-xl border-l-8 transition-all relative overflow-hidden"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
        <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center bg-white/5", status === 'warning' && "animate-pulse bg-warning/10")}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      </div>
      <p className="text-4xl font-black tracking-tighter italic text-foreground leading-none">{value}</p>
      <p className="mt-3 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{sub}</p>
      <div className="absolute right-[-10px] bottom-[-10px] opacity-[0.03] rotate-[-15deg]"><Icon size={80} /></div>
    </motion.div>
  );
}

function DetailPanel({ title, icon: Icon, color, children }: any) {
  return (
    <div className="rounded-[2.5rem] border border-white/5 bg-card/40 p-8 shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-white/5 shadow-inner">
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <h2 className="text-sm font-black uppercase tracking-widest italic">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function ChartLegend({ label, color }: any) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">{label}</span>
    </div>
  );
}

function EmptyDetail() {
  return <p className="text-[10px] italic text-muted-foreground py-10 text-center uppercase tracking-widest font-bold">Todo en orden por aquí</p>;
}
