/* =========================
   NEXUS SAC API
========================= */

const NEXSAC_BASE =
    "https://raw.githubusercontent.com/IAFsite/nexsac/main/data";


const NEXSAC_PROFILE =
    "https://raw.githubusercontent.com/IAFsite/nexsac/main/media/profile-picture";


/* =========================
   FETCH GENERATION
========================= */

async function fetchGeneration(
    generationId
) {

    if (!generationId) {

        throw new Error(
            "Nomor angkatan tidak ditemukan."
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


    return await response.json();

}


/* =========================
   PROFILE PHOTO URL
========================= */

function getProfilePhoto(
    generationId,
    photo
) {

    if (
        !generationId ||
        !photo
    ) {

        return "";

    }


    return `${NEXSAC_PROFILE}/${encodeURIComponent(
        generationId
    )}/${encodeURIComponent(
        photo
    )}`;

}


/* =========================
   FIND STUDENT GENERATION
========================= */

async function findStudentGeneration(
    studentId
) {

    const generations = [
        "00"
    ];


    for (
        const generationId
        of generations
    ) {

        try {

            const data =
                await fetchGeneration(
                    generationId
                );


            const students =
                Array.isArray(
                    data.students
                )
                    ? data.students
                    : [];


            const found =
                students.some(
                    student =>
                        String(
                            student.id
                        ) ===
                        String(
                            studentId
                        )
                );


            if (found) {

                return generationId;

            }

        }


        catch (error) {

            console.warn(
                `Gagal memeriksa database ${generationId}:`,
                error
            );

        }

    }


    return null;

}


/* =========================
   FETCH STUDENT
========================= */

async function fetchStudent(
    studentId,
    generationId = ""
) {

    if (!studentId) {

        throw new Error(
            "Kode murid tidak ditemukan."
        );

    }


    /* =========================
       RESOLVE GENERATION
    ========================= */

    const resolvedGeneration =
        generationId ||
        await findStudentGeneration(
            studentId
        );


    if (!resolvedGeneration) {

        throw new Error(
            `Murid dengan kode "${studentId}" tidak ditemukan.`
        );

    }


    /* =========================
       LOAD DATABASE
    ========================= */

    const data =
        await fetchGeneration(
            resolvedGeneration
        );


    const students =
        Array.isArray(
            data.students
        )
            ? data.students
            : [];


    /* =========================
       FIND STUDENT
    ========================= */

    const studentIndex =
        students.findIndex(
            student =>
                String(
                    student.id
                ) ===
                String(
                    studentId
                )
        );


    if (studentIndex === -1) {

        throw new Error(
            `Murid dengan kode "${studentId}" tidak ditemukan.`
        );

    }


    const student =
        students[studentIndex];


    /* =========================
       PROFILE PHOTO
    ========================= */

    const photoUrl =
        getProfilePhoto(
            resolvedGeneration,
            student.photo
        );


    /* =========================
       RETURN
    ========================= */

    return {

        student,

        studentIndex,

        generationId:
            resolvedGeneration,

        generationName:
            data.generation?.name ||
            `ANGKATAN ${resolvedGeneration}`,

        photoUrl

    };

}