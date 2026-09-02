'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('detalle_compras', {
      detalle_compra_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      compra_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'compras', key: 'compra_id' },
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
      precio_compra: {
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

    await queryInterface.addConstraint('detalle_compras', {
      fields: ['cantidad'],
      type: 'check',
      name: 'ck_detalle_compras_cantidad_positiva',
      where: { cantidad: { [Sequelize.Op.gt]: 0 } },
    });

    await queryInterface.addConstraint('detalle_compras', {
      fields: ['precio_compra'],
      type: 'check',
      name: 'ck_detalle_compras_precio_no_negativo',
      where: { precio_compra: { [Sequelize.Op.gte]: 0 } },
    });

    await queryInterface.addConstraint('detalle_compras', {
      fields: ['subtotal'],
      type: 'check',
      name: 'ck_detalle_compras_subtotal_no_negativo',
      where: { subtotal: { [Sequelize.Op.gte]: 0 } },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('detalle_compras');
  },
};
