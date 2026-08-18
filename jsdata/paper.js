/* =========================
   NEXUS SAC DATA API
========================= */

const NEXSAC_BASE =
    "https://raw.githubusercontent.com/IAFsite/nexsac/main/data";


const NEXSAC_MEDIA_BASE =
    "https://raw.githubusercontent.com/IAFsite/nexsac/main/media/media";


/* =========================
   FETCH PAPER
========================= */

async function fetchPaper(
    generationId,
    paperId
) {

    if (!generationId) {

        throw new Error(
            "Nomor angkatan tidak ditemukan."
        );

    }


    if (!paperId) {

        throw new Error(
            "Kode penelitian tidak ditemukan."
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
            `Data angkatan ${generationId} gagal dimuat (HTTP ${response.status}).`
        );

    }


    const database =
        await response.json();


    /* =========================
       FIND PAPER
    ========================= */

    for (
        const student
        of database.students || []
    ) {

        const researchList =
            Array.isArray(student.research)
                ? student.research
                : [];


        const paper =
            researchList.find(
                research =>
                    String(research.id) ===
                    String(paperId)
            );


        if (paper) {

            return {

                paper,

                student,

                generation:
                    database.generation || {}

            };

        }

    }


    throw new Error(
        `Penelitian dengan kode "${paperId}" tidak ditemukan pada angkatan ${generationId}.`
    );

}


/* =========================
   MEDIA URL
========================= */

function getMediaURL(
    generationId,
    filePath
) {

    const value =
        String(
            filePath || ""
        ).trim();


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
       BUILD MEDIA URL
    ========================= */

    return (
        `${NEXSAC_MEDIA_BASE}/` +
        `${encodeURIComponent(generationId)}/` +
        `${encodeURIComponent(fileName)}`
    );

}