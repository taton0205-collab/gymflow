"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock, FileDown, Plus, Sparkles, Loader2, Cake, TrendingUp, Users, Banknote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const attendanceBars = [35, 28, 44, 52, 67, 81, 88, 74, 49, 31, 22, 18, 25, 30, 45, 50];

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

      const { data: expirations } = await supabase.from("payments").select("next_due_date, members(full_name), plans(name)").gte("next_due_date", startOfToday).order("next_due_date", { ascending: true }).limit(5);
      const { data: allMembers } = await supabase.from("members").select("full_name, birth_date").not("birth_date", "is", null);
      const bdays = allMembers?.filter(m => new Date(m.birth_date).getDate() === hoy.getDate() && new Date(m.birth_date).getMonth() === hoy.getMonth()) || [];

      setStats({
        activeMembers: activeCount || 0,
        monthlyRevenue: mRevenue,
        dailyRevenue: dRevenue,
        newMembers: newCount || 0,
        revenueByMonth: normalizedRevenue,
        rawAmountsByMonth: rawMonthlyData,
        upcomingExpirations: expirations || [],
        calendarDots: [],
        upcomingBirthdays: bdays,
        aiInsights: ["Caja del mes actualizada.", "Nuevos socios registrados hoy."]
      });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 rounded-2xl border bg-card/40 p-8 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">GymFlow Live</h1>
        <Link href="/members"><Button className="font-bold uppercase text-[10px] tracking-widest h-10 px-6">Nuevo Socio</Button></Link>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Caja Mes" value={`$${new Intl.NumberFormat("es-AR").format(stats.monthlyRevenue)}`} color="#10b981" />
        <MetricCard label="Socios Activos" value={stats.activeMembers} color="#3b82f6" />
        <MetricCard label="Caja Hoy" value={`$${new Intl.NumberFormat("es-AR").format(stats.dailyRevenue)}`} color="#6366f1" />
        <MetricCard label="Nuevos" value={stats.newMembers} color="#f59e0b" />
      </div>

      <div className="rounded-xl border bg-card/40 p-6 backdrop-blur shadow-sm">
        <h2 className="text-sm font-black uppercase italic mb-6">Ingresos Anuales Real</h2>
        <div className="flex h-48 items-end gap-2">
          {stats.revenueByMonth.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <motion.div initial={{height:0}} animate={{height:`${h}%`}} className={cn("w-full rounded-t-sm bg-primary/30", i === new Date().getMonth() && "bg-primary shadow-lg")} />
              <span className="text-[8px] font-bold text-muted-foreground uppercase">{"EFMAMJJASOND"[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, color }: any) {
  return (
    <div className="rounded-xl border bg-card/40 p-4 border-l-4 shadow-sm" style={{ borderLeftColor: color }}>
      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-xl font-black mt-1">{value}</p>
    </div>
  );
}
