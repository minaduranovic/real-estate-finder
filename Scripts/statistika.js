function popuniDropdownKorisnika() {
  const korisnikDropdown = document.getElementById("korisnik");

  korisnikDropdown.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Odaberite korisnika";
  defaultOption.disabled = true;
  defaultOption.selected = true;
  korisnikDropdown.appendChild(defaultOption);

  listaKorisnika.forEach((korisnik) => {
    const option = document.createElement("option");
    option.value = korisnik.username;
    option.textContent = `${korisnik.ime} ${korisnik.prezime} (${korisnik.username})`;
    korisnikDropdown.appendChild(option);
  });
}

document.addEventListener("DOMContentLoaded", popuniDropdownKorisnika);

function dodajPeriod() {
  const container = document.getElementById("periodi-container");
  const noviPeriod = document.createElement("div");
  noviPeriod.innerHTML = `
            <div class="od-do-wrapper">
              <input type="number" placeholder="Od" class="period-od" /> -
              <input type="number" placeholder="Do" class="period-do" />
              <button type="button" class="dodaj-ukloni" onclick="ukloniElement(this)">-</button>
            </div>
      `;
  container.appendChild(noviPeriod);
}

function dodajRaspon() {
  const container = document.getElementById("rasponi-container");
  const noviRaspon = document.createElement("div");
  noviRaspon.innerHTML = `  
        <div class="od-do-wrapper">
          <input type="number" placeholder="Od" class="raspon-od" /> -
          <input type="number" placeholder="Do" class="raspon-do" />
          <button type="button" class="dodaj-ukloni" onclick="ukloniElement(this)">-</button>
        </div>
      `;
  container.appendChild(noviRaspon);
}

function ukloniElement(button) {
  const parent = button.closest(".od-do-wrapper");
  parent.remove();
}

function prikaziNekretninu(nekretnina) {
  const nekretninaDiv = document.createElement("div");
  nekretninaDiv.className = "nekretnina";
  nekretninaDiv.innerHTML = `
    <h3>${nekretnina.naziv || "Nepoznata nekretnina"}</h3>
    <p><strong>ID:</strong> ${nekretnina.id || "nepoznato"}</p>
    <p><strong>Tip nekretnine:</strong> ${
      nekretnina.tip_nekretnine || "nepoznato"
    }</p>
    <p><strong>Kvadratura:</strong> ${
      nekretnina.kvadratura ? nekretnina.kvadratura + " m²" : "nepoznato"
    }</p>
    <p><strong>Cijena:</strong> ${
      nekretnina.cijena ? nekretnina.cijena + " KM" : "nepoznato"
    }</p>
    <p><strong>Tip grijanja:</strong> ${
      nekretnina.tip_grijanja || "nepoznato"
    }</p>
    <p><strong>Lokacija:</strong> ${nekretnina.lokacija || "nepoznato"}</p>
    <p><strong>Godina izgradnje:</strong> ${
      nekretnina.godina_izgradnje || "nepoznato"
    }</p>
    <p><strong>Datum objave:</strong> ${
      nekretnina.datum_objave || "nepoznato"
    }</p>
    <p><strong>Opis:</strong> ${nekretnina.opis || "Nema opisa"}</p>
    <p><strong>Upiti:</strong></p>
    <ul>
        ${
          nekretnina.upiti && nekretnina.upiti.length > 0
            ? nekretnina.upiti
                .map(
                  (upit) => `
                <li>
                    <strong>Korisnik ID:</strong> ${
                      upit.korisnik_id || "nepoznato"
                    }<br>
                    <strong>Tekst upita:</strong> ${
                      upit.tekst_upita || "Nema teksta"
                    }
                </li>`
                )
                .join("")
            : "<li>Nema upita</li>"
        }
    </ul>
  `;
  return nekretninaDiv;
}

function dodatneVrijednosti() {
  const svojstvo = document.getElementById("svojstvo").value;
  const vrijednostContainer = document.getElementById("vrijednost-container");

  if (svojstvo === "kvadratura" || svojstvo === "cijena") {
    vrijednostContainer.innerHTML = `
      <label for="minVrijednost">Minimalna ${svojstvo}:</label>
      <input type="number" id="minVrijednost" placeholder="Unesite minimalnu ${svojstvo}">

      <label for="maxVrijednost">Maksimalna ${svojstvo}:</label>
      <input type="number" id="maxVrijednost" placeholder="Unesite maksimalnu ${svojstvo}">
    `;
  } else {
    vrijednostContainer.innerHTML = `
      <label for="vrijednost">Unesite vrijednost:</label>
      <input type="text" id="vrijednost" placeholder="Unesite vrijednost">
    `;
  }
}

