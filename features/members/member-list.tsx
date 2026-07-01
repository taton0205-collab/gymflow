"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Trash2, Copy, Check, Eye, PencilLine,
  QrCode, RefreshCw, Search, Filter, FileSpreadsheet, Dumbbell
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

  const fetchMembers = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("members")
      .select("*, plans(name), attendance_logs(checked_in_at), payments(next_due_date, status)")
      .order("created_at", { ascending: false });

    if (!error) setMembers(data || []);
    setLoading(false);
  };

  const getPaymentStatus = (member: any) => {
    const lastPayment = member.payments?.sort((a: any, b: any) =>
      new Date(b.next_due_date).getTime() - new Date(a.next_due_date).getTime()
    )[0];

    if (!lastPayment) return { label: "Inactivo", color: "bg-gray-500/10 text-gray-400" };

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
    const matchesSearch = m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || m.dni?.includes(searchTerm);
    const status = getPaymentStatus(m).label;
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'paid' && status === 'Al día') ||
      (filterStatus === 'debt' && status === 'Vencido') ||
      (filterStatus === 'warning' && status === 'Próx. Vencer') ||
      (filterStatus === 'inactive' && status === 'Inactivo');

    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="flex justify-center p-32"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      {/* Filtros y Buscador */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-card/40 p-6 rounded-[2rem] border border-white/5 backdrop-blur-md">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 w-full rounded-2xl bg-background border border-white/5 pl-12 pr-4 font-bold outline-none focus:border-primary/50 transition-all"
            placeholder="Buscar miembro o DNI..."
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          <FilterButton active={filterStatus === 'all'} onClick={() => setFilterStatus('all')} label="Todos" />
          <FilterButton active={filterStatus === 'paid'} onClick={() => setFilterStatus('paid')} label="Al día" color="text-green-500" />
          <FilterButton active={filterStatus === 'debt'} onClick={() => setFilterStatus('debt')} label="Con deuda" color="text-red-500" />
          <FilterButton active={filterStatus === 'warning'} onClick={() => setFilterStatus('warning')} label="Próx. Vencer" color="text-yellow-500" />
        </div>

        <Button variant="outline" className="h-12 px-6 rounded-2xl border-white/10 font-black uppercase text-[10px] tracking-widest gap-2">
          <FileSpreadsheet className="h-4 w-4" /> Exportar Excel
        </Button>
      </div>

      {/* Tabla de Miembros Pro */}
      <div className="rounded-[2.5rem] border bg-card/30 overflow-hidden shadow-2xl backdrop-blur-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/[0.02] text-muted-foreground border-b border-white/5 text-[10px] font-black uppercase tracking-widest">
            <tr>
              <th className="px-8 py-6">Miembro / Identidad</th>
              <th className="px-8 py-6">Plan Contratado</th>
              <th className="px-8 py-6 text-center">Estado de Pago</th>
              <th className="px-8 py-6 text-center">Vencimiento</th>
              <th className="px-8 py-6 text-center">Último Acceso</th>
              <th className="px-8 py-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredMembers.map((member) => {
              const status = getPaymentStatus(member);
              const lastAccess = member.attendance_logs?.sort((a:any, b:any) => new Date(b.checked_in_at).getTime() - new Date(a.checked_in_at).getTime())[0];
              const lastPay = member.payments?.sort((a:any, b:any) => new Date(b.next_due_date).getTime() - new Date(a.next_due_date).getTime())[0];

              return (
                <tr key={member.id} className="group hover:bg-white/[0.03] transition-all">
                  <td className="px-8 py-6">
                    <p className="font-black text-base uppercase italic tracking-tight text-foreground">{member.full_name}</p>
                    <div className="flex gap-3 mt-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <span>DNI: {member.dni || "S/D"}</span>
                      {member.phone && <span className="opacity-40">• {member.phone}</span>}
                    </div>
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
                    {lastPay?.next_due_date ? new Date(lastPay.next_due_date).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-8 py-6 text-center text-muted-foreground font-medium">
                    {lastAccess ? new Date(lastAccess.checked_in_at).toLocaleDateString() : "Nunca"}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <ActionButton icon={Eye} title="Perfil" href={`/members/${member.id}`} />
                       <ActionButton icon={PencilLine} title="Editar" onClick={() => setEditingMember(member)} />
                       <ActionButton icon={RefreshCw} title="Renovar/Pagar" color="text-green-500" onClick={() => setRenewingMember(member)} />
                       <ActionButton icon={QrCode} title="QR" onClick={() => setShowQR(member)} />
                       <ActionButton icon={Dumbbell} title="Rutina" color="text-primary" />
                       <ActionButton icon={Trash2} title="Eliminar" color="text-red-500" onClick={() => { if(confirm(`¿Borrar a ${member.full_name}?`)) {} }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingMember && <EditMemberForm member={editingMember} onUpdate={fetchMembers} onClose={() => setEditingMember(null)} />}
      {renewingMember && <RenewPlanForm member={renewingMember} onUpdate={fetchMembers} onClose={() => setRenewingMember(null)} />}
    </div>
  );
}

function FilterButton({ active, onClick, label, color }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
        active ? "bg-primary text-primary-foreground shadow-lg" : cn("bg-white/5 text-muted-foreground hover:bg-white/10", color)
      )}
    >
      {label}
    </button>
  );
}

function ActionButton({ icon: Icon, title, onClick, href, color }: any) {
  const content = (
    <button
      onClick={onClick}
      className={cn("h-10 w-10 bg-background border border-white/5 rounded-xl flex items-center justify-center shadow-sm hover:shadow-xl hover:scale-110 transition-all", color)}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
  if (href) return <Link href={href as any}>{content}</Link>;
  return content;
}
