"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Copy, Check, Eye } from "lucide-react";
import Link from "next/link";

export function MemberList() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchMembers = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from("members").select("*, plans(name)").order("created_at", { ascending: false });
    if (!error) setMembers(data || []);
    setLoading(false);
  };

  const deleteMember = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar a ${name}?`)) return;
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

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="rounded-xl border bg-card/50 overflow-hidden shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted/50 text-muted-foreground border-b text-[9px] font-black uppercase tracking-widest">
          <tr>
            <th className="px-6 py-4 text-foreground">Socio</th>
            <th className="px-6 py-4 text-foreground">Token QR</th>
            <th className="px-6 py-4 text-foreground">Plan</th>
            <th className="px-6 py-4 text-foreground text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {members.map((member) => (
            <tr key={member.id} className="group hover:bg-muted/30">
              <td className="px-6 py-4 font-bold">{member.full_name}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-2 py-1 rounded text-[10px] font-mono">{member.qr_token.substring(0, 8)}</code>
                  <button onClick={() => copyToken(member.qr_token, member.id)} className="text-primary">
                    {copiedId === member.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge tone="info" className="text-[9px] font-black uppercase">{member.plans?.name || "-"}</Badge>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/members/${member.id}` as any}>
                    <button className="p-2 hover:bg-primary/10 rounded-lg text-primary"><Eye className="h-4 w-4" /></button>
                  </Link>
                  <button onClick={() => deleteMember(member.id, member.full_name)} className="p-2 hover:text-red-500 rounded-lg text-muted-foreground">
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
