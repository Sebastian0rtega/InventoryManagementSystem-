'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('tiendas', [
      {nombre: 'Casa Matriz', direccion: 'Av. Libertad 123', created_at: new Date(), updated_at: new Date() },
      {nombre: 'Sucursal Norte', direccion: 'Av. Norte 456', created_at: new Date(), updated_at: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('tiendas', null, {});
  }
};