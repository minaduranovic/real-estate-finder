// function spojiNekretnine(divReferenca, instancaModula, tip_nekretnine) {
//     // pozivanje metode za filtriranje
//     const filtriraneNekretnine = instancaModula.filtrirajNekretnine({ tip_nekretnine: tip_nekretnine });
    
//     // iscrtavanje elemenata u divReferenca element

//     // Ciscenje svih elemenata liste
//     divReferenca.innerHTML = '';

//     if (filtriraneNekretnine.length === 0) {
//         divReferenca.innerHTML = '<p>Trenutno nema dostupnih nekretnina ovoga tipa.</p>';
//     } else {
//         filtriraneNekretnine.forEach(nekretnina => {
//             const nekretninaElement = document.createElement('div');
//             if(tip_nekretnine==="Stan"){
//                 nekretninaElement.classList.add('nekretnina');
//             }
//             else if(tip_nekretnine==="Kuća"){
//                 nekretninaElement.classList.add('nekretnina','kuca');
//             }
//             else{
//                 nekretninaElement.classList.add('nekretnina','pp');
//             }
            
//             const slikaElement = document.createElement('img');
//             slikaElement.classList.add('slika-nekretnine');
//             slikaElement.src = `../Resources/${nekretnina.id}.jpg`;
//             slikaElement.alt = nekretnina.naziv;
//             nekretninaElement.appendChild(slikaElement);

//             const detaljiElement = document.createElement('div');
//             detaljiElement.classList.add('detalji-nekretnine');
//             detaljiElement.innerHTML = `
//                 <h3>${nekretnina.naziv}</h3>
//                 <p>Kvadratura: ${nekretnina.kvadratura} m²</p>
//             `;
//             nekretninaElement.appendChild(detaljiElement);

//             const cijenaElement = document.createElement('div');
//             cijenaElement.classList.add('cijena-nekretnine');
//             cijenaElement.innerHTML = `<p>Cijena: ${nekretnina.cijena} BAM</p>`;
//             nekretninaElement.appendChild(cijenaElement);

//             const detaljiDugme = document.createElement('a');
//             detaljiDugme.href = '../HTML/detalji.html'; // hardkodiran html
//             detaljiDugme.classList.add('detalji-dugme');
//             detaljiDugme.textContent = 'Detalji';
//             nekretninaElement.appendChild(detaljiDugme);


//             // Dodavanje kreiranog elementa u divReferenci
//             divReferenca.appendChild(nekretninaElement);
//         });
//     }
// }


