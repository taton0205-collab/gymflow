import { ProductShell } from "@/components/product-shell";
import { Badge } from "@/components/ui/badge";
import { RoutineBuilder } from "@/features/routines/routine-builder";
import { RoutineList } from "@/features/routines/routine-list";
import { Dumbbell } from "lucide-react";

export default function RoutinesPage() {
  return (
    <ProductShell>
      <div className="space-y-10">
        {/* Header de Entrenamiento */}
        <section className="flex flex-col gap-10 rounded-[2.5rem] border bg-card/30 p-12 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Badge tone="info" className="px-5 py-1.5 font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-primary/10">Fitness Performance</Badge>
            </div>
            <div>
              <h1 className="text-7xl font-black tracking-tighter text-foreground uppercase italic leading-[0.9]">Rutinas</h1>
              <p className="mt-6 max-w-2xl text-xl text-muted-foreground font-medium leading-relaxed">
                Diseña planes de entrenamiento de élite. Asigna ejercicios, controla el progreso y potencia los resultados de tus atletas.
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <RoutineBuilder />
          </div>
        </section>

        {/* Listado de Rutinas */}
        <section className="space-y-8">
          <div className="flex items-center gap-6 px-4">
            <h2 className="text-3xl font-black uppercase tracking-tight italic flex items-center gap-3">
              <Dumbbell className="h-8 w-8 text-primary" /> Programas Activos
            </h2>
            <div className="h-1 flex-1 bg-gradient-to-r from-primary/30 to-transparent rounded-full"></div>
          </div>
          <RoutineList />
        </section>
      </div>
    </ProductShell>
  );
}
