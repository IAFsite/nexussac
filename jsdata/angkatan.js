/* =========================
   NEXUS SAC DATA API
========================= */

const NEXSAC_API =
    "https://api.db.indoadvfuture.com";


/* =========================
   GET GENERATION ID FROM URL
========================= */

function getGenerationIdFromURL() {

    const path =
        window.location.pathname;


    /*
     * URL baru:
     *
     * /angkatan/09
     */

    const match =
        path.match(
            /\/angkatan\/([^/]+)/
        );


    if (match) {

        return decodeURIComponent(
            match[1]
        );

    }


    /*
     * Fallback URL lama:
     *
     * /angkatan.html?id=09
     */

    const params =
        new URLSearchParams(
            window.location.search
        );


    return params.get("id");

}


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
            `${NEXSAC_API}/students?generation=${encodeURIComponent(
                generationId
            )}`
        );


    if (!response.ok) {

        throw new Error(
            `Data angkatan ${generationId} tidak dapat dimuat (HTTP ${response.status}).`
        );

    }


    const database =
        await response.json();


    const students =
        Array.isArray(
            database.students
        )
            ? database.students
            : [];


    /*
     * Ambil metadata generation dari API.
     *
     * Ini membuat format response tetap
     * kompatibel dengan JSON lama.
     */

    const generations =
        await fetchGenerations();


    const generation =
        generations.find(
            item =>
                String(item.id) ===
                String(generationId)
        );


    return {

        generation:
            generation || {

                id:
                    String(generationId),

                name:
                    `ANGKATAN ${generationId}`,

                description:
                    `Daftar murid angkatan ${generationId} Sekolah Alam Cikeas.`

            },

        students

    };

}


/* =========================
   FETCH SINGLE STUDENT
========================= */

async function fetchStudent(
    studentId
) {

    if (!studentId) {

        throw new Error(
            "ID siswa tidak ditemukan."
        );

    }


    const response =
        await fetch(
            `${NEXSAC_API}/students/${encodeURIComponent(
                studentId
            )}`
        );


    if (!response.ok) {

        throw new Error(
            `Data siswa tidak dapat dimuat (HTTP ${response.status}).`
        );

    }


    return await response.json();

}


/* =========================
   CURRENT GENERATION
========================= */

const generationId =
    getGenerationIdFromURL();


/*
 * Contoh:
 *
 * /angkatan/09
 *
 * generationId = "09"
 *
 *
 * Fallback:
 *
 * /angkatan.html?id=09
 *
 * generationId = "09"
 */


/* =========================
   OPTIONAL EXPORT
========================= */

window.NEXSAC = {

    fetchGenerations,

    fetchGenerationData,

    fetchStudent,

    getGenerationIdFromURL

};