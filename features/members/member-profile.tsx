"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2, User, Phone, Fingerprint, Cake, Calendar,
  History, CreditCard, Activity, Save, ChevronLeft,
  AlertTriangle, Target, StickyNote
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function MemberProfile({ memberId }: { memberId: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [member, setMember] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);

  // Campos editables
  const [observations, setObservations] = useState("");
  const [injuries, setInjuries] = useState("");
  const [goals, setGoals] = useState("");

  const fetchData = async () => {
    const supabase = createClient();

    // 1. Obtener Socio y Plan
    const { data: memberData } = await supabase
      .from("members")
      .select("*, plans(*)")
      .eq("id", memberId)
      .single();

    if (memberData) {
      setMember(memberData);
      setObservations(memberData.observations || "");
      setInjuries(memberData.injuries || "");
      setGoals(memberData.goals || "");

      // 2. Obtener Pagos
      const { data: paymentsData } = await supabase
        .from("payments")
        .select("*, plans(name)")
        .eq("member_id", memberId)
        .order("paid_at", { ascending: false });
      setPayments(paymentsData || []);

      // 3. Obtener Asistencias
      const { data: attendanceData } = await supabase
        .from("attendance_logs")
        .select("*")
        .eq("member_id", memberId)
        .order("checked_in_at", { ascending: false });
      setAttendance(attendanceData || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [memberId]);

  const handleUpdateNotes = async () => {
    setSaving(true);
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("members")
        .update({ observations, injuries, goals })
        .eq("id", memberId);

      if (error) throw error;
      alert("Ficha actualizada correctamente");
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  if (!member) return <div className="text-center py-20 font-bold">Socio no encontrado</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Botón Volver */}
      <Link href="/members">
        <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="mr-2 h-4 w-4" /> Volver al listado
        </Button>
      </Link>

      {/* Header Perfil */}
      <section className="flex flex-col gap-8 rounded-[2.5rem] border bg-card/40 p-10 shadow-sm backdrop-blur md:flex-row md:items-center">
        <div className="h-32 w-32 rounded-[2rem] bg-primary/10 flex items-center justify-center border-4 border-white shadow-xl shrink-0">
          <User className="h-16 w-16 text-primary" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <Badge tone={member.status === "active" ? "success" : "warning"} className="font-black px-4 py-1 uppercase tracking-widest text-[10px]">
              {member.status === "active" ? "Socio Activo" : "Cuenta Vencida"}
            </Badge>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Desde {new Date(member.created_at).toLocaleDateString()}</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase italic">{member.full_name}</h1>
          <div className="flex flex-wrap gap-6 text-muted-foreground">
            <div className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-tight">
              <Fingerprint className="h-4 w-4" /> DNI: {member.dni || "N/A"}
            </div>
            <div className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-tight">
              <Phone className="h-4 w-4" /> {member.phone || "Sin teléfono"}
            </div>
            <div className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-tight text-primary">
              <Cake className="h-4 w-4" /> Cumpleaños: {member.birth_date ? new Date(member.birth_date).toLocaleDateString() : "N/A"}
            </div>
          </div>
        </div>
        <div className="bg-background/50 p-6 rounded-3xl border border-white/20 text-center">
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Plan Actual</p>
          <p className="text-2xl font-black text-primary mt-1 uppercase italic">{member.plans?.name || "SIN PLAN"}</p>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Columna Izquierda: Historia y Datos Médicos */}
        <div className="space-y-8">
          {/* Secciones Médicas / Objetivos */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="h-4 w-4" />
                <h3 className="text-[10px] font-black uppercase tracking-widest">Lesiones / Alertas</h3>
              </div>
              <textarea
                value={injuries}
                onChange={(e) => setInjuries(e.target.value)}
                placeholder="Ej: Hernia de disco, Asma..."
                className="w-full bg-transparent text-sm font-medium outline-none min-h-[100px] resize-none"
              />
            </div>
            <div className="rounded-2xl border bg-card p-6 space-y-4 border-l-4 border-l-accent">
              <div className="flex items-center gap-2 text-accent">
                <Target className="h-4 w-4" />
                <h3 className="text-[10px] font-black uppercase tracking-widest">Objetivos Fitness</h3>
              </div>
              <textarea
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="Ej: Bajar 5kg, Maratón..."
                className="w-full bg-transparent text-sm font-medium outline-none min-h-[100px] resize-none"
              />
            </div>
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <StickyNote className="h-4 w-4" />
                <h3 className="text-[10px] font-black uppercase tracking-widest">Notas Administrativas</h3>
              </div>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Notas internas..."
                className="w-full bg-transparent text-sm font-medium outline-none min-h-[100px] resize-none"
              />
            </div>
          </div>

          <Button onClick={handleUpdateNotes} disabled={saving} className="w-full h-12 font-black uppercase tracking-widest">
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="mr-2 h-5 w-5" /> Guardar Cambios en Ficha</>}
          </Button>

          {/* Historial de Pagos */}
          <div className="rounded-3xl border bg-card/40 overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-black uppercase italic tracking-tight flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-primary" /> Historial de Cobros
              </h2>
            </div>
            <div className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-[10px] font-black uppercase text-muted-foreground border-b">
                  <tr>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Membresía</th>
                    <th className="px-6 py-4 text-right">Monto</th>
                    <th className="px-6 py-4 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payments.map((p, i) => (
                    <tr key={i} className="hover:bg-muted/20">
                      <td className="px-6 py-4 font-bold">{new Date(p.paid_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-medium text-muted-foreground uppercase text-[11px]">{p.plans?.name}</td>
                      <td className="px-6 py-4 text-right font-black text-foreground">${new Intl.NumberFormat("es-AR").format(p.amount)}</td>
                      <td className="px-6 py-4 text-right"><Badge tone="success" className="text-[8px]">PAID</Badge></td>
                    </tr>
                  ))}
                  {payments.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-muted-foreground italic uppercase text-xs">Sin registros de pago.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Asistencia */}
        <div className="space-y-6">
          <div className="rounded-3xl border bg-card p-8 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black uppercase italic flex items-center gap-3">
                <Activity className="h-5 w-5 text-accent" /> Asistencia Reciente
              </h2>
              <Badge tone="neutral" className="font-bold">{attendance.length} Entradas</Badge>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto max-h-[600px] pr-2">
              {attendance.map((log, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl border bg-muted/10 group hover:border-accent/30 transition-all">
                  <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20">
                    <Calendar className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight">{new Date(log.checked_in_at).toLocaleDateString("es-AR", { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <Clock className="h-3 w-3 text-muted-foreground" />
                       <p className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(log.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} HS</p>
                    </div>
                  </div>
                </div>
              ))}
              {attendance.length === 0 && (
                <div className="text-center py-20 space-y-4">
                  <div className="h-12 w-12 bg-muted rounded-full mx-auto flex items-center justify-center opacity-30">
                    <History className="h-6 w-6" />
                  </div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Sin registros de entrada</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Clock(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  )
}
