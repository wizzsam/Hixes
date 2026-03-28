import { z } from "zod";

export const usuarioSchema = z.object({
  empresa_id: z.number().nullable().optional(),
  sede_ids: z.array(z.number()).optional().default([]),
  rol_id: z.number().min(1, { message: "Debe seleccionar un rol" }),
  nombre_completo: z.string().min(3, { message: "El nombre completo debe tener al menos 3 caracteres" }),
  correo: z.string().email({ message: "Debe ser un correo válido" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }).optional(),
});

export type UsuarioFormValues = z.infer<typeof usuarioSchema>;
