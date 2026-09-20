const bouton = document.getElementById("importButton");
const input = document.getElementById("photoInput");
const gallery = document.getElementById("gallery");
const count = document.getElementById("count");

bouton.addEventListener("click", function () {
    input.click();
});

input.addEventListener("change", function () {

    const photos = input.files;

    gallery.innerHTML = "";

    if (photos.length === 0) {
        count.textContent = "Aucune photo importée";
        return;
    }

    count.textContent = photos.length + " photo(s) sélectionnée(s)";

    for (const photo of photos) {

        const image = document.createElement("img");

        image.src = URL.createObjectURL(photo);

        gallery.appendChild(image);
    }
});