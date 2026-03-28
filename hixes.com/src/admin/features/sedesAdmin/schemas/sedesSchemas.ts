import { z } from "zod";

export const sedeSchema = z.object({
  empresa_id: z.number().min(1, { message: "Debe seleccionar una empresa" }),
  nombre_sede: z.string().min(3, { message: "El nombre de la sede debe tener al menos 3 caracteres" }),
  direccion_sede: z.string().min(5, { message: "La dirección debe tener al menos 5 caracteres" }),
});

export type SedeFormValues = z.infer<typeof sedeSchema>;
