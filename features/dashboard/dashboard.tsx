"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    revenue: 0,
    dailyRevenue: 0,
    todayAttendance: 0,
    pendingCuotas: 0,
    popularPlans: [] as any[],
    upcomingExpirations: [] as any[],
    expiredPayments: [] as any[],
    aiInsights: [] as string[]
  });

  const fetchData = async () => {
    const supabase = createClient();
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    try {
      // Miembros
      const { data: members } = await supabase.from("members").select("status");
      const total = members?.length || 0;
      const active = members?.filter(m => m.status === 'active').length || 0;

      // Pagos
      const { data: payments } = await supabase.from("payments").select("amount, paid_at, status, next_due_date, members(full_name)");
      const monthlyRev = payments?.filter(p => p.paid_at >= startOfMonth).reduce((acc, p) => acc + Number(p.amount), 0) || 0;
      const dailyRev = payments?.filter(p => p.paid_at >= startOfToday).reduce((acc, p) => acc + Number(p.amount), 0) || 0;
      const pendingCount = payments?.filter(p => p.status !== 'paid').length || 0;

      // Asistencia
      const { count: attendanceToday } = await supabase.from("attendance_logs").select("*", { count: 'exact', head: true }).gte("checked_in_at", startOfToday);

      // Vencimientos y Expirados
      const todayISO = new Date().toISOString();
      const upcoming = payments?.filter(p => p.next_due_date >= todayISO).sort((a,b) => a.next_due_date.localeCompare(b.next_due_date)).slice(0, 5) || [];
      const expired = payments?.filter(p => p.next_due_date < todayISO && p.status !== 'paid').slice(0, 5) || [];

      // AI Insights
      const insights = [];
      if (attendanceToday && attendanceToday > 0) insights.push(`Hoy ingresaron ${attendanceToday} miembros.`);
      if (pendingCount > 0) insights.push(`Hay ${pendingCount} cobros pendientes.`);
      if (expired.length > 0) insights.push(`Atención: Tienes ${expired.length} tributos vencidos.`);

      setStats({
        totalMembers: total,
        activeMembers: active,
        revenue: monthlyRev,
        dailyRevenue: dailyRev,
        todayAttendance: attendanceToday || 0,
        pendingCuotas: pendingCount,
        popularPlans: [],
        upcomingExpirations: upcoming,
        expiredPayments: expired,
        aiInsights: insights.length > 0 ? insights : ["Analizando datos..."]
      });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    const supabase = createClient();
    const channel = supabase.channel("db-sync").on("postgres_changes", { event: "*", schema: "public" }, () => fetchData()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading) return <div className="flex h-[80vh] items-center justify-center text-primary animate-pulse font-black uppercase tracking-widest text-xs">Sincronizando Secutor...</div>;

  return (
    <div className="space-y-8 pb-20">
      {/* Header Minimalista */}
      <section className="rounded-[3rem] border border-primary/20 bg-card/40 p-10 shadow-2xl backdrop-blur-md border-b-[8px] border-b-primary/30">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge className="bg-primary/10 text-primary border-primary/20 font-black mb-4">DASHBOARD V3.0</Badge>
            <h1 className="text-6xl font-black uppercase italic tracking-tighter">SECUTOR<br/><span className="text-primary">ARENA</span></h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/members"><Button className="h-14 px-8 font-black uppercase text-xs italic bg-primary shadow-lg shadow-primary/20">NUEVO SOCIO</Button></Link>
            <Link href="/access"><Button variant="outline" className="h-14 px-8 font-black uppercase text-xs italic border-2">ABRIR ESCÁNER</Button></Link>
          </div>
        </div>
      </section>

      {/* KPI Reales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Activos" value={stats.activeMembers} sub={`Total: ${stats.totalMembers}`} icon={Users} color="hsl(var(--primary))" />
        <KPICard label="Caja Mes" value={`$${new Intl.NumberFormat("es-AR").format(stats.revenue)}`} sub={`Hoy: $${new Intl.NumberFormat("es-AR").format(stats.dailyRevenue)}`} icon={Banknote} color="#10b981" />
        <KPICard label="Asistencia" value={stats.todayAttendance} sub="Personas hoy" icon={Activity} color="#6366f1" />
        <KPICard label="Pendientes" value={stats.pendingCuotas} sub="Tributos a cobrar" icon={AlertCircle} color="#f59e0b" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* IA Advisor */}
        <div className="rounded-[2.5rem] border border-primary/20 bg-primary/5 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black uppercase italic text-primary tracking-tighter">AI Advisor</h2>
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <div className="space-y-4">
            {stats.aiInsights.map((ins, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-card border border-white/5 shadow-sm">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <p className="text-[11px] font-bold uppercase italic text-foreground/80">{ins}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Vencimientos */}
        <div className="rounded-[2.5rem] border border-white/5 bg-card/40 p-8 shadow-sm">
          <h2 className="text-xl font-black uppercase italic tracking-tighter mb-8">Vencimientos</h2>
          <div className="space-y-3">
            {stats.upcomingExpirations.length === 0 ? <p className="text-xs italic text-muted-foreground">Todo al día.</p> : stats.upcomingExpirations.map((exp, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/10 border border-white/5">
                <span className="text-xs font-black uppercase truncate max-w-[150px]">{exp.members?.full_name}</span>
                <span className="text-[10px] font-bold text-primary">{new Date(exp.next_due_date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, sub, icon: Icon, color }: any) {
  return (
    <div className="rounded-[2.5rem] border border-white/5 bg-card/40 p-8 shadow-lg border-l-8 transition-all hover:scale-[1.02]" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between mb-4 text-muted-foreground">
        <p className="text-[10px] font-black uppercase tracking-widest">{label}</p>
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <p className="text-4xl font-black italic">{value}</p>
      <p className="text-[9px] font-bold text-muted-foreground uppercase mt-2">{sub}</p>
    </div>
  );
}
