'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('usuarios', 'activo', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('usuarios', 'activo');
  },
};
