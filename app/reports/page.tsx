import { ProductShell } from "@/components/product-shell";
import { Badge } from "@/components/ui/badge";
import { ReportCenter } from "@/features/reports/report-center";
import { PieChart } from "lucide-react";

export default function ReportsPage() {
  return (
    <ProductShell>
      <div className="space-y-10">
        {/* Header de Analytics */}
        <section className="flex flex-col gap-10 rounded-[2.5rem] border bg-card/30 p-12 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between border-t-2 border-t-primary/10">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Badge tone="info" className="px-5 py-1.5 font-black uppercase text-[10px] tracking-[0.2em] bg-primary/10 text-primary border-none">Business Intelligence</Badge>
            </div>
            <div>
              <h1 className="text-7xl font-black tracking-tighter text-foreground uppercase italic leading-[0.9]">Reportes</h1>
              <p className="mt-6 max-w-2xl text-xl text-muted-foreground font-medium leading-relaxed">
                Transforma los datos de tu gimnasio en decisiones estratégicas. Exporta historiales de pago, padrones de socios y auditorías completas.
              </p>
            </div>
          </div>
          <div className="h-28 w-28 rounded-[2rem] bg-background border flex items-center justify-center shadow-inner">
            <PieChart className="h-12 w-12 text-muted-foreground" />
          </div>
        </section>

        {/* Centro de Reportes */}
        <section className="px-4">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-black uppercase italic tracking-tight">Exportación de Datos</h2>
            <div className="h-1 flex-1 bg-gradient-to-r from-primary/20 to-transparent rounded-full"></div>
          </div>
          <ReportCenter />
        </section>
      </div>
    </ProductShell>
  );
}
