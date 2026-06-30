"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2, Download, Table, BarChart3, TrendingUp, Users, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

      downloadCSV(data, "socios-gymflow.csv");
    } catch (error: any) {
      alert("Error al exportar: " + error.message);
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

      const flattenedData = data.map(p => ({
        Fecha: new Date(p.paid_at).toLocaleDateString(),
        Socio: p.members?.full_name || "Desconocido",
        Monto: p.amount,
        Metodo: p.method,
        Estado: p.status
      }));

      downloadCSV(flattenedData, "pagos-gymflow.csv");
    } catch (error: any) {
      alert("Error al exportar: " + error.message);
    } finally {
      setLoading(null);
    }
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) return alert("No hay datos para exportar");

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(obj =>
      Object.values(obj).map(val => `"${val}"`).join(",")
    ).join("\n");

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
      {/* Tarjetas de Resumen */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Consolidado de Socios"
          description="Exporta el padrón completo de miembros registrados."
          icon={Users}
          buttonLabel="Bajar CSV"
          onAction={exportMembers}
          isLoading={loading === "members"}
        />
        <SummaryCard
          title="Flujo de Caja"
          description="Detalle de todos los cobros y métodos de pago."
          icon={Wallet}
          buttonLabel="Bajar CSV"
          onAction={exportPayments}
          isLoading={loading === "payments"}
          tone="success"
        />
        <SummaryCard
          title="Stock e Insumos"
          description="Inventario valorizado y alertas de reposición."
          icon={Table}
          buttonLabel="Próximamente"
          onAction={() => {}}
          disabled
        />
        <SummaryCard
          title="Métricas de Crecimiento"
          description="Análisis de retención y nuevos suscriptores."
          icon={TrendingUp}
          buttonLabel="Próximamente"
          onAction={() => {}}
          disabled
        />
      </div>

      <div className="rounded-[2rem] border bg-card/40 p-12 text-center space-y-6">
        <div className="h-20 w-20 bg-primary/10 rounded-3xl mx-auto flex items-center justify-center">
          <BarChart3 className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Reporte Inteligente</h2>
          <p className="max-w-md mx-auto text-muted-foreground font-medium mt-2 uppercase text-[10px] tracking-widest">
            Toda tu información está protegida y lista para ser procesada por herramientas externas como Excel o Google Sheets.
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, description, icon: Icon, buttonLabel, onAction, isLoading, tone, disabled }: any) {
  return (
    <div className="rounded-2xl border bg-card/50 p-6 flex flex-col justify-between hover:shadow-xl transition-all border-b-4 border-b-primary/20">
      <div className="space-y-4">
        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-tight">{title}</h3>
          <p className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
      <Button
        onClick={onAction}
        disabled={isLoading || disabled}
        variant={tone === 'success' ? 'secondary' : 'default'}
        className="w-full mt-6 font-black uppercase text-[10px] tracking-widest h-10"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
          <div className="flex items-center gap-2">
            <Download className="h-3 w-3" /> {buttonLabel}
          </div>
        )}
      </Button>
    </div>
  );
}
