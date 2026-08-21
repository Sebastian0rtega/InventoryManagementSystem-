'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('roles', [
      {nombre_rol: 'ADMIN', created_at: new Date(), updated_at: new Date()},
      {nombre_rol: 'SELLER', created_at: new Date(), updated_at: new Date() },
      {nombre_rol: 'WAREHOUSE', created_at: new Date(), updated_at: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', null, {});
  }
};