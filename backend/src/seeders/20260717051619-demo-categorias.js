'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('categorias', [
      { categoria_id: 1, nombre: 'Lácteos', created_at: new Date(), updated_at: new Date() },
      { categoria_id: 2, nombre: 'Bebidas', created_at: new Date(), updated_at: new Date() },
      { categoria_id: 3, nombre: 'Abarrotes', created_at: new Date(), updated_at: new Date() },
      { categoria_id: 4, nombre: 'Limpieza', created_at: new Date(), updated_at: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('categorias', null, {});
  }
};
