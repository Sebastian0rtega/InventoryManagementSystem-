'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('roles', [
      { nombre_rol: 'Administrador' },
      { nombre_rol: 'Vendedor' },
      { nombre_rol: 'Bodeguero' }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', null, {});
  }
};