'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('compras', {
      compra_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      proveedor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'proveedores', key: 'proveedor_id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      tienda_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tiendas', key: 'tienda_id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'usuario_id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      tipo_documento: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      numero_documento: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      fecha_compra: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      total: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
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

    // Un documento no puede registrarse dos veces para el mismo proveedor
    await queryInterface.addConstraint('compras', {
      fields: ['proveedor_id', 'tipo_documento', 'numero_documento'],
      type: 'unique',
      name: 'uq_compras_documento_proveedor',
    });

    await queryInterface.addConstraint('compras', {
      fields: ['total'],
      type: 'check',
      name: 'ck_compras_total_no_negativo',
      where: { total: { [Sequelize.Op.gte]: 0 } },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('compras');
  },
};
