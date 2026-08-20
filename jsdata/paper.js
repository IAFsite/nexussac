/* =========================
   NEXUS SAC DATA API
========================= */

const NEXSAC_API =
    "https://api.db.indoadvfuture.com";


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


    /* =========================
       FETCH RESEARCH
    ========================= */

    const response =
        await fetch(
            `${NEXSAC_API}/research/${encodeURIComponent(
                paperId
            )}`
        );


    if (!response.ok) {

        if (response.status === 404) {

            throw new Error(
                `Penelitian dengan kode "${paperId}" tidak ditemukan.`
            );

        }


        throw new Error(
            `Data penelitian gagal dimuat (HTTP ${response.status}).`
        );

    }


    const database =
        await response.json();


    /* =========================
       NORMALIZE RESPONSE
    ========================= */

    const paper =
        database.research ||
        database.paper ||
        database;


    if (!paper) {

        throw new Error(
            `Penelitian dengan kode "${paperId}" tidak ditemukan.`
        );

    }


    /* =========================
       CHECK GENERATION
    ========================= */

    if (
        paper.generation_id &&
        String(paper.generation_id) !==
        String(generationId)
    ) {

        throw new Error(
            `Penelitian "${paperId}" bukan bagian dari angkatan ${generationId}.`
        );

    }


    /* =========================
       FETCH STUDENT
    ========================= */

    let student = null;


    const studentId =
        paper.student_id ||
        paper.studentId;


    if (studentId) {

        const studentResponse =
            await fetch(
                `${NEXSAC_API}/students/${encodeURIComponent(
                    studentId
                )}`
            );


        if (
            studentResponse.ok
        ) {

            student =
                await studentResponse.json();

        }

    }


    /* =========================
       FETCH GENERATION
    ========================= */

    let generation = null;


    const generationResponse =
        await fetch(
            `${NEXSAC_API}/generations`
        );


    if (
        generationResponse.ok
    ) {

        const generationsDatabase =
            await generationResponse.json();


        const generations =
            Array.isArray(
                generationsDatabase.generations
            )
                ? generationsDatabase.generations
                : [];


        generation =
            generations.find(
                item =>
                    String(item.id) ===
                    String(generationId)
            ) || null;

    }


    /* =========================
       RETURN
    ========================= */

    return {

        paper,

        student,

        generation:
            generation || {

                id:
                    String(generationId),

                name:
                    `ANGKATAN ${generationId}`,

                description:
                    ""

            }

    };

}


/* =========================
   FETCH STUDENT RESEARCH
========================= */

async function fetchStudentResearch(
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
            )}/research`
        );


    if (!response.ok) {

        if (
            response.status === 404
        ) {

            return [];

        }


        throw new Error(
            `Data penelitian siswa gagal dimuat (HTTP ${response.status}).`
        );

    }


    const database =
        await response.json();


    if (
        Array.isArray(
            database.research
        )
    ) {

        return database.research;

    }


    if (
        Array.isArray(
            database.papers
        )
    ) {

        return database.papers;

    }


    if (
        Array.isArray(database)
    ) {

        return database;

    }


    return [];

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


    /* =========================
       NO FILE
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
       CLEAN PATH
    ========================= */

    const cleanPath =
        value
            .split("?")[0]
            .split("#")[0];


    /* =========================
       GET FILE NAME
    ========================= */

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