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
import path from "path";

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
      headers: {
        RequestId: {
          description: "Identificador de la petición para soporte.",
          schema: { type: "string", format: "uuid" },
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
          required: ["nombre", "email", "password"],
          properties: {
            nombre: { type: "string", example: "Ana Pérez" },
            email: { type: "string", format: "email", example: "ana@empresa.com" },
            password: { type: "string", format: "password", minLength: 8, example: "clave123" },
          },
          description: "El registro público crea siempre un usuario SELLER en Casa Matriz.",
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
          required: ["token"],
          properties: {
            token: { type: "string", description: "JWT con 1h de validez (JWT_EXPIRES_IN)" },
          },
        },
        UsuarioActual: {
          type: "object",
          required: [
            "usuario_id",
            "rol_id",
            "tienda_id",
            "email",
            "nombre",
            "activo",
            "created_at",
            "updated_at",
            "rol",
          ],
          properties: {
            usuario_id: { type: "integer" },
            rol_id: { type: "integer" },
            tienda_id: { type: "integer" },
            email: { type: "string", format: "email" },
            nombre: { type: "string" },
            activo: { type: "boolean" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
            rol: {
              type: "object",
              required: ["rol_id", "nombre_rol"],
              properties: {
                rol_id: { type: "integer" },
                nombre_rol: { type: "string", enum: ["ADMIN", "SELLER", "WAREHOUSE"] },
              },
            },
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
          required: ["categoryId", "sku", "name", "purchasePrice", "salePrice"],
          properties: {
            categoryId: { type: "integer", minimum: 1, example: 1 },
            sku: { type: "string", example: "PROD-001" },
            barcode: { type: "string", nullable: true, description: "Opcional; se guarda como null si se omite." },
            name: { type: "string", example: "Bebida energética 500ml" },
            description: { type: "string", nullable: true },
            purchasePrice: { type: "number", minimum: 0.01, example: 1200 },
            salePrice: { type: "number", minimum: 0.01, example: 1500.5, description: "Precio positivo; se serializa con dos decimales." },
            active: { type: "boolean", default: true },
          },
        },
        Producto: {
          type: "object",
          properties: {
            producto_id: { type: "integer" },
            categoria_id: { type: "integer" },
            sku: { type: "string" },
            nombre: { type: "string" },
            codigo_barras: { type: "string", nullable: true },
            descripcion: { type: "string", nullable: true },
            precio_compra: { type: "string", example: "1200.00" },
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
            documentType: { type: "string", enum: ["BOLETA", "FACTURA", "GUIA_DESPACHO", "OTRO"], example: "FACTURA" },
            documentNumber: { type: "string", example: "F-1001", description: "Único por proveedor+tipo+número" },
            paymentMethod: { type: "string", enum: ["EFECTIVO", "TRANSFERENCIA", "DEBITO", "CREDITO", "OTRO"], default: "OTRO", example: "TRANSFERENCIA" },
            items: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                required: ["productId", "quantity", "unitCost"],
                properties: {
                  productId: { type: "integer", example: 1 },
                  quantity: { type: "integer", minimum: 1, example: 5 },
                  unitCost: { type: "number", minimum: 0.01, example: 12000 },
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
          required: ["items"],
          properties: {
            customerId: { type: "integer", example: 1 },
            storeId: { type: "integer", example: 1 },
            items: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                required: ["productId", "quantity"],
                properties: {
                  productId: { type: "integer", example: 1 },
                  quantity: { type: "integer", minimum: 1, example: 2 },
                  unitPrice: { type: "number", minimum: 0.01, example: 1500.5 },
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
          required: ["productId", "tipo", "cantidad", "motivo"],
          properties: {
            productId: { type: "integer", example: 1 },
            storeId: { type: "integer", minimum: 1, description: "Opcional; por defecto la tienda del usuario. ADMIN puede indicar otra.", example: 1 },
            tipo: { type: "string", enum: ["ENTRADA", "SALIDA"], example: "SALIDA" },
            cantidad: { type: "integer", minimum: 1, description: "Cantidad positiva; la dirección la determina tipo.", example: 2 },
            motivo: { type: "string", example: "Ajuste por conteo físico" },
          },
        },
        InventarioItem: {
          type: "object",
          required: [
            "inventario_id",
            "tienda_id",
            "producto_id",
            "stock_actual",
            "stock_minimo",
            "status",
            "producto",
            "tienda",
          ],
          properties: {
            inventario_id: { type: "integer" },
            producto_id: { type: "integer" },
            tienda_id: { type: "integer" },
            stock_actual: { type: "integer" },
            stock_minimo: { type: "integer" },
            status: { type: "string", enum: ["NORMAL", "LOW", "OUT"] },
            producto: { $ref: "#/components/schemas/ProductoInventario" },
            tienda: { $ref: "#/components/schemas/TiendaInventario" },
          },
        },
        ProductoInventario: {
          type: "object",
          required: [
            "producto_id",
            "nombre",
            "sku",
            "codigo_barras",
            "precio_venta",
            "activo",
          ],
          properties: {
            producto_id: { type: "integer" },
            nombre: { type: "string" },
            sku: { type: "string" },
            codigo_barras: { type: "string", nullable: true },
            precio_venta: { type: "string" },
            activo: { type: "boolean" },
          },
        },
        TiendaInventario: {
          type: "object",
          required: ["tienda_id", "nombre"],
          properties: {
            tienda_id: { type: "integer" },
            nombre: { type: "string" },
          },
        },
        InventarioListOutput: {
          type: "object",
          required: ["data", "page", "limit", "total", "totalPages"],
          properties: {
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/InventarioItem" },
            },
            page: { type: "integer" },
            limit: { type: "integer" },
            total: { type: "integer" },
            totalPages: { type: "integer" },
          },
        },
        MovimientoInventario: {
          type: "object",
          required: [
            "movimiento_id",
            "inventario_id",
            "tipo_movimiento",
            "cantidad",
            "motivo",
            "referencia_tipo",
            "referencia_id",
            "usuario_id",
            "created_at",
            "updated_at",
            "usuario",
          ],
          properties: {
            movimiento_id: { type: "integer" },
            inventario_id: { type: "integer" },
            tipo_movimiento: {
              type: "string",
              enum: ["ENTRADA_COMPRA", "SALIDA_VENTA", "AJUSTE_ENTRADA", "AJUSTE_SALIDA", "AJUSTE", "MERMA", "TRASLADO"],
            },
            cantidad: { type: "integer" },
            referencia_tipo: { type: "string", nullable: true, example: "COMPRA" },
            referencia_id: { type: "integer", nullable: true },
            motivo: { type: "string", nullable: true },
            usuario_id: { type: "integer", nullable: true },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
            usuario: {
              type: "object",
              nullable: true,
              required: ["usuario_id", "nombre", "email"],
              properties: {
                usuario_id: { type: "integer" },
                nombre: { type: "string" },
                email: { type: "string", format: "email" },
              },
            },
          },
          description:
            "Bitácora de solo lectura: no existen endpoints de escritura; se genera desde los servicios de negocio.",
        },
        InventarioMovementsOutput: {
          type: "object",
          required: [
            "inventario",
            "data",
            "page",
            "limit",
            "total",
            "totalPages",
          ],
          properties: {
            inventario: {
              type: "object",
              required: [
                "inventario_id",
                "producto",
                "tienda",
                "stock_actual",
                "stock_minimo",
                "status",
              ],
              properties: {
                inventario_id: { type: "integer" },
                producto: {
                  type: "object",
                  required: ["producto_id", "nombre", "sku"],
                  properties: {
                    producto_id: { type: "integer" },
                    nombre: { type: "string" },
                    sku: { type: "string" },
                  },
                },
                tienda: { $ref: "#/components/schemas/TiendaInventario" },
                stock_actual: { type: "integer" },
                stock_minimo: { type: "integer" },
                status: { type: "string", enum: ["NORMAL", "LOW", "OUT"] },
              },
            },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/MovimientoInventario" },
            },
            page: { type: "integer" },
            limit: { type: "integer" },
            total: { type: "integer" },
            totalPages: { type: "integer" },
          },
        },
        InventarioAdjustmentOutput: {
          type: "object",
          required: ["ajuste", "inventario"],
          properties: {
            ajuste: {
              type: "object",
              required: [
                "movimiento_id",
                "tipo",
                "cantidad",
                "motivo",
                "usuario",
                "tienda",
                "producto",
                "fecha",
              ],
              properties: {
                movimiento_id: { type: "integer" },
                tipo: { type: "string", enum: ["ENTRADA", "SALIDA"] },
                cantidad: { type: "integer" },
                motivo: { type: "string" },
                usuario: {
                  type: "object",
                  required: ["usuario_id", "nombre"],
                  properties: {
                    usuario_id: { type: "integer" },
                    nombre: { type: "string" },
                  },
                },
                tienda: { $ref: "#/components/schemas/TiendaInventario" },
                producto: {
                  type: "object",
                  required: ["producto_id", "nombre", "sku"],
                  properties: {
                    producto_id: { type: "integer" },
                    nombre: { type: "string" },
                    sku: { type: "string" },
                  },
                },
                fecha: { type: "string", format: "date-time" },
              },
            },
            inventario: {
              type: "object",
              required: [
                "inventario_id",
                "stock_actual",
                "stock_minimo",
                "status",
              ],
              properties: {
                inventario_id: { type: "integer" },
                stock_actual: { type: "integer" },
                stock_minimo: { type: "integer" },
                status: { type: "string", enum: ["NORMAL", "LOW", "OUT"] },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    path.join(__dirname, "openapiRoutes.{ts,js}").replace(/\\/g, "/"),
  ],
});

export default spec;
