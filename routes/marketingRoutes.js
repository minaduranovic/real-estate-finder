const express = require("express");
const router = express.Router();
const marketingController = require("../controllers/marketingController");

router.post("/marketing/nekretnine", marketingController.postMarketingNekretnine);
router.post("/marketing/nekretnina/:id", marketingController.postMarketingNekretnina);
router.post("/marketing/osvjezi/pretrage", marketingController.postMarketingOsvjeziPretrage);
router.post("/marketing/osvjezi/klikovi", marketingController.postMarketingOsvjeziKlikove);

module.exports = router;