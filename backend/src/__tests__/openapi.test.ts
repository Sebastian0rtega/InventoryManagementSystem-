import openapiSpec from "../docs/openapi";

type OpenApiDocument = {
  paths?: Record<string, Record<string, unknown>>;
  components?: {
    schemas?: Record<string, {
      required?: string[];
      properties?: Record<string, {
        default?: unknown;
        enum?: unknown[];
        items?: {
          required?: string[];
          items?: { required?: string[] };
        };
      }>;
    }>;
  };
};

describe("documentación OpenAPI", () => {
  const spec = openapiSpec as unknown as OpenApiDocument;

  test("incluye las operaciones de los routers montados", () => {
    const paths = spec.paths ?? {};
    const operations = Object.values(paths).reduce(
      (count, path) => count + Object.keys(path).filter((method) =>
        ["get", "post", "patch", "put", "delete"].includes(method),
      ).length,
      0,
    );

    expect(operations).toBeGreaterThanOrEqual(39);
    expect(paths["/api/purchases"]?.post).toBeDefined();
    expect(paths["/api/inventory/adjustments"]?.post).toBeDefined();
    expect(paths["/api/inventory/{id}/movements"]?.get).toBeDefined();
  });

  test("los esquemas de compras, ventas y ajustes reflejan los validadores", () => {
    const schemas = spec.components?.schemas ?? {};
    const compra = schemas.CrearCompraInput;
    const venta = schemas.CrearVentaInput;
    const ajuste = schemas.AjusteInventarioInput;
    const producto = schemas.ProductoInput;
    const registro = schemas.RegistroInput;
    const movimiento = schemas.MovimientoInventario;

    expect(compra?.properties?.documentType.enum).toEqual([
      "BOLETA",
      "FACTURA",
      "GUIA_DESPACHO",
      "OTRO",
    ]);
    expect(compra?.properties?.paymentMethod.enum).toEqual([
      "EFECTIVO",
      "TRANSFERENCIA",
      "DEBITO",
      "CREDITO",
      "OTRO",
    ]);
    expect(compra?.properties?.paymentMethod.default).toBe("OTRO");
    expect(compra?.required).not.toContain("paymentMethod");
    expect(venta?.required).toEqual(["items"]);
    expect(venta?.properties?.items?.items?.required).toEqual(["productId", "quantity"]);
    expect(ajuste?.required).toEqual(["productId", "tipo", "cantidad", "motivo"]);
    expect(ajuste?.properties?.tipo.enum).toEqual(["ENTRADA", "SALIDA"]);
    expect(producto?.required).toEqual([
      "categoryId",
      "sku",
      "name",
      "purchasePrice",
      "salePrice",
    ]);
    expect(producto?.properties?.barcode).toBeDefined();
    expect(registro?.required).toEqual(["nombre", "email", "password"]);
    expect(movimiento?.properties?.tipo_movimiento.enum).toContain("AJUSTE_ENTRADA");
    expect(movimiento?.properties?.tipo_movimiento.enum).toContain("AJUSTE_SALIDA");
  });
});