const DB_NAME = "MaGardeRobe";
const DB_VERSION = 1;
const STORE_NAME = "photos";

let db;

// --------------------------------------------------
// OUVERTURE DE LA BASE
// --------------------------------------------------

const request = indexedDB.open(DB_NAME, DB_VERSION);

request.onupgradeneeded = function (event) {
    db = event.target.result;

    if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
            keyPath: "id",
            autoIncrement: true
        });
    }
};

request.onsuccess = function (event) {
    db = event.target.result;

    afficherPhotos();
};

request.onerror = function () {
    console.error("Impossible d'ouvrir IndexedDB");
};


// --------------------------------------------------
// BOUTON IMPORTATION
// --------------------------------------------------

const bouton = document.getElementById("importButton");
const input = document.getElementById("photoInput");

bouton.addEventListener("click", function () {
    input.click();
});


// --------------------------------------------------
// IMPORT DES PHOTOS
// --------------------------------------------------

input.addEventListener("change", function () {

    const fichiers = input.files;

    if (!fichiers.length) {
        return;
    }

    const transaction = db.transaction(
        STORE_NAME,
        "readwrite"
    );

    const store = transaction.objectStore(STORE_NAME);

    for (const fichier of fichiers) {

        store.add({
            nom: fichier.name,
            photo: fichier,
            date: Date.now()
        });
    }

    transaction.oncomplete = function () {

        input.value = "";

        afficherPhotos();
    };
});


// --------------------------------------------------
// AFFICHER LES PHOTOS
// --------------------------------------------------

function afficherPhotos() {

    const gallery = document.getElementById("gallery");
    const count = document.getElementById("count");

    if (!db) {
        return;
    }

    gallery.innerHTML = "";

    const transaction = db.transaction(
        STORE_NAME,
        "readonly"
    );

    const store = transaction.objectStore(STORE_NAME);

    const request = store.getAll();

    request.onsuccess = function () {

        const photos = request.result;

        count.textContent =
            photos.length +
            " photo(s) enregistrée(s)";

        for (const element of photos) {

            const image = document.createElement("img");

            image.src = URL.createObjectURL(
                element.photo
            );

            image.title = element.nom;

            gallery.appendChild(image);
        }
    };
}