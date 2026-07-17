'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('productos', [
      {
        categoria_id: 1,
        codigo_barras: '780100000001',
        sku: 'LEC001',
        descripcion: 'Leche Entera 1L',
        nombre: 'Leche Soprole',
        precio_venta: 1200.00,
        precio_compra: 850.00
      },
      {
        categoria_id: 1,
        codigo_barras: '780100000002',
        sku: 'QUE001',
        descripcion: 'Queso Gauda',
        nombre: 'Queso Gauda',
        precio_venta: 4500.00,
        precio_compra: 3500.00
      },
      {
        categoria_id: 2,
        codigo_barras: '780100000003',
        sku: 'BEB001',
        descripcion: 'Bebida Cola 1.5L',
        nombre: 'Coca Cola',
        precio_venta: 2200.00,
        precio_compra: 1500.00
      },
      {
        categoria_id: 2,
        codigo_barras: '780100000004',
        sku: 'JUG001',
        descripcion: 'Jugo Naranja',
        nombre: 'Watts Naranja',
        precio_venta: 1800.00,
        precio_compra: 1200.00
      },
      {
        categoria_id: 3,
        codigo_barras: '780100000005',
        sku: 'ARR001',
        descripcion: 'Arroz Grado 1',
        nombre: 'Arroz Tucapel',
        precio_venta: 1700.00,
        precio_compra: 1200.00
      },
      {
        categoria_id: 4,
        codigo_barras: '780100000006',
        sku: 'DET001',
        descripcion: 'Detergente Líquido',
        nombre: 'Omo 3L',
        precio_venta: 8500.00,
        precio_compra: 6500.00
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('productos', null, {});
  }
};