function getKriterij() {
  const svojstvo = document.getElementById("svojstvo").value;
  let kriterij = {};

  if (!svojstvo) {
    alert("Molimo odaberite svojstvo.");
    return null;
  }

  if (svojstvo === "kvadratura" || svojstvo === "cijena") {
    const minVrijednost = parseFloat(
      document.getElementById("minVrijednost").value
    );
    const maxVrijednost = parseFloat(
      document.getElementById("maxVrijednost").value
    );

    if (isNaN(minVrijednost) || isNaN(maxVrijednost)) {
      alert(
        "Molimo unesite ispravne vrijednosti za minimalnu i maksimalnu vrijednost."
      );
      return null;
    }

    kriterij[svojstvo] = { min: minVrijednost, max: maxVrijednost };
  } else {
    let vrijednost = document.getElementById("vrijednost").value;

    if (!vrijednost) {
      alert("Molimo unesite vrijednost za odabrano svojstvo.");
      return null;
    }

    // Ako je vrijednost tekst, pretvori prvo slovo u veliko, a ostale u mala
    if (isNaN(vrijednost)) {
      vrijednost = vrijednost.charAt(0).toUpperCase() + vrijednost.slice(1).toLowerCase();
    } else {
      vrijednost = parseFloat(vrijednost); // Ako je broj, ostavi ga kao broj
    }

    kriterij[svojstvo] = vrijednost;
  }

  // console.log("Kriterij:", kriterij);
  return kriterij;
}


let chartInstance = null;

function iscrtajHistogram() {
  const periodiOd = Array.from(document.querySelectorAll(".period-od")).map(
    (input) => input.valueAsNumber
  );
  const periodiDo = Array.from(document.querySelectorAll(".period-do")).map(
    (input) => input.valueAsNumber
  );
  const rasponiOd = Array.from(document.querySelectorAll(".raspon-od")).map(
    (input) => input.valueAsNumber
  );
  const rasponiDo = Array.from(document.querySelectorAll(".raspon-do")).map(
    (input) => input.valueAsNumber
  );

  try {
    const periodi = periodiOd.map((od, i) => {
      const doVrijednost = periodiDo[i];
      if (isNaN(od) || isNaN(doVrijednost) || od > doVrijednost) {
        throw new Error("Unesite validne vrijednosti za periode.");
      }
      return { od, do: doVrijednost };
    });
    // console.log(periodi);

    const rasponiCijena = rasponiOd.map((od, i) => {
      const doVrijednost = rasponiDo[i];
      if (isNaN(od) || isNaN(doVrijednost) || od > doVrijednost) {
        throw new Error("Unesite validne vrijednosti za raspone cijena.");
      }
      return { od, do: doVrijednost };
    });
    // console.log(rasponiCijena);

    const statistika = StatistikaNekretnina();
    statistika.init(listaNekretnina, listaKorisnika);

    let histogramData = statistika.histogramCijena(periodi, rasponiCijena);
    // console.log("Histogram Data:", histogramData);

    const canvas = document.getElementById("histogramChart");
    const labels = rasponiCijena.map((range) => `${range.od} - ${range.do}`);

    const datasets = [];
    const colors = [
      "rgba(111, 19, 95, 0.6)",
      "rgba(104, 103, 11, 0.6)",
      "rgba(232, 102, 20, 0.6)",
      "rgba(36, 174, 121, 0.6)",
      "rgb(75, 192, 192)",
    ];
    periodi.forEach((period, index) => {
      const data = rasponiCijena.map((raspon, indeksRasporedaCijena) => {
        const podatak = histogramData.find(
          (d) =>
            d.indeksPerioda === index &&
            d.indeksRasporedaCijena === indeksRasporedaCijena
        );
        return podatak ? podatak.brojNekretnina : 0;
      });

      const labelPeriod = `${period.od} - ${period.do}`;
      datasets.push({
        label: labelPeriod,
        data: data,
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length].replace("0.6", "1"),
        borderWidth: 1,
      });
    });

    const ctx = canvas.getContext("2d");

    if (chartInstance) {
      chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: { display: true, text: "Rasponi cijena" },
          },
          y: {
            title: { display: true, text: "Broj nekretnina" },
            beginAtZero: true,
          },
        },
        plugins: {
          legend: {
            position: "top",
            labels: {
              boxWidth: 20,
              padding: 15,
            },
          },
        },
        elements: {
          bar: {
            borderWidth: 2,
          },
        },
        stacked: true,
      },
    });
  } catch (error) {
    alert(error.message);
  }
}

