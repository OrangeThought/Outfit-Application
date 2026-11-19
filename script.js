// ======================================================
// CONFIGURATION
// ======================================================

// ==========================================
// STOCKAGE LOCAL DES PHOTOS SUR IPHONE
// ==========================================

const DB_NAME = "OutfitAppDB";
const DB_VERSION = 1;

let db;
let photos = [];
let urlsPhotos = new Map();

function ouvrirBaseDonnees() {

    return new Promise((resolve, reject) => {

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = function(event) {

            const database = event.target.result;

            if (!database.objectStoreNames.contains("photos")) {

                database.createObjectStore("photos", {
                    keyPath: "nom"
                });

            }

        };

        request.onsuccess = function() {
            resolve(request.result);
        };

        request.onerror = function() {
            reject(request.error);
        };

    });

}


// ==========================================
// IMPORTER LES PHOTOS
// ==========================================

async function importerPhotos(fichiers) {

    const transaction = db.transaction(
        "photos",
        "readwrite"
    );

    const stockage = transaction.objectStore("photos");

    for (const fichier of fichiers) {

        if (!fichier.type.startsWith("image/")) {
            continue;
        }

        stockage.put({

            nom: fichier.name,

            image: fichier

        });

    }

    return new Promise((resolve, reject) => {

        transaction.oncomplete = resolve;

        transaction.onerror = () => {
            reject(transaction.error);
        };

    });

}

// ==========================================
// CHARGER LES PHOTOS DEPUIS L'IPHONE
// ==========================================

async function chargerPhotos() {

    const transaction = db.transaction(
        "photos",
        "readonly"
    );

    const stockage = transaction.objectStore("photos");

    const request = stockage.getAll();

    return new Promise((resolve, reject) => {

        request.onsuccess = function() {

            // Supprimer les anciennes URL temporaires

            urlsPhotos.forEach(url => {
                URL.revokeObjectURL(url);
            });

            urlsPhotos.clear();

            // Récupérer les noms des photos

            photos = request.result.map(photo => photo.nom);

            // Créer les URL locales

            request.result.forEach(photo => {

                const url = URL.createObjectURL(photo.image);

                urlsPhotos.set(photo.nom, url);

            });

            console.log("Photos locales :", photos);

            resolve();

        };

        request.onerror = function() {
            reject(request.error);
        };

    });

}


// ==========================================
// RECUPERER UNE PHOTO
// ==========================================

function obtenirPhoto(nomFichier) {

    return urlsPhotos.get(nomFichier) || "";

}

// Seuils de température
const SEUIL_FROID = 15;
const SEUIL_CHAUD = 24;


// ======================================================
// ELEMENTS HTML
// ======================================================

const navigationAssociations =
    document.getElementById("navigation-associations");

const boutonBasPrecedent =
    document.getElementById("bas-precedent");

const boutonBasSuivant =
    document.getElementById("bas-suivant");

const compteurAssociations =
    document.getElementById("compteur-associations");

const pageGalerie =
    document.getElementById("page-galerie");

const titreGalerie =
    document.getElementById("titre-galerie");

const galerieVetements =
    document.getElementById("galerie-vetements");

const boutonRetourGalerie =
    document.getElementById("retour-galerie");

const boutonParcourir = document.getElementById("parcourir");
const menuPrincipal = document.getElementById("menu-principal");
const pageTenue = document.getElementById("page-tenue");

const boutonTenueAleatoire =
    document.getElementById("tenue-aleatoire");

const boutonTemperatureFroid =
    document.getElementById("temperature-froid");

const boutonTemperatureIntermediaire =
    document.getElementById("temperature-intermediaire");

const boutonTemperatureChaud =
    document.getElementById("temperature-chaud");

const boutonRetour =
    document.getElementById("retour");

const imageHaut =
    document.getElementById("image-haut");

const imageBas =
    document.getElementById("image-bas");

const nomHaut =
    document.getElementById("nom-haut");

const nomBas =
    document.getElementById("nom-bas");

const tenueHautBas =
    document.getElementById("tenue-haut-bas");

