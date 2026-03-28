import { z } from "zod";

export const rolSchema = z.object({
  nombre_rol: z.string().min(2, { message: "El nombre del rol debe tener al menos 2 caracteres" }),
  descripcion: z.string().optional(),
});

export type RolFormValues = z.infer<typeof rolSchema>;
