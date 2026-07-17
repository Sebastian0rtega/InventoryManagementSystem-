'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('categorias', [
      { nombre: 'Lácteos', created_at: new Date(), updated_at: new Date() },
      { nombre: 'Bebidas', created_at: new Date(), updated_at: new Date() },
      { nombre: 'Abarrotes', created_at: new Date(), updated_at: new Date() },
      { nombre: 'Limpieza', created_at: new Date(), updated_at: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('categorias', null, {});
  }
};