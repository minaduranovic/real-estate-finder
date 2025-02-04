const session = require("express-session");

module.exports = session({
  secret:  "tajna_sifra",
  resave: false,
  saveUninitialized: false,
});
