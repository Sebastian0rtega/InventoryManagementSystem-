import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { validar } from "../middlewares/validate";
import { ROLES } from "../services/authService";
import * as purchaseController from "../controllers/purchaseController";
import {
  idParamSchema,
  listaComprasQuerySchema,
  crearCompraSchema,
} from "../validators/compras";

const router = Router();

// Todas las rutas de compras requieren autenticación
router.use(authenticate);

/**
 * POST /api/purchases
 * @tags Purchases
 * @security bearerAuth
 * @operationId crearCompra
 * @summary Registra una compra con entrada de stock atómica.
 * @description Crea la compra + detalles + movimientos ENTRADA_COMPRA dentro de una
 * transacción. El total se calcula en el servidor con precisión decimal exacta.
 * Si cualquier ítem falla, TODO se revierte (rollback total).
 * @param {CrearCompraInput} request.body.required - Datos de la compra
 * @return {Compra} 201 - Compra creada con total calculado
 * @return {Error} 400 - VALIDATION_ERROR: cantidad 0, costo negativo, cuerpo inválido
 * @return {Error} 401 - UNAUTHORIZED: sin token o token expirado
 * @return {Error} 403 - FORBIDDEN: rol sin permiso (solo ADMIN y WAREHOUSE)
 * @return {Error} 404 - NOT_FOUND: producto/proveedor/tienda inexistente (rollback aplicado)
 * @return {Error} 409 - CONFLICT: documento duplicado (proveedor+tipo+número)
 */
router.post(
  "/",
  authorize(ROLES.ADMIN, ROLES.WAREHOUSE),
  validar(crearCompraSchema, "body"),
  purchaseController.create,
);
/**
 * GET /api/purchases
 * @tags Purchases
 * @security bearerAuth
 * @operationId listarCompras
 * @summary Lista compras con paginación.
 * @param {integer} page.query - Página (default 1)
 * @param {integer} limit.query - Registros por página (default 10, máx 100)
 * @return 200 - { data: Compra[], total, page, limit }
 * @return {Error} 401 - Sin token
 * @return {Error} 403 - Rol sin permiso
 */
router.get(
  "/",
  authorize(ROLES.ADMIN, ROLES.WAREHOUSE),
  validar(listaComprasQuerySchema, "query"),
  purchaseController.list,
);
/**
 * GET /api/purchases/{id}
 * @tags Purchases
 * @security bearerAuth
 * @operationId obtenerCompra
 * @summary Obtiene una compra con sus detalles y proveedor.
 * @param {integer} id.path.required - ID de la compra
 * @return {Compra} 200
 * @return {Error} 401 - Sin token
 * @return {Error} 403 - Rol sin permiso
 * @return {Error} 404 - NOT_FOUND: id inexistente
 */
router.get(
  "/:id",
  authorize(ROLES.ADMIN, ROLES.WAREHOUSE),
  validar(listaComprasQuerySchema, "query"),
  purchaseController.list,
);
router.get(
  "/:id",
  authorize(ROLES.ADMIN, ROLES.WAREHOUSE),
  validar(idParamSchema, "params"),
  purchaseController.get,
);

export default router;
