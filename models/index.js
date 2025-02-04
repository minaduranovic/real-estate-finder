const sequelize = require("../config/db");
const Korisnik = require("./Korisnik");
const Nekretnina = require("./Nekretnina");
const Upit = require("./Upit");
const Zahtjev = require("./Zahtjev");
const Ponuda = require("./Ponuda");

Korisnik.hasMany(Upit);
Upit.belongsTo(Korisnik);

Korisnik.hasMany(Zahtjev);
Zahtjev.belongsTo(Korisnik);

Korisnik.hasMany(Ponuda);
Ponuda.belongsTo(Korisnik);

Nekretnina.hasMany(Upit, { as: "upiti" });
Upit.belongsTo(Nekretnina);

Nekretnina.hasMany(Zahtjev, { as: "zahtjevi" });
Zahtjev.belongsTo(Nekretnina);

Nekretnina.hasMany(Ponuda, { as: "ponude" });
Ponuda.belongsTo(Nekretnina);

module.exports = { sequelize, Korisnik, Nekretnina, Upit, Zahtjev, Ponuda };
