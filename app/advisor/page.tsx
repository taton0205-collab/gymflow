import { ProductShell } from "@/components/product-shell";
import { ModulePage } from "@/features/module-page/module-page";

export default function AdvisorPage() {
  return (
    <ProductShell>
      <ModulePage
        eyebrow="IA"
        title="AI Advisor"
        description="Asistente empresarial que analiza asistencia, ingresos, cuotas, churn, demanda horaria e inventario."
        primaryAction="Consultar IA"
        items={[
          { title: "Insights deterministas", description: "Primeras recomendaciones desde vistas agregadas confiables.", status: "Incluido en dashboard" },
          { title: "LLM con schema", description: "Respuestas JSON estrictas basadas en metricas verificadas.", status: "Arquitectura definida" },
          { title: "Acciones sugeridas", description: "Promociones, reposiciones, cobranzas y retencion.", status: "Roadmap" }
        ]}
      />
    </ProductShell>
  );
}