const tenueAutre =
    document.getElementById("tenue-autre");

const imageAutre =
    document.getElementById("image-autre");

const nomAutre =
    document.getElementById("nom-autre");

const titreAutre =
    document.getElementById("titre-autre");

const meteoTenue =
    document.getElementById("meteo-tenue");

// ======================================================
// CATEGORIES
// ======================================================

// Correspond exactement à ton script Python.

const CATEGORIES = {

    bas: {
        "00": "Pantalon",
        "01": "Jean",
        "02": "Pantalon léger",
        "03": "Short",
        "04": "Jupe"
    },

    haut: {
        "00": "T-shirt",
        "01": "Débardeur",
        "02": "Chemise",
        "03": "Pull",
        "04": "Sweet",
        "05": "Veste",
        "06": "Marcel",
        "07": "Gilet"
    },

    autre: {
        "00": "Combi",
        "01": "Robe été",
        "02": "Robe hiver",
        "03": "Combi-short"
    }
};

// ======================================================
// NAVIGATION PARCOURIR MES VETEMENTS
// ======================================================

// Pages
const pageParcourir =
    document.getElementById("page-parcourir");

const pageCategories =
    document.getElementById("page-categories");

// Boutons retour
const boutonRetourParcourir =
    document.getElementById("retour-parcourir");

const boutonRetourCategories =
    document.getElementById("retour-categories");

// Conteneur des catégories
const listeCategories =
    document.getElementById("liste-categories");

const titreCategories =
    document.getElementById("titre-categories");


// =================================
// OUVRIR LA PAGE PARCOURIR
// =================================

boutonParcourir.addEventListener("click", function () {

    menuPrincipal.style.display = "none";

    pageParcourir.style.display = "flex";

});


// =================================
// REVENIR AU MENU PRINCIPAL
// =================================

boutonRetourParcourir.addEventListener("click", function () {

    pageParcourir.style.display = "none";

    menuPrincipal.style.display = "flex";

});


// =================================
// AFFICHER LES CATEGORIES
// =================================

document.querySelectorAll(".bouton-navigation").forEach(bouton => {

    bouton.addEventListener("click", function () {

        const type = this.dataset.type;

        // Masquer la page précédente
        pageParcourir.style.display = "none";

        // Afficher la page des catégories
        pageCategories.style.display = "flex";

        // Modifier le titre
        titreCategories.textContent =
            "Catégories : " + type;

        // Vider les anciennes catégories
        listeCategories.innerHTML = "";

        // Récupérer les catégories correspondantes
        const categories = CATEGORIES[type];

        // Créer un bouton pour chaque catégorie
        Object.entries(categories).forEach(([code, nom]) => {

            const bouton = document.createElement("button");

            bouton.className = "bouton-categorie";

            bouton.textContent = nom;

            bouton.dataset.code = code;

            bouton.dataset.type = type;

            // Ouvrir la galerie au clic
            bouton.addEventListener("click", function () {

                afficherGalerie(type, code, nom);

            });

            listeCategories.appendChild(bouton);

        });

    });

});

// =================================
// REVENIR A PARCOURIR MES VETEMENTS
// =================================

boutonRetourCategories.addEventListener("click", function () {

    pageCategories.style.display = "none";

    pageParcourir.style.display = "flex";

});

// ======================================================
// CATEGORIES SELON LA TEMPERATURE
// ======================================================

// Ces listes sont faciles à modifier.
//
// Le code correspond aux deux derniers chiffres
// du nom du fichier.
//
// Exemple :
// 0010010.jpg
//
// 001 = numéro
// 0   = propriétaire
// 1   = haut
// 00  = T-shirt


const VETEMENTS_FROIDS = {

    hauts: [
        "03", // Pull
        "04", // Sweet
        "05", // Veste
        "07"  // Gilet
    ],

    bas: [
        "00", // Pantalon
        "01"  // Jean
    ],

    autres: [
        "00", // combi
        "02" // robe d'hivers
    ]
};


