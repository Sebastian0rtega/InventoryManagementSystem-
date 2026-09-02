'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('detalle_ventas', {
      detalle_venta_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      venta_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'ventas', key: 'venta_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
      },
      precio_venta: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      subtotal: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
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

    await queryInterface.addConstraint('detalle_ventas', {
      fields: ['cantidad'],
      type: 'check',
      name: 'ck_detalle_ventas_cantidad_positiva',
      where: { cantidad: { [Sequelize.Op.gt]: 0 } },
    });

    await queryInterface.addConstraint('detalle_ventas', {
      fields: ['precio_venta'],
      type: 'check',
      name: 'ck_detalle_ventas_precio_no_negativo',
      where: { precio_venta: { [Sequelize.Op.gte]: 0 } },
    });

    await queryInterface.addConstraint('detalle_ventas', {
      fields: ['subtotal'],
      type: 'check',
      name: 'ck_detalle_ventas_subtotal_no_negativo',
      where: { subtotal: { [Sequelize.Op.gte]: 0 } },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('detalle_ventas');
  },
};
