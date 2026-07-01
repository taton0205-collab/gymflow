"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Plus, Sparkles, Loader2, TrendingUp, Users, Banknote, Activity, Shield,
  AlertCircle, CalendarDays, Boxes, QrCode, CreditCard, Wallet,
  Zap, ArrowRight, UserPlus, FileText
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
    inactiveMembers: 0,
    revenueMonth: 0,
    revenueToday: 0,
    revenueWeek: 0,
    paidCuotas: 0,
    pendingCuotas: 0,
    todayAttendance: 0,
    lowStockCount: 0,
  });

  const fetchData = async () => {
    const supabase = createClient();
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    try {
      const { data: members } = await supabase.from("members").select("status");
      const total = members?.length || 0;
      const active = members?.filter(m => m.status === 'active').length || 0;

      const { data: payments } = await supabase.from("payments").select("amount, paid_at, status");
      const monthlyRev = payments?.filter(p => p.paid_at >= startOfMonth).reduce((acc, p) => acc + Number(p.amount), 0) || 0;
      const dailyRev = payments?.filter(p => p.paid_at >= startOfToday).reduce((acc, p) => acc + Number(p.amount), 0) || 0;
      const weeklyRev = payments?.filter(p => p.paid_at >= startOfWeek).reduce((acc, p) => acc + Number(p.amount), 0) || 0;

      const paidCount = payments?.filter(p => p.status === 'paid').length || 0;
      const pendingCount = (payments?.length || 0) - paidCount;

      const { count: attendanceToday } = await supabase.from("attendance_logs").select("*", { count: 'exact', head: true }).gte("checked_in_at", startOfToday);
      const { count: stockLow } = await supabase.from("inventory_items").select("*", { count: 'exact', head: true }).lte("stock", 5);

      setStats({
        totalMembers: total,
        activeMembers: active,
        inactiveMembers: total - active,
        revenueMonth: monthlyRev,
        revenueToday: dailyRev,
        revenueWeek: weeklyRev,
        paidCuotas: paidCount,
        pendingCuotas: pendingCount,
        todayAttendance: attendanceToday || 0,
        lowStockCount: stockLow || 0,
      });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div className="flex h-[80vh] items-center justify-center text-primary font-black uppercase tracking-[0.5em] animate-pulse">Sincronizando SECUTOR...</div>;

  return (
    <div className="space-y-10 pb-20">
      {/* HEADER & ACCESOS RÁPIDOS */}
      <section className="relative rounded-[3.5rem] border border-white/5 bg-card/30 p-12 shadow-2xl backdrop-blur-md border-b-8 border-b-primary/30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12">
          <div className="space-y-4">
            <Badge className="bg-primary/10 text-primary border-primary/20 font-black px-4 py-1 uppercase text-[9px] tracking-widest">Panel de Control v4.0</Badge>
            <h1 className="text-7xl font-black uppercase italic tracking-tighter leading-none text-foreground">SECUTOR<br/><span className="text-primary underline decoration-8 underline-offset-4">ARENA</span></h1>
            <p className="text-muted-foreground font-bold uppercase text-sm tracking-widest italic opacity-60">Consola Administrativa de Miembros</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap lg:justify-end">
             <QuickAction href="/members" icon={UserPlus} label="Registrar Miembro" primary />
             <QuickAction href="/payments" icon={Wallet} label="Registrar Pago" />
             <QuickAction href="/access" icon={QrCode} label="Abrir Lector" />
             <QuickAction href="/plans" icon={CalendarDays} label="Crear Plan" />
             <QuickAction href="/inventory" icon={Boxes} label="Nuevo Producto" />
          </div>
        </div>
      </section>

      {/* MÉTRICAS PRINCIPALES */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <DashboardCard label="Ingresos Hoy" value={`$${new Intl.NumberFormat("es-AR").format(stats.revenueToday)}`} sub="Caja diaria" icon={Zap} color="text-yellow-500" href="/payments" />
        <DashboardCard label="Ingresos Mes" value={`$${new Intl.NumberFormat("es-AR").format(stats.revenueMonth)}`} sub="Acumulado" icon={TrendingUp} color="text-green-500" href="/reports" />
        <DashboardCard label="Miembros Activos" value={stats.activeMembers} sub={`Inactivos: ${stats.inactiveMembers}`} icon={Users} color="text-blue-500" href="/members" />
        <DashboardCard label="Pagos Pendientes" value={stats.pendingCuotas} sub="Tributos por cobrar" icon={AlertCircle} color="text-red-500" href="/payments" />
        <DashboardCard label="Ingresos de Hoy" value={stats.todayAttendance} sub="Miembros entraron hoy" icon={Activity} color="text-primary" href="/access/history" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.5fr]">
         <div className="rounded-[3rem] border bg-card/40 p-10 border-t-2 border-t-primary/10 backdrop-blur-md">
            <h2 className="text-xl font-black uppercase italic tracking-tighter mb-10 flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-primary" /> Rendimiento de Caja
            </h2>
            <div className="flex h-64 items-end gap-3 px-4">
               {[40, 60, 45, 90, 50, 75, 80, 55, 95, 40, 70, 85].map((h, i) => (
                 <div key={i} className="flex-1 bg-primary/20 rounded-t-2xl transition-all hover:bg-primary/40 relative group">
                   <motion.div initial={{height:0}} animate={{height: `${h}%`}} className={cn("w-full bg-primary rounded-t-2xl shadow-[0_0_20px_rgba(var(--primary),0.3)]", i === new Date().getMonth() && "animate-pulse")} />
                 </div>
               ))}
            </div>
            <div className="mt-8 flex justify-center gap-4">
               <Badge variant="outline" className="text-[10px] font-black border-primary/20 text-muted-foreground uppercase">Filtro: Año Actual</Badge>
            </div>
         </div>

         <div className="space-y-4">
            <AlertBox label="Stock Bajo" value={stats.lowStockCount} icon={Boxes} color="text-red-500" href="/inventory" />
            <AlertBox label="Miembros Inactivos" value={stats.inactiveMembers} icon={Users} color="text-gray-500" href="/members" />
            <AlertBox label="Próximos Vencimientos" value="5" icon={CalendarDays} color="text-yellow-500" href="/members" />
         </div>
      </div>
    </div>
  );
}

function QuickAction({ href, icon: Icon, label, primary }: any) {
  return (
    <Link href={href}>
      <button className={cn(
        "h-16 px-6 rounded-2xl font-black uppercase italic tracking-widest text-[10px] transition-all active:scale-95 flex items-center gap-3 shadow-xl",
        primary ? "bg-primary text-primary-foreground hover:scale-105" : "bg-white/5 border border-white/5 text-foreground hover:bg-white/10"
      )}>
        <Icon className={cn("h-4 w-4", primary ? "text-primary-foreground" : "text-primary")} /> {label}
      </button>
    </Link>
  );
}

function DashboardCard({ label, value, sub, icon: Icon, color, href }: any) {
  return (
    <Link href={href}>
      <div className="rounded-[2.5rem] border border-white/5 bg-card/40 p-8 shadow-lg transition-all hover:scale-[1.05] hover:border-primary/20 cursor-pointer h-full">
        <div className="flex items-center justify-between mb-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
          <Icon className={cn("h-5 w-5", color)} />
        </div>
        <p className="text-3xl font-black italic tracking-tighter text-foreground leading-none">{value}</p>
        <p className="mt-3 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{sub}</p>
      </div>
    </Link>
  );
}

function AlertBox({ label, value, icon: Icon, color, href }: any) {
  return (
    <Link href={href}>
      <div className="rounded-[2rem] border border-white/5 bg-card/40 p-6 flex items-center justify-between shadow-sm transition-all hover:bg-white/5 cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
            <Icon className={cn("h-5 w-5", color)} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-muted-foreground">{label}</p>
            <p className="text-xl font-black italic">{value}</p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground/30" />
      </div>
    </Link>
  );
}