const VETEMENTS_INTERMEDIAIRES = {

    hauts: [
        "00", // T-shirt
        "02", // Chemise
        "03", // Pull
        "04", // Sweet
        "05", // Veste
        "07"  // Gilet
    ],

    bas: [
        "00", // Pantalon
        "01", // Jean
        "02", // Pantalon léger
        "04"  // Jupe
    ],

    autres: [
        "00", // combi
        "02" // robe d'hivers
    ]
};


const VETEMENTS_CHAUDS = {

    hauts: [
        "00", // T-shirt
        "01", // Débardeur
        "02", // Chemise
        "06"  // Marcel
    ],

    bas: [
        "02", // Pantalon léger
        "03", // Short
        "04"  // Jupe
    ],

    autres: [
        "00", // combi
        "01",  // robe d'été
        "03"  // combi-short
    ]
};


// ======================================================
// LISTE DES PHOTOS
// ======================================================

// Le navigateur ne peut pas directement faire
// os.listdir() comme Python.
//
// On utilise donc un fichier JSON qui contient
// la liste des photos.
//
// Ce fichier sera expliqué plus bas.

// Vêtements compatibles affichés dans la galerie
let vetementsCompatibles = [];

let indexVetementCompatible = 0;

// Permet de savoir où le bouton Retour doit revenir
let retourVersGalerie = false;

// ======================================================
// ANALYSE DU NOM D'UNE PHOTO
// ======================================================

function analyserPhoto(nomFichier) {

    const nom =
        nomFichier
            .split("/")
            .pop()
            .split(".")[0];


    // ------------------------------------------
    // VERIFICATION DU NOM
    // ------------------------------------------

    if (nom.length < 7) {
        return null;
    }

    const prefixe = nom.substring(0, 7);

    if (!/^\d{7}$/.test(prefixe)) {
        return null;
    }


    // ------------------------------------------
    // INFORMATIONS DU VETEMENT
    // ------------------------------------------

    const numero =
        prefixe.substring(0, 3);

    const proprietaire =
        prefixe.substring(3, 4);

    const type =
        prefixe.substring(4, 5);

    const categorie =
        prefixe.substring(5, 7);


    // Pour l'instant : Romane uniquement
    if (proprietaire !== "0") {
        return null;
    }


    let typeNom;

    if (type === "0") {
        typeNom = "bas";
    }

    else if (type === "1") {
        typeNom = "haut";
    }

    else {
        typeNom = "autre";
    }


    // ------------------------------------------
    // LECTURE DES MATCHS
    // ------------------------------------------

    const hautsAssocies = [];

    // Tout ce qui vient après les 7 premiers chiffres
    const suite = nom.substring(7);


    if (
        typeNom === "bas" &&
        suite.length >= 3 &&
        /^\d+$/.test(suite)
    ) {

        // Les 3 premiers chiffres = nombre de matchs
        const nombreMatchs =
            parseInt(
                suite.substring(0, 3),
                10
            );


        // Les numéros commencent après le compteur
        const numeros =
            suite.substring(3);


        // On lit exactement nombreMatchs numéros
        for (
            let i = 0;
            i < nombreMatchs;
            i++
        ) {

            const numeroHaut =
                numeros.substring(
                    i * 3,
                    i * 3 + 3
                );


            if (
                numeroHaut.length === 3 &&
                /^\d{3}$/.test(numeroHaut)
            ) {

                hautsAssocies.push(
                    numeroHaut
                );
            }
        }
    }


    return {

        fichier: nomFichier,

        numero: numero,

        type: typeNom,

        categorie: categorie,

        hautsAssocies: hautsAssocies
    };
}

