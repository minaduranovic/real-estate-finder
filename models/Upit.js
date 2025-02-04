const { DataTypes } = require('sequelize');
const sequelize = require("../config/db");

const Upit = sequelize.define('Upit', {
  id : { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  tekst: { type: DataTypes.TEXT, allowNull: false }
  
});

module.exports = Upit;