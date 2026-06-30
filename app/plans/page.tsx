import { ProductShell } from "@/components/product-shell";
import { Badge } from "@/components/ui/badge";
import { RegisterPlanForm } from "@/features/plans/register-plan-form";
import { PlanList } from "@/features/plans/plan-list";

export default function PlansPage() {
  return (
    <ProductShell>
      <div className="space-y-5">
        <section className="flex flex-col gap-5 rounded-md border bg-card/72 p-6 shadow-soft backdrop-blur md:flex-row md:items-end md:justify-between">
          <div>
            <Badge tone="info">Comercial</Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-normal md:text-5xl">Planes</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Configura las membresías y precios que ofreces en tu gimnasio.
            </p>
          </div>
          <RegisterPlanForm />
        </section>

        <section className="pt-5">
          <div className="mb-6">
            <h2 className="text-xl font-bold">Membresías Disponibles</h2>
            <p className="text-sm text-muted-foreground">Estos son los planes que tus socios pueden contratar.</p>
          </div>
          <PlanList />
        </section>
      </div>
    </ProductShell>
  );
}
