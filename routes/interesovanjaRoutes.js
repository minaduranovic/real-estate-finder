const express = require("express");
const router = express.Router();
const interesovanjaController = require("../controllers/interesovanjaController");

router.get("/nekretnina/:id/interesovanja", interesovanjaController.getInteresovanja);
router.post("/nekretnina/:id/ponuda", interesovanjaController.postPonuda);
router.post("/nekretnina/:id/zahtjev", interesovanjaController.postZahtjev);
router.post("/upit", interesovanjaController.postUpit);
router.get("/upiti/moji", interesovanjaController.getUpiti);
router.get("/next/upiti/nekretnina/:id", interesovanjaController.getNextUpiti);

module.exports = router;