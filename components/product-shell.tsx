"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bell,
  Boxes,
  CalendarClock,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  Menu,
  Moon,
  QrCode,
  Search,
  Settings,
  Sparkles,
  Sun,
  Users,
  X,
  LogOut,
  User as UserIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// Forzamos que TypeScript no se queje de los links
const navigation = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Socios", href: "/members", icon: Users },
  { label: "Planes", href: "/plans", icon: CalendarClock },
  { label: "Pagos", href: "/payments", icon: CreditCard },
  { label: "Acceso QR", href: "/access", icon: QrCode },
  { label: "Rutinas", href: "/routines", icon: Dumbbell },
  { label: "Progreso", href: "/progress", icon: Activity },
  { label: "Inventario", href: "/inventory", icon: Boxes },
  { label: "Reportes", href: "/reports", icon: BarChart3 },
  { label: "IA Advisor", href: "/advisor", icon: Sparkles },
  { label: "Configuracion", href: "/settings", icon: Settings }
] as const;

export function ProductShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
    const saved = window.localStorage.getItem("gymflow-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(saved ? saved === "dark" : prefersDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    window.localStorage.setItem("gymflow-theme", dark ? "dark" : "light");
  }, [dark]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-transparent">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r bg-card/70 backdrop-blur-2xl lg:block">
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>

      <header className="sticky top-0 z-30 border-b bg-background/74 backdrop-blur-2xl lg:ml-72">
        <div className="flex h-[68px] items-center gap-3 px-4 sm:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="relative hidden flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input className="h-10 w-full max-w-xl rounded-md border bg-card/80 pl-10 pr-4 text-sm outline-none" placeholder="Buscar..." />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setDark((v) => !v)}>{dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</Button>
            <div className="hidden h-9 items-center gap-3 rounded-md border bg-card/70 px-2.5 sm:flex">
              <span className="text-sm font-bold">Atlas Gym</span>
            </div>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-foreground/20" onClick={() => setMobileOpen(false)} />
          <motion.aside initial={{ x: -288 }} animate={{ x: 0 }} className="relative h-full w-72 border-r bg-card">
            <Button variant="ghost" size="icon" className="absolute right-3 top-3" onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></Button>
            <SidebarContent user={user} onLogout={handleLogout} />
          </motion.aside>
        </div>
      )}

      <main className="lg:ml-72">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-8 lg:py-10">{children}</div>
      </main>
    </div>
  );
}

function SidebarContent({ user, onLogout }: { user: any; onLogout: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col px-4 py-6">
      <div className="flex items-center gap-3 px-2">
        <div className="grid h-10 w-10 place-items-center rounded-md bg-foreground text-background shadow-lg"><Dumbbell className="h-5 w-5" /></div>
        <p className="text-sm font-black uppercase tracking-tighter italic">GymFlow Live</p>
      </div>

      <nav className="mt-9 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.label}
            href={item.href as any}
            className={cn(
              "flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-bold text-muted-foreground transition hover:bg-muted/70 hover:text-foreground",
              (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))) && "bg-foreground text-background shadow-xl"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-6 space-y-4">
        <div className="rounded-xl border bg-muted/20 p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><UserIcon className="h-4 w-4" /></div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase truncate">{user?.email?.split('@')[0] || "Admin"}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase">
            <LogOut className="h-4 w-4" /> Salir
          </button>
        </div>
      </div>
    </div>
  );
}
