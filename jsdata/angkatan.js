/* =========================
   NEXUS SAC DATA API
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


    /* =========================
       FETCH STUDENTS
    ========================= */

    const studentsResponse =
        await fetch(
            `${NEXSAC_API}/students?generation=${encodeURIComponent(
                generationId
            )}`
        );


    if (!studentsResponse.ok) {

        throw new Error(
            `Data angkatan ${generationId} tidak dapat dimuat (HTTP ${studentsResponse.status}).`
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
       FETCH RESEARCH
    ========================= */

    const researchResponse =
        await fetch(
            `${NEXSAC_API}/research?generation=${encodeURIComponent(
                generationId
            )}`
        );


    if (!researchResponse.ok) {

        throw new Error(
            `Data penelitian angkatan ${generationId} tidak dapat dimuat (HTTP ${researchResponse.status}).`
        );

    }


    const researchDatabase =
        await researchResponse.json();


    const research =
        Array.isArray(
            researchDatabase.research
        )
            ? researchDatabase.research
            : [];


    /* =========================
       FETCH GENERATION METADATA
    ========================= */

    const generations =
        await fetchGenerations();


    const generation =
        generations.find(
            item =>
                String(item.id) ===
                String(generationId)
        );


    /* =========================
       RESPONSE
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

        students,

        research

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