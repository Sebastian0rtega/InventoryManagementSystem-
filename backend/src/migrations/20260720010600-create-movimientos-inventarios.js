'use strict';

const TIPOS = ['ENTRADA_COMPRA', 'SALIDA_VENTA', 'AJUSTE', 'MERMA', 'TRASLADO'];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('movimientos_inventarios', {
      movimiento_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      inventario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'inventarios', key: 'inventario_id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      tipo_movimiento: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      referencia_tipo: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      referencia_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'usuarios', key: 'usuario_id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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

    await queryInterface.addConstraint('movimientos_inventarios', {
      fields: ['tipo_movimiento'],
      type: 'check',
      name: 'ck_movimientos_tipo_valido',
      where: { tipo_movimiento: { [Sequelize.Op.in]: TIPOS } },
    });

    await queryInterface.addConstraint('movimientos_inventarios', {
      fields: ['cantidad'],
      type: 'check',
      name: 'ck_movimientos_cantidad_positiva',
      where: { cantidad: { [Sequelize.Op.gt]: 0 } },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('movimientos_inventarios');
  },
};
