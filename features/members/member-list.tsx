"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Copy, Check, Eye, PencilLine, UserCircle2, QrCode, X, RefreshCw } from "lucide-react";
import Link from "next/link";
import { EditMemberForm } from "./edit-member-form";
import { RenewPlanForm } from "./renew-plan-form";

export function MemberList() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [renewingMember, setRenewingMember] = useState<any | null>(null);
  const [showQR, setShowQR] = useState<any | null>(null);

  const fetchMembers = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from("members").select("*, plans(name)").order("created_at", { ascending: false });
    if (!error) setMembers(data || []);
    setLoading(false);
  };

  const deleteMember = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar permanentemente a ${name}?`)) return;
    setDeletingId(id);
    const supabase = createClient();
    try {
      await supabase.from("members").delete().eq("id", id);
      setMembers(members.filter(m => m.id !== id));
    } catch (e) { console.error(e); } finally { setDeletingId(null); }
  };

  const copyToken = (token: string, id: string) => {
    navigator.clipboard.writeText(token);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  if (loading) return <div className="flex justify-center p-32"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;

  if (members.length === 0) {
    return (
      <div className="text-center py-32 border-4 border-dashed rounded-[3rem] opacity-30 flex flex-col items-center">
        <UserCircle2 className="h-16 w-16 mb-4" />
        <p className="text-sm font-black uppercase tracking-[0.3em]">Sin Miembros Activos</p>
      </div>
    );
  }

  return (
    <div className="rounded-[2.5rem] border bg-card/50 overflow-hidden shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted/50 text-muted-foreground border-b text-[9px] font-black uppercase tracking-[0.2em]">
          <tr>
            <th className="px-8 py-6 text-foreground">Socio / Identidad</th>
            <th className="px-8 py-6 text-foreground">Pase de Acceso</th>
            <th className="px-8 py-6 text-foreground">Rango</th>
            <th className="px-8 py-6 text-foreground text-right">Gestión</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {members.map((member) => (
            <tr key={member.id} className="group hover:bg-muted/30 transition-all">
              <td className="px-8 py-6">
                <p className="font-black text-base uppercase italic tracking-tight">{member.full_name}</p>
                <Badge tone={member.status === 'active' ? 'success' : 'warning'} className="text-[7px] font-black uppercase h-4 px-1.5 mt-1">{member.status}</Badge>
              </td>
              <td className="px-8 py-6">
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowQR(member)} className="h-10 px-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-2 text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                    <QrCode className="h-4 w-4" /><span className="text-[9px] font-black uppercase tracking-widest">QR</span>
                  </button>
                  <button onClick={() => copyToken(member.qr_token, member.id)} className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
                    {copiedId === member.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </td>
              <td className="px-8 py-6">
                <Badge tone="info" className="text-[10px] font-black uppercase tracking-widest px-3 py-1">{member.plans?.name || "Sin Plan"}</Badge>
              </td>
              <td className="px-8 py-6 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => setRenewingMember(member)} className="h-10 w-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary shadow-sm hover:bg-primary hover:text-white transition-all" title="Renovar Plan"><RefreshCw className="h-4 w-4" /></button>
                  <Link href={`/members/${member.id}` as any}><button className="h-10 w-10 bg-background border rounded-xl flex items-center justify-center text-muted-foreground shadow-sm hover:text-primary transition-all" title="Ficha"><Eye className="h-4 w-4" /></button></Link>
                  <button onClick={() => setEditingMember(member)} className="h-10 w-10 bg-background border rounded-xl flex items-center justify-center text-accent shadow-sm hover:text-accent transition-all" title="Editar"><PencilLine className="h-4 w-4" /></button>
                  <button onClick={() => deleteMember(member.id, member.full_name)} className="h-10 w-10 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center justify-center text-red-500 shadow-sm hover:bg-red-500 hover:text-white transition-all" title="Borrar"><Trash2 className="h-4 w-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showQR && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
           <div className="w-full max-w-sm rounded-[3rem] bg-card border-4 border-primary/30 p-10 text-center space-y-8 shadow-2xl relative">
              <button onClick={() => setShowQR(null)} className="absolute top-6 right-6 h-10 w-10 rounded-full bg-muted flex items-center justify-center"><X className="h-5 w-5" /></button>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-foreground">{showQR.full_name}</h3>
              <div className="bg-white p-6 rounded-[2rem] inline-block shadow-inner border-8 border-primary/10">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${showQR.qr_token}`} alt="QR" className="h-40 w-48" />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed px-6 italic">Presenta este código para validar tu ingreso al coliseo.</p>
           </div>
        </div>
      )}

      {editingMember && <EditMemberForm member={editingMember} onUpdate={fetchMembers} onClose={() => setEditingMember(null)} />}
      {renewingMember && <RenewPlanForm member={renewingMember} onUpdate={fetchMembers} onClose={() => setRenewingMember(null)} />}
    </div>
  );
}