function afficherSelectionGalerie(vetementSelectionne) {

    const vetements = photos
        .map(analyserPhoto)
        .filter(vetement => vetement !== null);

    // On vient de sélectionner un vêtement dans la galerie
    pageGalerie.style.display = "none";

    retourVersGalerie = true;

    // --------------------------------------
    // CAS 1 : UN HAUT EST SÉLECTIONNÉ
    // --------------------------------------

    if (vetementSelectionne.type === "haut") {

        vetementsCompatibles = vetements.filter(vetement =>
            vetement.type === "bas"
            &&
            vetement.hautsAssocies.includes(
                vetementSelectionne.numero
            )
        );

        if (vetementsCompatibles.length === 0) {

            alert("Aucun bas compatible n'a été trouvé.");

            pageGalerie.style.display = "flex";
            return;
        }

        indexVetementCompatible = 0;

        afficherTenue({
            typeTenue: "haut-bas",
            haut: vetementSelectionne,
            bas: vetementsCompatibles[0]
        }, null);
    }

    // --------------------------------------
    // CAS 2 : UN BAS EST SÉLECTIONNÉ
    // --------------------------------------

    else if (vetementSelectionne.type === "bas") {

        vetementsCompatibles = vetements.filter(vetement =>
            vetement.type === "haut"
            &&
            vetementSelectionne.hautsAssocies.includes(
                vetement.numero
            )
        );

        if (vetementsCompatibles.length === 0) {

            alert("Aucun haut compatible n'a été trouvé.");

            pageGalerie.style.display = "flex";
            return;
        }

        indexVetementCompatible = 0;

        afficherTenue({
            typeTenue: "haut-bas",
            haut: vetementsCompatibles[0],
            bas: vetementSelectionne
        }, null);
    }

    // --------------------------------------
    // CAS 3 : UNE TENUE AUTRE EST SÉLECTIONNÉE
    // --------------------------------------

    else {

        vetementsCompatibles = [];

        indexVetementCompatible = 0;

        afficherTenue({
            typeTenue: "autre",
            autre: vetementSelectionne
        }, null);
    }

    mettreAJourNavigationAssociations();
}

function mettreAJourNavigationAssociations() {

    if (vetementsCompatibles.length <= 1) {

        navigationAssociations.style.display = "none";
        return;
    }

    navigationAssociations.style.display = "flex";

    compteurAssociations.textContent =
        (indexVetementCompatible + 1)
        + " / "
        + vetementsCompatibles.length;
}

boutonBasPrecedent.addEventListener("click", function () {

    if (vetementsCompatibles.length <= 1) return;

    indexVetementCompatible--;

    if (indexVetementCompatible < 0) {
        indexVetementCompatible = vetementsCompatibles.length - 1;
    }

    afficherVetementCompatible();
});

boutonBasSuivant.addEventListener("click", function () {

    if (vetementsCompatibles.length <= 1) return;

    indexVetementCompatible++;

    if (indexVetementCompatible >= vetementsCompatibles.length) {
        indexVetementCompatible = 0;
    }

    afficherVetementCompatible();
});

function afficherVetementCompatible() {

    const vetement = vetementsCompatibles[indexVetementCompatible];

    // Si le vêtement de départ était un haut,
    // on conserve ce haut et on change le bas.

    if (vetement.type === "bas") {

        const hautActuel = analyserPhoto(
            retrouverNomPhoto(imageHaut.src)
        );

        afficherTenue({
            typeTenue: "haut-bas",
            haut: hautActuel,
            bas: vetement
        }, null);
    }

    // Si le vêtement de départ était un bas,
    // on conserve ce bas et on change le haut.

    else if (vetement.type === "haut") {

        const basActuel = analyserPhoto(
            retrouverNomPhoto(imageBas.src)
        );

        afficherTenue({
            typeTenue: "haut-bas",
            haut: vetement,
            bas: basActuel
        }, null);
    }

    mettreAJourNavigationAssociations();
}

// ======================================================
// AFFICHER LA GALERIE D'UNE CATEGORIE
// ======================================================

