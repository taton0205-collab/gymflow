export const metrics = [
  { label: "Socios activos", value: "842", delta: "+8.4%", tone: "success" as const },
  { label: "Socios vencidos", value: "37", delta: "-3.1%", tone: "warning" as const },
  { label: "Ingresos del mes", value: "$18.2M", delta: "+14.8%", tone: "success" as const },
  { label: "Ingresos diarios", value: "$742K", delta: "+6.2%", tone: "success" as const },
  { label: "Nuevos socios", value: "64", delta: "+11", tone: "info" as const }
];

export const revenueBars = [42, 58, 54, 68, 61, 78, 72, 84, 80, 92, 88, 96];

export const attendanceBars = [35, 28, 44, 52, 67, 81, 88, 74, 49, 31, 22, 18];

export const upcoming = [
  { name: "Martina Gomez", plan: "Mensual Pro", due: "Hoy", state: "Vence hoy" },
  { name: "Lucas Ferreyra", plan: "Trimestral", due: "Manana", state: "Pendiente" },
  { name: "Camila Ortega", plan: "Libre", due: "3 dias", state: "Programado" }
];

export const membershipCalendar = [
  { day: 1, members: [] },
  { day: 2, members: [{ name: "Martina Gomez", plan: "Mensual Pro", tone: "danger" as const }] },
  { day: 3, members: [{ name: "Lucas Ferreyra", plan: "Trimestral", tone: "warning" as const }] },
  { day: 4, members: [] },
  { day: 5, members: [{ name: "Camila Ortega", plan: "Libre", tone: "info" as const }] },
  { day: 6, members: [] },
  { day: 7, members: [{ name: "Rocio Medina", plan: "Mensual", tone: "warning" as const }] },
  { day: 8, members: [] },
  { day: 9, members: [{ name: "Tomas Alvarez", plan: "Anual", tone: "success" as const }] },
  { day: 10, members: [] },
  { day: 11, members: [{ name: "Agustin Perez", plan: "Personalizado", tone: "info" as const }] },
  { day: 12, members: [] },
  { day: 13, members: [] },
  { day: 14, members: [{ name: "Sofia Rivas", plan: "Mensual Pro", tone: "warning" as const }] }
];

export const birthdays = [
  { name: "Nicolas Silva", date: "Hoy", age: 29 },
  { name: "Valentina Ruiz", date: "Jueves", age: 34 }
];

export const insights = [
  "El horario de mayor concurrencia sigue siendo de 18 a 21 hs.",
  "El plan mensual representa el 65% de los ingresos recurrentes.",
  "La asistencia semanal bajo 18% frente al promedio del mes pasado.",
  "Conviene reponer creatina antes del viernes para evitar quiebre de stock."
];
