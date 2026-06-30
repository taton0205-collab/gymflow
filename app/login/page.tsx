"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Dumbbell, ShieldCheck, Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push("/");
      router.refresh();
    } catch (error: any) {
      alert("Error al iniciar sesión: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail("admin@gymflow.com");
    setPassword("gymflow123");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Columna Izquierda: Formulario */}
      <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-24 py-12">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div className="space-y-3">
            <div className="h-12 w-12 bg-foreground text-background rounded-xl flex items-center justify-center shadow-lg">
              <Dumbbell className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">GymFlow Live</h1>
            <p className="text-muted-foreground font-medium uppercase text-xs tracking-widest">Inicia sesión en tu espacio de trabajo</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Email Corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full rounded-xl border bg-muted/20 pl-10 pr-4 font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="nombre@empresa.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Contraseña</label>
                  <button type="button" className="text-[10px] font-black uppercase text-primary hover:underline">Olvide mi clave</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 w-full rounded-xl border bg-muted/20 pl-10 pr-4 font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="h-14 w-full text-lg font-black uppercase tracking-widest shadow-xl" disabled={loading}>
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "ENTRAR AL SISTEMA"}
            </Button>
          </form>

          <div className="pt-8 border-t border-dashed">
            <button
              onClick={handleDemoLogin}
              className="w-full flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
            >
              <ShieldCheck className="h-4 w-4" /> ¿No tienes cuenta? Contacta a soporte
            </button>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Visual (SaaS Style) */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-muted/30 border-l relative overflow-hidden p-12">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent rounded-full blur-[120px]" />
        </div>

        <div className="relative space-y-8 text-center max-w-lg">
          <div className="inline-flex items-center gap-2 bg-background border px-4 py-2 rounded-full shadow-sm animate-bounce">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">SaaS Premium para Gimnasios</span>
          </div>
          <h2 className="text-6xl font-black tracking-tighter uppercase italic leading-[0.9]">Transforma tu negocio hoy.</h2>
          <p className="text-xl text-muted-foreground font-medium leading-relaxed">
            Gestión de socios, cobros automáticos, rutinas y reportes en una sola plataforma de alto rendimiento.
          </p>
        </div>
      </div>
    </div>
  );
}
