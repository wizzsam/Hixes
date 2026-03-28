import { z } from "zod";

export const servicioSchema = z.object({
  tratamiento: z
    .string()
    .min(3, "El nombre del tratamiento debe tener al menos 3 caracteres")
    .max(255),
  descripcion: z
    .string()
    .max(1000, "La descripción es muy larga")
    .optional()
    .or(z.literal('')),
  // Cambiamos invalid_type_error por message
  precio_base: z
    .number({ message: "El precio debe ser un número" }) 
    .min(0, "El precio no puede ser negativo"),
});

export type ServicioFormData = z.infer<typeof servicioSchema>;