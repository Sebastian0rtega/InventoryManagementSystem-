'use strict';

const TIPOS_ANTERIORES = ['ENTRADA_COMPRA', 'SALIDA_VENTA', 'AJUSTE', 'MERMA', 'TRASLADO'];
const TIPOS_NUEVOS = [
  ...TIPOS_ANTERIORES,
  'AJUSTE_ENTRADA',
  'AJUSTE_SALIDA',
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      'movimientos_inventarios',
      'ck_movimientos_tipo_valido',
    );
    await queryInterface.addConstraint('movimientos_inventarios', {
      fields: ['tipo_movimiento'],
      type: 'check',
      name: 'ck_movimientos_tipo_valido',
      where: { tipo_movimiento: { [Sequelize.Op.in]: TIPOS_NUEVOS } },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "UPDATE movimientos_inventarios SET tipo_movimiento = 'AJUSTE' WHERE tipo_movimiento IN ('AJUSTE_ENTRADA', 'AJUSTE_SALIDA')",
    );
    await queryInterface.removeConstraint(
      'movimientos_inventarios',
      'ck_movimientos_tipo_valido',
    );
    await queryInterface.addConstraint('movimientos_inventarios', {
      fields: ['tipo_movimiento'],
      type: 'check',
      name: 'ck_movimientos_tipo_valido',
      where: { tipo_movimiento: { [Sequelize.Op.in]: TIPOS_ANTERIORES } },
    });
  },
};