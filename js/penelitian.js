/* =========================
   GET PARAMETERS
========================= */

const params =
    new URLSearchParams(
        window.location.search
    );


const generationId =
    params.get("id") || "";


const researchType =
    params.get("type") || "";


/* =========================
   RESEARCH TYPE
========================= */

const researchTypes = {

    a: "3S3C",

    b: "Laporan"

};


/* =========================
   LOAD RESEARCH
========================= */

async function loadResearch() {

    const pageTitle =
        document.getElementById(
            "page-title"
        );


    const researchList =
        document.getElementById(
            "research-list"
        );


    /* =========================
       CHECK PARAMETER
    ========================= */

    if (!generationId) {

        showError(
            researchList,
            "Nomor angkatan tidak ditemukan."
        );

        return;

    }


    if (!researchType) {

        showError(
            researchList,
            "Jenis penelitian tidak ditemukan."
        );

        return;

    }


    const typeName =
        researchTypes[
            researchType
        ];


    if (!typeName) {

        showError(
            researchList,
            "Jenis penelitian tidak valid."
        );

        return;

    }


    /* =========================
       HEADER
    ========================= */

    if (pageTitle) {

        pageTitle.textContent =
            `${typeName} — ANGKATAN ${generationId}`;

    }


    document.title =
        `${typeName} — Angkatan ${generationId} | Sekolah Alam Cikeas`;


    try {

        /* =========================
           LOAD RESEARCH
        ========================= */

        const researchListData =
            await fetchResearchByGeneration(
                generationId,
                researchType
            );


        /* =========================
           CLEAR
        ========================= */

        researchList.innerHTML = "";


        /* =========================
           NO DATA
        ========================= */

        if (
            researchListData.length === 0
        ) {

            showError(
                researchList,
                `Belum ada penelitian ${typeName} pada angkatan ${generationId}.`
            );

            return;

        }


        /* =========================
           CREATE CARDS
        ========================= */

        researchListData.forEach(
            ({ research, student }) => {

                const card =
                    document.createElement(
                        "a"
                    );


                card.className =
                    "research-card";


                card.href =
                    `paper.html?id=${encodeURIComponent(
                        research.id
                    )}`;


                card.addEventListener(
                    "click",
                    () => {

                        sessionStorage.setItem(
                            "paperGeneration",
                            generationId
                        );

                    }
                );


                card.innerHTML = `

                    <div class="research-card-content">

                        <h2 class="research-title">

                            ${escapeHTML(
                                research.title ||
                                "Tanpa Judul"
                            )}

                        </h2>


                        <p class="research-student">

                            ${escapeHTML(
                                student.name ||
                                "Nama tidak tersedia"
                            )}

                        </p>


                        <div class="research-meta">

                            <span>

                                ${escapeHTML(
                                    research.id ||
                                    "-"
                                )}

                                |

                                ${escapeHTML(
                                    research.year ||
                                    "-"
                                )}

                            </span>

                        </div>

                    </div>

                `;


                researchList.appendChild(
                    card
                );

            }
        );

    }


    catch (error) {

        console.error(
            "Gagal memuat penelitian:",
            error
        );


        showError(
            researchList,
            error.message
        );

    }

}


/* =========================
   ERROR
========================= */

function showError(
    container,
    message
) {

    if (!container)
        return;


    container.innerHTML = `

        <div class="load-error">

            <h2>
                Data tidak dapat dimuat
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

function escapeHTML(text) {

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

loadResearch();