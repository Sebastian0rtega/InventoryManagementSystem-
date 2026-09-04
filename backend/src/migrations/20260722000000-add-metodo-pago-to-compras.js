'use strict';

/** DÍA 3: la compra registra su método de pago (spec: paymentMethod). */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('compras', 'metodo_pago', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'OTRO',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('compras', 'metodo_pago');
  },
};
