import { z } from "zod";

/* ============================================================
 * DÍA 4 · Ventas
 * Schemas Zod para validar y normalizar peticiones de venta.
 * Normaliza productos repetidos acumulando sus cantidades
 * y rechaza cantidades cero o negativas.
 * ============================================================ */

export const itemVentaSchema = z.object({
  productId: z.coerce.number().int().positive("productId debe ser un entero positivo."),
  quantity: z.coerce.number().int().positive("quantity debe ser mayor a 0."),
  unitPrice: z.coerce.number().positive("unitPrice debe ser positivo.").multipleOf(0.01).optional(),
});

export const crearVentaSchema = z
  .object({
    customerId: z.coerce.number().int().positive("customerId debe ser un entero positivo.").optional(),
    storeId: z.coerce.number().int().positive("storeId debe ser un entero positivo.").optional(),
    items: z.array(itemVentaSchema).min(1, "Debe incluir al menos un item."),
  })
  .strict()
  .transform((data) => {
    // Normalizar productos repetidos: agrupar por productId sumando cantidades
    const map = new Map<number, ItemVentaInput>();
    for (const item of data.items) {
      const existing = map.get(item.productId);
      if (existing) {
        existing.quantity += item.quantity;
        if (item.unitPrice !== undefined && existing.unitPrice === undefined) {
          existing.unitPrice = item.unitPrice;
        }
      } else {
        map.set(item.productId, { ...item });
      }
    }
    return {
      ...data,
      items: Array.from(map.values()),
    };
  });

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive("id debe ser un entero positivo."),
});

export const listaVentasQuerySchema = z.object({
  storeId: z.coerce.number().int().positive().optional(),
  customerId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ItemVentaInput = z.infer<typeof itemVentaSchema>;
export type CrearVentaBody = z.infer<typeof crearVentaSchema>;
export type ListaVentasQuery = z.infer<typeof listaVentasQuerySchema>;
