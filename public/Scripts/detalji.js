document.addEventListener("DOMContentLoaded", () => {
    const sviUpiti = Array.from(document.querySelectorAll(".upit"));
    const prevDugme = document.getElementById("prevBtn");
    const nextDugme = document.getElementById("nextBtn");
    const glavniElement = document.getElementById("upiti");

    if (sviUpiti.length === 0 || !prevDugme || !nextDugme || !glavniElement) {
        console.error("Nema dovoljno podataka.");
        return;
    }

    let carousel = null;

    function inicijalizujCarousel() {
        // if (window.innerWidth <= 600) {
            if (!carousel) { 
                carousel = postaviCarousel(glavniElement, sviUpiti);
                if (carousel) {
                    prevDugme.addEventListener("click", carousel.fnLijevo);
                    nextDugme.addEventListener("click", carousel.fnDesno);
                } else {
                    console.error("Greška pri kreiranju carousel-a.");
                }
            }
        // } else {
        //     if (carousel) {
        //         prevDugme.removeEventListener("click", carousel.fnLijevo);
        //         nextDugme.removeEventListener("click", carousel.fnDesno);
        //         carousel = null;
        //     }
        //     glavniElement.innerHTML = sviUpiti.map(el => el.outerHTML).join(""); 
        // }
    }

    inicijalizujCarousel();

    window.addEventListener("resize", inicijalizujCarousel);
});
