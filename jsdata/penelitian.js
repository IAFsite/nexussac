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
        name: "3S3C"
    },

    B: {
        id: "B",
        name: "KTI"
    },

    C: {
        id: "C",
        name: "Penelitian C"
    }

};


/* =========================
   ALL RESEARCH CONFIG
========================= */

const ALL_RESEARCH_LIMIT = 20;


let allResearchOffset = 0;

let allResearchLoading = false;

let allResearchHasMore = true;

let allResearchObserver = null;

let allResearch = [];

let allResearchSearch = "";

let researchSearchTimer = null;

let researchSearchRequestId = 0;


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


/* =========================
   FETCH ALL RESEARCH
========================= */

async function fetchAllResearch(
    limit,
    offset
) {

    const response =
        await fetch(
            `${NEXSAC_API}/research?limit=${encodeURIComponent(
                limit
            )}&offset=${encodeURIComponent(
                offset
            )}`
        );


    if (!response.ok) {

        throw new Error(
            `Seluruh data penelitian tidak dapat dimuat (HTTP ${response.status}).`
        );

    }


    return await response.json();

}


/* =========================
   FETCH STUDENT
========================= */

async function fetchStudentForResearch(
    research
) {

    const studentId =
        String(
            research.student_id ||
            ""
        );


    if (!studentId) {

        return null;

    }


    const generation =
        research.generation ||
        research.generation_id ||
        "";


    /*
     * Kalau API research sudah
     * menyimpan generation,
     * gunakan langsung.
     */

    if (generation) {

        try {

            const response =
                await fetch(
                    `${NEXSAC_API}/students?generation=${encodeURIComponent(
                        generation
                    )}`
                );


            if (response.ok) {

                const data =
                    await response.json();


                const students =
                    Array.isArray(
                        data.students
                    )
                        ? data.students
                        : [];


                return (
                    students.find(
                        student =>
                            String(
                                student.id
                            ) ===
                            studentId
                    ) || null
                );

            }

        }

        catch (error) {

            console.warn(
                "Gagal mengambil data siswa:",
                error
            );

        }

    }


    /*
     * Fallback:
     * cari langsung berdasarkan ID.
     */

    try {

        const response =
            await fetch(
                `${NEXSAC_API}/students?id=${encodeURIComponent(
                    studentId
                )}`
            );


        if (!response.ok) {

            return null;

        }


        const data =
            await response.json();


        if (
            Array.isArray(
                data.students
            )
        ) {

            return (
                data.students.find(
                    student =>
                        String(
                            student.id
                        ) ===
                        studentId
                ) || null
            );

        }


        return data.student || null;

    }

    catch (error) {

        console.warn(
            `Student ${studentId} gagal dimuat.`,
            error
        );


        return null;

    }

}


/* =========================
   LOAD ALL RESEARCH
========================= */

async function loadAllResearch() {

    const title =
        document.getElementById(
            "generation-name"
        );


    if (title) {

        title.textContent =
            "ALL RESEARCH";

    }


    document.title =
        "All Research | SMA Sekolah Alam Cikeas";


    createResearchSearchBar();


    await loadMoreResearch();


    initializeResearchLazyLoading();

}


/* =========================
   LOAD NEXT RESEARCH BATCH
========================= */

async function loadMoreResearch(
    fromSearch = false
) {

    if (
        allResearchLoading ||
        !allResearchHasMore
    ) {

        return;

    }


    allResearchLoading = true;


    try {

        const data =
            await fetchAllResearch(
                ALL_RESEARCH_LIMIT,
                allResearchOffset
            );


        const researchList =
            Array.isArray(
                data.research
            )
                ? data.research
                : [];


        if (
            researchList.length === 0
        ) {

            allResearchHasMore =
                false;


            finishResearchLoading();

            return;

        }


        const currentOffset =
            allResearchOffset;


        /*
         * Deduplicate research.
         */

        researchList.forEach(
            (
                research,
                index
            ) => {

                const researchId =
                    String(
                        research.id ||
                        research.research_id ||
                        (
                            String(
                                research.student_id ||
                                ""
                            ) +
                            "_" +
                            String(
                                research.type ||
                                ""
                            ) +
                            "_" +
                            String(
                                research.title ||
                                ""
                            )
                        )
                    );


                const exists =
                    allResearch.some(
                        item =>
                            item.researchId ===
                            researchId
                    );


                if (exists) {

                    return;

                }


                allResearch.push({

                    researchId,

                    research,

                    student:
                        null,

                    index:
                        currentOffset +
                        index

                });

            }
        );


        allResearchOffset +=
            researchList.length;


        /*
         * Pagination.
         */

        if (
            data.pagination &&
            typeof data.pagination.hasMore ===
                "boolean"
        ) {

            allResearchHasMore =
                data.pagination.hasMore;

        }

        else {

            allResearchHasMore =
                researchList.length >=
                ALL_RESEARCH_LIMIT;

        }


        /*
         * Fetch student data.
         */

        await Promise.all(
            allResearch
                .slice(
                    currentOffset
                )
                .map(
                    async item => {

                        if (
                            item.student
                        ) {

                            return;

                        }


                        item.student =
                            await fetchStudentForResearch(
                                item.research
                            );

                    }
                )
        );


        /*
         * Render.
         */

        if (!fromSearch) {

            renderResearchBatch(
                currentOffset
            );

        }


        if (
            !allResearchHasMore
        ) {

            finishResearchLoading();

        }

    }


    catch (error) {

        console.error(
            "Gagal memuat penelitian:",
            error
        );


        showResearchError(
            error.message
        );

    }


    finally {

        allResearchLoading =
            false;

    }

}


