/* =========================
   NEXUS SAC DATA API
========================= */

const NEXSAC_BASE =
    "https://raw.githubusercontent.com/IAFsite/nexsac/main/data";


const NEXSAC_PROFILE_BASE =
    "https://raw.githubusercontent.com/IAFsite/nexsac/main/media/profile-picture";


/* =========================
   FETCH GENERATION
========================= */

async function fetchGeneration(
    generationId
) {

    if (!generationId) {

        throw new Error(
            "Kode angkatan tidak ditemukan."
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
            `Data angkatan ${generationId} gagal dimuat (HTTP ${response.status})`
        );

    }


    return await response.json();

}


/* =========================
   PROFILE PHOTO URL
========================= */

function getProfilePhotoURL(
    generationId,
    photo
) {

    const value =
        String(
            photo || ""
        ).trim();


    /* =========================
       NO PHOTO
    ========================= */

    if (!value) {

        return "";

    }


    /* =========================
       ABSOLUTE URL
    ========================= */

    if (
        value.startsWith("http://") ||
        value.startsWith("https://") ||
        value.startsWith("//")
    ) {

        return value;

    }


    /* =========================
       GET FILE NAME
    ========================= */

    const cleanPath =
        value
            .split("?")[0]
            .split("#")[0];


    const fileName =
        cleanPath
            .split("/")
            .filter(Boolean)
            .pop();


    if (!fileName) {

        return "";

    }


    /* =========================
       BUILD PROFILE URL
    ========================= */

    return (
        `${NEXSAC_PROFILE_BASE}/` +
        `${encodeURIComponent(generationId)}/` +
        `${encodeURIComponent(fileName)}`
    );

}