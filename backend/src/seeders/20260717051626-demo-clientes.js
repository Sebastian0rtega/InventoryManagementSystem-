'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('clientes', [
      {
        cliente_id:1,
        nombre: 'Juan Pérez',
        rut: '11111111-1',
        telefono: '987654321',
        email: 'juan@email.com',
        created_at: new Date(), 
        updated_at: new Date()
      },
      {
        cliente_id:2,
        nombre: 'María González',
        rut: '22222222-2',
        telefono: '912345678',
        email: 'maria@email.com', 
        created_at: new Date(), 
        updated_at: new Date()
      },
      {
        cliente_id:3,
        nombre: 'Pedro Soto',
        rut: '33333333-3',
        telefono: '923456789',
        email: 'pedro@email.com', 
        created_at: new Date(), 
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('clientes', null, {});
  }
};