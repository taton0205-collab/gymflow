"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Loader2, CalendarClock } from "lucide-react";

export function PlanList() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .order("price", { ascending: true });

      if (error) {
        console.error(error);
      } else {
        setPlans(data || []);
      }
      setLoading(false);
    };

    fetchPlans();

    const supabase = createClient();
    const channel = supabase
      .channel("plans-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "plans" }, () => {
        fetchPlans();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-12 text-center">
        <CalendarClock className="mx-auto h-8 w-8 text-muted-foreground/50" />
        <p className="mt-2 text-sm text-muted-foreground">No has creado ningún plan de membresía.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <article key={plan.id} className="rounded-md border bg-card p-5 shadow-soft shadow-hairline">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-lg">{plan.name}</h3>
              <p className="text-2xl font-black mt-2 text-primary">
                ${new Intl.NumberFormat("es-AR").format(plan.price)}
              </p>
            </div>
            <Badge tone="success">{plan.duration_days} días</Badge>
          </div>
          <div className="mt-4 pt-4 border-t border-dashed flex justify-between items-center text-xs text-muted-foreground">
            <span>Estado</span>
            <span className="font-medium text-foreground">{plan.active ? "Activo" : "Inactivo"}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
