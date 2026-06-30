"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Trash2, QrCode, Copy, Check, Eye } from "lucide-react";
import Link from "next/link";

export function MemberList() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchMembers = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("members")
      .select("*, plans(name)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setMembers(data || []);
    }
    setLoading(false);
  };

  const deleteMember = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro que quieres eliminar a ${name}?`)) return;
    setDeletingId(id);
    const supabase = createClient();
    try {
      const { error } = await supabase.from("members").delete().eq("id", id);
      if (error) throw error;
      setMembers(members.filter(m => m.id !== id));
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const copyToken = (token: string, id: string) => {
    navigator.clipboard.writeText(token);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    fetchMembers();
    const supabase = createClient();
    const channel = supabase.channel("members-list").on("postgres_changes", { event: "*", schema: "public", table: "members" }, () => fetchMembers()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="rounded-xl border bg-card/50 overflow-hidden shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted/50 text-muted-foreground border-b text-[10px] font-black uppercase tracking-widest">
          <tr>
            <th className="px-6 py-4">Socio</th>
            <th className="px-6 py-4">Token QR (Acceso)</th>
            <th className="px-6 py-4">Plan</th>
            <th className="px-6 py-4">Estado</th>
            <th className="px-6 py-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {members.map((member) => (
            <tr key={member.id} className="group hover:bg-muted/30 transition-colors">
              <td className="px-6 py-4">
                <p className="font-bold text-foreground">{member.full_name}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-medium">{member.dni || "Sin DNI"}</p>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-2 py-1 rounded text-[10px] font-mono">{member.qr_token.substring(0, 8)}...</code>
                  <button onClick={() => copyToken(member.qr_token, member.id)} className="p-1 hover:bg-primary/10 rounded transition-colors text-primary">
                    {copiedId === member.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </td>
              <td className="px-6 py-4">
                {member.plans ? <Badge tone="info" className="font-black text-[9px] uppercase tracking-wider">{member.plans.name}</Badge> : "-"}
              </td>
              <td className="px-6 py-4">
                <Badge tone={member.status === "active" ? "success" : "warning"} className="font-black text-[9px] uppercase tracking-wider">
                  {member.status === "active" ? "Activo" : "Vencido"}
                </Badge>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/members/${member.id}`}>
                    <button className="p-2 bg-muted/50 hover:bg-primary/10 hover:text-primary rounded-lg transition-all" title="Ver Perfil">
                      <Eye className="h-4 w-4" />
                    </button>
                  </Link>
                  <button onClick={() => deleteMember(member.id, member.full_name)} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all text-muted-foreground">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
