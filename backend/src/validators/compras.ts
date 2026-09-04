import { z } from "zod";

/* ============================================================
 * DÍA 3 · Compras
 * Schemas Zod para params, query y body. El controlador NO
 * repite validaciones manuales: valida y normaliza aquí.
 * ============================================================ */

export const TIPOS_DOCUMENTO = ["BOLETA", "FACTURA", "GUIA_DESPACHO", "OTRO"] as const;
export const METODOS_PAGO = ["EFECTIVO", "TRANSFERENCIA", "DEBITO", "CREDITO", "OTRO"] as const;

const itemCompraSchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive(),
  // Costo unitario > 0, con precisión de centavo (multipleOf evita 12.005)
  unitCost: z.coerce.number().positive().multipleOf(0.01),
});

export const crearCompraSchema = z
  .object({
    supplierId: z.coerce.number().int().positive(),
    storeId: z.coerce.number().int().positive(),
    documentType: z.enum(TIPOS_DOCUMENTO),
    documentNumber: z
      .string()
      .trim()
      .min(1, "documentNumber es requerido.")
      .max(50)
      .transform((v) => v.toUpperCase()),
    paymentMethod: z.enum(METODOS_PAGO).default("OTRO"),
    items: z.array(itemCompraSchema).min(1, "Debe incluir al menos un item."),
  })
  .strict()
  // No se permite el mismo producto repetido: se rechaza antes de tocar la DB.
  .refine(
    (c) => new Set(c.items.map((i) => i.productId)).size === c.items.length,
    { message: "items: hay productos repetidos; consolida la cantidad en un solo item." },
  );

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const listaComprasQuerySchema = z.object({
  supplierId: z.coerce.number().int().positive().optional(),
  storeId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ItemCompraInput = z.infer<typeof itemCompraSchema>;
export type CrearCompraBody = z.infer<typeof crearCompraSchema>;
export type ListaComprasQuery = z.infer<typeof listaComprasQuerySchema>;
