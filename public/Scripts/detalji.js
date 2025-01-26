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

  PoziviAjax.getInteresovanja(nekretnina.id, (error, interesovanja) => {
    if (error) {
      console.error("Greška prilikom učitavanja interesovanja:", error);
      return;
    }
    console.log(interesovanja);

    const upitiDiv = document.getElementById("upiti");
    const zahtjeviDiv = document.getElementById("zahtjevi");
    const ponudeDiv = document.getElementById("ponude");

    interesovanja.upiti.forEach((upit) => {
      let div = document.createElement("div");
      div.classList.add("upit");
      div.innerHTML = `<p><strong>ID ${upit.id}</strong></br>
                                  Tekst: ${upit.tekst}</br>
                                  </p>`;
      upitiDiv.appendChild(div);
    });

 
    PoziviAjax.getKorisnik((error, korisnik) => {
      if (error) {
        console.error("Greška pri dobijanju korisničkih podataka:", error);
        return;
      }
    
      const zahtjeviDiv = document.getElementById("zahtjevi");
      zahtjeviDiv.innerHTML = ""; 
    
      let filtriraniZahtjevi = [];
    
      interesovanja.zahtjevi.forEach((zahtjev) => {
        if (!korisnik) {
          return;
        }
    
        if (!korisnik.admin && korisnik.id !== zahtjev.KorisnikId) {
          return;
        }
    
        filtriraniZahtjevi.push(zahtjev);
      });
      console.log(filtriraniZahtjevi);
      if (filtriraniZahtjevi.length === 0) {
        zahtjeviDiv.innerHTML = "<p>Nema zahtjeva za prikaz.</p>";
        return;
      }
    
      filtriraniZahtjevi.forEach((zahtjev, index) => {
        let div = document.createElement("div");
        div.classList.add("zahtjev");
        div.style.display = index === 0 ? "block" : "none"; 
        div.innerHTML = `
          <p><strong>ID: ${zahtjev.id}</strong></p>
          <p>Tekst: ${zahtjev.tekst}</p>
          <p>Datum: ${zahtjev.trazeniDatum}</p>
          <p>Status: ${zahtjev.odobren ? "Odobren" : "Neodobren"}</p>
        `;
        zahtjeviDiv.appendChild(div);
      });
    
      let indeksZahtjeva = 0;
      const sviZahtjevi = document.querySelectorAll("#zahtjevi .zahtjev");
    
      const prikaziZahtjev = (noviIndeks) => {
        sviZahtjevi[indeksZahtjeva].style.display = "none"; 
        sviZahtjevi[noviIndeks].style.display = "block"; 
        indeksZahtjeva = noviIndeks;
      };
    
      const lijevoDugme = document.getElementById("prevZahtjevi");
      const desnoDugme = document.getElementById("nextZahtjevi");
    
      lijevoDugme.addEventListener("click", () => {
        const noviIndeks = (indeksZahtjeva - 1 + sviZahtjevi.length) % sviZahtjevi.length;
        prikaziZahtjev(noviIndeks);
      });
    
      desnoDugme.addEventListener("click", () => {
        const noviIndeks = (indeksZahtjeva + 1) % sviZahtjevi.length;
        prikaziZahtjev(noviIndeks);
      });
    });
    
    interesovanja.ponude.forEach((ponuda) => {
      let div = document.createElement("div");
      div.classList.add("ponuda");
      div.innerHTML = `<p><strong>ID: ${ponuda.id}</strong></br>
                          Tekst: ${ponuda.tekst}</br>
                          Status: ${ponuda.odbijenaPonuda ? "Odbijena" : "Prihvaćena"}</p>`;
      ponudeDiv.appendChild(div);
    });

    const sviUpiti = Array.from(upitiDiv.querySelectorAll(".upit"));
    let indeks = 0;
    const carouselUpiti = postaviCarousel(upitiDiv, sviUpiti, indeks);

    let lijevoDugmeUpiti = document.getElementById("prevUpiti");
    lijevoDugmeUpiti.addEventListener("click", () => {
      let novi = (indeks - 1 + sviUpiti.length) % sviUpiti.length;
      carouselUpiti.fnLijevo();
      sviUpiti[indeks].id = "";
      sviUpiti[novi].id = "prikazujeSe";
      indeks = novi;
    });

    let desnoDugmeUpiti = document.getElementById("nextUpiti");
    desnoDugmeUpiti.addEventListener("click", () => {
      let novi = (indeks + 1) % sviUpiti.length;
      carouselUpiti.fnDesno();
      sviUpiti[indeks].id = "";
      sviUpiti[novi].id = "prikazujeSe";
      indeks = novi;
    });

  
    const sviPonude = Array.from(ponudeDiv.querySelectorAll(".ponuda"));
    let indeksPonude = 0;
    const carouselPonude = postaviCarousel(ponudeDiv, sviPonude, indeksPonude);

    let lijevoDugmePonude = document.getElementById("prevPonude");
    lijevoDugmePonude.addEventListener("click", () => {
      let novi = (indeksPonude - 1 + sviPonude.length) % sviPonude.length;
      carouselPonude.fnLijevo();
      sviPonude[indeksPonude].id = "";
      sviPonude[novi].id = "prikazujeSe";
      indeksPonude = novi;
    });

    let desnoDugmePonude = document.getElementById("nextPonude");
    desnoDugmePonude.addEventListener("click", () => {
      let novi = (indeksPonude + 1) % sviPonude.length;
      carouselPonude.fnDesno();
      sviPonude[indeksPonude].id = "";
      sviPonude[novi].id = "prikazujeSe";
      indeksPonude = novi;
    });
  });
}


