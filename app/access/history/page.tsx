"use client";

import { useEffect, useState } from "react";
import { ProductShell } from "@/components/product-shell";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Loader2, History, User, Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AttendanceHistoryPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("attendance_logs")
      .select("*, members(full_name, plans(name))")
      .order("checked_in_at", { ascending: false })
      .limit(50);

    if (!error) setLogs(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
    const supabase = createClient();
    const channel = supabase.channel("access-logs-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "attendance_logs" }, () => fetchLogs())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <ProductShell>
      <div className="space-y-8">
        <section className="flex flex-col gap-6 rounded-[2.5rem] border bg-card/30 p-10 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between border-t-2 border-t-primary/10">
          <div>
            <Badge tone="info" className="px-4 py-1 font-black uppercase tracking-widest text-[9px]">Bitácora de Acceso</Badge>
            <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase italic mt-4">Cronología Arena</h1>
            <p className="mt-2 text-muted-foreground font-medium italic">Historial de entradas y validaciones en tiempo real.</p>
          </div>
          <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center border-2 border-primary/20">
            <History className="h-8 w-8 text-primary" />
          </div>
        </section>

        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="rounded-[2.5rem] border bg-card/40 overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground border-b text-[9px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-6 text-foreground">Gladiador / Guerrero</th>
                  <th className="px-8 py-6 text-foreground">Fecha y Hora</th>
                  <th className="px-8 py-6 text-foreground">Resultado</th>
                  <th className="px-8 py-6 text-foreground text-right">Método</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => {
                  const isSuccess = log.source === 'qr_success' || log.source === 'qr';
                  return (
                    <tr key={log.id} className="group hover:bg-muted/30 transition-all">
                      <td className="px-8 py-6">
                        <p className="font-black text-base uppercase italic tracking-tight">{log.members?.full_name}</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase mt-0.5 tracking-tighter">Plan: {log.members?.plans?.name || "Sin Plan"}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 font-bold text-foreground">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          {new Date(log.checked_in_at).toLocaleDateString()} • {new Date(log.checked_in_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                          isSuccess ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                        )}>
                          {isSuccess ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {isSuccess ? "Autorizado" : "Denegado"}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <span className="text-[10px] font-black text-muted-foreground uppercase opacity-50 italic">Digital Scanner</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProductShell>
  );
}
