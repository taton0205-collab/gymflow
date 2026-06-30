"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Loader2, CalendarClock, Trash2 } from "lucide-react";

export function PlanList() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPlans = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .order("price", { ascending: true });

    if (!error) setPlans(data || []);
    setLoading(false);
  };

  const deletePlan = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro que quieres eliminar el plan "${name}"?`)) return;

    setDeletingId(id);
    const supabase = createClient();
    try {
      const { error } = await supabase.from("plans").delete().eq("id", id);
      if (error) throw error;
      setPlans(plans.filter(p => p.id !== id));
    } catch (e: any) {
      alert("Error al eliminar el plan: " + e.message);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  if (plans.length === 0) {
    return (
      <div className="rounded-[2rem] border-4 border-dashed p-20 text-center opacity-30">
        <CalendarClock className="mx-auto h-12 w-12 mb-4" />
        <p className="text-sm font-black uppercase tracking-widest">Sin Rangos Creados</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <article key={plan.id} className="group relative rounded-[2rem] border bg-card p-8 shadow-lg hover:shadow-2xl transition-all border-b-8 border-b-primary/20">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-black text-xl uppercase italic tracking-tighter text-foreground">{plan.name}</h3>
              <p className="text-3xl font-black mt-4 text-primary italic">
                ${new Intl.NumberFormat("es-AR").format(plan.price)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge tone="success" className="font-black text-[10px] uppercase">{plan.duration_days} días</Badge>
              <button
                onClick={() => deletePlan(plan.id, plan.name)}
                disabled={deletingId === plan.id}
                className="h-10 w-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
              >
                {deletingId === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-dashed flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <span>Status</span>
            <span className="text-primary italic">Activo en Arena</span>
          </div>
        </article>
      ))}
    </div>
  );
}
