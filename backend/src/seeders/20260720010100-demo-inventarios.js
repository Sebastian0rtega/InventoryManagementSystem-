'use strict';

/**
 * Inventario inicial determinista:
 *  - Tienda 1 (Casa Matriz): producto 1 -> 100 unidades, producto 2 -> 50
 *  - Tienda 2 (Sucursal Norte): producto 1 -> 30 unidades
 */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert(
      'inventarios',
      [
        { tienda_id: 1, producto_id: 1, cantidad: 100, created_at: now, updated_at: now },
        { tienda_id: 1, producto_id: 2, cantidad: 50, created_at: now, updated_at: now },
        { tienda_id: 2, producto_id: 1, cantidad: 30, created_at: now, updated_at: now },
      ],
      {},
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('inventarios', null, {});
  },
};
