/* =========================
   GENERATION DATA
========================= */

async function fetchGenerations() {

    const response =
        await fetch(
            "https://raw.githubusercontent.com/IAFsite/nexsac/main/angkatan.json"
        );


    if (!response.ok) {

        throw new Error(
            `angkatan.json gagal dimuat (${response.status})`
        );

    }


    const database =
        await response.json();


    const generations =
        Array.isArray(
            database.generations
        )
            ? database.generations
            : [];


    if (!generations.length) {

        throw new Error(
            "Tidak ada data angkatan."
        );

    }


    return generations;

}