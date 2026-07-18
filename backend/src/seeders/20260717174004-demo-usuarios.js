'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('usuarios', [
      {
        rol_id: 1, 
        tienda_id: 1,
        email: 'admin@inventory.com',
        nombre: 'Administrador Global',
        password_hash: '$2b$10$EPY9m2vN6pG3pE5J5fMvO.MWhb0N69G7k1234567890abcdefghij' 
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('usuarios', null, {});
  }
};