// const listaNekretnina = [{
//     id: 1,
//     tip_nekretnine: "Stan",
//     naziv: "Useljiv stan Sarajevo",
//     kvadratura: 58,
//     cijena: 232000,
//     tip_grijanja: "plin",
//     lokacija: "Novo Sarajevo",
//     godina_izgradnje: 2019,
//     datum_objave: "01.10.2023.",
//     opis: "Sociis natoque penatibus.",
//     upiti: [{
//         korisnik_id: 1,
//         tekst_upita: "Nullam eu pede mollis pretium."
//     },
//     {
//         korisnik_id: 2,
//         tekst_upita: "Phasellus viverra nulla."
//     }]
// },{
//     id: 1,
//     tip_nekretnine: "Stan",
//     naziv: "Useljiv stan Sarajevo",
//     kvadratura: 58,
//     cijena: 32000,
//     tip_grijanja: "plin",
//     lokacija: "Novo Sarajevo",
//     godina_izgradnje: 2019,
//     datum_objave: "01.10.2009.",
//     opis: "Sociis natoque penatibus.",
//     upiti: [{
//         korisnik_id: 1,
//         tekst_upita: "Nullam eu pede mollis pretium."
//     },
//     {
//         korisnik_id: 2,
//         tekst_upita: "Phasellus viverra nulla."
//     }]
// },{
//     id: 1,
//     tip_nekretnine: "Stan",
//     naziv: "Useljiv stan Sarajevo",
//     kvadratura: 58,
//     cijena: 232000,
//     tip_grijanja: "plin",
//     lokacija: "Novo Sarajevo",
//     godina_izgradnje: 2019,
//     datum_objave: "01.10.2003.",
//     opis: "Sociis natoque penatibus.",
//     upiti: [{
//         korisnik_id: 1,
//         tekst_upita: "Nullam eu pede mollis pretium."
//     },
//     {
//         korisnik_id: 2,
//         tekst_upita: "Phasellus viverra nulla."
//     }]
// },
// {
//     id: 2,
//     tip_nekretnine: "Kuća",
//     naziv: "Mali poslovni prostor",
//     kvadratura: 20,
//     cijena: 70000,
//     tip_grijanja: "struja",
//     lokacija: "Centar",
//     godina_izgradnje: 2005,
//     datum_objave: "20.08.2023.",
//     opis: "Magnis dis parturient montes.",
//     upiti: [{
//         korisnik_id: 2,
//         tekst_upita: "Integer tincidunt."
//     }
//     ]
// },
// {
//     id: 3,
//     tip_nekretnine: "Kuća",
//     naziv: "Mali poslovni prostor",
//     kvadratura: 20,
//     cijena: 70000,
//     tip_grijanja: "struja",
//     lokacija: "Centar",
//     godina_izgradnje: 2005,
//     datum_objave: "20.08.2023.",
//     opis: "Magnis dis parturient montes.",
//     upiti: [{
//         korisnik_id: 2,
//         tekst_upita: "Integer tincidunt."
//     }
//     ]
// },
// {
//     id: 4,
//     tip_nekretnine: "Kuća",
//     naziv: "Mali poslovni prostor",
//     kvadratura: 20,
//     cijena: 70000,
//     tip_grijanja: "struja",
//     lokacija: "Centar",
//     godina_izgradnje: 2005,
//     datum_objave: "20.08.2023.",
//     opis: "Magnis dis parturient montes.",
//     upiti: [{
//         korisnik_id: 2,
//         tekst_upita: "Integer tincidunt."
//     }
//     ]
// }]

// const listaKorisnika = [{
//     id: 1,
//     ime: "Neko",
//     prezime: "Nekic",
//     username: "username1",
// },
// {
//     id: 2,
//     ime: "Neko2",
//     prezime: "Nekic2",
//     username: "username2",
// }]

// const divStan = document.getElementById("stan");
// const divKuca = document.getElementById("kuca");
// const divPp = document.getElementById("pp");

// //instanciranje modula
// let nekretnine = SpisakNekretnina();
// nekretnine.init(listaNekretnina, listaKorisnika);

// //pozivanje funkcije
// spojiNekretnine(divStan, nekretnine, "Stan");
// spojiNekretnine(divKuca, nekretnine, "Kuća");
// spojiNekretnine(divPp, nekretnine, "Poslovni prostor");




