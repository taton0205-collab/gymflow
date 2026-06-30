"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, Lock, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: any) {
      alert("Error al actualizar contraseña: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0c0e] p-4">
      <div className="max-w-md w-full space-y-10 rounded-[3rem] border border-white/5 bg-white/[0.02] p-12 backdrop-blur-2xl shadow-2xl">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 bg-primary text-primary-foreground rounded-2xl mx-auto flex items-center justify-center shadow-xl italic font-black text-2xl">S</div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-foreground">Nueva Contraseña</h1>
          <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.3em]">Crea una clave segura para volver al sistema</p>
        </div>

        {success ? (
          <motion_div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10 space-y-4">
            <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto" />
            <p className="text-xl font-black text-white uppercase italic">¡Contraseña actualizada!</p>
            <p className="text-sm text-muted-foreground">Redirigiendo al login...</p>
          </motion_div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Nueva Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 w-full rounded-2xl border-2 border-white/5 bg-white/[0.03] pl-12 pr-4 font-bold outline-none focus:border-primary/50 transition-all text-foreground"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Confirmar Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                  <input
                    required
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-14 w-full rounded-2xl border-2 border-white/5 bg-white/[0.03] pl-12 pr-4 font-bold outline-none focus:border-primary/50 transition-all text-foreground"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="h-16 w-full text-lg font-black uppercase tracking-widest shadow-2xl skew-x-[-5deg]" disabled={loading}>
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "CAMBIAR CONTRASEÑA"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

function motion_div({ children, ...props }: any) {
  return <div {...props}>{children}</div>;
}