function prikaziProsjecnuKvadraturu() {
  const kriterij = getKriterij();
  if (!kriterij) return;

  const statistika = StatistikaNekretnina();
  statistika.init(listaNekretnina, listaKorisnika);

  const prosjecnaKvadratura = statistika.prosjecnaKvadratura(kriterij);

  const container = document.getElementById("prosjecna-kvadratura");
  container.innerHTML = `Prosječna kvadratura: ${prosjecnaKvadratura} m²`;
}

function prikaziOutlier() {
  const kriterij = getKriterij();
  if (!kriterij) return;

  const nazivSvojstva = document.getElementById("nazivSvojstva").value;
  const statistika = StatistikaNekretnina();
  statistika.init(listaNekretnina, listaKorisnika);

  const outlier = statistika.outlier(kriterij, nazivSvojstva);

  const container = document.getElementById("outlier");
  container.innerHTML = "";
  if (outlier) {
    const nekretninaDiv = prikaziNekretninu(outlier);
    container.appendChild(nekretninaDiv);
  } else {
    container.innerHTML = "Nema outlier-a";
  }
}

function prikaziMojeNekretnine() {
  const korisnikDropdown = document.getElementById("korisnik").value;
  const korisnikInput = document.getElementById("korisnik-text").value;

  // Prioritet dajemo unesenom korisničkom imenu
  const korisnikIme = korisnikDropdown || korisnikInput;

  const korisnik = listaKorisnika.find((k) => k.username === korisnikIme);

  if (!korisnik) {
    alert("Korisnik nije pronađen.");
    return;
  }

  const statistika = StatistikaNekretnina();
  statistika.init(listaNekretnina, listaKorisnika);
  const mojeNekretnine = statistika.mojeNekretnine(korisnik);

  const container = document.querySelector(".moje-nekretnine");
  container.innerHTML = "";

  if (mojeNekretnine.length > 0) {
    mojeNekretnine.forEach((nekretnina) => {
      const nekretninaDiv = prikaziNekretninu(nekretnina);
      container.appendChild(nekretninaDiv);
    });
  } else {
    container.innerHTML = "Nema nekretnina za prikaz.";
  }
}

function resetHistogram() {
  const periodiContainer = document.getElementById("periodi-container");
  const rasponiContainer = document.getElementById("rasponi-container");

  periodiContainer.innerHTML = `
      <div class="od-do-wrapper">
          <input type="number" placeholder="Od" class="period-od"> -
          <input type="number" placeholder="Do" class="period-do">
          <button class="dodaj-ukloni" type="button" onclick="dodajPeriod()">+</button>
      </div>
  `;
  rasponiContainer.innerHTML = `
      <div class="od-do-wrapper">
          <input type="number" placeholder="Od" class="raspon-od"> -
          <input type="number" placeholder="Do" class="raspon-do">
          <button class="dodaj-ukloni" type="button" onclick="dodajRaspon()">+</button>
      </div>
  `;
  const canvas = document.getElementById("histogramChart");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (window.histogramInstance) {
    window.histogramInstance.destroy();
    window.histogramInstance = null;
  }
}

function resetProsjecnaKvadratura() {
  document.getElementById("prosjecna-kvadratura").innerHTML = "";
  document.getElementById("svojstvo").selectedIndex = 0;
  document.getElementById("nazivSvojstva").selectedIndex = 0;
  const vrijednostContainer = document.getElementById("vrijednost-container");
  vrijednostContainer.innerHTML = `
  <label for="vrijednost">Unesite vrijednost:</label>
  <input type="text" id="vrijednost" placeholder="Unesite vrijednost">
`;
}

function resetOutlier() {
  const vrijednostContainer = document.getElementById("vrijednost-container");
  document.getElementById("svojstvo").selectedIndex = 0;
  document.getElementById("nazivSvojstva").selectedIndex = 0;

  vrijednostContainer.innerHTML = `
    <label for="vrijednost">Unesite vrijednost:</label>
    <input type="text" id="vrijednost" placeholder="Unesite vrijednost">
  `;
  document.getElementById("outlier").innerHTML = "";
}

function resetMojeNekretnine() {
  document.getElementById("korisnik").value = "";
  document.getElementById("korisnik-text").value = "";
  const container = document.querySelector(".moje-nekretnine");
  container.innerHTML = "";
}
