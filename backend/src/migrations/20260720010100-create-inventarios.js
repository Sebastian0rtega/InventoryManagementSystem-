'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inventarios', {
      inventario_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      tienda_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tiendas', key: 'tienda_id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      producto_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'productos', key: 'producto_id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    // Un solo registro de stock por (tienda, producto)
    await queryInterface.addConstraint('inventarios', {
      fields: ['tienda_id', 'producto_id'],
      type: 'unique',
      name: 'uq_inventarios_tienda_producto',
    });

    await queryInterface.addConstraint('inventarios', {
      fields: ['cantidad'],
      type: 'check',
      name: 'ck_inventarios_cantidad_positiva',
      where: { cantidad: { [Sequelize.Op.gte]: 0 } },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('inventarios');
  },
};
