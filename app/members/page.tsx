import { ProductShell } from "@/components/product-shell";
import { Badge } from "@/components/ui/badge";
import { RegisterMemberForm } from "@/features/members/register-member-form";
import { MemberList } from "@/features/members/member-list";
import { MemberCounter } from "@/features/members/member-counter";

export default function MembersPage() {
  return (
    <ProductShell>
      <div className="space-y-6">
        {/* Encabezado Principal */}
        <section className="flex flex-col gap-5 rounded-xl border bg-card/72 p-8 shadow-soft backdrop-blur md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge tone="info">Gestión de Clientes</Badge>
              <MemberCounter />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight md:text-6xl">Socios</h1>
              <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
                Administra tu comunidad. Registra ingresos, controla vencimientos y mantén tu gimnasio organizado.
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <RegisterMemberForm />
          </div>
        </section>

        {/* Listado de Socios */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black tracking-tight">Listado de Miembros</h2>
            <div className="h-px flex-1 mx-6 bg-border hidden sm:block"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Base de datos activa</span>
          </div>
          <MemberList />
        </section>
      </div>
    </ProductShell>
  );
}
