'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('tiendas', [
      { nombre: 'Casa Matriz', direccion: 'Av. Libertad 123' },
      { nombre: 'Sucursal Norte', direccion: 'Av. Norte 456' }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('tiendas', null, {});
  }
};