'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('roles', [
      {nombre_rol: 'Administrador', created_at: new Date(), updated_at: new Date()},
      {nombre_rol: 'Vendedor', created_at: new Date(), updated_at: new Date() },
      {nombre_rol: 'Bodeguero', created_at: new Date(), updated_at: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', null, {});
  }
};