function spojiNekretnine(divReferenca, instancaModula, tip_nekretnine) {
    // pozivanje metode za filtriranje
    const filtriraneNekretnine = instancaModula.filtrirajNekretnine({ tip_nekretnine: tip_nekretnine });

    // iscrtavanje elemenata u divReferenca element
    divReferenca.innerHTML = '';

    if (filtriraneNekretnine.length === 0) {
        divReferenca.innerHTML = '<p>Trenutno nema dostupnih nekretnina ovoga tipa.</p>';
    } else {
        filtriraneNekretnine.forEach(nekretnina => {
            const nekretninaElement = document.createElement('div');

            // Add class based on the property type
            if (tip_nekretnine === "Stan") {
                nekretninaElement.classList.add('nekretnina', 'stan');
            } else if (tip_nekretnine === "Kuća") {
                nekretninaElement.classList.add('nekretnina', 'kuca');
            } else {
                nekretninaElement.classList.add('nekretnina', 'pp');
            }

            // Add ID for easy referencing
            nekretninaElement.id = `${nekretnina.id}`;

            // Create image for the property
            const slikaElement = document.createElement('img');
            slikaElement.classList.add('slika-nekretnine');
            slikaElement.src = `../Resources/${nekretnina.id}.jpg`;
            slikaElement.alt = nekretnina.naziv;
            nekretninaElement.appendChild(slikaElement);

            // Add details of the property
            const detaljiElement = document.createElement('div');
            detaljiElement.classList.add('detalji-nekretnine');
            detaljiElement.innerHTML = `
                <h3>${nekretnina.naziv}</h3>
                <p>Kvadratura: ${nekretnina.kvadratura} m²</p>
            `;
            nekretninaElement.appendChild(detaljiElement);

            // Add price details
            const cijenaElement = document.createElement('div');
            cijenaElement.classList.add('cijena-nekretnine');
            cijenaElement.innerHTML = `<p>Cijena: ${nekretnina.cijena} BAM</p>`;
            nekretninaElement.appendChild(cijenaElement);

            // Create a details button to link to the details page
            const detaljiDugme = document.createElement('a');
            detaljiDugme.href = `detalji.html?id=${nekretnina.id}`;  // Link to the details page with the property ID
            detaljiDugme.classList.add('detalji-dugme');
            detaljiDugme.textContent = 'Detalji';
            nekretninaElement.appendChild(detaljiDugme);

            // Append the created property element to the parent div
            divReferenca.appendChild(nekretninaElement);
        });
    }
}

// Function to fetch the list of properties from the server
const listaNekretnina = [];

const listaKorisnika = [];

// Define the divs where properties will be displayed
const divStan = document.getElementById("stan");
const divKuca = document.getElementById("kuca");
const divPp = document.getElementById("pp");

// Instantiate the module for managing properties
let nekretnine = SpisakNekretnina();

// Fetch properties from the server and display them
PoziviAjax.getNekretnine((error, listaNekretnina) => {
    if (error) {
        console.error("Greška prilikom dohvatanja nekretnina sa servera:", error);
    } else {
        // Initialize the module with the fetched data
        nekretnine.init(listaNekretnina, listaKorisnika);

        // Display properties for each type (Stan, Kuća, Poslovni prostor)
        spojiNekretnine(divStan, nekretnine, "Stan");
        spojiNekretnine(divKuca, nekretnine, "Kuća");
        spojiNekretnine(divPp, nekretnine, "Poslovni prostor");
    }
});

// Function to filter properties based on type
function filtrirajNekretnine(filtriraneNekretnine) {
    const filtriraneNekretnineInstance = SpisakNekretnina();
    filtriraneNekretnineInstance.init(filtriraneNekretnine, listaKorisnika);

    spojiNekretnine(divStan, filtriraneNekretnineInstance, "Stan");
    spojiNekretnine(divKuca, filtriraneNekretnineInstance, "Kuća");
    spojiNekretnine(divPp, filtriraneNekretnineInstance, "Poslovni prostor");
}

// function filtrirajOnClick() {
//     const kriterij = {
//         min_cijena: parseFloat(document.getElementById('minCijena').value) || 0,
//         max_cijena: parseFloat(document.getElementById('maxCijena').value) || Infinity,
//         min_kvadratura: parseFloat(document.getElementById('minKvadratura').value) || 0,
//         max_kvadratura: parseFloat(document.getElementById('maxKvadratura').value) || Infinity
//     };

//     const filtriraneNekretnine = nekretnine.filtrirajNekretnine(kriterij);

//     MarketingAjax.novoFiltriranje(
//         filtriraneNekretnine.map(nekretnina => nekretnina.id)
//     );

//     filtrirajNekretnine(filtriraneNekretnine);
// }

// document.getElementById('dugmePretraga').addEventListener('click', filtrirajOnClick);

// setInterval(() => {
//     MarketingAjax.osvjeziPretrage(document.getElementById('divNekretnine'));
//     MarketingAjax.osvjeziKlikove(document.getElementById('divNekretnine'));
// }, 500);