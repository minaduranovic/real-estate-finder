const { Nekretnina, Upit, Zahtjev, Ponuda, Korisnik } = require("../models");

const postZahtjev = async (req, res) => {
  const { id, zid } = req.params;
  const { odobren, addToTekst } = req.body;
  const user = req.session?.user;

  if (!user) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }

  if (!user.admin) {
    return res
      .status(403)
      .json({ error: "Samo admin može odgovoriti na zahtjev." });
  }

  try {
    const zahtjev = await Zahtjev.findOne({
      where: { id: zid, nekretninaId: id },
    });

    if (!zahtjev) {
      return res
        .status(404)
        .json({ error: "Zahtjev sa zadanim ID-em ne postoji." });
    }
    await zahtjev.update({
      odobren: odobren,
      tekst: `${zahtjev.tekst} ODGOVOR ADMINA: ${addToTekst}`,
    });

    res.status(200).json({ message: "Zahtjev uspješno ažuriran." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getInteresovanja = async (req, res) => {
  const nekretninaId = req.params.id;

  try {
    const nekretnina = await Nekretnina.findByPk(nekretninaId);
    if (!nekretnina) {
      return res.status(404).json({ greska: "Nekretnina nije pronađena." });
    }

    const upiti = await Upit.findAll({ where: { NekretninaId: nekretninaId } });
    const zahtjevi = await Zahtjev.findAll({
      where: { NekretninaId: nekretninaId },
    });
    const ponude = await Ponuda.findAll({
      where: { NekretninaId: nekretninaId },
    });

    const loggedInUser = req.session?.user
      ? await Korisnik.findOne({
          where: { username: req.session.user.username },
        })
      : null;

    const isAdmin = loggedInUser?.admin;

    if (isAdmin) {
      return res.json({ upiti, zahtjevi, ponude });
    }

    const filteredPonude = await Promise.all(
      ponude.map(async (ponuda) => {
        if (loggedInUser && ponuda.KorisnikId === loggedInUser.id) {
          return ponuda;
        }

        if (ponuda.vezanaPonudaId) {
          const vezanaPonuda = await Ponuda.findByPk(ponuda.vezanaPonudaId);
          if (vezanaPonuda && vezanaPonuda.KorisnikId === loggedInUser.id) {
            return ponuda;
          }
        }
        const { cijenaPonude, ...ponudaWithoutCijena } = ponuda.toJSON();
        return ponudaWithoutCijena;
      })
    );

    res.json({
      upiti,
      zahtjevi,
      ponude: filteredPonude,
    });
  } catch (error) {
    console.error("Greška prilikom dohvata interesovanja:", error);
    res.status(500).json({ greska: "Greška na serveru." });
  }
};

const postPonuda = async (req, res) => {
  const { id } = req.params;
  const { tekst, ponudaCijene, datumPonude, idVezanePonude, odbijenaPonuda } =
    req.body;
  const user = req.session?.user;

  if (!user) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }

  try {
    const nekretnina = await Nekretnina.findByPk(id);
    if (!nekretnina) {
      return res
        .status(404)
        .json({ error: `Nekretnina sa id-em ${id} ne postoji.` });
    }

    const parentPonuda = idVezanePonude
      ? await Ponuda.findByPk(idVezanePonude)
      : null;

    if (parentPonuda && parentPonuda.odbijenaPonuda) {
      return res
        .status(400)
        .json({ error: "Ne možete dodati ponudu u odbijeni niz ponuda." });
    }

    if (!user.admin && parentPonuda && parentPonuda.userId !== user.id) {
      return res.status(403).json({ error: "Nemate ovlasti za ovu akciju." });
    }
    // console.log(tekst, ponudaCijene, datumPonude, odbijenaPonuda, idVezanePonude, id, user.id);
    const ponuda = await Ponuda.create({
      tekst,
      cijenaPonude: ponudaCijene,
      datumPonude,
      odbijenaPonuda,
      parentPonudaId: idVezanePonude || null,
      NekretninaId: id,
      KorisnikId: user.id,
    });

    res.status(201).json(ponuda);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const postUpit = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ greska: "Neautorizovan pristup" });
  }

  const { nekretnina_id, tekst_upita } = req.body;

  try {
    const loggedInUser = await Korisnik.findOne({
      where: { username: req.session.user.username },
    });

    if (!loggedInUser) {
      return res.status(401).json({ greska: "Neautorizovan pristup" });
    }

    const nekretnina = await Nekretnina.findByPk(nekretnina_id);

    if (!nekretnina) {
      return res
        .status(400)
        .json({ greska: `Nekretnina sa id-em ${nekretnina_id} ne postoji` });
    }

    const brojUpita = await Upit.count({
      where: { KorisnikId: loggedInUser.id, NekretninaId: nekretnina_id },
    });

    if (brojUpita >= 3) {
      return res
        .status(429)
        .json({ greska: "Previse upita za istu nekretninu." });
    }

    await Upit.create({
      KorisnikId: loggedInUser.id,
      NekretninaId: nekretnina_id,

      tekst: tekst_upita,
    });

    res.status(200).json({ poruka: "Upit je uspješno dodan" });
  } catch (error) {
    console.error("Error processing query:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
};

const getUpiti = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ greska: "Neautorizovan pristup" });
  }

  try {
    const loggedInUser = await Korisnik.findOne({
      where: { username: req.session.user.username },
    });

    if (!loggedInUser) {
      return res.status(401).json({ greska: "Neautorizovan pristup" });
    }

    const upiti = await Upit.findAll({
      where: { KorisnikId: loggedInUser.id },
      include: [{ model: Nekretnina, attributes: ["naziv", "lokacija"] }],
    });

    if (upiti.length === 0) {
      return res.status(404).json([]);
    }

    res.status(200).json(
      upiti.map((upit) => ({
        nekretninaId: upit.NekretninaId,
        tekst: upit.tekst,
      }))
    );
  } catch (error) {
    console.error("Error fetching user queries:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
};

const getNextUpiti = async (req, res) => {
  const nekretninaId = parseInt(req.params.id, 10);
  const stranica = parseInt(req.query.page, 10);

  if (stranica < 0) {
    return res.status(200).json([]);
  }

  try {
    const nekretnina = await Nekretnina.findByPk(nekretninaId, {
      include: {
        model: Upit,
        as: "upiti",
        attributes: ["korisnik_id", "tekst_upita"],
      },
    });

    if (!nekretnina) {
      return res.status(404).json({ greska: "Nekretnina nije pronađena." });
    }

    const ukupnoUpita = nekretnina.upiti.length;

    const pocetak = ukupnoUpita - (stranica + 1) * 3;
    const kraj = pocetak + 3;

    const validPocetak = Math.max(pocetak, 0);
    const validKraj = Math.max(kraj, 0);

    const nextUpiti = nekretnina.upiti.slice(validPocetak, validKraj);

    if (nextUpiti.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(nextUpiti);
  } catch (error) {
    console.error("Greška prilikom dohvaćanja upita:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
};

module.exports = {
  postZahtjev,
  getInteresovanja,
  postPonuda,
  postUpit,
  getUpiti,
  getNextUpiti,
};
