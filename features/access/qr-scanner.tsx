"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { QrCode, Loader2, CheckCircle2, XCircle, User, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
      const { data: member, error: memberError } = await supabase
        .from("members")
        .select("*, plans(*)")
        .eq("qr_token", token)
        .single();

      if (memberError || !member) {
        setResult({ success: false, message: "QR Inválido." });
        return;
      }

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
        setResult({ success: false, message: "DENEGADO: Cuota Vencida.", member, plan: member.plans });
        return;
      }

      await supabase.from("attendance_logs").insert([{ gym_id: member.gym_id, member_id: member.id, source: "qr" }]);

      setResult({ success: true, message: "¡BIENVENIDO!", member, plan: member.plans });
      setToken("");

    } catch (error: any) {
      setResult({ success: false, message: "Error: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="rounded-3xl border-4 border-dashed border-primary/30 p-8 bg-card/50 backdrop-blur flex flex-col items-center text-center shadow-inner">
        <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
          <QrCode className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-black uppercase italic">Escáner de Acceso</h2>
        <form onSubmit={handleScan} className="mt-8 w-full max-w-sm space-y-4">
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Token del socio..."
            className="h-12 w-full rounded-xl border-2 bg-background px-4 text-center font-mono focus:border-primary outline-none"
          />
          <Button type="submit" className="h-12 w-full font-black uppercase" disabled={loading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Validar"}
          </Button>
        </form>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className={cn("rounded-3xl border-4 p-8 flex flex-col items-center text-center shadow-2xl",
            result.success ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10")}>
          {result.success ? <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" /> : <XCircle className="h-12 w-12 text-red-500 mb-2" />}
          <h3 className={cn("text-2xl font-black uppercase", result.success ? "text-green-600" : "text-red-600")}>{result.message}</h3>
          {result.member && (
            <div className="mt-6 flex gap-4 bg-background/50 p-4 rounded-xl border border-white/20">
              <div className="text-left">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Socio</p>
                <p className="text-sm font-black uppercase italic">{result.member.full_name}</p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
