/* =========================
   NEXUS SAC DATA API
========================= */

const NEXSAC_API =
    "https://api.db.indoadvfuture.com";


const NEXSAC_PROFILE_BASE =
    "https://raw.githubusercontent.com/IAFsite/nexsac/main/media/profile-picture";


/* =========================
   CHECK RESEARCH CONTENT
========================= */

function hasResearchContent(
    research
) {

    if (!research) {

        return false;

    }


    let content =
        research.content;


    /* =========================
       CONTENT AS JSON STRING
    ========================= */

    if (typeof content === "string") {

        try {

            content =
                JSON.parse(content);

        } catch {

            return false;

        }

    }


    return (
        Array.isArray(content) &&
        content.length > 0
    );

}


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
       FETCH RESEARCH
       ONLY THIS GENERATION
    ========================= */

    const researchResponse =
        await fetch(
            `${NEXSAC_API}/research?generation=${encodeURIComponent(
                generationId
            )}`
        );


    if (!researchResponse.ok) {

        throw new Error(
            `Data penelitian angkatan ${generationId} gagal dimuat (HTTP ${researchResponse.status})`
        );

    }


    const researchDatabase =
        await researchResponse.json();


    const researchList =
        Array.isArray(
            researchDatabase.research
        )
            ? researchDatabase.research
            : [];


    /* =========================
       FIND STUDENTS WITH
       AT LEAST 1 RESEARCH
    ========================= */

    const researchStudentIds =
        new Set();


    researchList.forEach(
        research => {

            if (
                !hasResearchContent(
                    research
                )
            ) {

                return;

            }


            const studentId =
                String(
                    research.student_id || ""
                ).trim();


            if (!studentId) {

                return;

            }


            researchStudentIds.add(
                studentId
            );

        }
    );


    /* =========================
       FILTER STUDENTS
       ONLY STUDENTS WITH RESEARCH
    ========================= */

    const studentsWithResearch =
        students.filter(
            student => {

                const studentId =
                    String(
                        student.id || ""
                    ).trim();


                return researchStudentIds.has(
                    studentId
                );

            }
        );


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

        students:
            studentsWithResearch

    };

}


/* =========================
   FETCH ALL STUDENTS
   ONLY STUDENTS WITH RESEARCH
========================= */

async function fetchAllStudents(
    limit = 20,
    offset = 0
) {

    /* =========================
       FETCH RESEARCH
    ========================= */

    const researchResponse =
        await fetch(
            `${NEXSAC_API}/research?limit=10000&offset=0`
        );


    if (!researchResponse.ok) {

        throw new Error(
            `Data penelitian gagal dimuat (HTTP ${researchResponse.status})`
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
       FIND STUDENTS WITH RESEARCH
    ========================= */

    const researchStudentIds =
        new Set();


    research.forEach(
        item => {

            if (
                !hasResearchContent(
                    item
                )
            ) {

                return;

            }


            const studentId =
                String(
                    item.student_id || ""
                ).trim();


            if (!studentId) {

                return;

            }


            researchStudentIds.add(
                studentId
            );

        }
    );


    /* =========================
       FETCH STUDENTS
    ========================= */

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


    const allStudents =
        Array.isArray(
            database.students
        )
            ? database.students
            : [];


    /* =========================
       FILTER STUDENTS
       ONLY WITH RESEARCH
    ========================= */

    const students =
        allStudents.filter(
            student => {

                const studentId =
                    String(
                        student.id || ""
                    ).trim();


                return researchStudentIds.has(
                    studentId
                );

            }
        );


    /* =========================
       PAGINATION
    ========================= */

    const originalPagination =
        database.pagination || {};


    return {

        students,

        pagination: {

            limit,

            offset,

            hasMore:
                Boolean(
                    originalPagination.hasMore
                )

        }

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