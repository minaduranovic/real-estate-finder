function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function prikaziDetalje(nekretnina) {
  const osnovnoDiv = document.getElementById("osnovno");
  osnovnoDiv.innerHTML = `
        <img src="../Resources/${nekretnina.id}.jpg" alt="${nekretnina.naziv}">
        <p><strong>Naziv:</strong> ${nekretnina.naziv}</p>
        <p><strong>Kvadratura:</strong> ${nekretnina.kvadratura} m²</p>
        <p><strong>Cijena:</strong> ${nekretnina.cijena} BAM</p>
    `;

  document.getElementById("kolona1").innerHTML = `
        <p><strong>Tip grijanja:</strong> ${nekretnina.tip_grijanja}</p>
        <p><strong>Lokacija:</strong> <a href="#" id="top5Link">${nekretnina.lokacija}</a></p>
    `;
  document.getElementById("kolona2").innerHTML = `
        <p><strong>Godina izgradnje:</strong> ${nekretnina.godina_izgradnje}</p>
        <p><strong>Datum objave oglasa:</strong> ${nekretnina.datum_objave}</p>
    `;
  document.getElementById("opis").innerHTML = `
        <p><strong>Opis:</strong> ${nekretnina.opis}</p>
    `;

  let k = 2;

  let trenutnaStranica = 0;
  let sviUpiti = [...nekretnina.upiti];
  let ukupnoUcitano = sviUpiti.length;

  const upitiDiv = document.getElementById("upiti");

  sviUpiti.forEach((upit) => {
    let div = document.createElement("div");
    div.classList.add("upit");
    div.innerHTML = `<p><strong>Korisnik ${upit.korisnik_id}</strong>: ${upit.tekst_upita}</p>`;
    upitiDiv.appendChild(div);
  });
  console.log("Svi učitani upiti:", sviUpiti);

  const sviElementi = Array.from(upitiDiv.querySelectorAll(".upit"));

  if (sviElementi.length === 0) {
    console.error("Nema upita u containeru.");
    return;
  }

  let indeks = 0;
  const carousel = postaviCarousel(upitiDiv, sviElementi, indeks);

  let lijevoDugme = document.getElementById("prevBtn");
  lijevoDugme.addEventListener("click", () => {
    let novi = (indeks - 1 + sviElementi.length) % sviElementi.length;
    carousel.fnLijevo();
    sviElementi[indeks].id = "";
    sviElementi[novi].id = "prikazujeSe";
    indeks = novi;
    console.log("Trenutni indeks:", indeks);
  });

  let desnoDugme = document.getElementById("nextBtn");
  desnoDugme.addEventListener("click", () => {
    let novi = (indeks + 1) % sviElementi.length;
    carousel.fnDesno();
    sviElementi[indeks].id = "";
    sviElementi[novi].id = "prikazujeSe";
    indeks = novi;

    // console.log('Trenutni indeks:', indeks);
    if (indeks >= k) {
      trenutnaStranica += 1;
      k += 3;
      PoziviAjax.getNextUpiti(
        nekretninaId,
        trenutnaStranica,
        (error, newUpiti) => {
          if (error) {
            console.error("Greška prilikom učitavanja sledećih upita:", error);
          } else {
            console.log("Učitani sledeći upiti:", newUpiti);
            if (newUpiti.length > 0) {
              ukupnoUcitano += newUpiti.length;
              newUpiti.forEach((upit) => {
                let div = document.createElement("div");
                div.classList.add("upit");
                div.innerHTML = `<p><strong>Korisnik ${upit.korisnik_id}</strong>: ${upit.tekst_upita}</p>`;
                sviElementi.push(div);
                upitiDiv.appendChild(div);
              });
            }
          }
        }
      );
    }
  });
}

const nekretninaId = getQueryParam("id");

if (nekretninaId) {
  setTimeout(() => {
    PoziviAjax.getNekretnina(nekretninaId, (error, data) => {
      if (error) {
        console.error("Error fetching property details:", error);
        alert("Došlo je do greške pri dohvaćanju podataka o nekretnini.");
      } else {
        try {
          const nekretnina = JSON.parse(data);
          prikaziDetalje(nekretnina);
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
          alert("Došlo je do greške u obradi podataka.");
        }
      }
    });
  }, 1000);
} else {
  alert("Nema ID-a u URL-u!");
}

document.addEventListener("click", function (event) {
  if (event.target && event.target.id === "top5Link") {
    event.preventDefault();
    const lokacija = event.target.textContent;

    PoziviAjax.getTop5Nekretnina(lokacija, (error, data) => {
      if (error) {
        console.error("Greška pri dohvaćanju top 5 nekretnina:", error);
        alert("Došlo je do greške pri dohvaćanju top 5 nekretnina.");
      } else {
        try {
          const topNekretnine = JSON.parse(data);
          prikaziTop5Nekretnina(topNekretnine);
        } catch (parseError) {
          console.error("Greška pri parsiranju podataka:", parseError);
          alert("Greška u obradi podataka.");
        }
      }
    });
  }
});

function prikaziTop5Nekretnina(nekretnine) {
  const top5Div = document.getElementById("top5Nekretnine");
  if (nekretnine.length === 0) {
    top5Div.innerHTML = "<p>Nema nekretnina za prikaz u ovoj lokaciji.</p>";
    return;
  }
  top5Div.innerHTML = `
        <h3>Top 5 nekretnina za ovu lokaciju:</h3>
        <ul>
            ${nekretnine
              .map(
                (n) => `
                <li style="margin-bottom: 10px;">
                    <img src="../Resources/${n.id}.jpg" width="100" style="vertical-align: middle;">
                    <div style="display: inline-block; margin-left: 10px;">
                        <p><strong>${n.naziv}</strong></p>
                        <p>${n.kvadratura} m² - ${n.cijena} BAM</p>
                    </div>
                </li>
            `
              )
              .join("")}
        </ul>
    `;
}

