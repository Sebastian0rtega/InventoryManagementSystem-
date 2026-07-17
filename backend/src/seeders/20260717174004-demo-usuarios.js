'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('usuarios', [
      {
        rol_id: 1, 
        tienda_id: 1,
        email: 'admin@inventory.com',
        nombre: 'Administrador Global',
        password_hash: 'admin_plain_password_change_me_semana_2' 
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('usuarios', null, {});
  }
};