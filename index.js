const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs").promises; // Using asynchronus API for file read and write
const bcrypt = require("bcrypt");

const sequelize = require("./db");
const Korisnik = require("./models/Korisnik");
const Nekretnina = require("./models/Nekretnina");
const Upit = require("./models/Upit");
const Zahtjev = require("./models/Zahtjev");
const Ponuda = require("./models/Ponuda");

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

// sequelize.sync({ alter: true })
//   .then(() => console.log('Baza i tabele su sinhronizovane.'))
//   .catch(err => console.error('Greška pri sinhronizaciji:', err));

sequelize.sync({ alter: true }).then(async () => {
  console.log("Database synchronized.");

  const adminPassword = await bcrypt.hash("admin", 10);
  const userPassword = await bcrypt.hash("user", 10);

  // await Korisnik.findOrCreate({
  //   where: { username: "admin" },
  //   defaults: {
  //     username: "admin",
  //     password: adminPassword,
  //     admin: true,
  //     ime: "Admin",
  //     prezime: "Adminovic"
  //   },
  // });

  // await Korisnik.findOrCreate({
  //   where: { username: "user" },
  //   defaults: {
  //     username: "user",
  //     password: userPassword,
  //     admin: false,
  //     ime: "User",
  //     prezime: "Useric"
  //   },
  // });
});

// module.exports = { sequelize, Korisnik, Nekretnina, Upit, Zahtjev, Ponuda };

const app = express();
const PORT = 3000;

const podaciOgranicenja = {};

app.use(
  session({
    secret: "tajna sifra",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(express.static(__dirname + "/public"));

// Enable JSON parsing without body-parser
app.use(express.json());

/* ---------------- SERVING HTML -------------------- */

// Async function for serving html files
async function serveHTMLFile(req, res, fileName) {
  const htmlPath = path.join(__dirname, "public/html", fileName);
  try {
    const content = await fs.readFile(htmlPath, "utf-8");
    res.send(content);
  } catch (error) {
    console.error("Error serving HTML file:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
}

// Array of HTML files and their routes
const routes = [
  { route: "/nekretnine.html", file: "nekretnine.html" },
  { route: "/detalji.html", file: "detalji.html" },
  { route: "/meni.html", file: "meni.html" },
  { route: "/prijava.html", file: "prijava.html" },
  { route: "/profil.html", file: "profil.html" },
  // Practical for adding more .html files as the project grows
  { route: "/vijesti.html", file: "vijesti.html" },
  { route: "/statistika.html", file: "statistika.html" },
  { route: "/mojiUpiti.html", file: "mojiUpiti.html" },
];

// Loop through the array so HTML can be served
routes.forEach(({ route, file }) => {
  app.get(route, async (req, res) => {
    await serveHTMLFile(req, res, file);
  });
});

/* ----------- SERVING OTHER ROUTES --------------- */

// Async function for reading json data from data folder
async function readJsonFile(filename) {
  const filePath = path.join(__dirname, "data", `${filename}.json`);
  try {
    const rawdata = await fs.readFile(filePath, "utf-8");
    return JSON.parse(rawdata);
  } catch (error) {
    throw error;
  }
}

// Async function for reading json data from data folder
async function saveJsonFile(filename, data) {
  const filePath = path.join(__dirname, "data", `${filename}.json`);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    throw error;
  }
}

/*
Checks if the user exists and if the password is correct based on korisnici.json data. 
If the data is correct, the username is saved in the session and a success message is sent.
*/
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const sadasnjeVrijeme = Date.now();

  try {
    if (
      podaciOgranicenja[username] &&
      podaciOgranicenja[username].blockedUntil &&
      sadasnjeVrijeme < podaciOgranicenja[username].blockedUntil
    ) {
      return res.status(429).json({
        greska: "Previše neuspješnih pokušaja. Pokušajte ponovo za 1 minutu.",
      });
    }

    const korisnik = await Korisnik.findOne({ where: { username } });

    if (!korisnik) {
      await handleLoginFailure(username);
      return res.status(400).json({ poruka: "Neuspješna prijava" });
    }

    const isPasswordMatched = await bcrypt.compare(password, korisnik.password);

    if (!isPasswordMatched) {
      await handleLoginFailure(username);
      return res.status(400).json({ poruka: "Neuspješna prijava" });
    }

    req.session.user = {
      username: korisnik.username,
      id: korisnik.id,
      admin: korisnik.admin,
    };

    if (podaciOgranicenja[username]) {
      delete podaciOgranicenja[username];
    }

    res.json({ poruka: "Uspješna prijava" });
  } catch (error) {
    console.error("Greška prilikom prijave:", error);
    res.status(500).json({ greska: "Interna greška servera" });
  }
});

async function handleLoginFailure(username) {
  if (!podaciOgranicenja[username]) {
    podaciOgranicenja[username] = { attempts: 0, blockedUntil: null };
  }

  podaciOgranicenja[username].attempts += 1;

  if (podaciOgranicenja[username].attempts >= 3) {
    podaciOgranicenja[username].blockedUntil = Date.now() + 60 * 1000;
    podaciOgranicenja[username].attempts = 0;
  }
}

/*
Delete everything from the session.
*/
app.post("/logout", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ greska: "Neautorizovan pristup" });
  }

  try {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error during logout:", err);
        return res.status(500).json({ greska: "Internal Server Error" });
      }
      res.status(200).json({ poruka: "Uspješno ste se odjavili" });
    });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
});

