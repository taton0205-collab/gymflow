"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity, BarChart3, Bell, Boxes, CalendarClock, CreditCard, Dumbbell,
  LayoutDashboard, Menu, Moon, QrCode, Search, Settings, Sparkles, Sun,
  Users, X, LogOut, User as UserIcon, Shield
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const navigation = [
  { label: "Coliseo", href: "/", icon: LayoutDashboard },
  { label: "Gladiadores", href: "/members", icon: Users },
  { label: "Rangos", href: "/plans", icon: CalendarClock },
  { label: "Tributos", href: "/payments", icon: CreditCard },
  { label: "Acceso QR", href: "/access", icon: QrCode },
  { label: "Entrenamiento", href: "/routines", icon: Dumbbell },
  { label: "Inventario", href: "/inventory", icon: Boxes },
  { label: "Cronicas", href: "/reports", icon: BarChart3 },
  { label: "Ajustes", href: "/settings", icon: Settings }
];

export function ProductShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(true); // Default oscuro para SECUTOR
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    document.documentElement.classList.add("dark");
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-transparent">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r bg-card/70 backdrop-blur-2xl lg:block shadow-2xl">
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>

      <header className="sticky top-0 z-30 border-b bg-background/74 backdrop-blur-2xl lg:ml-72">
        <div className="flex h-[72px] items-center gap-3 px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></Button>
          <div className="relative hidden flex-1 md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input className="h-10 w-full max-w-xl rounded-xl border bg-card/80 pl-10 pr-4 text-sm outline-none border-primary/20" placeholder="Buscar en SECUTOR..." />
          </div>
          <div className="ml-auto flex items-center gap-4">
             <div className="flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
               <Shield className="h-4 w-4 text-primary" />
               <span className="text-xs font-black uppercase text-primary tracking-tighter">SECUTOR GYM</span>
             </div>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-foreground/20" onClick={() => setMobileOpen(false)} />
          <motion.aside initial={{ x: -288 }} animate={{ x: 0 }} className="relative h-full w-72 border-r bg-card"><SidebarContent user={user} onLogout={handleLogout} /></motion.aside>
        </div>
      )}

      <main className="lg:ml-72"><div className="mx-auto max-w-7xl px-8 py-10">{children}</div></main>
    </div>
  );
}

function SidebarContent({ user, onLogout }: any) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col px-6 py-8">
      <div className="flex items-center gap-3 px-2">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/40 italic font-black text-xl italic">S</div>
        <div>
          <p className="text-lg font-black uppercase tracking-tighter italic leading-none">SECUTOR</p>
          <p className="text-[9px] font-bold text-primary uppercase tracking-[0.3em] mt-1">Arena Management</p>
        </div>
      </div>

      <nav className="mt-12 space-y-1.5 flex-1">
        {navigation.map((item) => (
          <Link key={item.label} href={item.href as any} className={cn(
            "flex h-12 w-full items-center gap-4 rounded-xl px-4 text-sm font-black uppercase tracking-tight transition-all",
            (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)))
              ? "bg-primary text-white shadow-xl shadow-primary/30 rotate-[-1deg]"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}>
            <item.icon className="h-5 w-5" /><span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t border-dashed">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all text-xs font-black uppercase">
          <LogOut className="h-4 w-4" /> Abandonar Arena
        </button>
      </div>
    </div>
  );
}
