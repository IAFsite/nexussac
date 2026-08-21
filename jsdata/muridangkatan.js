/* =========================
   NEXUS SAC DATA API
========================= */

const NEXSAC_API =
    "https://api.db.indoadvfuture.com";


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


    /* =========================
       FETCH STUDENTS
       ONLY THIS GENERATION
    ========================= */

    const studentsResponse =
        await fetch(
            `${NEXSAC_API}/students?generation=${encodeURIComponent(
                generationId
            )}`
        );


    if (!studentsResponse.ok) {

        throw new Error(
            `Data angkatan ${generationId} gagal dimuat (HTTP ${studentsResponse.status})`
        );

    }


    const studentsDatabase =
        await studentsResponse.json();


    const students =
        Array.isArray(
            studentsDatabase.students
        )
            ? studentsDatabase.students
            : [];


    /* =========================
       FETCH GENERATION METADATA
    ========================= */

    const generationResponse =
        await fetch(
            `${NEXSAC_API}/generations`
        );


    if (!generationResponse.ok) {

        throw new Error(
            `Daftar angkatan gagal dimuat (HTTP ${generationResponse.status})`
        );

    }


    const generationsDatabase =
        await generationResponse.json();


    const generations =
        Array.isArray(
            generationsDatabase.generations
        )
            ? generationsDatabase.generations
            : [];


    const generation =
        generations.find(
            item =>
                String(item.id) ===
                String(generationId)
        );


    /* =========================
       RETURN OLD JSON FORMAT
    ========================= */

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
   FETCH ALL STUDENTS
   LAZY / PAGINATED
========================= */

async function fetchAllStudents(
    limit = 20,
    offset = 0
) {

    const params =
        new URLSearchParams();


    params.set(
        "limit",
        String(limit)
    );


    params.set(
        "offset",
        String(offset)
    );


    const response =
        await fetch(
            `${NEXSAC_API}/students?${params.toString()}`
        );


    if (!response.ok) {

        throw new Error(
            `Seluruh data murid gagal dimuat (HTTP ${response.status})`
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


    return {

        students,

        pagination:
            database.pagination || {

                limit,

                offset,

                hasMore:
                    students.length >=
                    limit

            }

    };

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