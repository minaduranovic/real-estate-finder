const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Korisnik = sequelize.define('Korisnik', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    ime: { type: DataTypes.STRING, allowNull: false},
    prezime: { type: DataTypes.STRING, allowNull: false},
    username: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    admin: { type: DataTypes.BOOLEAN, defaultValue: false }
});

module.exports = Korisnik;