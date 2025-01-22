const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Zahtjev = sequelize.define('Zahtjev', {
  id : { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  tekst: { type: DataTypes.TEXT, allowNull: false },
  trazeniDatum: { type: DataTypes.DATE, allowNull: false },
  odobren: { type: DataTypes.BOOLEAN, defaultValue: false }
});

module.exports = Zahtjev;