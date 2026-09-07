import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { validar } from "../middlewares/validate";
import { ROLES } from "../services/authService";
import * as saleController from "../controllers/saleController";
import {
  idParamSchema,
  listaVentasQuerySchema,
  crearVentaSchema,
} from "../validators/ventas";

const router = Router();

// Todas las rutas de ventas requieren autenticación previa
router.use(authenticate);

/**
 * POST /api/sales
 * @tags Sales
 * @security bearerAuth
 * @operationId crearVenta
 * @summary Registra una venta con salida de stock atómica.
 * @description Crea la venta + detalles + movimientos SALIDA_VENTA en una transacción.
 * Si no hay stock suficiente para cualquier ítem, TODO se revierte (rollback total).
 * SELLER solo puede vender en su propia tienda.
 * @param {CrearVentaInput} request.body.required - Datos de la venta
 * @return {Venta} 201 - Venta creada con total calculado en servidor
 * @return {Error} 400 - VALIDATION_ERROR: cuerpo o ítems inválidos
 * @return {Error} 401 - Sin token
 * @return {Error} 403 - FORBIDDEN: rol sin permiso o SELLER de otra tienda
 * @return {Error} 404 - NOT_FOUND: producto/cliente/tienda inexistente
 * @return {Error} 409 - CONFLICT: stock insuficiente
 */
router.post(
  "/",
  authorize(ROLES.ADMIN, ROLES.SELLER),
  validar(crearVentaSchema, "body"),
  saleController.create,
);

/**
 * GET /api/sales
 * @tags Sales
 * @security bearerAuth
 * @operationId listarVentas
 * @summary Lista ventas con paginación. SELLER ve solo su tienda.
 * @param {integer} page.query - Página (default 1)
 * @param {integer} limit.query - Registros por página
 * @return 200 - { data: Venta[], total, page, limit }
 * @return {Error} 401 - Sin token
 * @return {Error} 403 - Rol sin permiso
 */
router.get(
  "/",
  authorize(ROLES.ADMIN, ROLES.SELLER),
  validar(listaVentasQuerySchema, "query"),
  saleController.list,
);
/**
 * GET /api/sales/{id}
 * @tags Sales
 * @security bearerAuth
 * @operationId obtenerVenta
 * @summary Obtiene una venta con sus detalles y cliente.
 * @param {integer} id.path.required - ID de la venta
 * @return {Venta} 200
 * @return {Error} 401 - Sin token
 * @return {Error} 403 - Rol sin permiso
 * @return {Error} 404 - NOT_FOUND: id inexistente
 */
router.get(
  "/:id",
  authorize(ROLES.ADMIN, ROLES.SELLER),
  validar(listaVentasQuerySchema, "query"),
  saleController.list,
);

router.get(
  "/:id",
  authorize(ROLES.ADMIN, ROLES.SELLER),
  validar(idParamSchema, "params"),
  saleController.get,
);

export default router;
