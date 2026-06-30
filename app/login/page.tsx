"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, Mail, Lock, Shield, MessageCircle } from "lucide-react";
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

  const handleForgotPassword = () => {
    if (!email) {
      alert("Por favor, ingresa tu email corporativo primero.");
      return;
    }
    alert(`Se ha enviado un enlace de recuperación a ${email}. (Simulación de sistema seguro)`);
  };

  const handleContactSupport = () => {
    const message = encodeURIComponent("Hola, necesito soporte técnico con mi sistema SECUTOR GYM.");
    window.open(`https://wa.me/541100000000?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background dark">
      {/* Columna Izquierda: Formulario */}
      <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-24 py-12 bg-[#0c0c0e]">
        <div className="max-w-md w-full mx-auto space-y-10">
          <div className="space-y-4">
            <div className="h-16 w-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20 italic font-black text-2xl">
              S
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter uppercase italic text-foreground">SECUTOR<br/><span className="text-primary underline decoration-4">ARENA</span></h1>
              <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.4em] mt-2">Acceso al Sistema de Comando</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Email Corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 w-full rounded-2xl border-2 border-white/5 bg-white/[0.03] pl-12 pr-4 font-bold outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-foreground"
                    placeholder="gladiador@secutor.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Contraseña</label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[10px] font-black uppercase text-primary hover:underline transition-all"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 w-full rounded-2xl border-2 border-white/5 bg-white/[0.03] pl-12 pr-4 font-bold outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-foreground"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="h-16 w-full text-lg font-black uppercase tracking-widest shadow-2xl shadow-primary/20 skew-x-[-5deg] transition-all hover:scale-[1.02]" disabled={loading}>
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "INICIAR SESIÓN"}
            </Button>
          </form>

          <div className="pt-8 border-t border-white/5">
            <button
              onClick={handleContactSupport}
              className="w-full flex items-center justify-center gap-3 text-xs font-black text-muted-foreground hover:text-primary transition-all uppercase tracking-[0.2em]"
            >
              <MessageCircle className="h-5 w-5" /> Contactar al soporte
            </button>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Visual */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-[#080809] border-l border-white/5 relative overflow-hidden p-12">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-primary rounded-full blur-[150px] opacity-30" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-primary rounded-full blur-[150px] opacity-10" />
        </div>

        <div className="relative space-y-10 text-center max-w-lg">
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-full shadow-2xl backdrop-blur-md">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/80">Secutor Elite Management</span>
          </div>
          <h2 className="text-7xl font-black tracking-tighter uppercase italic leading-[0.8] text-foreground">La fuerza<br/>del control.</h2>
          <p className="text-xl text-muted-foreground font-medium leading-relaxed italic uppercase opacity-60">
            Administración de alta gama para centros de entrenamiento de élite.
          </p>
        </div>
      </div>
    </div>
  );
}
