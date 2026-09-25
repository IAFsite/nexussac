/* =========================
   GENERATION DATA
========================= */

const NEXSAC_API =
    "https://api.db.indoadvfuture.com";


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
   FETCH GENERATIONS
========================= */

async function fetchGenerations() {

    const response =
        await fetch(
            `${NEXSAC_API}/generations`
        );


    if (!response.ok) {

        throw new Error(
            `Daftar angkatan gagal dimuat (HTTP ${response.status})`
        );

    }


    const database =
        await response.json();


    const generations =
        Array.isArray(
            database.generations
        )
            ? database.generations
            : [];


    if (!generations.length) {

        throw new Error(
            "Tidak ada data angkatan."
        );

    }


    /* =========================
       CHECK EACH GENERATION
    ========================= */

    const generationsWithResearch =
        await Promise.all(
            generations.map(
                async generation => {

                    try {

                        const researchResponse =
                            await fetch(
                                `${NEXSAC_API}/research?generation=${encodeURIComponent(
                                    generation.id
                                )}`
                            );


                        if (!researchResponse.ok) {

                            return null;

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
                           AT LEAST 1 VALID RESEARCH
                        ========================= */

                        const hasResearch =
                            research.some(
                                item =>
                                    hasResearchContent(
                                        item
                                    )
                            );


                        if (!hasResearch) {

                            return null;

                        }


                        return generation;

                    } catch (error) {

                        console.warn(
                            `Gagal memeriksa research angkatan ${generation.id}:`,
                            error
                        );

                        return null;

                    }

                }
            )
        );


    /* =========================
       REMOVE EMPTY GENERATIONS
    ========================= */

    const filteredGenerations =
        generationsWithResearch.filter(
            generation =>
                generation !== null
        );


    if (!filteredGenerations.length) {

        throw new Error(
            "Tidak ada angkatan yang memiliki data penelitian."
        );

    }


    return filteredGenerations;

}