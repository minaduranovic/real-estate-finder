const express = require("express");
const router = express.Router();
const nekretnineController = require("../controllers/nekretnineController");

router.get("/nekretnine/top5", nekretnineController.getTop5Nekretnine);
router.get("/nekretnina/:id", nekretnineController.getNekretninaById);
router.get("/nekretnine", nekretnineController.getNekretnine);

module.exports = router;