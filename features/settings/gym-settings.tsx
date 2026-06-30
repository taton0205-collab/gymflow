"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Building2, Smartphone, MapPin, Phone, Globe } from "lucide-react";

export function GymSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gym, setGym] = useState<any>(null);

  // Campos del formulario
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [alias, setAlias] = useState("");

  const fetchGym = async () => {
    const supabase = createClient();
    // Obtenemos el primer gimnasio (en un SaaS real filtraríamos por el ID del usuario)
    const { data, error } = await supabase.from("gyms").select("*").limit(1).single();

    if (data) {
      setGym(data);
      setName(data.name || "");
      setAddress(data.address || "");
      setPhone(data.phone || "");
      // El alias lo guardamos en una columna que crearemos o en una columna existente de texto para esta demo
      // Usaremos la columna 'email' temporalmente como alias si no quieres ejecutar SQL,
      // pero lo ideal es crear la columna.
      setAlias(data.email || "");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGym();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("gyms")
        .update({
          name,
          address,
          phone,
          email: alias // Usando email como placeholder para el alias de MP
        })
        .eq("id", gym.id);

      if (error) throw error;
      alert("¡Configuración guardada correctamente!");
    } catch (error: any) {
      alert("Error al guardar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-4xl space-y-8">
      <form onSubmit={handleSave} className="space-y-8">
        {/* Sección: Identidad del Gimnasio */}
        <div className="rounded-3xl border bg-card/40 p-8 backdrop-blur shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase italic tracking-tight">Identidad del Gimnasio</h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Información básica y contacto</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-muted-foreground ml-1">Nombre del Gimnasio</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 w-full rounded-xl border bg-background px-4 font-bold outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Ej: Iron Fitness Gym"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-muted-foreground ml-1 flex items-center gap-2">
                <MapPin className="h-3 w-3" /> Dirección
              </label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-12 w-full rounded-xl border bg-background px-4 font-bold outline-none"
                placeholder="Calle y número..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-muted-foreground ml-1 flex items-center gap-2">
                <Phone className="h-3 w-3" /> Teléfono de Contacto
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 w-full rounded-xl border bg-background px-4 font-bold outline-none"
                placeholder="+54 11 ..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-muted-foreground ml-1 flex items-center gap-2">
                <Globe className="h-3 w-3" /> Sitio Web o Redes
              </label>
              <input
                className="h-12 w-full rounded-xl border bg-background px-4 font-bold outline-none opacity-50"
                placeholder="https://..."
                disabled
              />
            </div>
          </div>
        </div>

        {/* Sección: Finanzas y Pagos */}
        <div className="rounded-3xl border bg-card/40 p-8 backdrop-blur shadow-sm space-y-6 border-l-4 border-l-primary">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase italic tracking-tight text-primary">Configuración de Cobro</h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Mercado Pago y Transferencias</p>
            </div>
          </div>

          <div className="max-w-md space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-primary ml-1">Alias de Mercado Pago / CVU</label>
              <div className="relative">
                <input
                  required
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  className="h-14 w-full rounded-xl border-2 border-primary/20 bg-primary/[0.02] px-4 font-mono font-black text-lg text-primary outline-none focus:border-primary transition-all"
                  placeholder="TU.ALIAS.AQUI"
                />
                <p className="text-[10px] font-bold text-muted-foreground mt-2 italic">
                  * Este alias es el que verán tus empleados y clientes al registrar un pago.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Button type="submit" className="h-16 w-full text-xl font-black uppercase tracking-[0.2em] shadow-xl active:scale-[0.98] transition-all" disabled={saving}>
          {saving ? <Loader2 className="h-6 w-6 animate-spin" /> : (
            <div className="flex items-center gap-2">
              <Save className="h-6 w-6" /> GUARDAR TODOS LOS CAMBIOS
            </div>
          )}
        </Button>
      </form>
    </div>
  );
}
