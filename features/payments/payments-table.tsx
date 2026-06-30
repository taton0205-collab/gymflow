"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Filter, Download, FileText, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export function PaymentsTable() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPayments = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("payments")
      .select("*, members(full_name), plans(name)")
      .order("paid_at", { ascending: false });

    if (!error) setPayments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
    const supabase = createClient();
    const channel = supabase.channel("realtime-payments").on("postgres_changes", { event: "*", schema: "public", table: "payments" }, () => fetchPayments()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filteredPayments = payments.filter(p =>
    p.members?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      {/* Controles de Tabla */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full rounded-lg border bg-card pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Buscar por socio o método..."
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-bold hover:bg-muted transition-colors">
            <Filter className="h-4 w-4" /> Filtros
          </button>
          <button className="flex items-center gap-2 rounded-lg border bg-primary text-primary-foreground px-4 py-2 text-sm font-bold hover:opacity-90 transition-colors">
            <Download className="h-4 w-4" /> Exportar
          </button>
        </div>
      </div>

      {/* Tabla Estilo Stripe */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground border-b">
            <tr>
              <th className="px-6 py-4">Fecha / ID</th>
              <th className="px-6 py-4">Socio</th>
              <th className="px-6 py-4">Membresía</th>
              <th className="px-6 py-4">Monto</th>
              <th className="px-6 py-4">Método</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredPayments.map((payment) => (
              <tr key={payment.id} className="group hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-foreground">{new Date(payment.paid_at).toLocaleDateString()}</p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5 uppercase">{payment.id.substring(0, 8)}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="font-bold">{payment.members?.full_name}</span>
                </td>
                <td className="px-6 py-4">
                  <Badge tone="neutral" className="bg-muted text-muted-foreground border-none font-bold text-[10px]">
                    {payment.plans?.name || "Cargo extra"}
                  </Badge>
                </td>
                <td className="px-6 py-4 font-black text-foreground">
                  ${new Intl.NumberFormat("es-AR").format(payment.amount)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 capitalize font-medium">
                    <span className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      payment.method === 'cash' ? "bg-green-500" : "bg-blue-500"
                    )} />
                    {payment.method.replace('_', ' ')}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge tone={payment.status === 'paid' ? 'success' : 'warning'} className="font-black uppercase text-[9px]">
                    {payment.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-muted rounded-md transition-colors">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPayments.length === 0 && (
          <div className="p-20 text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No se encontraron pagos con esos criterios.</p>
          </div>
        )}
      </div>
    </div>
  );
}