/* =========================
   SEARCH BAR
========================= */

function createResearchSearchBar() {

    if (
        document.getElementById(
            "research-search-container"
        )
    ) {

        return;

    }


    const researchList =
        document.getElementById(
            "research-list"
        );


    if (!researchList)
        return;


    const container =
        document.createElement(
            "div"
        );


    container.id =
        "research-search-container";


    container.style.marginBottom =
        "25px";


    container.innerHTML = `

        <input
            id="research-search"
            type="search"
            placeholder="Cari penelitian, siswa, atau ID..."
            autocomplete="off"
            style="
                width: 100%;
                padding: 14px 18px;
                border: 1px solid #E1E7F0;
                border-radius: 14px;
                background: #FFFFFF;
                color: #24324B;
                font-size: .95rem;
                outline: none;
                box-shadow: 0 5px 18px rgba(35,48,108,.05);
            "
        >

    `;


    researchList.parentNode.insertBefore(
        container,
        researchList
    );


    const input =
        document.getElementById(
            "research-search"
        );


    input.addEventListener(
        "input",
        event => {

            const value =
                event.target.value
                    .trim()
                    .toLowerCase();


            allResearchSearch =
                value;


            researchSearchRequestId++;


            clearTimeout(
                researchSearchTimer
            );


            if (!value) {

                renderAllLoadedResearch();

                return;

            }


            const requestId =
                researchSearchRequestId;


            researchSearchTimer =
                setTimeout(
                    () => {

                        performResearchSearch(
                            value,
                            requestId
                        );

                    },
                    300
                );

        }
    );

}


/* =========================
   SEARCH
========================= */

async function performResearchSearch(
    query,
    requestId
) {

    if (
        requestId !==
        researchSearchRequestId
    ) {

        return;

    }


    renderResearchSearchResults(
        query
    );


    if (
        hasResearchSearchResult(
            query
        )
    ) {

        return;

    }


    while (
        allResearchHasMore &&
        requestId ===
            researchSearchRequestId
    ) {

        await loadMoreResearch(
            true
        );


        if (
            requestId !==
            researchSearchRequestId
        ) {

            return;

        }


        renderResearchSearchResults(
            query
        );


        if (
            hasResearchSearchResult(
                query
            )
        ) {

            return;

        }

    }


    if (
        requestId ===
        researchSearchRequestId
    ) {

        renderResearchSearchResults(
            query
        );

    }

}


/* =========================
   SEARCH MATCH
========================= */

function researchMatches(
    item,
    query
) {

    const research =
        item.research || {};


    const student =
        item.student || {};


    const q =
        String(
            query || ""
        )
            .trim()
            .toLowerCase();


    const title =
        String(
            research.title ||
            research.name ||
            ""
        )
            .toLowerCase();


    const id =
        String(
            research.id ||
            research.research_id ||
            ""
        )
            .toLowerCase();


    const studentId =
        String(
            student.id ||
            research.student_id ||
            ""
        )
            .toLowerCase();


    const studentName =
        String(
            student.name ||
            ""
        )
            .toLowerCase();


    return (
        title.includes(q) ||
        id.includes(q) ||
        studentId.includes(q) ||
        studentName.includes(q)
    );

}


/* =========================
   HAS RESULT
========================= */

function hasResearchSearchResult(
    query
) {

    return allResearch.some(
        item =>
            researchMatches(
                item,
                query
            )
    );

}


/* =========================
   RENDER SEARCH RESULTS
========================= */

function renderResearchSearchResults(
    query
) {

    const researchList =
        document.getElementById(
            "research-list"
        );


    if (!researchList)
        return;


    researchList
        .querySelectorAll(
            ".research-card"
        )
        .forEach(
            card =>
                card.remove()
        );


    const oldEmpty =
        document.getElementById(
            "research-search-empty"
        );


    if (oldEmpty) {

        oldEmpty.remove();

    }


    const results =
        allResearch.filter(
            item =>
                researchMatches(
                    item,
                    query
                )
        );


    const seen =
        new Set();


    results.forEach(
        item => {

            if (
                seen.has(
                    item.researchId
                )
            ) {

                return;

            }


            seen.add(
                item.researchId
            );


            renderResearch(
                item
            );

        }
    );


    if (
        results.length === 0 &&
        !allResearchHasMore
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "load-error";


        empty.id =
            "research-search-empty";


        empty.innerHTML = `

            <h2>
                Penelitian tidak ditemukan
            </h2>

            <p>
                Tidak ada penelitian atau siswa
                yang cocok dengan pencarian.
            </p>

        `;


        researchList.prepend(
            empty
        );

    }

}