app.get("/korisnik", async (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ greska: "Neautorizovan pristup" });
  }
  const username = req.session.user.username;

  try {
    const user = await Korisnik.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ greska: "Korisnik nije pronađen" });
    }

    const userData = {
      id: user.id,
      ime: user.ime,
      prezime: user.prezime,
      username: user.username,
      admin: user.admin,
    };

    res.status(200).json(userData);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
});

app.get("/nekretnine/top5", async (req, res) => {
  const { lokacija } = req.query;

  if (!lokacija) {
    return res.status(400).json({ greska: "Lokacija nije navedena." });
  }

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
});

/*
Allows logged user to make a request for a property
*/
app.post("/upit", async (req, res) => {
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
});

app.get("/upiti/moji", async (req, res) => {
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
});

app.get("/nekretnina/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const nekretnina = await Nekretnina.findByPk(id, {
      include: {
        model: Upit,
        as: "upiti",
        attributes: ["KorisnikId", "tekst", "createdAt"],
        limit: 3,
        order: [["createdAt", "DESC"]],
      },
    });

    if (!nekretnina) {
      return res
        .status(404)
        .json({ greska: `Nekretnina sa id-em ${id} ne postoji` });
    }

    res.status(200).json(nekretnina);
  } catch (error) {
    console.error("Error fetching property details:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
});

