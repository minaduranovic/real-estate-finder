function postaviCarousel(glavniElement, sviElementi, indeks = 0) {
    if (
        !glavniElement ||
        !Array.isArray(sviElementi) ||
        sviElementi.length === 0 ||
        indeks < 0 ||
        indeks >= sviElementi.length
    ) {
        return null;
    }

    glavniElement.innerHTML = sviElementi[indeks].outerHTML;
  
    function fnLijevo() {
        indeks = (indeks - 1 + sviElementi.length) % sviElementi.length; 
        glavniElement.innerHTML = sviElementi[indeks].outerHTML;
    }

    function fnDesno() {
        indeks = (indeks + 1) % sviElementi.length; 
        glavniElement.innerHTML = sviElementi[indeks].outerHTML;
    }

    return { fnLijevo, fnDesno };
}