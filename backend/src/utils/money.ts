import Decimal from "decimal.js";

// Configuración estricta para dinero: redondeo HALF_UP y 2 decimales.
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/**
 * Multiplica cantidad x precio y devuelve string con 2 decimales.
 * Nunca usar float de JS para dinero: 0.1 + 0.2 === 0.30000000000000004.
 * PostgreSQL NUMERIC/DECIMAL es decimal exacto; Decimal.js también, por eso
 * los cálculos se hacen aquí en decimal y se persisten como string/NUMERIC.
 */
export function calcularSubtotal(cantidad: number | string, precio: number | string): string {
  return new Decimal(cantidad).times(new Decimal(precio)).toDecimalPlaces(2).toFixed(2);
}

/** Suma una lista de subtotales y devuelve string con 2 decimales. */
export function calcularTotal(subtotales: (number | string)[]): string {
  return subtotales
    .reduce((acc, s) => acc.plus(new Decimal(s)), new Decimal(0))
    .toDecimalPlaces(2)
    .toFixed(2);
}

/** Valida que un monto sea un decimal no negativo (>= 0). */
export function esMontoValido(valor: number | string): boolean {
  try {
    const d = new Decimal(valor);
    return d.isFinite() && d.gte(0);
  } catch {
    return false;
  }
}

export { Decimal };
