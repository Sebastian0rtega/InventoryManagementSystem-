'use strict';

/**
 * DÍA 5 · Inventario y movimientos
 * - inventarios: agrega stock_minimo (umbral para estado LOW).
 * - movimientos_inventarios: agrega motivo (texto obligatorio del porqué del cambio)
 *   y tipo_movimiento admite ENTRADA / SALIDA manuales de ajuste.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('inventarios', 'stock_minimo', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      after: 'cantidad',
    });

    await queryInterface.addColumn('movimientos_inventarios', 'motivo', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'cantidad',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('movimientos_inventarios', 'motivo');
    await queryInterface.removeColumn('inventarios', 'stock_minimo');
  },
};
