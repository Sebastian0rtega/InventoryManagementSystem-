import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { validar } from "../middlewares/validate";
import { ROLES } from "../services/authService";
import * as inventoryController from "../controllers/inventoryController";
import {
  ajusteInventarioSchema,
  idParamSchema,
  listaInventarioQuerySchema,
} from "../validators/inventario";

const router = Router();

// Todas las rutas de inventario requieren autenticación
router.use(authenticate);

/**
 * GET /api/inventory
 * @tags Inventory
 * @security bearerAuth
 * @operationId listarInventario
 * @summary Stock por tienda. SELLER/WAREHOUSE limitados a su tienda (forzado en servicio).
 * @param {integer} storeId.query - Filtrar por tienda
 * @param {integer} productId.query - Filtrar por producto
 * @return {InventarioItem} 200 - { data: InventarioItem[], total }
 * @return {Error} 400 - Parámetros inválidos
 * @return {Error} 401 - Sin token
 * @return {Error} 403 - Rol sin permiso
 */
router.get(
  "/",
  authorize(ROLES.ADMIN, ROLES.SELLER, ROLES.WAREHOUSE),
  validar(listaInventarioQuerySchema, "query"),
  inventoryController.list,
);

/**
 * POST /api/inventory/adjustments
 * @tags Inventory
 * @security bearerAuth
 * @operationId ajustarInventario
 * @summary Ajuste manual de stock con registro en bitácora (ADMIN · WAREHOUSE).
 * @param {AjusteInventarioInput} request.body.required - Cantidad con signo y motivo obligatorio
 * @return {MovimientoInventario} 201 - Ajuste y movimiento AJUSTE_POSITIVO/NEGATIVO registrados
 * @return {Error} 400 - VALIDATION_ERROR: motivo vacío o cantidad inválida
 * @return {Error} 401 - Sin token
 * @return {Error} 403 - Rol sin permiso (SELLER no puede ajustar)
 * @return {Error} 404 - Producto/tienda inexistente
 */
router.post(
  "/adjustments",
  authorize(ROLES.ADMIN, ROLES.WAREHOUSE),
  validar(ajusteInventarioSchema, "body"),
  inventoryController.adjust,
);

/**
 * GET /api/inventory/{id}/movements
 * @tags Inventory
 * @security bearerAuth
 * @operationId movimientosDeInventario
 * @summary Bitácora de movimientos de un ítem de inventario (solo lectura).
 * @description SOLO LECTURA: no existe POST/PUT/DELETE para movimientos; el historial
 * se genera exclusivamente desde los servicios de negocio (compras, ventas, ajustes).
 * @param {integer} id.path.required - ID del registro de inventario
 * @return {MovimientoInventario} 200 - { data: MovimientoInventario[], total }
 * @return {Error} 401 - Sin token
 * @return {Error} 403 - Rol sin permiso
 * @return {Error} 404 - Inventario inexistente
 */
router.get(
  "/:id/movements",
  authorize(ROLES.ADMIN, ROLES.WAREHOUSE),
  validar(idParamSchema, "params"),
  inventoryController.movements,
);

export default router;
