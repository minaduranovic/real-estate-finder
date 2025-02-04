const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");


const Nekretnina = sequelize.define('Nekretnina', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tip_nekretnine: { type: DataTypes.STRING, allowNull: false },
    naziv: { type: DataTypes.STRING, allowNull: false },
    kvadratura: { type: DataTypes.FLOAT, allowNull: false },
    cijena: { type: DataTypes.FLOAT, allowNull: false },
    tip_grijanja: { type: DataTypes.STRING, allowNull: false },
    lokacija: { type: DataTypes.STRING, allowNull: false },
    godina_izgradnje: { type: DataTypes.INTEGER, allowNull: false },
    datum_objave: { type: DataTypes.DATE, allowNull: false },
    opis: { type: DataTypes.TEXT, allowNull: false }
  });
  
  Nekretnina.prototype.getInteresovanja = async function () {
    const upiti = await this.getUpiti();
    const zahtjevi = await this.getZahtjevi();
    const ponude = await this.getPonude();
    return { upiti, zahtjevi, ponude };
  };
  
module.exports = Nekretnina;
