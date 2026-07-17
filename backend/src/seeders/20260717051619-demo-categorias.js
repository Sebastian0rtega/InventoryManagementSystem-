'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('categorias', [
      { nombre: 'Lácteos' },
      { nombre: 'Bebidas' },
      { nombre: 'Abarrotes' },
      { nombre: 'Limpieza' }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('categorias', null, {});
  }
};