function afficherGalerie(type, categorie, nomCategorie) {

    // Masquer la page des catégories
    pageCategories.style.display = "none";

    // Afficher la galerie
    pageGalerie.style.display = "flex";

    // Modifier le titre
    titreGalerie.textContent = nomCategorie;

    // Vider la galerie précédente
    galerieVetements.innerHTML = "";

    // Analyser toutes les photos
    const vetementsTrouves = photos
        .map(analyserPhoto)
        .filter(vetement =>
            vetement !== null &&
            vetement.type === type &&
            vetement.categorie === categorie
        );

    // Vérifier si des vêtements existent
    if (vetementsTrouves.length === 0) {

        galerieVetements.textContent =
            "Aucun vêtement dans cette catégorie.";

        return;
    }

    // Ajouter les photos à la galerie
    vetementsTrouves.forEach(vetement => {

        const image = document.createElement("img");

        image.src = obtenirPhoto(vetement.fichier);
        image.alt = nomCategorie;
        image.className = "image-galerie";
        image.loading = "lazy";

        // La photo devient cliquable
        image.addEventListener("click", function () {

            afficherSelectionGalerie(vetement);

        });

        galerieVetements.appendChild(image);
    });

}

// ======================================================
// CHOIX DE LA TENUE SELON LA TEMPERATURE
// ======================================================

function choisirRegimeTemperature(temperature) {

    if (temperature <= SEUIL_FROID) {

        return VETEMENTS_FROIDS;
    }


    if (temperature >= SEUIL_CHAUD) {

        return VETEMENTS_CHAUDS;
    }


    return VETEMENTS_INTERMEDIAIRES;
}


// ======================================================
// CHOISIR UNE PHOTO AU HASARD
// ======================================================

function choisirAleatoire(tableau) {

    if (tableau.length === 0) {
        return null;
    }


    const index =
        Math.floor(
            Math.random() * tableau.length
        );


    return tableau[index];
}


// ======================================================
// GENERATION DE LA TENUE
// ======================================================

function genererTenue(temperature) {

    const regime =
        choisirRegimeTemperature(
            temperature
        );

    const vetements =
        photos
            .map(analyserPhoto)
            .filter(photo => photo !== null);


    // =========================
    // TENUE "AUTRE"
    // =========================

    const autresDisponibles =
        vetements.filter(
            vetement =>
                vetement.type === "autre"
                &&
                regime.autres.includes(
                    vetement.categorie
                )
        );

    // 30 % de chances de choisir
    // une tenue "autre"
    if (
        autresDisponibles.length > 0
        &&
        Math.random() < 0.30
    ) {

        const autre =
            choisirAleatoire(
                autresDisponibles
            );

        return {
            typeTenue: "autre",
            autre: autre
        };
    }


    // =========================
    // TENUE HAUT + BAS
    // =========================

    const basDisponibles =
        vetements.filter(
            vetement =>
                vetement.type === "bas"
                &&
                regime.bas.includes(
                    vetement.categorie
                )
        );

    if (basDisponibles.length === 0) {
        throw new Error(
            "Aucun bas compatible avec cette température."
        );
    }

    const basMelanges =
        [...basDisponibles]
            .sort(
                () => Math.random() - 0.5
            );

    for (const bas of basMelanges) {

        const hautsAssocies =
            vetements.filter(
                vetement =>
                    vetement.type === "haut"
                    &&
                    regime.hauts.includes(
                        vetement.categorie
                    )
                    &&
                    bas.hautsAssocies.includes(
                        vetement.numero
                    )
            );

        if (hautsAssocies.length > 0) {

            const haut =
                choisirAleatoire(
                    hautsAssocies
                );

            return {
                typeTenue: "haut-bas",
                haut: haut,
                bas: bas
            };
        }
    }

    throw new Error(
        "Aucune tenue possible pour cette température."
    );
}


// ======================================================
// AFFICHER LA TENUE
// ======================================================

