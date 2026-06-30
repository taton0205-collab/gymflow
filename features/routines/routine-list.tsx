"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Loader2, Dumbbell, User, ChevronRight, ListChecks } from "lucide-react";

export function RoutineList() {
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoutines = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("routines")
      .select(`
        *,
        members(full_name),
        routine_exercises(count)
      `)
      .order("created_at", { ascending: false });

    if (!error) setRoutines(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRoutines();
    const supabase = createClient();
    const channel = supabase.channel("routines-sync").on("postgres_changes", { event: "*", schema: "public", table: "routines" }, () => fetchRoutines()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  if (routines.length === 0) {
    return (
      <div className="rounded-3xl border-4 border-dashed p-20 text-center space-y-4">
        <div className="h-16 w-16 bg-muted rounded-full mx-auto flex items-center justify-center">
          <Dumbbell className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <p className="text-xl font-black uppercase italic tracking-tighter">No hay rutinas activas</p>
          <p className="text-sm text-muted-foreground font-medium uppercase mt-1">Empieza creando una rutina para un socio</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {routines.map((routine) => (
        <div key={routine.id} className="group relative rounded-2xl border bg-card p-6 shadow-sm hover:shadow-xl transition-all border-b-4 border-b-primary/20">
          <div className="flex items-start justify-between">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
            <Badge tone="success" className="font-black text-[9px] uppercase tracking-widest">Activa</Badge>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-black uppercase italic tracking-tight">{routine.name}</h3>
            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span className="text-xs font-bold uppercase tracking-tight">{routine.members?.full_name}</span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between py-4 border-t border-dashed">
            <div className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-black uppercase text-muted-foreground">{routine.routine_exercises?.[0]?.count || 0} Ejercicios</span>
            </div>
            <button className="h-8 w-8 rounded-full border flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
