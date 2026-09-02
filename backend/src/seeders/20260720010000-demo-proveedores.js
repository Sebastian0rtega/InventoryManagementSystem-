'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert(
      'proveedores',
      [
        {
          nombre: 'Distribuidora Central SpA',
          rut: '76123456-7',
          telefono: '+56912345678',
          email: 'ventas@distribuidoracentral.cl',
          created_at: now,
          updated_at: now,
        },
      ],
      {},
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('proveedores', null, {});
  },
};
