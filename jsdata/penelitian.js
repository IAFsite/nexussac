/* =========================
   NEXUS SAC DATA API
========================= */

const NEXSAC_API =
    "https://api.db.indoadvfuture.com";


/* =========================
   RESEARCH TYPE META
========================= */

const RESEARCH_TYPES = {

    A: {
        id: "A",
        name: "Penelitian A"
    },

    B: {
        id: "B",
        name: "Penelitian B"
    },

    C: {
        id: "C",
        name: "Penelitian C"
    }

};


/* =========================
   FETCH RESEARCH
   BY GENERATION
========================= */

async function fetchResearchByGeneration(
    generationId,
    researchType
) {

    if (!generationId) {

        throw new Error(
            "Kode angkatan tidak ditemukan."
        );

    }


    /* =========================
       FETCH RESEARCH
    ========================= */

    const response =
        await fetch(
            `${NEXSAC_API}/research?generation=${encodeURIComponent(
                generationId
            )}`
        );


    if (!response.ok) {

        throw new Error(
            `Data penelitian angkatan ${generationId} tidak dapat dimuat (HTTP ${response.status}).`
        );

    }


    const data =
        await response.json();


    const researchList =
        Array.isArray(data.research)
            ? data.research
            : [];


    /* =========================
       FILTER TYPE
    ========================= */

    const filteredResearch =
        researchType
            ? researchList.filter(
                item =>
                    String(item.type)
                        .toUpperCase() ===
                    String(researchType)
                        .toUpperCase()
            )
            : researchList;


    /* =========================
       FETCH STUDENTS
       FOR DISPLAY DATA
    ========================= */

    const studentsResponse =
        await fetch(
            `${NEXSAC_API}/students?generation=${encodeURIComponent(
                generationId
            )}`
        );


    if (!studentsResponse.ok) {

        throw new Error(
            `Data siswa angkatan ${generationId} tidak dapat dimuat (HTTP ${studentsResponse.status}).`
        );

    }


    const studentsData =
        await studentsResponse.json();


    const students =
        Array.isArray(
            studentsData.students
        )
            ? studentsData.students
            : [];


    /* =========================
       COMBINE RESEARCH
       + STUDENT
    ========================= */

    return filteredResearch.map(
        research => {

            const student =
                students.find(
                    item =>
                        String(item.id) ===
                        String(
                            research.student_id
                        )
                ) || null;


            return {

                research,

                student

            };

        }
    );

}