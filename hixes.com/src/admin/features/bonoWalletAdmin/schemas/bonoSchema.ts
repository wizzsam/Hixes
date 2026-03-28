import { z } from "zod";

export const bonoWalletSchema = z.object({
  monto_minimo: z
    .number({ message: "El monto mínimo debe ser un número" })
    .min(0, "El monto mínimo no puede ser negativo"),
  
  monto_maximo: z
    .number({ message: "El monto máximo debe ser un número" })
    .min(0, "El monto máximo no puede ser negativo")
    .nullable()
    .optional(),

  bono_porcentaje: z
    .number({ message: "El porcentaje debe ser un número" })
    .min(0, "El porcentaje no puede ser menor a 0")
    .max(100, "El porcentaje no puede ser mayor a 100"),

  empresa_ids: z
    .array(z.number())
    .min(1, "Debe seleccionar al menos una empresa"),
}).refine((data) => {
  if (data.monto_maximo !== null && data.monto_maximo !== undefined) {
    return data.monto_maximo > data.monto_minimo;
  }
  return true;
}, {
  message: "El monto máximo debe ser mayor al monto mínimo",
  path: ["monto_maximo"], 
});