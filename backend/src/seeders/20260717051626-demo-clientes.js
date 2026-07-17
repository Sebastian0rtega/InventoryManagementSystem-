'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('clientes', [
      {
        nombre: 'Juan Pérez',
        rut: '11111111-1',
        telefono: '987654321',
        email: 'juan@email.com'
      },
      {
        nombre: 'María González',
        rut: '22222222-2',
        telefono: '912345678',
        email: 'maria@email.com'
      },
      {
        nombre: 'Pedro Soto',
        rut: '33333333-3',
        telefono: '923456789',
        email: 'pedro@email.com'
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('clientes', null, {});
  }
};