function afficherTenue(tenue, temperature) {

    // ------------------------------------------
    // TENUE AUTRE : COMBI / ROBE / COMBI-SHORT
    // ------------------------------------------

    if (tenue.typeTenue === "autre") {

        const autre = tenue.autre;

        // Cacher le haut + bas
        tenueHautBas.style.display = "none";

        // Afficher la tenue autre
        tenueAutre.style.display = "flex";


        // Image
        imageAutre.src =
            obtenirPhoto(autre.fichier);


        // Nom
        nomAutre.textContent =
            CATEGORIES.autre[autre.categorie]
            || "Tenue";


        // Titre
        titreAutre.textContent =
            CATEGORIES.autre[autre.categorie]
            || "Tenue";
    }


    // ------------------------------------------
    // TENUE HAUT + BAS
    // ------------------------------------------

    else {

        const haut = tenue.haut;
        const bas = tenue.bas;

        // Afficher haut + bas
        tenueHautBas.style.display = "flex";

        // Cacher la tenue autre
        tenueAutre.style.display = "none";


        // Images
        imageHaut.src =
            obtenirPhoto(haut.fichier);

        imageBas.src =
            obtenirPhoto(bas.fichier);


        // Noms (uniquement si les éléments existent)
        if (nomHaut) {
            nomHaut.textContent =
                CATEGORIES.haut[haut.categorie] || "Haut";
        }

        if (nomBas) {
            nomBas.textContent =
                CATEGORIES.bas[bas.categorie] || "Bas";
        }
    }


    // ------------------------------------------
    // TEMPERATURE CHOISIE
    // ------------------------------------------

    if (temperature !== null && temperature !== undefined) {

        if (temperature <= SEUIL_FROID) {

            meteoTenue.textContent =
                "👕 Tenue adaptée à 0 à 15 °C";

        }

        else if (temperature < SEUIL_CHAUD) {

            meteoTenue.textContent =
                "👕 Tenue adaptée à 15 à 24 °C";

        }

        else {

            meteoTenue.textContent =
                "👕 Tenue adaptée à 24 °C et +";
        }

    } else {

        meteoTenue.textContent = "";
    }


    // ------------------------------------------
    // AFFICHAGE DE LA PAGE
    // ------------------------------------------

    menuPrincipal.style.display =
        "none";

    pageTenue.style.display =
        "flex";
}


// ======================================================
// BOUTON TENUE ALEATOIRE
// ======================================================

boutonTenueAleatoire.addEventListener(
    "click",
    function () {

        retourVersGalerie = false;

        menuPrincipal.style.display =
            "none";


        pageTenue.style.display =
            "flex";


        meteoTenue.textContent =
            "Choisis une température";
    }
);


// ======================================================
// BOUTONS TEMPERATURE
// ======================================================

boutonTemperatureFroid.addEventListener(
    "click",
    function () {

        const tenue =
            genererTenue(10);


        afficherTenue(
            tenue,
            10
        );
    }
);


boutonTemperatureIntermediaire.addEventListener(
    "click",
    function () {

        const tenue =
            genererTenue(20);


        afficherTenue(
            tenue,
            20
        );
    }
);


boutonTemperatureChaud.addEventListener(
    "click",
    function () {

        const tenue =
            genererTenue(25);


        afficherTenue(
            tenue,
            25
        );
    }
);


// ======================================================
// BOUTON RETOUR
// ======================================================

boutonRetour.addEventListener("click", function () {

    pageTenue.style.display = "none";

    navigationAssociations.style.display = "none";

    vetementsCompatibles = [];

    indexVetementCompatible = 0;

    if (retourVersGalerie) {

        pageGalerie.style.display = "flex";

    } else {

        menuPrincipal.style.display = "flex";
    }

});

// ======================================================
// RETOUR DEPUIS LA GALERIE
// ======================================================

boutonRetourGalerie.addEventListener("click", function () {

    // Masquer la galerie
    pageGalerie.style.display = "none";

    // Réafficher les catégories
    pageCategories.style.display = "flex";

});

// ==========================================
// INITIALISATION DE L'APPLICATION
// ==========================================

animerTitre();

const boutonImporter =
    document.getElementById("importer-photos");

const fichiersPhotos =
    document.getElementById("fichiers-photos");

const statutPhotos =
    document.getElementById("statut-photos");

boutonImporter.addEventListener("click", function() {

    fichiersPhotos.click();

});


fichiersPhotos.addEventListener("change", async function() {

    try {

        statutPhotos.textContent = "Importation en cours...";

        await importerPhotos(fichiersPhotos.files);

        await chargerPhotos();

        statutPhotos.textContent =
            photos.length + " vêtements enregistrés sur cet iPhone.";

        fichiersPhotos.value = "";

    } catch (erreur) {

        console.error(erreur);

        statutPhotos.textContent =
            "Erreur pendant l'importation.";

    }

});

