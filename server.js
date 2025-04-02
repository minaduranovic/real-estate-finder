const express = require("express");
const session = require("./config/sessionConfig");
const { sequelize } = require("./models");
const path = require("path");
const fs = require("fs").promises;

const authRoutes = require("./routes/authRoutes");
const nekretnineRoutes = require("./routes/nekretnineRoutes");
const interesovanjaRoutes = require("./routes/interesovanjaRoutes");
const marketingRoutes = require("./routes/marketingRoutes");

const app = express();
const PORT =  3000;

app.use(session);
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

// Ruta za serviranje JavaScript fajlova sa ispravnim MIME tipom
app.get('/scripts/:file', (req, res) => {
  res.set('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'scripts', req.params.file));
});

async function serveHTMLFile(req, res, fileName) {
  const htmlPath = path.join(__dirname, "public/html", fileName);
  try {
    const content = await fs.readFile(htmlPath, "utf-8");
    res.send(content);
  } catch (error) {
    console.error("Error serving HTML file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

const routes = [
  { route: "/nekretnine.html", file: "nekretnine.html" },
  { route: "/detalji.html", file: "detalji.html" },
  { route: "/meni.html", file: "meni.html" },
  { route: "/prijava.html", file: "prijava.html" },
  { route: "/profil.html", file: "profil.html" },
  { route: "/vijesti.html", file: "vijesti.html" },
  { route: "/statistika.html", file: "statistika.html" },
  { route: "/mojiUpiti.html", file: "mojiUpiti.html" },
];

routes.forEach(({ route, file }) => {
  app.get(route, async (req, res) => {
    await serveHTMLFile(req, res, file);
  });
});

app.use("/", authRoutes);
app.use("/", nekretnineRoutes);
app.use("/", interesovanjaRoutes);
app.use("/", marketingRoutes);

sequelize.sync({ alter: true }).then(() => {
  console.log("Baza sinhronizovana.");
  app.listen(PORT, () => console.log(`Server pokrenut na portu ${PORT}`));
});
