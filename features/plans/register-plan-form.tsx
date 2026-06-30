"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, X, Loader2 } from "lucide-react";

export function RegisterPlanForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("30");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();

    try {
      // Obtener el ID del gimnasio
      let { data: gyms } = await supabase.from("gyms").select("id").limit(1);
      const gymId = gyms?.[0]?.id;

      if (!gymId) throw new Error("No se encontró un gimnasio configurado.");

      const { error } = await supabase.from("plans").insert([
        {
          gym_id: gymId,
          name: name,
          price: parseFloat(price),
          duration_days: parseInt(duration),
          active: true
        }
      ]);

      if (error) throw error;

      alert("¡Plan creado con éxito!");
      setIsOpen(false);
      setName("");
      setPrice("");
      setDuration("30");
    } catch (error: any) {
      console.error(error);
      alert("Error al crear plan: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4" />
        Crear plan
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Nuevo Plan de Membresía</h2>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del Plan *</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Ej: Pase Libre Musculación"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Precio ($) *</label>
                <input
                  required
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Ej: 15000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duración (Días) *</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="1">1 día (Clase suelta)</option>
                  <option value="7">7 días (Semanal)</option>
                  <option value="30">30 días (Mensual)</option>
                  <option value="90">90 días (Trimestral)</option>
                  <option value="365">365 días (Anual)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar Plan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