const nekretninaId = getQueryParam("id");
document.addEventListener("DOMContentLoaded", () => {
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
});
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


function handleInterestTypeChange(event) {
  const tipInteresovanja = event.target.value;
  const dodatnaPoljaDiv = document.getElementById("dodatnaPolja");

  if (tipInteresovanja === "ponuda") {
    dodatnaPoljaDiv.innerHTML = `
      <label for="vezanaPonuda">ID vezane ponude:</label>
      <select id="vezanaPonuda" name="vezanaPonuda"></select>
      <label for="tekstPonude">Tekst ponude:</label>
      <textarea id="tekstPonude" name="tekstPonude" required></textarea>
     <label for="cijenaPonude">Cijena:</label>
      <input type="number" id="cijenaPonude" name="cijenaPonude" required></input>
        <label for="datumPonude">Datum:</label>
      <input type="date" id="datumPonude" name="datumPonude" required></input>
    `;
    loadUserOffers();
  } else if (  tipInteresovanja === "upit") {
    dodatnaPoljaDiv.innerHTML = `
      <label for="tekstUpita">Tekst:</label>
      <textarea id="tekstUpita" name="tekstUpita" required></textarea>
    `;
   } else if (tipInteresovanja === "zahtjev") {
    dodatnaPoljaDiv.innerHTML = `
      <label for="tekstZahtjeva">Tekst:</label>
      <textarea id="tekstZahtjeva" name="tekstZahtjeva" required></textarea>
       <label for="datumZahtjeva">Datum:</label>
      <input type="date" id="datumZahtjeva" name="datumZahtjeva" required></input>
    `;
     
    }
  }


function loadUserOffers() {
  PoziviAjax.getKorisnik((error, korisnik) => {
    if (error) {
      // console.error("Greška pri dobijanju korisničkih podataka:", error);
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

function loadUserDataAndProceed() {
  PoziviAjax.getKorisnik((error, korisnik) => {
    if (error) {
      // console.error("Greška pri dobijanju korisničkih podataka:", error);
      // alert("Došlo je do greške pri učitavanju korisničkih podataka.");
    } else {
      // console.log("Korisnik uspešno učitan:", korisnik);
      // handleUserOfferSelection(korisnik);
    }
  });
}

document.addEventListener("DOMContentLoaded", function() {
  const tipInteresovanjaSelect = document.getElementById("tipInteresovanja");
  if (tipInteresovanjaSelect) {
    tipInteresovanjaSelect.addEventListener("change", handleInterestTypeChange);
  }

  loadUserDataAndProceed();
  handleInterestTypeChange({ target: { value: "upit" } }); 
});


window.dodajInteresovanje = function dodajInteresovanje() {
  const tipInteresovanja = document.getElementById("tipInteresovanja").value;
  const nekretninaId = getQueryParam("id");
  const dodatnaPoljaDiv = document.getElementById("dodatnaPolja");
  const dodajBtn = document.getElementById("dodajInteresovanje");
  let dataUpit = {
    nekretnina_id: nekretninaId,
  };
  let dataZahtjev = {
    nekretninaId: nekretninaId,
  };
  let dataPonuda = {
    nekretninaId: nekretninaId,
  };
  if (tipInteresovanja === "upit") {
    dataUpit.tekst_upita = document.getElementById("tekstUpita").value;
    // console.log(dataUpit);
      PoziviAjax.dodajUpit(dataUpit, (error, response) => {
        if (error) {
          console.error("Greška pri dodavanju upita:", error);
          alert("Došlo je do greške pri slanju upita.");
        } else {
          alert("Upit uspješno poslan.");
        }
      });
  
   
  } else if (tipInteresovanja === "zahtjev") {
    dataZahtjev.tekst = document.getElementById("tekstZahtjeva").value;
    dataZahtjev.trazeniDatum = document.getElementById("datumZahtjeva").value;
    PoziviAjax.dodajZahtjev(nekretninaId, dataZahtjev, (error, response) => {
      if (error) {
        console.error("Greška pri dodavanju zahtjeva:", error);
        alert("Došlo je do greške pri slanju zahtjeva.");
      } else {
        alert("Zahtjev uspješno poslan.");
      }
    });
  } else if (tipInteresovanja === "ponuda") {
    dataPonuda.tekst = document.getElementById("tekstPonude").value;
    dataPonuda.ponudaCijene = parseFloat(document.getElementById("cijenaPonude").value);
    dataPonuda.datumPonude = document.getElementById("datumPonude").value;
    dataPonuda.parentPonudaId= document.getElementById("vezanaPonuda").value || null;

    PoziviAjax.dodajPonudu(nekretninaId, dataPonuda, (error, response) => {
      if (error) {
        console.error("Greška pri dodavanju ponude:", error);
        alert("Došlo je do greške pri slanju ponude.");
      } else {
        alert("Ponuda uspješno poslana.");
      }
    });
  }


}
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("dodajInteresovanje").onclick = dodajInteresovanje;
});