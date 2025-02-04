const path = require('path');
const fs = require('fs').promises;

async function readJsonFile(filename) {
    const filePath = path.join(__dirname, '..', 'data', 'preferencije.json');
    try {
    const rawdata = await fs.readFile(filePath, "utf-8");
    return JSON.parse(rawdata);
  } catch (error) {
    throw error;
  }
}

async function saveJsonFile(filename, data) {
  const filePath = path.join(__dirname, "data", `${filename}.json`);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    throw error;
  }
}

async function postMarketingNekretnine(req, res) {
  const { nizNekretnina } = req.body;

  try {
    let preferencije = await readJsonFile("preferencije");

    if (!preferencije || !Array.isArray(preferencije)) {
      console.error("Neispravan format podataka u preferencije.json.");
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    preferencije = preferencije.map((nekretnina) => {
      nekretnina.pretrage = nekretnina.pretrage || 0;
      return nekretnina;
    });

    nizNekretnina.forEach((id) => {
      const nekretnina = preferencije.find((item) => item.id === id);
      if (nekretnina) {
        nekretnina.pretrage += 1;
      }
    });

    await saveJsonFile("preferencije", preferencije);

    res.status(200).json({});
  } catch (error) {
    console.error("Greška prilikom čitanja ili pisanja JSON datoteke:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function postMarketingNekretnina(req, res) {
  const { id } = req.params;

  try {
    const preferencije = await readJsonFile("preferencije");

    const nekretninaData = preferencije.find(
      (item) => item.id === parseInt(id, 10)
    );

    if (nekretninaData) {
      nekretninaData.klikovi = (nekretninaData.klikovi || 0) + 1;

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
}

async function postMarketingOsvjeziPretrage(req, res) {
  const { nizNekretnina } = req.body || { nizNekretnina: [] };

  try {
    const preferencije = await readJsonFile("preferencije");

    const promjene = nizNekretnina.map((id) => {
      const nekretninaData = preferencije.find((item) => item.id === id);
      return { id, pretrage: nekretninaData ? nekretninaData.pretrage : 0 };
    });

    res.status(200).json({ nizNekretnina: promjene });
  } catch (error) {
    console.error("Greška prilikom čitanja ili pisanja JSON datoteke:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function postMarketingOsvjeziKlikove(req, res) {
  const { nizNekretnina } = req.body || { nizNekretnina: [] };

  try {
    const preferencije = await readJsonFile("preferencije");

    const promjene = nizNekretnina.map((id) => {
      const nekretninaData = preferencije.find((item) => item.id === id);
      return { id, klikovi: nekretninaData ? nekretninaData.klikovi : 0 };
    });

    res.status(200).json({ nizNekretnina: promjene });
  } catch (error) {
    console.error("Greška prilikom čitanja ili pisanja JSON datoteke:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  postMarketingNekretnine,
  postMarketingNekretnina,
  postMarketingOsvjeziPretrage,
  postMarketingOsvjeziKlikove
};
