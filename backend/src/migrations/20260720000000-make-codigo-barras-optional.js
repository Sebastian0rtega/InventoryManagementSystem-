'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // codigo_barras pasa a ser opcional: se permite NULL (se conserva el UNIQUE).
    await queryInterface.changeColumn('productos', 'codigo_barras', {
      type: Sequelize.STRING(50),
      allowNull: true,
      unique: true
    });
  },
  down: async (queryInterface, Sequelize) => {
    // Vuelve a ser obligatorio (fallará si existen filas con NULL).
    await queryInterface.changeColumn('productos', 'codigo_barras', {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true
    });
  }
};
