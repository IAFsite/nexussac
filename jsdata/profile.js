/* =========================
   NEXUS SAC API
========================= */

const NEXSAC_API =
    "https://api.db.indoadvfuture.com";


const NEXSAC_PROFILE =
    "https://raw.githubusercontent.com/IAFsite/nexsac/main/media/profile-picture";


const NEXSAC_DEFAULT_PROFILE =
    "asset/default-profile";


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
            `Daftar angkatan gagal dimuat (HTTP ${response.status}).`
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


    /* =========================
       FETCH STUDENTS
       ONLY THIS GENERATION
    ========================= */

    const response =
        await fetch(
            `${NEXSAC_API}/students?generation=${encodeURIComponent(
                generationId
            )}`
        );


    if (!response.ok) {

        throw new Error(
            `Data angkatan ${generationId} gagal dimuat (HTTP ${response.status}).`
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
       RETURN
       SAME FORMAT AS OLD JSON
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
   PROFILE PHOTO URL
========================= */

function getProfilePhoto(
    generationId,
    photo
) {

    const value =
        String(
            photo || ""
        ).trim();


    /* =========================
       NO PHOTO
       RETURN EMPTY
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
       CLEAN FILE NAME
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
        `${NEXSAC_PROFILE}/` +
        `${encodeURIComponent(generationId)}/` +
        `${encodeURIComponent(fileName)}`
    );

}


/* =========================
   DEFAULT PROFILE PHOTO
========================= */

function getDefaultProfile(
    studentId
) {

    const id =
        String(
            studentId || ""
        ).trim();


    /*
     * NEXUS SAC ID
     *
     * 07001
     *     ^^^
     *     nomor absen
     *
     * 09014
     *     ^^^
     *     nomor absen
     */


    const attendanceNumber =
        parseInt(
            id.slice(-3),
            10
        );


    /* =========================
       INVALID ID
    ========================= */

    if (
        !Number.isFinite(
            attendanceNumber
        ) ||
        attendanceNumber <= 0
    ) {

        return (
            `${NEXSAC_DEFAULT_PROFILE}/1.png`
        );

    }


    /* =========================
       LOOP 1 - 12
    ========================= */

    const profileNumber =
        (
            (attendanceNumber - 1) %
            12
        ) + 1;


    /* =========================
       BUILD DEFAULT URL
    ========================= */

    return (
        `${NEXSAC_DEFAULT_PROFILE}/` +
        `${profileNumber}.png`
    );

}


/* =========================
   FINAL PROFILE PHOTO
========================= */

function getStudentPhoto(
    student,
    generationId
) {

    /*
     * Foto asli terlebih dahulu.
     */

    const photo =
        getProfilePhoto(
            generationId,
            student?.photo
        );


    if (photo) {

        return photo;

    }


    /*
     * Kalau photo = null,
     * gunakan default PP.
     */

    return getDefaultProfile(
        student?.id
    );

}


/* =========================
   FIND STUDENT GENERATION
========================= */

async function findStudentGeneration(
    studentId
) {

    if (!studentId) {

        return null;

    }


    const id =
        String(
            studentId
        ).trim();


    /* =========================
       NEXUS SAC ID FORMAT

       09014
       ^^
       generation
    ========================= */

    const generationId =
        id.substring(
            0,
            2
        );


    if (
        /^\d{2}$/.test(
            generationId
        )
    ) {

        return generationId;

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
       FETCH STUDENT DIRECTLY
    ========================= */

    const response =
        await fetch(
            `${NEXSAC_API}/students/${encodeURIComponent(
                studentId
            )}`
        );


    if (!response.ok) {

        if (
            response.status === 404
        ) {

            throw new Error(
                `Murid dengan kode "${studentId}" tidak ditemukan.`
            );

        }


        throw new Error(
            `Data murid gagal dimuat (HTTP ${response.status}).`
        );

    }


    const student =
        await response.json();


    /* =========================
       VALIDATE GENERATION
    ========================= */

    if (
        student.generation_id &&
        String(
            student.generation_id
        ) !==
        String(
            resolvedGeneration
        )
    ) {

        throw new Error(
            `Murid "${studentId}" tidak berada di angkatan ${resolvedGeneration}.`
        );

    }


    /* =========================
       FETCH GENERATION METADATA
    ========================= */

    const generations =
        await fetchGenerations();


    const generation =
        generations.find(
            item =>
                String(item.id) ===
                String(resolvedGeneration)
        );


    /* =========================
       PROFILE PHOTO
    ========================= */

    const photoUrl =
        getStudentPhoto(
            student,
            resolvedGeneration
        );


    /* =========================
       RETURN
       SAME FORMAT AS OLD JS
    ========================= */

    return {

        student,

        studentIndex:
            -1,

        generationId:
            resolvedGeneration,

        generationName:
            generation?.name ||
            `ANGKATAN ${resolvedGeneration}`,

        photoUrl

    };

}