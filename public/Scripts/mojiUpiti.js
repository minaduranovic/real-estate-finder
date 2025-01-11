document.addEventListener("DOMContentLoaded", () => {
    const upitiContainer = document.getElementById("upiti-container");

    function loadMojiUpiti() {
        PoziviAjax.getMojiUpiti((error, data) => {
            if (error) {
                console.error("Greška prilikom dohvaćanja upita:", error);
                upitiContainer.innerHTML = `<p>Došlo je do greške prilikom dohvaćanja vaših upita. Molimo pokušajte kasnije.</p>`;
                return;
            }
        
            try {
                if (typeof data === "string") {
                    data = JSON.parse(data); 
                }
            } catch (e) {
                console.error("Greška pri parsiranju JSON podataka:", e);
                upitiContainer.innerHTML = `<p>Neispravni podaci sa servera.</p>`;
                return;
            }
        
            if (!Array.isArray(data) || data.length === 0) {
                upitiContainer.innerHTML = `<p>Nemate nijedan upit.</p>`;
                return;
            }
        
            const list = document.createElement("ul");
            data.forEach(upit => {
                const listItem = document.createElement("li");
                listItem.innerHTML = `
                    <strong>Nekretnina ID:</strong> ${upit.id_nekretnine} <br>
                    <strong>Tekst upita:</strong> ${upit.tekst_upita}
                `;
                list.appendChild(listItem);
            });
        
            upitiContainer.appendChild(list);
        });
        
    }

    loadMojiUpiti();
});
