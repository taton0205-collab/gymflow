"use client";

// V1.0.1 - Fix Production Build
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, X, Loader2, Dumbbell, Trash2, Save, User } from "lucide-react";
import { cn } from "@/lib/utils";

type Exercise = {
  name: string;
  sets: string;
  reps: string;
  weight: string;
  rest: string;
};

export function RoutineBuilder() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [routineName, setRoutineName] = useState("Rutina de Entrenamiento");
  const [objective, setObjective] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: "", sets: "4", reps: "12", weight: "", rest: "60" }
  ]);

  useEffect(() => {
    if (isOpen) {
      const fetchMembers = async () => {
        const supabase = createClient();
        const { data } = await supabase.from("members").select("id, full_name").eq("status", "active");
        if (data) setMembers(data);
      };
      fetchMembers();
    }
  }, [isOpen]);

  const addExercise = () => {
    setExercises([...exercises, { name: "", sets: "4", reps: "12", weight: "", rest: "60" }]);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof Exercise, value: string) => {
    const newExercises = [...exercises];
    newExercises[index][field] = value;
    setExercises(newExercises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return alert("Selecciona un socio.");
    if (exercises.some(ex => !ex.name)) return alert("Todos los ejercicios deben tener nombre.");

    setLoading(true);
    const supabase = createClient();

    try {
      let { data: gyms } = await supabase.from("gyms").select("id").limit(1);
      const gymId = gyms?.[0]?.id;

      // 1. Crear la Rutina (Cabecera)
      const { data: routine, error: routineError } = await supabase
        .from("routines")
        .insert([{
          gym_id: gymId,
          member_id: selectedMemberId,
          name: routineName,
          objective: objective,
          active: true
        }])
        .select().single();

      if (routineError) throw routineError;

      // 2. Crear los Ejercicios (Detalle)
      const exercisesToInsert = exercises.map((ex, index) => ({
        routine_id: routine.id,
        name: ex.name,
        exercise_order: index,
        sets: parseInt(ex.sets),
        reps: ex.reps,
        weight: ex.weight,
        rest_seconds: parseInt(ex.rest)
      }));

      const { error: exercisesError } = await supabase
        .from("routine_exercises")
        .insert(exercisesToInsert);

      if (exercisesError) throw exercisesError;

      alert("¡Rutina creada y asignada con éxito!");
      setIsOpen(false);
      resetForm();
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedMemberId("");
    setRoutineName("Rutina de Entrenamiento");
    setObjective("");
    setExercises([{ name: "", sets: "4", reps: "12", weight: "", rest: "60" }]);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="h-12 px-8 font-black uppercase tracking-widest shadow-xl">
        <Plus className="mr-2 h-5 w-5" /> Crear Rutina
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-4xl rounded-3xl border bg-background shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-8 py-6 border-b flex items-center justify-between bg-muted/20">
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">Constructor de Rutinas</h2>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Diseño de entrenamiento personalizado</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10">
              {/* Sección 1: Socio y Meta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                    <User className="h-3 w-3" /> Seleccionar Socio *
                  </label>
                  <select
                    required
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="h-12 w-full rounded-xl border bg-card px-4 font-bold outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Buscar socio...</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                    <Save className="h-3 w-3" /> Nombre de Rutina
                  </label>
                  <input
                    required
                    value={routineName}
                    onChange={(e) => setRoutineName(e.target.value)}
                    className="h-12 w-full rounded-xl border bg-card px-4 font-bold outline-none"
                    placeholder="Ej: Full Body A"
                  />
                </div>
              </div>

              {/* Sección 2: Lista de Ejercicios */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">Listado de Ejercicios</h3>
                  <div className="h-px flex-1 mx-4 bg-border"></div>
                  <Button type="button" variant="outline" size="sm" onClick={addExercise} className="font-black text-[10px] uppercase">
                    <Plus className="h-3 w-3 mr-1" /> Añadir Ejercicio
                  </Button>
                </div>

                <div className="space-y-4">
                  {exercises.map((ex, index) => (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={index}
                      className="group relative grid grid-cols-12 gap-3 bg-muted/10 p-4 rounded-2xl border hover:border-primary/30 transition-all"
                    >
                      <div className="col-span-12 md:col-span-4 space-y-1">
                        <label className="text-[8px] font-black uppercase text-muted-foreground ml-1">Ejercicio</label>
                        <input
                          value={ex.name}
                          onChange={(e) => updateExercise(index, "name", e.target.value)}
                          className="h-10 w-full rounded-lg border bg-background px-3 text-sm font-bold outline-none"
                          placeholder="Nombre del ejercicio"
                        />
                      </div>
                      <div className="col-span-3 md:col-span-2 space-y-1">
                        <label className="text-[8px] font-black uppercase text-muted-foreground ml-1">Series</label>
                        <input
                          value={ex.sets}
                          onChange={(e) => updateExercise(index, "sets", e.target.value)}
                          className="h-10 w-full rounded-lg border bg-background px-3 text-sm text-center font-bold outline-none"
                        />
                      </div>
                      <div className="col-span-3 md:col-span-2 space-y-1">
                        <label className="text-[8px] font-black uppercase text-muted-foreground ml-1">Reps</label>
                        <input
                          value={ex.reps}
                          onChange={(e) => updateExercise(index, "reps", e.target.value)}
                          className="h-10 w-full rounded-lg border bg-background px-3 text-sm text-center font-bold outline-none"
                        />
                      </div>
                      <div className="col-span-3 md:col-span-2 space-y-1">
                        <label className="text-[8px] font-black uppercase text-muted-foreground ml-1">Peso</label>
                        <input
                          value={ex.weight}
                          onChange={(e) => updateExercise(index, "weight", e.target.value)}
                          className="h-10 w-full rounded-lg border bg-background px-3 text-sm text-center font-bold outline-none"
                          placeholder="Kg"
                        />
                      </div>
                      <div className="col-span-3 md:col-span-2 flex items-end pb-0.5">
                        <button
                          type="button"
                          onClick={() => removeExercise(index)}
                          className="h-10 w-full rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </form>

            {/* Footer con Acción */}
            <div className="p-8 border-t bg-muted/10">
              <Button
                onClick={handleSubmit}
                className="h-16 w-full text-xl font-black uppercase tracking-[0.2em] shadow-2xl active:scale-[0.98] transition-all"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Guardar y Asignar Rutina"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
