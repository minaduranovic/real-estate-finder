const express = require("express");
const { login, logout, getKorisnik, putKorisnik} = require("../controllers/authController");
const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/korisnik", getKorisnik);
router.put("/korisnik", putKorisnik);

module.exports = router;