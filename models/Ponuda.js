const { DataTypes } = require('sequelize');
const sequelize = require("../config/db");

const Ponuda = sequelize.define('Ponuda', {
  id : { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  tekst: { type: DataTypes.TEXT, allowNull: false },
  cijenaPonude: { type: DataTypes.FLOAT, allowNull: false },
  datumPonude: { type: DataTypes.DATE, allowNull: false },
  odbijenaPonuda: { type: DataTypes.BOOLEAN, defaultValue: false }
});

Ponuda.hasMany(Ponuda, { as: 'vezanePonude', foreignKey: 'parentPonudaId' });
Ponuda.belongsTo(Ponuda, { as: 'parentPonuda', foreignKey: 'parentPonudaId' });

module.exports = Ponuda;