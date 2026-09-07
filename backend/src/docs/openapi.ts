/**
 * DÍA 6 · Especificación OpenAPI (Swagger) de la API de inventario.
 *
 * Se sirve en /api/docs vía swagger-ui-express y expone el JSON en /api/docs.json.
 * Documenta los endpoints del Sprint 2 (auth, usuarios, categorías, productos,
 * proveedores, clientes, compras, ventas, inventario) con:
 *   - esquemas de entrada/salida,
 *   - seguridad Bearer (JWT),
 *   - respuestas de error estándar 400/401/403/404/409/500.
 */
import swaggerJsdoc from "swagger-jsdoc";

const spec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Inventory Management API",
      version: "1.0.0",
      description:
        "API del sistema de control de inventario. " +
        "Módulos: autenticación, usuarios, categorías, productos, proveedores, " +
        "clientes, compras, ventas e inventario. Todas las rutas (excepto " +
        "health y auth) requieren token JWT con esquema Bearer.",
      contact: { name: "Sebastian Ortega" },
      license: { name: "MIT" },
    },
    servers: [{ url: "http://localhost:3000", description: "Desarrollo local" }],
    tags: [
      { name: "Auth", description: "Registro, login y perfil (/api/auth)" },
      { name: "Users", description: "Gestión de usuarios (ADMIN) (/api/users)" },
      { name: "Categories", description: "Categorías de productos (/api/categories)" },
      { name: "Products", description: "Catálogo de productos (/api/products)" },
      { name: "Suppliers", description: "Proveedores (/api/suppliers)" },
      { name: "Customers", description: "Clientes (/api/customers)" },
      { name: "Purchases", description: "Compras y entrada de stock (/api/purchases)" },
      { name: "Sales", description: "Ventas y salida de stock (/api/sales)" },
      { name: "Inventory", description: "Stock y movimientos (/api/inventory)" },
      { name: "Health", description: "Chequeo de estado" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Token JWT emitido por POST /api/auth/login. " +
            "Envíalo como cabecera `Authorization: Bearer <token>`.",
        },
      },
      schemas: {
        /* ---------- Errores estándar ---------- */
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                code: {
                  type: "string",
                  example: "VALIDATION_ERROR",
                  description:
                    "VALIDATION_ERROR · UNAUTHORIZED · FORBIDDEN · NOT_FOUND · CONFLICT · INTERNAL_SERVER_ERROR",
                },
                message: { type: "string", example: "Datos de entrada inválidos." },
                details: {
                  type: "array",
                  items: { type: "object" },
                  example: [{ campo: "items[0].quantity", problema: "debe ser >= 1" }],
                },
              },
              required: ["code", "message"],
            },
          },
        },
        /* ---------- Auth ---------- */
        RegistroInput: {
          type: "object",
          required: ["nombre", "email", "password", "rol"],
          properties: {
            nombre: { type: "string", example: "Ana Pérez" },
            email: { type: "string", format: "email", example: "ana@empresa.com" },
            password: { type: "string", format: "password", minLength: 8, example: "clave123" },
            rol: { type: "string", enum: ["ADMIN", "SELLER", "WAREHOUSE"], example: "SELLER" },
            tienda_id: { type: "integer", example: 1 },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "nuevo.vendedor@empresa.com" },
            password: { type: "string", format: "password", example: "clave123" },
          },
        },
        LoginOutput: {
          type: "object",
          properties: {
            token: { type: "string", description: "JWT con 1h de validez (JWT_EXPIRES_IN)" },
            usuario: { $ref: "#/components/schemas/Usuario" },
          },
        },
        Usuario: {
          type: "object",
          properties: {
            id: { type: "integer" },
            nombre: { type: "string" },
            email: { type: "string", format: "email" },
            rol: { type: "string", enum: ["ADMIN", "SELLER", "WAREHOUSE"] },
            tienda_id: { type: "integer", nullable: true },
            activo: { type: "boolean" },
          },
          description:
            "NUNCA incluye password_hash: se excluye a nivel de servicio/modelo en todas las respuestas.",
        },
        /* ---------- Catálogo ---------- */
        Categoria: {
          type: "object",
          properties: {
            id: { type: "integer" },
            nombre: { type: "string", example: "Bebidas" },
            descripcion: { type: "string", nullable: true },
          },
        },
        ProductoInput: {
          type: "object",
          required: ["sku", "nombre", "precio_venta", "categoriaId"],
          properties: {
            sku: { type: "string", example: "PROD-001" },
            codigo_barras: { type: "string", nullable: true },
            nombre: { type: "string", example: "Bebida energética 500ml" },
            descripcion: { type: "string", nullable: true },
            precio_venta: { type: "number", example: 1500.5, description: "Decimal exacto; se redondea a 2 decimales en servidor" },
            categoriaId: { type: "integer", example: 1 },
          },
        },
        Producto: {
          type: "object",
          properties: {
            id: { type: "integer" },
            sku: { type: "string" },
            nombre: { type: "string" },
            precio_venta: { type: "string", example: "1500.50" },
            activo: { type: "boolean" },
            categoria: { $ref: "#/components/schemas/Categoria" },
          },
        },
        /* ---------- Compras ---------- */
        CrearCompraInput: {
          type: "object",
          required: ["supplierId", "storeId", "documentType", "documentNumber", "items"],
          properties: {
            supplierId: { type: "integer", example: 1 },
            storeId: { type: "integer", example: 1 },
            documentType: { type: "string", enum: ["FACTURA", "BOLETA", "GUIA"], example: "FACTURA" },
            documentNumber: { type: "string", example: "F-1001", description: "Único por proveedor+tipo+número" },
            paymentMethod: { type: "string", enum: ["EFECTIVO", "TRANSFERENCIA", "TARJETA", "CREDITO"], example: "TRANSFERENCIA" },
            items: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                required: ["productId", "quantity", "unitCost"],
                properties: {
                  productId: { type: "integer", example: 1 },
                  quantity: { type: "integer", minimum: 1, example: 5 },
                  unitCost: { type: "number", minimum: 0, example: 12000 },
                },
              },
            },
          },
        },
        Compra: {
          type: "object",
          properties: {
            compra_id: { type: "integer" },
            proveedor_id: { type: "integer" },
            tienda_id: { type: "integer" },
            tipo_documento: { type: "string" },
            numero_documento: { type: "string" },
            metodo_pago: { type: "string" },
            total: { type: "string", example: "67501.50", description: "Calculado en servidor con precisión decimal exacta" },
            detalles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  producto_id: { type: "integer" },
                  cantidad: { type: "integer" },
                  costo_unitario: { type: "string" },
                },
              },
            },
          },
        },
        /* ---------- Ventas ---------- */
        CrearVentaInput: {
          type: "object",
          required: ["customerId", "storeId", "items"],
          properties: {
            customerId: { type: "integer", example: 1 },
            storeId: { type: "integer", example: 1 },
            items: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                required: ["productId", "quantity", "unitPrice"],
                properties: {
                  productId: { type: "integer", example: 1 },
                  quantity: { type: "integer", minimum: 1, example: 2 },
                  unitPrice: { type: "number", minimum: 0, example: 1500.5 },
                },
              },
            },
          },
        },
        Venta: {
          type: "object",
          properties: {
            venta_id: { type: "integer" },
            cliente_id: { type: "integer" },
            tienda_id: { type: "integer" },
            total: { type: "string", example: "3001.00" },
            detalles: { type: "array", items: { type: "object" } },
          },
        },
        /* ---------- Inventario ---------- */
        AjusteInventarioInput: {
          type: "object",
          required: ["productId", "storeId", "cantidad", "motivo"],
          properties: {
            productId: { type: "integer", example: 1 },
            storeId: { type: "integer", example: 1 },
            cantidad: { type: "integer", description: "Positivo = entrada, negativo = salida", example: -2 },
            motivo: { type: "string", example: "Ajuste por conteo físico" },
          },
        },
        InventarioItem: {
          type: "object",
          properties: {
            producto_id: { type: "integer" },
            tienda_id: { type: "integer" },
            cantidad: { type: "integer" },
            stock_minimo: { type: "integer" },
            producto: { $ref: "#/components/schemas/Producto" },
          },
        },
        MovimientoInventario: {
          type: "object",
          properties: {
            id: { type: "integer" },
            tipo_movimiento: {
              type: "string",
              enum: ["ENTRADA_COMPRA", "SALIDA_VENTA", "AJUSTE_POSITIVO", "AJUSTE_NEGATIVO"],
            },
            cantidad: { type: "integer" },
            stock_resultante: { type: "integer" },
            referencia_tipo: { type: "string", example: "COMPRA" },
            referencia_id: { type: "integer" },
            motivo: { type: "string", nullable: true },
          },
          description:
            "Bitácora de solo lectura: no existen endpoints de escritura; se genera desde los servicios de negocio.",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [],
});

export default spec;