app.get("/next/upiti/nekretnina/:id", async (req, res) => {
  const nekretninaId = parseInt(req.params.id, 10);
  const stranica = parseInt(req.query.page, 10);

  if (stranica < 0) {
    return res.status(200).json([]);
  }

  try {
    // Pronađite nekretninu prema ID-u
    const nekretnina = await Nekretnina.findByPk(nekretninaId, {
      include: {
        model: Upit,
        as: "upiti",
        attributes: ["korisnik_id", "tekst_upita"], // Izaberite samo potrebne atribute
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
});

/*
Updates any user field
*/
app.put("/korisnik", async (req, res) => {
  // Check if the user is authenticated
  if (!req.session.username) {
    // User is not logged in
    return res.status(401).json({ greska: "Neautorizovan pristup" });
  }

  // Get data from the request body
  const { ime, prezime, username, password } = req.body;

  try {
    // Read user data from the JSON file
    const users = await readJsonFile("korisnici");

    // Find the user by username
    const loggedInUser = users.find(
      (user) => user.username === req.session.username
    );

    if (!loggedInUser) {
      // User not found (should not happen if users are correctly managed)
      return res.status(401).json({ greska: "Neautorizovan pristup" });
    }

    // Update user data with the provided values
    if (ime) loggedInUser.ime = ime;
    if (prezime) loggedInUser.prezime = prezime;
    if (username) loggedInUser.username = username;
    if (password) {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);
      loggedInUser.password = hashedPassword;
    }

    // Save the updated user data back to the JSON file
    await saveJsonFile("korisnici", users);
    res.status(200).json({ poruka: "Podaci su uspješno ažurirani" });
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
});

/*
Returns all properties from the file.
*/
app.get("/nekretnine", async (req, res) => {
  try {
    const nekretnine = await Nekretnina.findAll({
      attributes: [
        "id",
        "tip_nekretnine",
        "naziv",
        "kvadratura",
        "cijena",
        "tip_grijanja",
        "lokacija",
        "godina_izgradnje",
        "datum_objave",
        "opis",
      ],
    });

    res.status(200).json(nekretnine);
  } catch (error) {
    console.error("Greška prilikom dohvaćanja nekretnina:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
});

/* ----------------- MARKETING ROUTES ----------------- */

// Route that increments value of pretrage for one based on list of ids in nizNekretnina
app.post("/marketing/nekretnine", async (req, res) => {
  const { nizNekretnina } = req.body;

  try {
    // Load JSON data
    let preferencije = await readJsonFile("preferencije");

    // Check format
    if (!preferencije || !Array.isArray(preferencije)) {
      console.error("Neispravan format podataka u preferencije.json.");
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    // Init object for search
    preferencije = preferencije.map((nekretnina) => {
      nekretnina.pretrage = nekretnina.pretrage || 0;
      return nekretnina;
    });

    // Update atribute pretraga
    nizNekretnina.forEach((id) => {
      const nekretnina = preferencije.find((item) => item.id === id);
      if (nekretnina) {
        nekretnina.pretrage += 1;
      }
    });

    // Save JSON file
    await saveJsonFile("preferencije", preferencije);

    res.status(200).json({});
  } catch (error) {
    console.error("Greška prilikom čitanja ili pisanja JSON datoteke:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/marketing/nekretnina/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Read JSON
    const preferencije = await readJsonFile("preferencije");

    // Finding the needed objects based on id
    const nekretninaData = preferencije.find(
      (item) => item.id === parseInt(id, 10)
    );

    if (nekretninaData) {
      // Update clicks
      nekretninaData.klikovi = (nekretninaData.klikovi || 0) + 1;

      // Save JSON file
      await saveJsonFile("preferencije", preferencije);

      res
        .status(200)
        .json({ success: true, message: "Broj klikova ažuriran." });
    } else {
      res.status(404).json({ error: "Nekretnina nije pronađena." });
    }
  } catch (error) {
    console.error("Greška prilikom čitanja ili pisanja JSON datoteke:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/marketing/osvjezi/pretrage", async (req, res) => {
  const { nizNekretnina } = req.body || { nizNekretnina: [] };

  try {
    // Read JSON
    const preferencije = await readJsonFile("preferencije");

    // Finding the needed objects based on id
    const promjene = nizNekretnina.map((id) => {
      const nekretninaData = preferencije.find((item) => item.id === id);
      return { id, pretrage: nekretninaData ? nekretninaData.pretrage : 0 };
    });

    res.status(200).json({ nizNekretnina: promjene });
  } catch (error) {
    console.error("Greška prilikom čitanja ili pisanja JSON datoteke:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/marketing/osvjezi/klikovi", async (req, res) => {
  const { nizNekretnina } = req.body || { nizNekretnina: [] };

  try {
    // Read JSON
    const preferencije = await readJsonFile("preferencije");

    // Finding the needed objects based on id
    const promjene = nizNekretnina.map((id) => {
      const nekretninaData = preferencije.find((item) => item.id === id);
      return { id, klikovi: nekretninaData ? nekretninaData.klikovi : 0 };
    });

    res.status(200).json({ nizNekretnina: promjene });
  } catch (error) {
    console.error("Greška prilikom čitanja ili pisanja JSON datoteke:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//SPIRALA 4

app.get("/nekretnina/:id/interesovanja", async (req, res) => {
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
});

app.post("/nekretnina/:id/ponuda", async (req, res) => {
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
});

app.post("/nekretnina/:id/zahtjev", async (req, res) => {
  const { id } = req.params;
  const { tekst, trazeniDatum } = req.body;
  const user = req.session?.user;

  if (!user) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }

  // Provera da li su polja tekst i trazeniDatum prisutna
  if (!tekst || !trazeniDatum) {
    return res
      .status(400)
      .json({ error: "Tekst i trazeniDatum su obavezna polja." });
  }

  try {
    // Provjera da li nekretnina postoji
    const nekretnina = await Nekretnina.findByPk(id);
    if (!nekretnina) {
      return res
        .status(404)
        .json({ error: `Nekretnina sa id-em ${id} ne postoji.` });
    }

    // Provjera da li je trazeniDatum u budućnosti
    const currentDate = new Date();
    const requestedDate = new Date(trazeniDatum);

    if (requestedDate < currentDate) {
      return res
        .status(400)
        .json({ error: "Datum pregleda mora biti u budućnosti." });
    }

    // Kreiranje zahtjeva
    const zahtjev = await Zahtjev.create({
      tekst,
      trazeniDatum,
      NekretninaId: id,
      KorisnikId: user.id,
    });

    res.status(201).json(zahtjev);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/nekretnina/:id/zahtjev/:zid", async (req, res) => {
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
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
