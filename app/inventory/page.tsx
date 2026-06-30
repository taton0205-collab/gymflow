import { ProductShell } from "@/components/product-shell";
import { Badge } from "@/components/ui/badge";
import { AddItemForm } from "@/features/inventory/add-item-form";
import { InventoryList } from "@/features/inventory/inventory-list";
import { PackageSearch } from "lucide-react";

export default function InventoryPage() {
  return (
    <ProductShell>
      <div className="space-y-8">
        {/* Header de Inventario */}
        <section className="flex flex-col gap-8 rounded-3xl border bg-card/40 p-10 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between border-b-4 border-b-primary/20">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge tone="info" className="px-4 py-1 font-black uppercase text-[10px] tracking-widest">Almacén Central</Badge>
            </div>
            <div>
              <h1 className="text-6xl font-black tracking-tighter text-foreground uppercase italic">Inventario</h1>
              <p className="mt-3 max-w-2xl text-lg text-muted-foreground font-medium leading-relaxed">
                Gestión inteligente de suplementos, accesorios y mercadería. Controla el stock y aumenta tus ventas secundarias.
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <AddItemForm />
          </div>
        </section>

        {/* Lista y Estadísticas */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <h2 className="text-2xl font-black uppercase tracking-tight italic">Catálogo de Productos</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent"></div>
          </div>
          <InventoryList />
        </section>
      </div>
    </ProductShell>
  );
}
