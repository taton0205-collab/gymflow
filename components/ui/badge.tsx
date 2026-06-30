import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

const tones: Record<BadgeTone, string> = {
  neutral: "border bg-muted/45 text-muted-foreground",
  success: "border border-success/20 bg-success/10 text-success",
  warning: "border border-warning/20 bg-warning/10 text-warning",
  danger: "border border-danger/20 bg-danger/10 text-danger",
  info: "border border-primary/20 bg-primary/10 text-primary"
};

export function Badge({ children, tone = "neutral", className }: { children: React.ReactNode; tone?: BadgeTone; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-medium shadow-hairline", tones[tone], className)}>{children}</span>;
}
