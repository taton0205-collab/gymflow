import { ProductShell } from "@/components/product-shell";
import { Badge } from "@/components/ui/badge";
import { QRScanner } from "@/features/access/qr-scanner";

export default function AccessPage() {
  return (
    <ProductShell>
      <div className="space-y-8">
        {/* Encabezado */}
        <section className="text-center space-y-4 py-10">
          <Badge tone="info" className="px-4 py-1 font-bold">CONTROL DE INGRESO</Badge>
          <h1 className="text-5xl font-black tracking-tighter md:text-7xl uppercase">Acceso QR</h1>
          <p className="max-w-xl mx-auto text-muted-foreground font-medium text-lg">
            Valida la entrada de tus socios escaneando su código único. El sistema verificará automáticamente el estado de su cuota.
          </p>
        </section>

        {/* Escáner */}
        <section>
          <QRScanner />
        </section>

        {/* Info */}
        <section className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 pt-10">
          <div className="p-6 rounded-2xl border bg-card/50 text-center space-y-2">
            <div className="text-2xl font-black text-green-500">Luz Verde</div>
            <p className="text-xs text-muted-foreground font-bold uppercase">Cuota al día</p>
          </div>
          <div className="p-6 rounded-2xl border bg-card/50 text-center space-y-2">
            <div className="text-2xl font-black text-red-500">Luz Roja</div>
            <p className="text-xs text-muted-foreground font-bold uppercase">Cuota vencida</p>
          </div>
          <div className="p-6 rounded-2xl border bg-card/50 text-center space-y-2">
            <div className="text-2xl font-black text-primary">Log</div>
            <p className="text-xs text-muted-foreground font-bold uppercase">Ingreso registrado</p>
          </div>
        </section>
      </div>
    </ProductShell>
  );
}
