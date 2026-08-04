'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const passwordHash = await bcrypt.hash('admin123', 10); // genera hash real

    await queryInterface.bulkInsert('usuarios', [
      {
        usuario_id:1,
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