// function handleUserOfferSelection(korisnik) {
//   // Dobijanje korisničkog ID-a iz korisničkih podataka
//   const korisnikId = korisnik.id; // Pretpostavka da korisnik objekat ima 'id' atribut
//   console.log(korisnikId);
//   // Sada možete koristiti korisnikId da pozovete ponude
//   PoziviAjax.getPonudeZaKorisnika(nekretninaId, korisnikId, (error, ponude) => {
//     const dodatnaPoljaDiv = document.getElementById("dodatnaPolja");
//     if (error) {
//       console.error("Greška pri dohvaćanju ponuda:", error);
//       dodatnaPoljaDiv.innerHTML = "<p>Došlo je do greške.</p>";
//     } else {
//       const options = ponude
//         .map((ponuda) => `<option value="${ponuda.id}">${ponuda.id}</option>`)
//         .join("");
//       dodatnaPoljaDiv.innerHTML = `
//               <label for="vezanaPonuda">ID vezane ponude:</label>
//               <select id="vezanaPonuda" name="vezanaPonuda" ${
//                 options ? "" : "disabled"
//               }>
//                   ${options || "<option value=''>Nema ponuda</option>"}
//               </select>
//               <label for="tekstPonude">Tekst:</label>
//               <textarea id="tekstPonude" name="tekstPonude" required></textarea>
//           `;
//     }
//   });
// }

// // Funkcija koja se poziva kada stranica učita korisničke podatke
// function loadUserDataAndProceed() {
//   PoziviAjax.getKorisnik((error, korisnik) => {
//     if (error) {
//       console.error("Greška pri dobijanju korisničkih podataka:", error);
//       alert("Došlo je do greške pri učitavanju korisničkih podataka.");
//     } else {
//       console.log("Korisnik uspešno učitan:", korisnik);
//       // Ovdje možete implementirati logiku koja zavisi od korisničkih podataka,
//       // kao što je pozivanje ponuda za korisnika.
//       handleUserOfferSelection(korisnik);
//     }
//   });
// }

// window.onload = loadUserDataAndProceed;
// Funkcija koja se poziva kada se odabere tip interesovanja
function handleInterestTypeChange(event) {
  const tipInteresovanja = event.target.value;
  const dodatnaPoljaDiv = document.getElementById("dodatnaPolja");

  if (tipInteresovanja === "ponuda") {
    dodatnaPoljaDiv.innerHTML = `
      <label for="vezanaPonuda">ID vezane ponude:</label>
      <select id="vezanaPonuda" name="vezanaPonuda"></select>
      <label for="tekstPonude">Tekst ponude:</label>
      <textarea id="tekstPonude" name="tekstPonude" required></textarea>
    `;
    loadUserOffers();
  } else if (tipInteresovanja === "zahtjev" || tipInteresovanja === "upit") {
    dodatnaPoljaDiv.innerHTML = `
      <label for="tekstInteresovanja">Tekst:</label>
      <textarea id="tekstInteresovanja" name="tekstInteresovanja" required></textarea>
    `;
  }
}

// Funkcija za učitavanje ponuda za vezane ponude korisnika
function loadUserOffers() {
  PoziviAjax.getKorisnik((error, korisnik) => {
    if (error) {
      console.error("Greška pri dobijanju korisničkih podataka:", error);
      return;
    }

    const korisnikId = korisnik.id;
    PoziviAjax.getPonudeZaKorisnika(nekretninaId, korisnikId, (error, ponude) => {
      const vezanaPonudaSelect = document.getElementById("vezanaPonuda");
      if (error) {
        console.error("Greška pri dohvaćanju ponuda:", error);
        vezanaPonudaSelect.innerHTML = "<option value=''>Nema ponuda</option>";
        vezanaPonudaSelect.disabled = true;
      } else {
        const options = ponude
          .map((ponuda) => `<option value="${ponuda.id}">${ponuda.id}</option>`)
          .join("");
        vezanaPonudaSelect.innerHTML = options || "<option value=''>Nema ponuda</option>";
        vezanaPonudaSelect.disabled = ponude.length === 0;
      }
    });
  });
}

// Funkcija koja se poziva kada stranica učita korisničke podatke
function loadUserDataAndProceed() {
  PoziviAjax.getKorisnik((error, korisnik) => {
    if (error) {
      console.error("Greška pri dobijanju korisničkih podataka:", error);
      alert("Došlo je do greške pri učitavanju korisničkih podataka.");
    } else {
      console.log("Korisnik uspešno učitan:", korisnik);
      // Prikazivanje ponuda korisniku
      handleUserOfferSelection(korisnik);
    }
  });
}

// Pratimo promjenu u dropdownu za tip interesovanja
document.addEventListener("DOMContentLoaded", function() {
  const tipInteresovanjaSelect = document.getElementById("tipInteresovanja");
  if (tipInteresovanjaSelect) {
    tipInteresovanjaSelect.addEventListener("change", handleInterestTypeChange);
  }

  loadUserDataAndProceed();
  handleInterestTypeChange({ target: { value: "upit" } }); // Početna vrednost
});

