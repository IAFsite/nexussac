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
   ALL RESEARCH CONFIG
========================= */

const ALL_RESEARCH_LIMIT = 20;


let allResearchOffset = 0;

let allResearchLoading = false;

let allResearchHasMore = true;

let allResearchObserver = null;

let allResearch = [];

let allResearchSearch = "";

let searchTimer = null;

let searchRequestId = 0;


/* =========================
   DETECT MODE
========================= */

const isAllResearch =
    !generationId;


/* =========================
   LOAD RESEARCH
========================= */

async function loadResearch() {

    /*
     * =========================
     * ALL RESEARCH MODE
     * =========================
     */

    if (isAllResearch) {

        await loadAllResearch();

        return;

    }


    /*
     * =========================
     * GENERATION MODE
     * =========================
     */

    await loadGenerationResearch();

}


/* =========================
   GENERATION RESEARCH
========================= */

async function loadGenerationResearch() {

    const pageTitle =
        document.getElementById(
            "page-title"
        );


    const researchList =
        document.getElementById(
            "research-list"
        );


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

        const researchListData =
            await fetchResearchByGeneration(
                generationId,
                researchType
            );


        researchList.innerHTML = "";


        if (
            researchListData.length === 0
        ) {

            showError(
                researchList,
                `Belum ada penelitian ${typeName} pada angkatan ${generationId}.`
            );

            return;

        }


        researchListData.forEach(
            ({ research, student }) => {

                renderGenerationResearch(
                    research,
                    student
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
   GENERATION CARD
========================= */

function renderGenerationResearch(
    research,
    student
) {

    const researchList =
        document.getElementById(
            "research-list"
        );


    if (!researchList)
        return;


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
                    student?.name ||
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


/* =========================
   ALL RESEARCH
========================= */

async function loadAllResearch() {

    const pageTitle =
        document.getElementById(
            "page-title"
        );


    if (pageTitle) {

        pageTitle.textContent =
            "Seluruh Penelitian";

    }


    document.title =
        "All Research | SMA Sekolah Alam Cikeas";


    createSearchBar();


    await loadMoreResearch();


    initializeResearchLazyLoading();

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
            `Data penelitian tidak dapat dimuat (HTTP ${response.status}).`
        );

    }


    return await response.json();

}


/* =========================
   LOAD NEXT BATCH
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


        const startIndex =
            allResearch.length;


        /*
         * =========================
         * ADD + DEDUP
         * =========================
         */

        for (
            let i = 0;
            i < researchList.length;
            i++
        ) {

            const research =
                researchList[i];


            const researchId =
                String(
                    research.id ||
                    research.research_id ||
                    ""
                );


            /*
             * ID research wajib unik.
             */

            if (!researchId) {

                continue;

            }


            const exists =
                allResearch.some(
                    item =>
                        item.id ===
                        researchId
                );


            if (exists) {

                continue;

            }


            allResearch.push({

                id:
                    researchId,

                research,

                student:
                    null

            });

        }


        allResearchOffset +=
            researchList.length;


        /*
         * =========================
         * PAGINATION
         * =========================
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
         * =========================
         * FETCH STUDENTS
         * =========================
         *
         * Gunakan student_id.
         *
         * Karena ID student:
         *
         * 09001
         *
         * dan research:
         *
         * 0900101
         *
         * kita ambil generation dari
         * 2 digit pertama.
         */

        const newItems =
            allResearch.slice(
                startIndex
            );


        const generationGroups =
            {};


        newItems.forEach(
            item => {

                const studentId =
                    String(
                        item.research.student_id ||
                        ""
                    );


                if (
                    studentId.length < 2
                ) {

                    return;

                }


                const generation =
                    studentId.substring(
                        0,
                        2
                    );


                if (
                    !generationGroups[
                        generation
                    ]
                ) {

                    generationGroups[
                        generation
                    ] = [];

                }


                generationGroups[
                    generation
                ].push(
                    item
                );

            }
        );


        /*
         * Ambil siswa per angkatan,
         * bukan satu request per research.
         *
         * Jauh lebih ringan.
         */

        await Promise.all(

            Object.entries(
                generationGroups
            ).map(
                async (
                    [
                        generation,
                        items
                    ]
                ) => {

                    try {

                        const response =
                            await fetch(
                                `${NEXSAC_API}/students?generation=${encodeURIComponent(
                                    generation
                                )}`
                            );


                        if (!response.ok) {

                            return;

                        }


                        const data =
                            await response.json();


                        const students =
                            Array.isArray(
                                data.students
                            )
                                ? data.students
                                : [];


                        items.forEach(
                            item => {

                                const student =
                                    students.find(
                                        student =>
                                            String(
                                                student.id
                                            ) ===
                                            String(
                                                item.research.student_id
                                            )
                                    );


                                item.student =
                                    student ||
                                    null;

                            }
                        );

                    }

                    catch (error) {

                        console.warn(
                            `Gagal memuat siswa angkatan ${generation}`,
                            error
                        );

                    }

                }
            )

        );


        /*
         * =========================
         * RENDER
         * =========================
         */

        if (!fromSearch) {

            newItems.forEach(
                item => {

                    renderAllResearchCard(
                        item
                    );

                }
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
            "Gagal memuat all research:",
            error
        );


        showError(
            document.getElementById(
                "research-list"
            ),
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

function createSearchBar() {

    if (
        document.getElementById(
            "research-search"
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


    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.style.marginBottom =
        "25px";


    wrapper.innerHTML = `

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
        wrapper,
        researchList
    );


    const input =
        document.getElementById(
            "research-search"
        );


    input.addEventListener(
        "input",
        event => {

            const query =
                event.target.value
                    .trim()
                    .toLowerCase();


            allResearchSearch =
                query;


            searchRequestId++;


            clearTimeout(
                searchTimer
            );


            if (!query) {

                renderAllLoadedResearch();

                return;

            }


            const requestId =
                searchRequestId;


            searchTimer =
                setTimeout(
                    () => {

                        performSearch(
                            query,
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

async function performSearch(
    query,
    requestId
) {

    if (
        requestId !==
        searchRequestId
    ) {

        return;

    }


    renderSearchResults(
        query
    );


    while (
        allResearchHasMore &&
        requestId ===
            searchRequestId
    ) {

        if (
            hasSearchResult(
                query
            )
        ) {

            break;

        }


        await loadMoreResearch(
            true
        );


        if (
            requestId !==
            searchRequestId
        ) {

            return;

        }


        renderSearchResults(
            query
        );

    }


    renderSearchResults(
        query
    );

}


/* =========================
   SEARCH MATCH
========================= */

function matchesResearch(
    item,
    query
) {

    const research =
        item.research || {};


    const student =
        item.student || {};


    const q =
        String(
            query
        )
            .toLowerCase();


    const title =
        String(
            research.title ||
            ""
        )
            .toLowerCase();


    const researchId =
        String(
            research.id ||
            ""
        )
            .toLowerCase();


    const studentName =
        String(
            student.name ||
            ""
        )
            .toLowerCase();


    const studentId =
        String(
            research.student_id ||
            student.id ||
            ""
        )
            .toLowerCase();


    return (
        title.includes(q) ||
        researchId.includes(q) ||
        studentName.includes(q) ||
        studentId.includes(q)
    );

}


/* =========================
   HAS SEARCH RESULT
========================= */

function hasSearchResult(
    query
) {

    return allResearch.some(
        item =>
            matchesResearch(
                item,
                query
            )
    );

}


/* =========================
   RENDER SEARCH RESULTS
========================= */

function renderSearchResults(
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
                matchesResearch(
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
                    item.id
                )
            ) {

                return;

            }


            seen.add(
                item.id
            );


            renderAllResearchCard(
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


        empty.id =
            "research-search-empty";


        empty.className =
            "load-error";


        empty.innerHTML = `

            <h2>
                Penelitian tidak ditemukan
            </h2>

            <p>
                Tidak ada penelitian yang
                cocok dengan pencarian.
            </p>

        `;


        researchList.appendChild(
            empty
        );

    }

}


/* =========================
   RENDER LOADED
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


    const seen =
        new Set();


    allResearch.forEach(
        item => {

            if (
                seen.has(
                    item.id
                )
            ) {

                return;

            }


            seen.add(
                item.id
            );


            renderAllResearchCard(
                item
            );

        }
    );

}


/* =========================
   ALL RESEARCH CARD
========================= */

function renderAllResearchCard(
    item
) {

    const researchList =
        document.getElementById(
            "research-list"
        );


    if (!researchList)
        return;


    if (
        researchList.querySelector(
            `[data-research-id="${CSS.escape(
                item.id
            )}"]`
        )
    ) {

        return;

    }


    const research =
        item.research || {};


    const student =
        item.student || {};


    const card =
        document.createElement(
            "a"
        );


    card.className =
        "research-card";


    card.dataset.researchId =
        item.id;


    card.href =
        `paper.html?id=${encodeURIComponent(
            item.id
        )}`;


    card.addEventListener(
        "click",
        () => {

            sessionStorage.setItem(
                "paperGeneration",
                String(
                    research.student_id ||
                    ""
                ).substring(
                    0,
                    2
                )
            );

        }
    );


    const type =
        String(
            research.type ||
            ""
        ).toUpperCase();


    const typeName =
        type === "A"
            ? "3S3C"
            : type === "B"
                ? "KTI"
                : (
                    type ||
                    "Penelitian"
                );


    card.innerHTML = `

        <div class="research-card-content">

            <div class="research-type">

                ${escapeHTML(
                    typeName
                )}

            </div>


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

                    NEXUS SAC |
                    ${escapeHTML(
                        student.id ||
                        research.student_id ||
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


    sentinel.style.height =
        "1px";


    sentinel.style.width =
        "100%";


    researchList.parentNode.appendChild(
        sentinel
    );


    allResearchObserver =
        new IntersectionObserver(

            entries => {

                if (
                    entries[0]?.isIntersecting &&
                    !allResearchSearch
                ) {

                    loadMoreResearch();

                }

            },

            {

                rootMargin:
                    "600px 0px"

            }

        );


    allResearchObserver.observe(
        sentinel
    );

}


/* =========================
   FINISH
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
   START
========================= */

loadResearch();