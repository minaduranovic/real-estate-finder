let StatistikaNekretnina = function () {
  let spisak = SpisakNekretnina();

  let init = function (nekretnine, korisnici) {
    spisak.init(nekretnine, korisnici);
  };

  let prosjecnaKvadratura = function (kriterij) {
    let filtrirane = spisak.filtrirajNekretnine(kriterij);
    if (filtrirane.length === 0) return 0;
    let ukupnaKvadratura = filtrirane.reduce(
      (sum, nekretnina) => sum + nekretnina.kvadratura, 0
    );

    return ukupnaKvadratura / filtrirane.length;
  };

  let outlier = function (kriterij, nazivSvojstva) {
    let filtrirane = spisak.filtrirajNekretnine(kriterij);
    if (filtrirane.length === 0) return null;
    let prosjek =
      filtrirane.reduce(
        (sum, nekretnina) => sum + nekretnina[nazivSvojstva], 0
      ) / filtrirane.length;

    return filtrirane.reduce((maxOutlier, nekretnina) => {
      let odstupanje = Math.abs(nekretnina[nazivSvojstva] - prosjek);
      return !maxOutlier || odstupanje > maxOutlier.odstupanje
        ? { ...nekretnina, odstupanje }
        : maxOutlier;
    }, null);
  };

  let mojeNekretnine = function (korisnik) {
    return spisak.listaNekretnina
        .filter(nekretnina =>
            nekretnina.upiti.some(upit => upit.korisnik_id === korisnik.id)
        )
        .sort((a, b) =>
            b.upiti.filter(upit => upit.korisnik_id === korisnik.id).length -
            a.upiti.filter(upit => upit.korisnik_id === korisnik.id).length
        )
        // .map(({ upiti, ...nekretninaBezUpita }) => nekretninaBezUpita); 
};

function histogramCijena(periodi, rasponiCijena) {
  let rezultat = [];
  
  periodi.forEach((period, indeksPerioda) => {
      rasponiCijena.forEach((raspon, indeksRasporedaCijena) => {

          let brojNekretnina = listaNekretnina.filter(nekretnina => {
              let godinaObjave = parseInt(nekretnina.datum_objave.split('.')[2]);
              return (
                  godinaObjave >= period.od &&
                  godinaObjave <= period.do &&
                  nekretnina.cijena >= raspon.od &&
                  nekretnina.cijena <= raspon.do
              );
          }).length;

          rezultat.push({
              indeksPerioda,
              indeksRasporedaCijena,
              brojNekretnina:brojNekretnina
            });
      });
  });

  return rezultat;
}

  return {
    init: init,
    prosjecnaKvadratura: prosjecnaKvadratura,
    outlier: outlier,
    mojeNekretnine: mojeNekretnine,
    histogramCijena: histogramCijena,
  };
};
