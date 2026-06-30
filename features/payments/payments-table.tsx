"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, FileText } from "lucide-react";

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
  }, []);

  const filtered = payments.filter((p: any) => {
    const name = Array.isArray(p.members) ? p.members[0]?.full_name : p.members?.full_name;
    return (name || "").toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="h-10 w-full rounded-lg border bg-card pl-10 pr-4 text-sm outline-none" placeholder="Buscar socio..." />
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-[9px] font-black uppercase tracking-widest text-muted-foreground border-b">
            <tr>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Socio</th>
              <th className="px-6 py-4">Monto</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Ficha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((payment) => {
              const memberName = Array.isArray(payment.members) ? payment.members[0]?.full_name : payment.members?.full_name;
              return (
                <tr key={payment.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4 font-bold">{new Date(payment.paid_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-bold">{memberName || "N/A"}</td>
                  <td className="px-6 py-4 font-black text-foreground">${new Intl.NumberFormat("es-AR").format(payment.amount)}</td>
                  <td className="px-6 py-4"><Badge tone="success" className="text-[8px] uppercase">{payment.status}</Badge></td>
                  <td className="px-6 py-4 text-right"><FileText className="h-4 w-4 text-muted-foreground ml-auto" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
