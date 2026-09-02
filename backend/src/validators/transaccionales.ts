import { z } from "zod";

/**
 * Schemas Zod para el dominio transaccional (compras / ventas / inventario).
 * Se usan en la capa de endpoints para validar entrada antes de tocar la DB.
 */

export const detalleCompraSchema = z.object({
  producto_id: z.number().int().positive(),
  cantidad: z.number().int().positive(),
  precio_compra: z.number().nonnegative().multipleOf(0.01),
});

export const crearCompraSchema = z
  .object({
    proveedor_id: z.number().int().positive(),
    tienda_id: z.number().int().positive(),
    tipo_documento: z.enum(["BOLETA", "FACTURA", "GUIA_DESPACHO", "OTRO"]),
    numero_documento: z.string().min(1).max(50),
    detalles: z.array(detalleCompraSchema).min(1),
  })
  .strict();

export const detalleVentaSchema = z.object({
  producto_id: z.number().int().positive(),
  cantidad: z.number().int().positive(),
});

export const crearVentaSchema = z
  .object({
    cliente_id: z.number().int().positive().nullable().optional(),
    tienda_id: z.number().int().positive(),
    detalles: z.array(detalleVentaSchema).min(1),
  })
  .strict();

export type CrearCompraInput = z.infer<typeof crearCompraSchema>;
export type CrearVentaInput = z.infer<typeof crearVentaSchema>;
