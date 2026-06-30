import { ProductShell } from "@/components/product-shell";
import { Badge } from "@/components/ui/badge";
import { GymSettings } from "@/features/settings/gym-settings";
import { Settings2 } from "lucide-react";

export default function SettingsPage() {
  return (
    <ProductShell>
      <div className="space-y-10">
        {/* Header de Configuración */}
        <section className="flex flex-col gap-10 rounded-[2.5rem] border bg-card/30 p-12 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Badge tone="info" className="px-5 py-1.5 font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-primary/10">Workspace Admin</Badge>
            </div>
            <div>
              <h1 className="text-7xl font-black tracking-tighter text-foreground uppercase italic leading-[0.9]">Ajustes</h1>
              <p className="mt-6 max-w-2xl text-xl text-muted-foreground font-medium leading-relaxed">
                Personaliza la identidad de tu gimnasio, configura los métodos de cobro y gestiona los permisos de tu equipo.
              </p>
            </div>
          </div>
          <div className="h-24 w-24 rounded-3xl bg-muted flex items-center justify-center border-4 border-dashed">
            <Settings2 className="h-10 w-10 text-muted-foreground" />
          </div>
        </section>

        {/* Formulario de Ajustes */}
        <section className="px-4 pb-20">
          <GymSettings />
        </section>
      </div>
    </ProductShell>
  );
}
