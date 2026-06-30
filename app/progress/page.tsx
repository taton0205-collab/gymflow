import { ProductShell } from "@/components/product-shell";
import { ModulePage } from "@/features/module-page/module-page";

export default function ProgressPage() {
  return (
    <ProductShell>
      <ModulePage
        eyebrow="Health"
        title="Progreso"
        description="Peso, grasa corporal, masa muscular, medidas, fotos y graficos automaticos por socio."
        primaryAction="Cargar medicion"
        items={[
          { title: "Metricas", description: "Peso, porcentaje graso, masa muscular y mediciones flexibles en JSON.", status: "Modelo creado" },
          { title: "Fotos", description: "Storage preparado para progreso visual y comparativas.", status: "Pendiente bucket" },
          { title: "Graficos", description: "Evolucion automatica por fecha y objetivo.", status: "Roadmap" }
        ]}
      />
    </ProductShell>
  );
}
