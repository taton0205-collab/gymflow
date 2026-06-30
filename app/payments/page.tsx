import { ProductShell } from "@/components/product-shell";
import { Badge } from "@/components/ui/badge";
import { PaymentsTable } from "@/features/payments/payments-table";
import { Landmark, TrendingUp } from "lucide-react";

export default function PaymentsPage() {
  return (
    <ProductShell>
      <div className="space-y-8">
        {/* Header Comercial */}
        <section className="flex flex-col gap-6 rounded-2xl border bg-card/40 p-10 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge tone="success" className="px-3 py-1 font-bold">FINANZAS</Badge>
              <div className="flex items-center gap-2 text-xs font-bold text-success uppercase tracking-widest">
                <TrendingUp className="h-4 w-4" /> +14.8% este mes
              </div>
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter md:text-6xl text-foreground uppercase">Historial de Pagos</h1>
              <p className="mt-3 max-w-2xl text-lg text-muted-foreground font-medium leading-relaxed">
                Libro de caja digital. Supervisa cada transacción, emite comprobantes y audita los ingresos de tu gimnasio.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-background/50 p-6 rounded-2xl border shadow-inner">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Landmark className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none">Caja Total</p>
              <p className="text-2xl font-black text-foreground mt-2 leading-none">Auditoría Activa</p>
            </div>
          </div>
        </section>

        {/* Tabla de Pagos */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black tracking-tight uppercase italic">Transacciones Recientes</h2>
            <div className="h-px flex-1 mx-8 bg-border"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Actualizado en tiempo real</span>
          </div>
          <PaymentsTable />
        </section>
      </div>
    </ProductShell>
  );
}
