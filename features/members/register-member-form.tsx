"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, X, Loader2, Banknote, CreditCard, Smartphone, Landmark, Copy, CheckCircle2, Cake } from "lucide-react";
import { cn } from "@/lib/utils";

const PAYMENT_METHODS = [
  { id: "cash", label: "Efectivo", icon: Banknote },
  { id: "transfer", label: "Transf.", icon: Landmark },
  { id: "mercado_pago", label: "M. Pago", icon: Smartphone },
  { id: "card", label: "Tarjeta", icon: CreditCard },
];

export function RegisterMemberForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [copied, setCopied] = useState(false);
  const [gymAlias, setGymAlias] = useState("GYM.FLOW.MP");

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        const supabase = createClient();

        // Cargar Planes
        const { data: plansData } = await supabase
          .from("plans")
          .select("id, name, price, duration_days")
          .eq("active", true)
          .order("duration_days", { ascending: true });
        if (plansData) setPlans(plansData);

        // Cargar Alias del Gimnasio
        const { data: gymData } = await supabase.from("gyms").select("email").limit(1).single();
        if (gymData?.email) setGymAlias(gymData.email);
      };
      fetchData();
    }
  }, [isOpen]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) return alert("Selecciona un plan.");
    setLoading(true);
    const supabase = createClient();

    try {
      let { data: gyms } = await supabase.from("gyms").select("id").limit(1);
      let gymId = gyms?.[0]?.id;

      if (!gymId) {
        const { data: newGym, error: gymError } = await supabase
          .from("gyms")
          .insert([{ name: "Mi Gimnasio", slug: "gym-" + Math.random().toString(36).substring(7) }])
          .select().single();
        if (gymError) throw gymError;
        gymId = newGym.id;
      }

      const { data: newMember, error: memberError } = await supabase
        .from("members")
        .insert([{
          gym_id: gymId,
          plan_id: selectedPlanId,
          full_name: fullName,
          dni: dni,
          phone: phone,
          birth_date: birthDate || null,
          status: "active"
        }])
        .select().single();
      if (memberError) throw memberError;

      const selectedPlan = plans.find(p => p.id === selectedPlanId);
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + selectedPlan.duration_days);

      const { error: paymentError } = await supabase.from("payments").insert([{
        gym_id: gymId, member_id: newMember.id, plan_id: selectedPlanId, amount: selectedPlan.price,
        paid_amount: selectedPlan.price, method: paymentMethod, status: "paid", paid_at: new Date().toISOString(),
        due_date: new Date().toISOString().split('T')[0], next_due_date: dueDate.toISOString().split('T')[0],
      }]);
      if (paymentError) throw paymentError;

      alert("¡Socio registrado con éxito!");
      setIsOpen(false);
      setFullName(""); setDni(""); setPhone(""); setBirthDate(""); setSelectedPlanId("");
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="h-11 px-6 font-bold shadow-md transition-all active:scale-95">
        <Plus className="mr-2 h-5 w-5" />
        Registrar socio
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl border bg-background shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b px-8 py-5">
              <h2 className="text-2xl font-black tracking-tight">Registro de Socio</h2>
              <button onClick={() => setIsOpen(false)} className="rounded-full p-2 hover:bg-muted transition-colors"><X className="h-6 w-6" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[80vh] overflow-y-auto">
              <div className="space-y-5">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">1. Datos Personales</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground ml-1">Nombre y Apellido *</label>
                    <input required value={fullName} onChange={(e) => setFullName(e.target.value)}
                      className="h-12 w-full rounded-lg border bg-muted/20 px-4 text-base focus:ring-2 focus:ring-primary/30 outline-none transition-all" placeholder="Juan Pérez" />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground ml-1">DNI</label>
                      <input value={dni} onChange={(e) => setDni(e.target.value)} className="h-12 w-full rounded-lg border bg-muted/20 px-4 text-base outline-none" placeholder="Documento" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground ml-1">Teléfono</label>
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12 w-full rounded-lg border bg-muted/20 px-4 text-base outline-none" placeholder="+54 11..." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground ml-1 flex items-center gap-2">
                      <Cake className="h-3 w-3" /> Fecha de Nacimiento
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="h-12 w-full rounded-lg border bg-muted/20 px-4 text-base outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">2. Seleccionar Plan</h3>
                <div className="grid grid-cols-2 gap-3">
                  {plans.map((plan) => (
                    <button key={plan.id} type="button" onClick={() => setSelectedPlanId(plan.id)}
                      className={cn("flex flex-col rounded-xl border-2 p-4 text-left transition-all",
                      selectedPlanId === plan.id ? "border-primary bg-primary/5 shadow-inner" : "bg-card border-transparent hover:border-muted-foreground/30")}>
                      <span className="text-xs font-bold text-muted-foreground uppercase">{plan.name}</span>
                      <span className="text-xl font-black mt-1">${new Intl.NumberFormat("es-AR").format(plan.price)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">3. Método de Pago</h3>
                <div className="grid grid-cols-4 gap-3">
                  {PAYMENT_METHODS.map((method) => (
                    <button key={method.id} type="button" onClick={() => setPaymentMethod(method.id)}
                      className={cn("flex flex-col items-center py-4 rounded-xl border-2 gap-2 transition-all",
                      paymentMethod === method.id ? "border-primary bg-primary/10" : "bg-muted/20 border-transparent hover:bg-muted/40")}>
                      <method.icon className={cn("h-6 w-6", paymentMethod === method.id ? "text-primary" : "text-muted-foreground")} />
                      <span className="text-[10px] font-black uppercase tracking-tighter">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {(paymentMethod === "mercado_pago" || paymentMethod === "transfer") && (
                <div className="rounded-xl bg-primary/5 border-2 border-primary/20 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase text-primary mb-1">Alias para Cobrar:</p>
                    <p className="text-lg font-mono font-black">{gymAlias}</p>
                  </div>
                  <button type="button" onClick={() => copyToClipboard(gymAlias)} className="h-12 w-12 flex items-center justify-center bg-background rounded-xl border shadow-sm active:scale-90 transition-all">
                    {copied ? <CheckCircle2 className="h-6 w-6 text-success" /> : <Copy className="h-6 w-6 text-primary" />}
                  </button>
                </div>
              )}

              <Button type="submit" className="h-16 w-full text-lg font-black uppercase tracking-widest shadow-xl active:scale-[0.98] transition-all" disabled={loading || !selectedPlanId}>
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> :
                `Cobrar $${selectedPlanId ? new Intl.NumberFormat("es-AR").format(plans.find(p => p.id === selectedPlanId)?.price || 0) : '0'}`}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
