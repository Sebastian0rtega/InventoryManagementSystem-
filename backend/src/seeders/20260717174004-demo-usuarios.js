'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    if (!process.env.ADMIN_PASSWORD) {
      throw new Error('Falta la variable de entorno ADMIN_PASSWORD para crear el usuario administrador.');
    }
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10); // genera hash real
    // El README documenta un vendedor de demostración; se crea aquí para que
    // las credenciales listadas existan realmente tras ejecutar los seeders.
    const sellerHash = await bcrypt.hash(process.env.ADMIN_PASSWORD + '-seller', 10);

    await queryInterface.bulkInsert('usuarios', [
      {

        rol_id: 1,
        tienda_id: 1,
        email: 'admin@inventory.com',
        nombre: 'Administrador Global',
        password_hash: passwordHash,
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        rol_id: 2, // SELLER
        tienda_id: 1,
        email: 'vendedor.demo@example.com',
        nombre: 'Vendedor Demo',
        password_hash: sellerHash,
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('usuarios', {
      email: ['admin@inventory.com', 'vendedor.demo@example.com']
    }, {});
  }
};