// ==========================================
// DEMARRAGE
// ==========================================

async function initialiserApplication() {

    try {

        db = await ouvrirBaseDonnees();

        await chargerPhotos();

        statutPhotos.textContent =
            photos.length + " vêtements enregistrés sur cet iPhone.";

    } catch (erreur) {

        console.error(erreur);

        alert("Impossible d'ouvrir le stockage des photos.");

    }

}

initialiserApplication();

function retrouverNomPhoto(url) {

    for (const [nom, urlLocale] of urlsPhotos) {

        if (urlLocale === url) {
            return nom;
        }

    }

    return "";

}

// ==========================================
// GESTION ET SUPPRESSION DES PHOTOS
// ==========================================

const boutonGererPhotos =
    document.getElementById("gerer-photos");

const pageGestionPhotos =
    document.getElementById("page-gestion-photos");

const boutonRetourGestionPhotos =
    document.getElementById("retour-gestion-photos");

const listePhotosEnregistrees =
    document.getElementById("liste-photos-enregistrees");


// OUVRIR LA PAGE

boutonGererPhotos.addEventListener("click", function() {

    menuPrincipal.style.display = "none";

    pageGestionPhotos.style.display = "flex";

    afficherPhotosEnregistrees();

});


// RETOUR AU MENU

boutonRetourGestionPhotos.addEventListener("click", function() {

    pageGestionPhotos.style.display = "none";

    menuPrincipal.style.display = "flex";

});


// AFFICHER LES PHOTOS

function afficherPhotosEnregistrees() {

    listePhotosEnregistrees.innerHTML = "";

    photos.forEach(nomPhoto => {

        const bloc = document.createElement("div");

        bloc.style.display = "flex";
        bloc.style.alignItems = "center";
        bloc.style.gap = "10px";
        bloc.style.marginBottom = "15px";

        const image = document.createElement("img");

        image.src = obtenirPhoto(nomPhoto);
        image.style.width = "100px";
        image.style.height = "100px";
        image.style.objectFit = "contain";

        const nom = document.createElement("span");

        nom.textContent = nomPhoto;

        const boutonSupprimer = document.createElement("button");

        boutonSupprimer.textContent = "Supprimer";

        boutonSupprimer.addEventListener("click", async function() {

            const confirmation = confirm(
                "Supprimer définitivement cette photo de l'application ?"
            );

            if (!confirmation) return;

            await supprimerPhoto(nomPhoto);

            afficherPhotosEnregistrees();

            statutPhotos.textContent =
                photos.length + " vêtements enregistrés sur cet iPhone.";

        });

        bloc.appendChild(image);
        bloc.appendChild(nom);
        bloc.appendChild(boutonSupprimer);

        listePhotosEnregistrees.appendChild(bloc);

    });

}


// SUPPRIMER UNE PHOTO DU STOCKAGE

async function supprimerPhoto(nomPhoto) {

    return new Promise((resolve, reject) => {

        const transaction = db.transaction(
            "photos",
            "readwrite"
        );

        const stockage = transaction.objectStore("photos");

        stockage.delete(nomPhoto);

        transaction.oncomplete = async function() {

            const url = urlsPhotos.get(nomPhoto);

            if (url) {
                URL.revokeObjectURL(url);
                urlsPhotos.delete(nomPhoto);
            }

            await chargerPhotos();

            resolve();

        };

        transaction.onerror = function() {

            reject(transaction.error);

        };

    });

}

function animerTitre() {
    const titre = document.getElementById("main-title");
    if (!titre) return;

    const texte = "Bonjour, que souhaites-tu porter aujourd'hui ? 🤔";
    titre.innerHTML = "";
    titre.style.fontSize = "22px";
    titre.style.fontWeight = "bold";

    let index = 0;

    const intervalle = setInterval(() => {
        titre.textContent += texte[index];
        index++;

        if (index >= texte.length) {
            clearInterval(intervalle);
        }
    }, 60);
}