'use strict';

module.exports = (sequelize, DataTypes) => {
  const Tienda = sequelize.define('Tienda', {
    tienda_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    direccion: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'tiendas',
    underscored: true,
    timestamps: false // porque ya defines created_at y updated_at en la migración
  });

  return Tienda;
};
