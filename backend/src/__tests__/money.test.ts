import { calcularSubtotal, calcularTotal, esMontoValido } from "../utils/money";

/**
 * Pruebas unitarias de cálculo monetario con Decimal.js.
 * Motivan por qué NO se usa float de JS para dinero:
 * 0.1 + 0.2 === 0.30000000000000004 en IEEE-754.
 */
describe("utils/money (decimal.js)", () => {
  test("subtotal básico exacto", () => {
    expect(calcularSubtotal(3, "19.99")).toBe("59.97");
  });

  test("evita el error clásico de float (0.1 + 0.2)", () => {
    expect(0.1 + 0.2).not.toBe(0.3); // el problema
    expect(calcularTotal(["0.1", "0.2"])).toBe("0.30"); // la solución
  });

  test("redondeo HALF_UP a 2 decimales", () => {
    expect(calcularSubtotal(1, "10.005")).toBe("10.01");
    expect(calcularSubtotal(1, "10.004")).toBe("10.00");
  });

  test("total de varios subtotales", () => {
    expect(calcularTotal(["59.97", "100.50", "0.03"])).toBe("160.50");
  });

  test("montos válidos y no negativos", () => {
    expect(esMontoValido("0")).toBe(true);
    expect(esMontoValido("19.99")).toBe(true);
    expect(esMontoValido("-0.01")).toBe(false);
    expect(esMontoValido("abc")).toBe(false);
  });
});
