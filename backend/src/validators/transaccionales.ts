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

/* ============================================================
 * DÍA 2 · Proveedores y clientes
 * Esquemas Zod para params, query y body. El controlador NO
 * repite validaciones manuales: valida y normaliza aquí.
 * ============================================================ */

/** Normaliza RUT chileno: mayúsculas, sin puntos, con guion (ej: 76123456-7). */
export function normalizarRut(rut: string): string {
  const limpio = rut.replace(/\./g, "").trim().toUpperCase();
  if (!limpio.includes("-")) {
    // 761234567 -> 76123456-7
    const cuerpo = limpio.slice(0, -1);
    const dv = limpio.slice(-1);
    return `${cuerpo}-${dv}`;
  }
  return limpio;
}

/** Normaliza email: minúsculas y sin espacios. */
export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Normaliza texto libre: colapsa espacios y recorta. */
export function normalizarTexto(texto: string): string {
  return texto.trim().replace(/\s+/g, " ");
}

/** Valida dígito verificador de RUT chileno (módulo 11). */
export function rutValido(rut: string): boolean {
  const m = /^(\d{7,8})-([\dK])$/.exec(rut);
  if (!m) return false;
  const cuerpo = m[1];
  const dv = m[2];
  let suma = 0;
  let factor = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const resto = 11 - (suma % 11);
  const dvEsperado = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);
  return dv === dvEsperado;
}

// ---------- params ----------
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// ---------- query (búsqueda, paginación, filtro por estado) ----------
export const listaQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  activo: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ---------- body: proveedores ----------
const telefonoSchema = z
  .string()
  .trim()
  .regex(/^\+?\d{7,15}$/, "El teléfono debe tener entre 7 y 15 dígitos (opcional +).")
  .optional()
  .or(z.literal("").transform(() => undefined));

export const crearProveedorSchema = z
  .object({
    nombre: z.string().transform(normalizarTexto).pipe(z.string().min(2).max(100)),
    rut: z
      .string()
      .transform(normalizarRut)
      .pipe(z.string().refine(rutValido, "El RUT no es válido (dígito verificador incorrecto).")),
    email: z.string().transform(normalizarEmail).pipe(z.string().email().max(100)),
    telefono: telefonoSchema,
  })
  .strict();

export const actualizarProveedorSchema = crearProveedorSchema.partial();

// ---------- body: clientes ----------
export const crearClienteSchema = z
  .object({
    nombre: z.string().transform(normalizarTexto).pipe(z.string().min(2).max(100)),
    rut: z
      .string()
      .transform(normalizarRut)
      .pipe(z.string().refine(rutValido, "El RUT no es válido (dígito verificador incorrecto).")),
    email: z.string().transform(normalizarEmail).pipe(z.string().email().max(100)),
    telefono: telefonoSchema,
  })
  .strict();

export const actualizarClienteSchema = crearClienteSchema.partial();

export type CrearProveedorInput = z.infer<typeof crearProveedorSchema>;
export type ActualizarProveedorInput = z.infer<typeof actualizarProveedorSchema>;
export type CrearClienteInput = z.infer<typeof crearClienteSchema>;
export type ActualizarClienteInput = z.infer<typeof actualizarClienteSchema>;
export type ListaQuery = z.infer<typeof listaQuerySchema>;
