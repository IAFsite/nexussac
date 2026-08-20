/* =========================
   GET GENERATION ID
========================= */

const params =
    new URLSearchParams(
        window.location.search
    );


const generationId =
    params.get("id");


/* =========================
   LOAD STUDENTS
========================= */

async function loadStudents() {

    const studentList =
        document.getElementById(
            "student-list"
        );


    const generationName =
        document.getElementById(
            "generation-name"
        );


    if (!generationId) {

        showError(
            "Kode angkatan tidak ditemukan."
        );

        return;

    }


    try {

        /* =========================
           LOAD DATABASE
        ========================= */

        const data =
            await fetchGeneration(
                generationId
            );


        /* =========================
        GENERATION
        ========================= */

const generation =
    data.generation || {};


const displayGeneration =
    generation.name ||
    `ANGKATAN ${generationId}`;


if (generationName) {

    generationName.textContent =
        `MURID ${displayGeneration
            .replace(/^ANGKATAN\s+/i, "ANGKATAN ")
        }`;

}


/* =========================
   DOCUMENT TITLE
========================= */

document.title =
    `Murid ${displayGeneration} | SMA Sekolah Alam Cikeas`;


        /* =========================
           STUDENTS
        ========================= */

        const students =
            Array.isArray(data.students)
                ? data.students
                : [];


        if (!studentList)
            return;


        studentList.innerHTML = "";


        /* =========================
           NO STUDENTS
        ========================= */

        if (students.length === 0) {

            studentList.innerHTML = `

                <div class="load-error">

                    <h2>
                        Belum ada data murid
                    </h2>

                    <p>
                        Data murid untuk angkatan ini
                        belum tersedia.
                    </p>

                </div>

            `;

            return;

        }


        /* =========================
           RENDER STUDENTS
        ========================= */

        students.forEach(
            (student, index) => {

/* =========================
   DEFAULT PROFILE
========================= */

const defaultProfile =
    (index % 12) + 1;


/* =========================
   PROFILE PHOTO
========================= */

const profilePhoto =
    getProfilePhotoURL(
        generationId,
        student.photo
    );


const photo =
    profilePhoto ||
    `asset/default-profile/${defaultProfile}.png`;
                /* =========================
                   CARD
                ========================= */

                const card =
                    document.createElement(
                        "a"
                    );


                card.className =
                    "student-card";


                card.href =
                    `profile.html?id=${encodeURIComponent(
                        student.id
                    )}&generation=${encodeURIComponent(
                        generationId
                    )}`;


                card.innerHTML = `

                    <img
                        src="${escapeHTML(photo)}"
                        class="student-photo"
                        alt="Foto ${escapeHTML(
                            student.name ||
                            "murid"
                        )}"
                        loading="lazy"
                    >


                    <div class="student-info">

                        <h2 class="student-name">

                            ${escapeHTML(
                                student.name ||
                                "Nama tidak tersedia"
                            )}

                        </h2>


                        <div class="student-id">

                            NEXUS SAC |
                            ${escapeHTML(
                                student.id ||
                                "-"
                            )}

                        </div>

                    </div>

                `;


                studentList.appendChild(
                    card
                );

            }
        );

    }


    catch (error) {

        console.error(
            "Gagal memuat data murid:",
            error
        );


        showError(
            error.message
        );

    }

}


/* =========================
   ERROR
========================= */

function showError(
    message
) {

    const studentList =
        document.getElementById(
            "student-list"
        );


    if (!studentList)
        return;


    studentList.innerHTML = `

        <div class="load-error">

            <h2>
                Data murid tidak dapat dimuat
            </h2>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>

    `;

}


/* =========================
   HTML ESCAPE
========================= */

function escapeHTML(
    text
) {

    return String(text)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================
   START
========================= */

loadStudents();