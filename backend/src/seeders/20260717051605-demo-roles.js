'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('roles', [
      {rol_id:1, nombre_rol: 'Administrador', created_at: new Date(), updated_at: new Date()},
      {rol_id:2, nombre_rol: 'Vendedor', created_at: new Date(), updated_at: new Date() },
      {rol_id:3, nombre_rol: 'Bodeguero', created_at: new Date(), updated_at: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', null, {});
  }
};