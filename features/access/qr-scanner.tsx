"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { QrCode, Loader2, CheckCircle2, XCircle, User, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export function QRScanner() {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    member?: any;
    plan?: any;
  } | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setResult(null);
    const supabase = createClient();

    try {
      // 1. Buscar al socio por su token de QR
      const { data: member, error: memberError } = await supabase
        .from("members")
        .select("*, plans(*)")
        .eq("qr_token", token)
        .single();

      if (memberError || !member) {
        setResult({ success: false, message: "QR Inválido o Socio no encontrado." });
        return;
      }

      // 2. Verificar si su cuota está vencida
      // Buscamos el último pago para ver la fecha de vencimiento
      const { data: lastPayment } = await supabase
        .from("payments")
        .select("next_due_date")
        .eq("member_id", member.id)
        .order("next_due_date", { ascending: false })
        .limit(1);

      const today = new Date();
      const dueDate = lastPayment?.[0]?.next_due_date ? new Date(lastPayment[0].next_due_date) : null;

      const isExpired = dueDate ? dueDate < today : true;

      if (isExpired) {
        setResult({
          success: false,
          message: "ACCESO DENEGADO: Cuota Vencida.",
          member,
          plan: member.plans
        });
        return;
      }

      // 3. Registrar la asistencia
      const { error: logError } = await supabase.from("attendance_logs").insert([
        {
          gym_id: member.gym_id,
          member_id: member.id,
          source: "qr"
        }
      ]);

      if (logError) throw logError;

      setResult({
        success: true,
        message: "¡ACCESO PERMITIDO!",
        member,
        plan: member.plans
      });

      // Limpiar el token para el próximo escaneo
      setToken("");

    } catch (error: any) {
      setResult({ success: false, message: "Error en el sistema: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Zona de Escaneo */}
      <div className="rounded-3xl border-4 border-dashed border-primary/30 p-8 bg-card/50 backdrop-blur flex flex-col items-center text-center">
        <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
          <QrCode className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight">Simulador de Escáner QR</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          En una app real, aquí se abriría la cámara. Por ahora, ingresa el <b>ID o Token</b> del socio.
        </p>

        <form onSubmit={handleScan} className="mt-8 w-full max-w-sm space-y-4">
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Pega el Token o ID del socio aquí..."
            className="h-14 w-full rounded-xl border-2 bg-background px-4 text-center text-lg font-mono focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
            autoFocus
          />
          <Button type="submit" className="h-14 w-full text-lg font-black uppercase" disabled={loading}>
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Validar Ingreso"}
          </Button>
        </form>
      </div>

      {/* Resultado del Escaneo */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "rounded-3xl border-4 p-8 flex flex-col items-center text-center shadow-2xl transition-all",
            result.success ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"
          )}
        >
          {result.success ? (
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          ) : (
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
          )}

          <h3 className={cn("text-3xl font-black uppercase", result.success ? "text-green-600" : "text-red-600")}>
            {result.message}
          </h3>

          {result.member && (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-md bg-background/50 rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-4 text-left">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Socio</p>
                  <p className="text-lg font-black leading-tight">{result.member.full_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-left">
                <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Plan</p>
                  <p className="text-lg font-black leading-tight">{result.plan?.name || "Sin Plan"}</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
