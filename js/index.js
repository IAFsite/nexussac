/* =========================
   LOAD GENERATIONS
========================= */

async function loadGenerations() {

    const container =
        document.getElementById(
            "generation-list"
        );


    if (!container)
        return;


    try {

        const generations =
            await fetchGenerations();


        renderGenerations(
            generations,
            container
        );

    }

    catch (error) {

        console.error(
            "Gagal memuat data angkatan:",
            error
        );


        container.innerHTML = `

            <div class="load-error">

                <h2>
                    Gagal memuat data
                </h2>

                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>

            </div>

        `;

    }

}


/* =========================
   RENDER
========================= */

function renderGenerations(
    generations,
    container
) {

    container.innerHTML = "";


    generations.forEach(
        generation => {

            const card =
                document.createElement(
                    "a"
                );


            card.className =
                "generation-card";


            card.href =
                `angkatan.html?id=${encodeURIComponent(
                    generation.id
                )}`;


            card.innerHTML = `

                <div class="generation-number">

                    ${escapeHTML(
                        generation.id
                    )}

                </div>


                <div class="generation-name">

                    ${escapeHTML(
                        generation.name
                    )}

                </div>


                <div class="generation-range">

                    ${escapeHTML(
                        generation.range
                    )}

                </div>


                <div class="generation-arrow">

                    →

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );

}


/* =========================
   ESCAPE HTML
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

loadGenerations();