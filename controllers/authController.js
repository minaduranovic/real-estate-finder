const bcrypt = require("bcryptjs");
const fs = require("fs/promises");
const path = require("path");
const { Korisnik } = require("../models");

const putanjaZaLogove = path.join(__dirname, "../data", "prijave.txt");
let podaciOgranicenja = {};

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

async function login(req, res) {
  const { username, password } = req.body;
  const sadasnjeVrijeme = Date.now();

  try {
    if (
      podaciOgranicenja[username] &&
      podaciOgranicenja[username].blockedUntil &&
      sadasnjeVrijeme < podaciOgranicenja[username].blockedUntil
    ) {
      await fs.appendFile(
        putanjaZaLogove,
        `[${new Date().toISOString()}] - username: "${username}" - status: "neuspješno"\n`
      );
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

    delete podaciOgranicenja[username];

    await fs.appendFile(
      putanjaZaLogove,
      `[${new Date().toISOString()}] - username: "${username}" - status: "uspješno"\n`
    );

    res.json({ poruka: "Uspješna prijava" });
  } catch (error) {
    console.error("Greška prilikom prijave:", error);
    res.status(500).json({ greska: "Interna greška servera" });
  }
}

async function logout(req, res) {
  if (!req.session.user) {
    return res.status(401).json({ greska: "Neautorizovan pristup" });
  }

  req.session.destroy((err) => {
    if (err) {
      console.error("Error during logout:", err);
      return res.status(500).json({ greska: "Internal Server Error" });
    }
    res.status(200).json({ poruka: "Uspješno ste se odjavili" });
  });
}

async function getKorisnik(req, res) {
  if (!req.session.user) {
    return res.status(401).json({ greska: "Neautorizovan pristup" });
  }

  try {
    const user = await Korisnik.findOne({
      where: { username: req.session.user.username },
    });

    if (!user) {
      return res.status(404).json({ greska: "Korisnik nije pronađen" });
    }

    res.status(200).json({
      id: user.id,
      ime: user.ime,
      prezime: user.prezime,
      username: user.username,
      admin: user.admin,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
}

async function putKorisnik(req, res) {
  if (!req.session.username) {
    return res.status(401).json({ greska: "Neautorizovan pristup" });
  }

  const { ime, prezime, username, password } = req.body;

  try {
    const loggedInUser = await Korisnik.findOne({
      where: { username: req.session.username },
    });

    if (!loggedInUser) {
      return res.status(401).json({ greska: "Neautorizovan pristup" });
    }

    if (ime) loggedInUser.ime = ime;
    if (prezime) loggedInUser.prezime = prezime;
    if (username) loggedInUser.username = username;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      loggedInUser.password = hashedPassword;
    }

    await loggedInUser.save();
    res.status(200).json({ poruka: "Podaci su uspješno ažurirani" });
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
}

module.exports = {
  login,
  logout,
  getKorisnik,
  putKorisnik,
};
