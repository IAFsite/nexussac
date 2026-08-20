/* =========================
   GENERATION DATA
========================= */

const NEXSAC_API =
    "https://api.db.indoadvfuture.com";


/* =========================
   FETCH GENERATIONS
========================= */

async function fetchGenerations() {

    const response =
        await fetch(
            `${NEXSAC_API}/generations`
        );


    if (!response.ok) {

        throw new Error(
            `Daftar angkatan gagal dimuat (HTTP ${response.status})`
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


/* =========================
   GENERATION URL
========================= */

function getGenerationURL(
    generationId
) {

    return `/angkatan/${encodeURIComponent(
        generationId
    )}`;

}


/* =========================
   GENERATION LINK
========================= */

function createGenerationLink(
    generationId
) {

    const link =
        document.createElement("a");


    link.href =
        getGenerationURL(
            generationId
        );


    return link;

}