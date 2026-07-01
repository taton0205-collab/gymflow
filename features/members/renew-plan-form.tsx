"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { X, Loader2, RefreshCw, Banknote, CreditCard, Smartphone, Landmark, CheckCircle2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

const PAYMENT_METHODS = [
  { id: "cash", label: "Efectivo", icon: Banknote },
  { id: "transfer", label: "Transf.", icon: Landmark },
  { id: "mercado_pago", label: "M. Pago", icon: Smartphone },
  { id: "card", label: "Tarjeta", icon: CreditCard },
];

export function RenewPlanForm({ member, onUpdate, onClose }: { member: any, onUpdate: () => void, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [gymAlias, setGymAlias] = useState("SECUTOR.MP");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: plansData } = await supabase.from("plans").select("*").eq("active", true).order("duration_days", { ascending: true });
      if (plansData) setPlans(plansData);

      const { data: gymData } = await supabase.from("gyms").select("email").limit(1).single();
      if (gymData?.email) setGymAlias(gymData.email);
    };
    fetchData();
  }, []);

  const handleRenew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) return alert("Selecciona un rango para renovar.");

    setLoading(true);
    const supabase = createClient();

    try {
      const selectedPlan = plans.find(p => p.id === selectedPlanId);
      const today = new Date();
      const dueDate = new Date();
      dueDate.setDate(today.getDate() + selectedPlan.duration_days);

      // 1. Registrar el Pago
      const { error: paymentError } = await supabase.from("payments").insert([{
        gym_id: member.gym_id,
        member_id: member.id,
        plan_id: selectedPlanId,
        amount: selectedPlan.price,
        paid_amount: selectedPlan.price,
        method: paymentMethod,
        status: "paid",
        paid_at: new Date().toISOString(),
        due_date: new Date().toISOString().split('T')[0],
        next_due_date: dueDate.toISOString().split('T')[0],
      }]);

      if (paymentError) throw paymentError;

      // 2. Actualizar estado y plan del miembro
      const { error: memberError } = await supabase
        .from("members")
        .update({
          status: "active",
          plan_id: selectedPlanId
        })
        .eq("id", member.id);

      if (memberError) throw memberError;

      alert("¡Membresía renovada con éxito!");
      onUpdate();
      onClose();
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-[3rem] border border-primary/20 bg-background shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between border-b px-8 py-6 bg-primary/5">
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-primary flex items-center gap-2">
              <RefreshCw className="h-6 w-6" /> RENOVAR RANGO
            </h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Guerrero: {member.full_name}</p>
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"><X className="h-6 w-6" /></button>
        </div>

        <form onSubmit={handleRenew} className="p-8 space-y-8">
          {/* Selección de Plan */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">1. Seleccionar Nuevo Rango</h3>
            <div className="grid grid-cols-2 gap-3">
              {plans.map((plan) => (
                <button key={plan.id} type="button" onClick={() => setSelectedPlanId(plan.id)}
                  className={cn("flex flex-col rounded-2xl border-2 p-4 text-left transition-all",
                  selectedPlanId === plan.id ? "border-primary bg-primary/5 shadow-inner" : "bg-muted/10 border-transparent hover:border-primary/20")}>
                  <span className="text-[10px] font-black uppercase opacity-60">{plan.name}</span>
                  <span className="text-lg font-black mt-1 italic">${new Intl.NumberFormat("es-AR").format(plan.price)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Método de Pago */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">2. Forma de Pago</h3>
            <div className="grid grid-cols-4 gap-2">
              {PAYMENT_METHODS.map((method) => (
                <button key={method.id} type="button" onClick={() => setPaymentMethod(method.id)}
                  className={cn("flex flex-col items-center py-3 rounded-xl border-2 gap-1 transition-all",
                  paymentMethod === method.id ? "border-primary bg-primary/10" : "bg-muted/10 border-transparent")}>
                  <method.icon className={cn("h-4 w-4", paymentMethod === method.id ? "text-primary" : "text-muted-foreground")} />
                  <span className="text-[8px] font-black uppercase">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Alias */}
          {(paymentMethod === "mercado_pago" || paymentMethod === "transfer") && (
            <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase text-primary">Tributo vía:</p>
                <p className="text-base font-mono font-black italic">{gymAlias}</p>
              </div>
              <button type="button" onClick={() => copyToClipboard(gymAlias)} className="h-10 w-10 flex items-center justify-center bg-background rounded-xl border shadow-sm">
                {copied ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-primary" />}
              </button>
            </div>
          )}

          <Button type="submit" className="h-16 w-full text-lg font-black uppercase tracking-widest shadow-2xl skew-x-[-5deg]" disabled={loading}>
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "CONFIRMAR RENOVACIÓN"}
          </Button>
        </form>
      </div>
    </div>
  );
}
