import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Plus } from "lucide-react";

type ModulePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction: string;
  items: Array<{ title: string; description: string; status: string }>;
};

export function ModulePage({ eyebrow, title, description, primaryAction, items }: ModulePageProps) {
  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-5 rounded-md border bg-card/72 p-6 shadow-soft backdrop-blur md:flex-row md:items-end md:justify-between">
        <div>
          <Badge tone="info">{eyebrow}</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-normal md:text-5xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          {primaryAction}
        </Button>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {items.map((item) => (
          <article key={item.title} className="rounded-md border bg-card/76 p-5 shadow-soft backdrop-blur transition hover:border-primary/25">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
              </div>
              <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground" />
            </div>
            <div className="mt-5">
              <Badge tone="neutral">{item.status}</Badge>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
