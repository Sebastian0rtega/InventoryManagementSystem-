import { z } from "zod";

/* ============================================================
 * DÍA 5 · Inventario
 * Schemas Zod para el listado de stock, los ajustes manuales
 * y la consulta (solo lectura) de movimientos.
 * ============================================================ */

export const listaInventarioQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).max(100).optional(),
  storeId: z.coerce.number().int().positive().optional(),
  status: z.enum(["NORMAL", "LOW", "OUT"]).optional(),
  sort: z.enum(["stock_actual", "-stock_actual"]).optional(),
});

export const ajusteInventarioSchema = z
  .object({
    storeId: z.coerce.number().int().positive("storeId debe ser un entero positivo.").optional(),
    productId: z.coerce.number().int().positive("productId debe ser un entero positivo."),
    tipo: z.enum(["ENTRADA", "SALIDA"]),
    cantidad: z.coerce.number().int().positive("cantidad debe ser mayor a 0."),
    motivo: z.string().trim().min(3, "motivo es obligatorio (mínimo 3 caracteres).").max(255),
  })
  .strict();

export const listaMovimientosQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive("id debe ser un entero positivo."),
});

export type ListaInventarioQuery = z.infer<typeof listaInventarioQuerySchema>;
export type AjusteInventarioBody = z.infer<typeof ajusteInventarioSchema>;
export type ListaMovimientosQuery = z.infer<typeof listaMovimientosQuerySchema>;
