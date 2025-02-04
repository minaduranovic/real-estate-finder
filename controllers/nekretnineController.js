const { Nekretnina, Upit, Zahtjev, Ponuda, Korisnik } = require("../models");

const getTop5Nekretnine = async (req, res) => {
  const { lokacija } = req.query;
  if (!lokacija) return res.status(400).json({ greska: "Lokacija nije navedena." });
  try {
    const topProperties = await Nekretnina.findAll({
      where: { lokacija },
      order: [["datum_objave", "DESC"]],
      limit: 5,
    });
    res.status(200).json(topProperties);
  } catch (error) {
    console.error("Error fetching top properties:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
};

const getNekretninaById = async (req, res) => {
  const { id } = req.params;
  try {
    const nekretnina = await Nekretnina.findByPk(id, {
      include: { model: Upit, as: "upiti", attributes: ["KorisnikId", "tekst", "createdAt"], limit: 3, order: [["createdAt", "DESC"]] },
    });
    if (!nekretnina) return res.status(404).json({ greska: `Nekretnina sa id-em ${id} ne postoji` });
    res.status(200).json(nekretnina);
  } catch (error) {
    console.error("Error fetching property details:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
};

const getNekretnine = async (req, res) => {
  try {
    const nekretnine = await Nekretnina.findAll();
    res.status(200).json(nekretnine);
  } catch (error) {
    console.error("Greška prilikom dohvaćanja nekretnina:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
};

module.exports = { getTop5Nekretnine, getNekretninaById, getNekretnine };
