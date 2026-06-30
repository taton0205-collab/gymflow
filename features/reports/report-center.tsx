"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Table, BarChart3, TrendingUp, Users, Wallet } from "lucide-react";

export function ReportCenter() {
  const [loading, setLoading] = useState<string | null>(null);

  const exportMembers = async () => {
    setLoading("members");
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("members")
        .select("full_name, dni, phone, birth_date, status, created_at");

      if (error) throw error;
      downloadCSV(data || [], "socios-gymflow.csv");
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(null);
    }
  };

  const exportPayments = async () => {
    setLoading("payments");
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("payments")
        .select("amount, method, status, paid_at, members(full_name)");

      if (error) throw error;

      const flattenedData = (data || []).map((p: any) => ({
        Fecha: p.paid_at ? new Date(p.paid_at).toLocaleDateString() : "N/A",
        Socio: Array.isArray(p.members) ? p.members[0]?.full_name : p.members?.full_name || "Desconocido",
        Monto: p.amount,
        Metodo: p.method,
        Estado: p.status
      }));

      downloadCSV(flattenedData, "pagos-gymflow.csv");
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(null);
    }
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) return alert("No hay datos");
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(obj => Object.values(obj).map(val => `"${val}"`).join(",")).join("\n");
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid gap-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Consolidado de Socios" icon={Users} label="Socios" onAction={exportMembers} isLoading={loading === "members"} />
        <SummaryCard title="Flujo de Caja" icon={Wallet} label="Pagos" onAction={exportPayments} isLoading={loading === "payments"} />
        <SummaryCard title="Inventario" icon={Table} label="Stock" onAction={() => {}} disabled />
        <SummaryCard title="Métricas" icon={TrendingUp} label="KPIs" onAction={() => {}} disabled />
      </div>
      <div className="rounded-3xl border bg-card/40 p-12 text-center space-y-4">
        <BarChart3 className="h-12 w-12 text-primary mx-auto" />
        <h2 className="text-xl font-black uppercase italic">Analytics Ready</h2>
      </div>
    </div>
  );
}

function SummaryCard({ title, icon: Icon, label, onAction, isLoading, disabled }: any) {
  return (
    <div className="rounded-2xl border bg-card p-6 flex flex-col justify-between border-b-4 border-b-primary/20">
      <div className="flex items-center gap-3 mb-6">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-[10px] font-black uppercase tracking-widest">{title}</h3>
      </div>
      <Button onClick={onAction} disabled={isLoading || disabled} className="w-full font-black text-[10px] uppercase h-10">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : `Exportar ${label}`}
      </Button>
    </div>
  );
}
