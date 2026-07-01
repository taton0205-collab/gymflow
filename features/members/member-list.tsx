"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Trash2, Copy, Check, Eye, PencilLine,
  QrCode, RefreshCw, Search, FileSpreadsheet, Dumbbell, UserCircle2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { EditMemberForm } from "./edit-member-form";
import { RenewPlanForm } from "./renew-plan-form";

export function MemberList() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [renewingMember, setRenewingMember] = useState<any | null>(null);
  const [showQR, setShowQR] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchMembers = async () => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*, plans(name), attendance_logs(checked_in_at), payments(next_due_date, status)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (e) {
      console.error("Error al cargar miembros:", e);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatus = (member: any) => {
    if (!member.payments || member.payments.length === 0) {
      return { label: "Sin Pagos", color: "bg-gray-500/10 text-gray-400" };
    }

    const lastPayment = [...member.payments].sort((a: any, b: any) =>
      new Date(b.next_due_date).getTime() - new Date(a.next_due_date).getTime()
    )[0];

    const today = new Date();
    today.setHours(0,0,0,0);
    const dueDate = new Date(lastPayment.next_due_date);
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (dueDate < today) return { label: "Vencido", color: "bg-red-500/10 text-red-500" };
    if (diffDays <= 5) return { label: "Próx. Vencer", color: "bg-yellow-500/10 text-yellow-500" };
    return { label: "Al día", color: "bg-green-500/10 text-green-500" };
  };

  useEffect(() => { fetchMembers(); }, []);

  const filteredMembers = members.filter(m => {
    const name = m.full_name?.toLowerCase() || "";
    const dni = m.dni || "";
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || dni.includes(searchTerm);

    const status = getPaymentStatus(m).label;
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'paid' && status === 'Al día') ||
      (matchesSearch && filterStatus === 'debt' && status === 'Vencido') ||
      (filterStatus === 'warning' && status === 'Próx. Vencer');

    return matchesSearch && matchesStatus;
  });

  const copyToken = (token: string, id: string) => {
    navigator.clipboard.writeText(token);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return <div className="flex justify-center p-32"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-card/40 p-6 rounded-[2rem] border border-white/5">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 w-full rounded-2xl bg-background border border-white/5 pl-12 pr-4 font-bold outline-none"
            placeholder="Buscar..."
          />
        </div>
        <div className="flex flex-wrap gap-2">
           {['all', 'paid', 'debt', 'warning'].map((f) => (
             <button key={f} onClick={() => setFilterStatus(f)} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", filterStatus === f ? "bg-primary text-black" : "bg-white/5 text-muted-foreground")}>
               {f === 'all' ? 'Todos' : f === 'paid' ? 'Al día' : f === 'debt' ? 'Vencidos' : 'Por vencer'}
             </button>
           ))}
        </div>
      </div>

      <div className="rounded-[2.5rem] border bg-card/30 overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/[0.02] text-muted-foreground border-b border-white/5 text-[9px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-8 py-6">Miembro</th>
                <th className="px-8 py-6">Plan</th>
                <th className="px-8 py-6 text-center">Estado</th>
                <th className="px-8 py-6 text-center">Vencimiento</th>
                <th className="px-8 py-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredMembers.map((member) => {
                const status = getPaymentStatus(member);
                const lastPay = member.payments && member.payments.length > 0
                  ? [...member.payments].sort((a:any, b:any) => new Date(b.next_due_date).getTime() - new Date(a.next_due_date).getTime())[0]
                  : null;

                return (
                  <tr key={member.id} className="group hover:bg-white/[0.03] transition-all">
                    <td className="px-8 py-6">
                      <p className="font-black text-base uppercase italic text-foreground">{member.full_name}</p>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">DNI: {member.dni || "S/D"}</p>
                    </td>
                    <td className="px-8 py-6">
                      <Badge tone="info" className="text-[10px] font-black uppercase px-3 py-1 bg-primary/10 text-primary border-none">
                        {member.plans?.name || "Sin Plan"}
                      </Badge>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest", status.color)}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center font-bold text-foreground/80">
                      {lastPay?.next_due_date ? new Date(lastPay.next_due_date).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                         <Link href={`/members/${member.id}`} className="h-10 w-10 bg-background border border-white/5 rounded-xl flex items-center justify-center text-primary shadow-sm hover:scale-110 transition-all"><Eye className="h-4 w-4" /></Link>
                         <button onClick={() => setEditingMember(member)} className="h-10 w-10 bg-background border border-white/5 rounded-xl flex items-center justify-center text-accent hover:scale-110 transition-all"><PencilLine className="h-4 w-4" /></button>
                         <button onClick={() => setRenewingMember(member)} className="h-10 w-10 bg-background border border-white/5 rounded-xl flex items-center justify-center text-green-500 hover:scale-110 transition-all"><RefreshCw className="h-4 w-4" /></button>
                         <button onClick={() => setShowQR(member)} className="h-10 w-10 bg-background border border-white/5 rounded-xl flex items-center justify-center text-foreground hover:scale-110 transition-all"><QrCode className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showQR && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
           <div className="w-full max-w-sm rounded-[3rem] bg-card border-4 border-primary/30 p-10 text-center space-y-6">
              <h3 className="text-xl font-black uppercase italic text-foreground">{showQR.full_name}</h3>
              <div className="bg-white p-4 rounded-3xl inline-block mx-auto border-4 border-primary/20">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${showQR.qr_token}`} alt="QR" />
              </div>
              <Button onClick={() => setShowQR(null)} className="w-full h-12 font-black uppercase">Cerrar</Button>
           </div>
        </div>
      )}

      {editingMember && <EditMemberForm member={editingMember} onUpdate={fetchMembers} onClose={() => setEditingMember(null)} />}
      {renewingMember && <RenewPlanForm member={renewingMember} onUpdate={fetchMembers} onClose={() => setRenewingMember(null)} />}
    </div>
  );
}
