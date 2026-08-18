/* =========================
   GET PARAMETERS
========================= */

const params =
    new URLSearchParams(
        window.location.search
    );


const studentId =
    params.get("id") || "";


const generationIdParam =
    params.get("generation") || "";


/* =========================
   RESEARCH TYPE
========================= */

const researchTypes = {

    a: "3S3C",

    b: "Laporan"

};


/* =========================
   LOAD PROFILE
========================= */

async function loadProfile() {

    try {

        /* =========================
           FETCH STUDENT
        ========================= */

        const result =
            await fetchStudent(
                studentId,
                generationIdParam
            );


        const {
            student,
            studentIndex,
            generationId,
            generationName,
            photoUrl
        } = result;


        /* =========================
           HEADER
        ========================= */

        const pageTitle =
            document.getElementById(
                "page-title"
            );


        if (pageTitle) {

            pageTitle.textContent =
                `MURID ${generationName}`;

        }


        document.title =
            `${student.name || "Profil Murid"} | Murid SMP Sekolah Alam Cikeas`;


        /* =========================
           RENDER PROFILE
        ========================= */

        renderProfile(
            student,
            studentIndex,
            photoUrl
        );


        /* =========================
           RENDER AWARDS
        ========================= */

        renderAwards(
            student.awards
        );


        /* =========================
           RENDER RESEARCH
        ========================= */

        renderResearch(
            student.research,
            generationId
        );

    }


    catch (error) {

        console.error(
            "Gagal memuat profile:",
            error
        );


        showError(
            error.message
        );

    }

}


/* =========================
   RENDER PROFILE
========================= */

function renderProfile(
    student,
    index,
    photoUrl
) {

    const nameElement =
        document.getElementById(
            "profile-name"
        );


    const idElement =
        document.getElementById(
            "profile-id"
        );


    const photoElement =
        document.getElementById(
            "profile-photo"
        );


    /* =========================
       NAME
    ========================= */

    if (nameElement) {

        nameElement.textContent =
            student.name ||
            "Nama tidak tersedia";

    }


    /* =========================
       ID
    ========================= */

    if (idElement) {

        idElement.textContent =
            `NEXUS SAC | ${student.id || "-"}`;

    }


    /* =========================
       PROFILE PHOTO
    ========================= */

    /*
     * URL foto sudah dibuat oleh
     * jsdata.js melalui fetchStudent().
     *
     * Jika tidak ada foto,
     * gunakan default lokal.
     */

    const defaultProfile =
        (index % 12) + 1;


    const photo =
        photoUrl ||
        `asset/default-profile/${defaultProfile}.png`;


    if (photoElement) {

        photoElement.src =
            photo;


        photoElement.alt =
            `Foto ${student.name || "murid"}`;

    }

}


/* =========================
   RENDER AWARDS
========================= */

function renderAwards(
    awards
) {

    const section =
        document.getElementById(
            "awards-section"
        );


    const list =
        document.getElementById(
            "awards-list"
        );


    if (!section || !list)
        return;


    /* =========================
       NO AWARDS
    ========================= */

    if (
        !Array.isArray(awards) ||
        awards.length === 0
    ) {

        section.hidden = true;

        return;

    }


    /* =========================
       CLEAR
    ========================= */

    list.innerHTML = "";


    /* =========================
       RENDER
    ========================= */

    awards.forEach(
        award => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "award";


            const title =
                typeof award === "string"
                    ? award
                    : award?.title || "-";


            item.innerHTML = `

                <div class="award-title">

                    ${escapeHTML(title)}

                </div>

            `;


            list.appendChild(
                item
            );

        }
    );


    section.hidden = false;

}


/* =========================
   RENDER RESEARCH
========================= */

function renderResearch(
    researchList,
    generationId
) {

    const container =
        document.getElementById(
            "research-list"
        );


    const count =
        document.getElementById(
            "research-count"
        );


    if (!container)
        return;


    const research =
        Array.isArray(researchList)
            ? researchList
            : [];


    /* =========================
       CLEAR
    ========================= */

    container.innerHTML = "";


    /* =========================
       COUNT
    ========================= */

    if (count) {

        count.textContent =
            `${research.length} penelitian`;

    }


    /* =========================
       EMPTY
    ========================= */

    if (research.length === 0) {

        container.innerHTML = `

            <div class="load-error">

                <h2>
                    Belum ada penelitian
                </h2>

                <p>
                    Murid ini belum memiliki penelitian.
                </p>

            </div>

        `;

        return;

    }


    /* =========================
       CARDS
    ========================= */

    research.forEach(
        paper => {

            const card =
                document.createElement(
                    "a"
                );


            card.className =
                "research-card";


            /*
             * Bawa generation ID ke paper page.
             */

            card.href =
                `paper.html?id=${encodeURIComponent(
                    paper.id
                )}&generation=${encodeURIComponent(
                    generationId
                )}`;


            card.innerHTML = `

                <span class="research-type">

                    ${escapeHTML(
                        researchTypes[
                            paper.type
                        ] ||
                        "Penelitian"
                    )}

                </span>


                <h3 class="research-title">

                    ${escapeHTML(
                        paper.title ||
                        "Tanpa Judul"
                    )}

                </h3>


                <div class="research-meta">

                    ${escapeHTML(
                        paper.id || "-"
                    )}

                    |

                    ${escapeHTML(
                        paper.year || "-"
                    )}

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );

}


/* =========================
   ERROR
========================= */

function showError(
    message
) {

    const container =
        document.querySelector(
            ".container"
        );


    if (!container)
        return;


    container.innerHTML = `

        <div class="load-error">

            <h2>
                Profil tidak dapat dimuat
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

loadProfile();