/* =========================
   RENDER BATCH
========================= */

function renderResearchBatch(
    startIndex
) {

    const batch =
        allResearch.slice(
            startIndex
        );


    batch.forEach(
        item => {

            renderResearch(
                item
            );

        }
    );

}


/* =========================
   RENDER ALL
========================= */

function renderAllLoadedResearch() {

    const researchList =
        document.getElementById(
            "research-list"
        );


    if (!researchList)
        return;


    researchList
        .querySelectorAll(
            ".research-card"
        )
        .forEach(
            card =>
                card.remove()
        );


    const empty =
        document.getElementById(
            "research-search-empty"
        );


    if (empty) {

        empty.remove();

    }


    const seen =
        new Set();


    allResearch.forEach(
        item => {

            if (
                seen.has(
                    item.researchId
                )
            ) {

                return;

            }


            seen.add(
                item.researchId
            );


            renderResearch(
                item
            );

        }
    );

}


/* =========================
   RENDER RESEARCH
========================= */

function renderResearch(
    item
) {

    const researchList =
        document.getElementById(
            "research-list"
        );


    if (!researchList)
        return;


    const research =
        item.research || {};


    const researchId =
        item.researchId;


    /*
     * HARD DOM DEDUP
     */

    if (researchId) {

        const existing =
            researchList.querySelector(
                `[data-research-id="${CSS.escape(
                    researchId
                )}"]`
            );


        if (existing) {

            return;

        }

    }


    const card =
        document.createElement(
            "a"
        );


    card.className =
        "research-card";


    card.dataset.researchId =
        researchId;


    const student =
        item.student || {};


    const title =
        research.title ||
        research.name ||
        "Penelitian tanpa judul";


    const studentName =
        student.name ||
        "Siswa tidak tersedia";


    const studentId =
        student.id ||
        research.student_id ||
        "-";


    const type =
        String(
            research.type ||
            ""
        ).toUpperCase();


    const typeName =
        RESEARCH_TYPES[type]
            ? RESEARCH_TYPES[type].name
            : (
                type ||
                "Penelitian"
            );


    card.href =
        `research.html?id=${encodeURIComponent(
            researchId
        )}`;


    card.innerHTML = `

        <div class="research-info">

            <div class="research-type">

                ${escapeHTML(
                    typeName
                )}

            </div>

            <h2 class="research-title">

                ${escapeHTML(
                    title
                )}

            </h2>

            <div class="research-student">

                ${escapeHTML(
                    studentName
                )}

            </div>

            <div class="research-id">

                NEXUS SAC |
                ${escapeHTML(
                    studentId
                )}

            </div>

        </div>

    `;


    researchList.appendChild(
        card
    );

}


/* =========================
   LAZY LOADING
========================= */

function initializeResearchLazyLoading() {

    if (
        !allResearchHasMore
    ) {

        return;

    }


    const researchList =
        document.getElementById(
            "research-list"
        );


    if (!researchList)
        return;


    const sentinel =
        document.createElement(
            "div"
        );


    sentinel.id =
        "all-research-sentinel";


    sentinel.style.width =
        "100%";


    sentinel.style.height =
        "1px";


    sentinel.style.marginTop =
        "20px";


    researchList.parentNode.appendChild(
        sentinel
    );


    allResearchObserver =
        new IntersectionObserver(

            entries => {

                if (
                    entries[0] &&
                    entries[0].isIntersecting
                ) {

                    if (
                        !allResearchSearch
                    ) {

                        loadMoreResearch();

                    }

                }

            },

            {

                rootMargin:
                    "600px 0px",

                threshold:
                    0

            }

        );


    allResearchObserver.observe(
        sentinel
    );

}


/* =========================
   FINISH LOADING
========================= */

function finishResearchLoading() {

    if (
        allResearchObserver
    ) {

        allResearchObserver.disconnect();

        allResearchObserver =
            null;

    }

}


/* =========================
   ERROR
========================= */

function showResearchError(
    message
) {

    const researchList =
        document.getElementById(
            "research-list"
        );


    if (!researchList)
        return;


    researchList.innerHTML = `

        <div class="load-error">

            <h2>
                Data penelitian tidak dapat dimuat
            </h2>

            <p>
                ${escapeHTML(
                    message
                )}
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
   AUTO START
========================= */

if (
    typeof generationId !==
    "undefined" &&
    generationId
) {

    /*
     * Kalau halaman lama masih
     * memakai ?id=ANGKATAN,
     * fungsi lama tetap tersedia.
     */

}
else {

    loadAllResearch();

}