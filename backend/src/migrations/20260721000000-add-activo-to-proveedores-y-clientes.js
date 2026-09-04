'use strict';

/**
 * Soft-delete para proveedores y clientes (DÍA 2):
 * DELETE /api/suppliers/:id y /api/customers/:id prefieren desactivación
 * sobre borrado físico, porque pueden estar referenciados por compras/ventas.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('proveedores', 'activo', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
    await queryInterface.addColumn('clientes', 'activo', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('proveedores', 'activo');
    await queryInterface.removeColumn('clientes', 'activo');
  },
};
