/* =========================
   NEXUS SAC DATA API
========================= */

const NEXSAC_BASE =
    "https://raw.githubusercontent.com/IAFsite/nexsac/main/data";


/* =========================
   FETCH GENERATIONS
========================= */

async function fetchGenerations() {

    const response =
        await fetch(
            `${NEXSAC_BASE}/angkatan.json`
        );


    if (!response.ok) {

        throw new Error(
            `Daftar angkatan tidak dapat dimuat (HTTP ${response.status}).`
        );

    }


    const database =
        await response.json();


    return Array.isArray(
        database.generations
    )
        ? database.generations
        : [];

}


/* =========================
   FETCH GENERATION DATA
========================= */

async function fetchGenerationData(
    generationId
) {

    if (!generationId) {

        throw new Error(
            "ID angkatan tidak ditemukan."
        );

    }


    const response =
        await fetch(
            `${NEXSAC_BASE}/${encodeURIComponent(
                generationId
            )}.json`
        );


    if (!response.ok) {

        throw new Error(
            `Data angkatan ${generationId} tidak dapat dimuat (HTTP ${response.status}).`
        );

    }


    return await response.json();

}