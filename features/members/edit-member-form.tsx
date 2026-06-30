"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { X, Loader2, Save, User, Fingerprint, Phone, Cake } from "lucide-react";

export function EditMemberForm({ member, onUpdate, onClose }: { member: any, onUpdate: () => void, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(member.full_name || "");
  const [dni, setDni] = useState(member.dni || "");
  const [phone, setPhone] = useState(member.phone || "");
  const [birthDate, setBirthDate] = useState(member.birth_date || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("members")
        .update({
          full_name: fullName,
          dni: dni,
          phone: phone,
          birth_date: birthDate || null
        })
        .eq("id", member.id);

      if (error) throw error;

      alert("Socio actualizado con éxito");
      onUpdate();
      onClose();
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-[2.5rem] border bg-background shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b px-8 py-6 bg-muted/20">
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Editar Perfil</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Actualizar información de socio</p>
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"><X className="h-6 w-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-primary ml-1 flex items-center gap-2">
                <User className="h-3 w-3" /> Nombre y Apellido
              </label>
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="h-12 w-full rounded-2xl border bg-muted/20 px-4 text-base font-bold outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 flex items-center gap-2">
                  <Fingerprint className="h-3 w-3" /> DNI
                </label>
                <input value={dni} onChange={(e) => setDni(e.target.value)} className="h-12 w-full rounded-2xl border bg-muted/20 px-4 text-base font-bold outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 flex items-center gap-2">
                  <Phone className="h-3 w-3" /> Teléfono
                </label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12 w-full rounded-2xl border bg-muted/20 px-4 text-base font-bold outline-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 flex items-center gap-2">
                <Cake className="h-3 w-3" /> Fecha de Nacimiento
              </label>
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)}
                className="h-12 w-full rounded-2xl border bg-muted/20 px-4 text-base font-bold outline-none" />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="ghost" onClick={onClose} className="h-14 flex-1 font-black uppercase text-xs">Cancelar</Button>
            <Button type="submit" className="h-14 flex-[2] text-sm font-black uppercase tracking-widest shadow-xl" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> GUARDAR CAMBIOS</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
