'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Renombra los roles legacy a la nomenclatura estándar del sistema.
    await queryInterface.sequelize.query(
      `UPDATE roles SET nombre_rol = 'ADMIN' WHERE nombre_rol = 'Administrador';`
    );
    await queryInterface.sequelize.query(
      `UPDATE roles SET nombre_rol = 'SELLER' WHERE nombre_rol = 'Vendedor';`
    );
    await queryInterface.sequelize.query(
      `UPDATE roles SET nombre_rol = 'WAREHOUSE' WHERE nombre_rol = 'Bodeguero';`
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      `UPDATE roles SET nombre_rol = 'Administrador' WHERE nombre_rol = 'ADMIN';`
    );
    await queryInterface.sequelize.query(
      `UPDATE roles SET nombre_rol = 'Vendedor' WHERE nombre_rol = 'SELLER';`
    );
    await queryInterface.sequelize.query(
      `UPDATE roles SET nombre_rol = 'Bodeguero' WHERE nombre_rol = 'WAREHOUSE';`
    );
  },
};
