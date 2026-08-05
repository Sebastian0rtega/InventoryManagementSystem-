'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10); // genera hash real

    await queryInterface.bulkInsert('usuarios', [
      {
      
        rol_id: 1, 
        tienda_id: 1,
        email: 'admin@inventory.com',
        nombre: 'Administrador Global',
        password_hash: passwordHash,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('usuarios', { email: 'admin@inventory.com' }, {});
  }
};
