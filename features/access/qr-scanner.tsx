"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { QrCode, Loader2, CheckCircle2, XCircle, User, Calendar, Camera, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

declare global {
  interface Window {
    Html5QrcodeScanner: any;
  }
}

export function QRScanner() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    member?: any;
    plan?: any;
    dueDate?: string;
  } | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    // Cargar script de escaneo vía CDN para no requerir npm install
    const script = document.createElement("script");
    script.src = "https://unpkg.com/html5-qrcode";
    script.async = true;
    script.onload = () => {
      console.log("Scanner script loaded");
    };
    document.body.appendChild(script);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const startScanner = () => {
    if (!window.Html5QrcodeScanner) return;
    setCameraActive(true);
    setResult(null);

    const onScanSuccess = (decodedText: string) => {
      handleValidateToken(decodedText);
      if (scannerRef.current) {
        scannerRef.current.clear();
        setCameraActive(false);
      }
    };

    scannerRef.current = new window.Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );
    scannerRef.current.render(onScanSuccess);
  };

  const handleValidateToken = async (token: string) => {
    setLoading(true);
    const supabase = createClient();

    try {
      // 1. Buscar socio
      const { data: member, error: memberError } = await supabase
        .from("members")
        .select("*, plans(*)")
        .eq("qr_token", token)
        .single();

      if (memberError || !member) {
        setResult({ success: false, message: "QR INVÁLIDO - SOCIO NO REGISTRADO" });
        return;
      }

      // 2. Validar Pago
      const { data: lastPayment } = await supabase
        .from("payments")
        .select("next_due_date, status")
        .eq("member_id", member.id)
        .order("next_due_date", { ascending: false })
        .limit(1);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = lastPayment?.[0]?.next_due_date ? new Date(lastPayment[0].next_due_date) : null;

      const isPaid = lastPayment?.[0]?.status === 'paid';
      const isExpired = dueDate ? dueDate < today : true;

      const accessGranted = isPaid && !isExpired;

      // 3. Registrar en Historial (Tabla attendance_logs)
      // Nota: Idealmente agregaríamos columnas de estado, pero usaremos las existentes
      await supabase.from("attendance_logs").insert([{
        gym_id: member.gym_id,
        member_id: member.id,
        source: accessGranted ? "qr_success" : "qr_denied",
        // Usamos notes o metadatos si existieran, por ahora registro base
      }]);

      if (accessGranted) {
        setResult({
          success: true,
          message: "ACCESO AUTORIZADO",
          member,
          plan: member.plans,
          dueDate: dueDate?.toLocaleDateString()
        });
      } else {
        setResult({
          success: false,
          message: "ACCESO DENEGADO - PAGO PENDIENTE",
          member,
          plan: member.plans,
          dueDate: dueDate?.toLocaleDateString()
        });
      }

    } catch (e: any) {
      setResult({ success: false, message: "ERROR DE CONEXIÓN" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4">
      {/* Contenedor del Escáner */}
      <div className="relative rounded-[3rem] border-4 border-primary/20 bg-card/40 backdrop-blur-xl overflow-hidden shadow-2xl">
        {!cameraActive && !result && (
          <div className="p-20 text-center space-y-6">
            <div className="h-24 w-24 bg-primary/10 rounded-3xl mx-auto flex items-center justify-center animate-pulse">
              <Camera className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">Escáner SECUTOR</h2>
              <p className="text-muted-foreground mt-2 font-medium">Activa la cámara para validar el acceso de un miembro.</p>
            </div>
            <Button onClick={startScanner} className="h-16 px-12 text-lg font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20">
              ACTIVAR CÁMARA
            </Button>
          </div>
        )}

        <div id="reader" className={cn("w-full", !cameraActive && "hidden")}></div>

        {cameraActive && (
           <div className="p-4 bg-background/80 border-t flex justify-center">
             <Button variant="ghost" onClick={() => { scannerRef.current?.clear(); setCameraActive(false); }} className="font-black text-[10px] uppercase">
               Cancelar Escaneo
             </Button>
           </div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                "absolute inset-0 z-10 flex flex-col items-center justify-center p-8 text-center",
                result.success ? "bg-green-600" : "bg-red-600"
              )}
            >
              <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                {result.success ? <CheckCircle2 className="h-32 w-32 text-white mb-6" /> : <XCircle className="h-32 w-32 text-white mb-6" />}
              </motion.div>

              <h3 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                {result.message}
              </h3>

              {result.member && (
                <div className="mt-12 w-full max-w-md bg-white/10 backdrop-blur-md rounded-[2rem] p-8 border border-white/20 text-white space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                     <div className="text-left">
                       <p className="text-[10px] font-black uppercase opacity-60">Gladiador</p>
                       <p className="text-2xl font-black italic">{result.member.full_name}</p>
                     </div>
                     <User className="h-8 w-8 opacity-40" />
                  </div>

                  <div className="grid grid-cols-2 gap-8 text-left">
                    <div>
                      <p className="text-[10px] font-black uppercase opacity-60">Rango</p>
                      <p className="font-bold italic uppercase">{result.plan?.name || "Sin Rango"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase opacity-60">Vencimiento</p>
                      <p className={cn("font-bold italic", !result.success && "text-red-200")}>
                        {result.dueDate || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={() => setResult(null)}
                variant="outline"
                className="mt-12 h-14 px-10 border-white text-white hover:bg-white hover:text-black font-black uppercase tracking-widest"
              >
                <RefreshCw className="mr-2 h-5 w-5" /> Siguiente Escaneo
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info Extra */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-3xl border bg-card/40 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-muted-foreground">Validación</p>
            <p className="text-sm font-bold">Verificación de Tributos en Tiempo Real</p>
          </div>
        </div>
        <div className="p-6 rounded-3xl border bg-card/40 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <QrCode className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-muted-foreground">Seguridad</p>
            <p className="text-sm font-bold">Un QR Intransferible por Miembro</p>
          </div>
        </div>
      </div>
    </div>
  );
}
