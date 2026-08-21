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
   ALL STUDENT CONFIG
========================= */

const ALL_STUDENT_LIMIT = 20;


let allStudentOffset = 0;

let allStudentLoading = false;

let allStudentHasMore = true;

let allStudentObserver = null;

let allStudents = [];

let allStudentSearch = "";


/* =========================
   SEARCH STATE
========================= */

let searchTimer = null;

let searchRequestId = 0;


/* =========================
   LOAD STUDENTS
========================= */

async function loadStudents() {

    /*
     * Ada ?id=
     * → mode angkatan
     */

    if (generationId) {

        await loadGenerationStudents();

        return;

    }


    /*
     * Tidak ada ?id=
     * → ALL STUDENT
     */

    await loadAllStudents();

}


/* =========================
   GENERATION MODE
========================= */

async function loadGenerationStudents() {

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
                    .replace(
                        /^ANGKATAN\s+/i,
                        "ANGKATAN "
                    )
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
            Array.isArray(
                data.students
            )
                ? data.students
                : [];


        if (!studentList)
            return;


        studentList.innerHTML = "";


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
           RENDER
        ========================= */

        students.forEach(
            (
                student,
                index
            ) => {

                renderStudent(
                    student,
                    index,
                    generationId
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
   ALL STUDENT MODE
========================= */

async function loadAllStudents() {

    const generationName =
        document.getElementById(
            "generation-name"
        );


    if (generationName) {

        generationName.textContent =
            "ALL STUDENT";

    }


    document.title =
        "All Student | SMA Sekolah Alam Cikeas";


    createSearchBar();


    await loadMoreAllStudents();


    initializeAllStudentLazyLoading();

}


/* =========================
   FETCH NEXT BATCH
========================= */

async function loadMoreAllStudents(
    fromSearch = false
) {

    if (
        allStudentLoading ||
        !allStudentHasMore
    ) {

        return;

    }


    allStudentLoading = true;


    if (!fromSearch) {

        showLoading();

    }


    try {

        const data =
            await fetchAllStudents(
                ALL_STUDENT_LIMIT,
                allStudentOffset
            );


        const students =
            Array.isArray(
                data.students
            )
                ? data.students
                : [];


        /* =========================
           NO MORE DATA
        ========================= */

        if (
            students.length === 0
        ) {

            allStudentHasMore =
                false;


            if (
                allStudentOffset === 0
            ) {

                showAllStudentEmpty();

            }


            finishAllStudentLoading();

            return;

        }


        const currentOffset =
            allStudentOffset;


        /* =========================
           STORE STUDENTS
        ========================= */

        students.forEach(
            (
                student,
                index
            ) => {

                const studentId =
                    String(
                        student.id ||
                        student.student_id ||
                        ""
                    );


                /*
                 * Jangan masukkan
                 * student duplicate
                 * ke memory.
                 */

                const alreadyExists =
                    allStudents.some(
                        item =>
                            String(
                                item.student.id ||
                                item.student.student_id ||
                                ""
                            ) ===
                            studentId
                    );


                if (
                    studentId &&
                    alreadyExists
                ) {

                    return;

                }


                allStudents.push({

                    student,

                    index:
                        currentOffset +
                        index,

                    generation:
                        student.generation ||
                        student.generation_id ||
                        student.angkatan ||
                        ""

                });

            }
        );


        /* =========================
           UPDATE OFFSET
        ========================= */

        allStudentOffset +=
            students.length;


        /* =========================
           PAGINATION
        ========================= */

        if (
            data.pagination &&
            typeof data.pagination.hasMore ===
                "boolean"
        ) {

            allStudentHasMore =
                data.pagination.hasMore;

        }

        else {

            allStudentHasMore =
                students.length >=
                ALL_STUDENT_LIMIT;

        }


        /* =========================
           RENDER BATCH
        ========================= */

        if (!fromSearch) {

            students.forEach(
                (
                    student,
                    index
                ) => {

                    renderStudent(
                        student,
                        currentOffset + index,
                        student.generation ||
                        student.generation_id ||
                        student.angkatan ||
                        ""
                    );

                }
            );

        }


        if (!allStudentHasMore) {

            finishAllStudentLoading();

        }

    }


    catch (error) {

        console.error(
            "Gagal memuat seluruh data murid:",
            error
        );


        showError(
            error.message
        );

    }


    finally {

        allStudentLoading = false;

    }

}


/* =========================
   SEARCH BAR
========================= */

function createSearchBar() {

    if (
        document.getElementById(
            "student-search-container"
        )
    ) {

        return;

    }


    const studentList =
        document.getElementById(
            "student-list"
        );


    if (!studentList)
        return;


    const container =
        document.createElement(
            "div"
        );


    container.id =
        "student-search-container";


    container.style.marginBottom =
        "25px";


    container.innerHTML = `

        <input
            id="student-search"
            type="search"
            placeholder="Cari nama atau ID murid..."
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


    studentList.parentNode.insertBefore(
        container,
        studentList
    );


    const input =
        document.getElementById(
            "student-search"
        );


    input.addEventListener(
        "input",
        event => {

            const value =
                event.target.value
                    .trim()
                    .toLowerCase();


            allStudentSearch =
                value;


            /*
             * Invalidate search lama.
             */

            searchRequestId++;


            clearTimeout(
                searchTimer
            );


            /*
             * Search kosong.
             */

            if (!value) {

                renderAllLoadedStudents();

                return;

            }


            const requestId =
                searchRequestId;


            /*
             * Debounce.
             */

            searchTimer =
                setTimeout(
                    () => {

                        performSearch(
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
   PERFORM SEARCH
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


    /*
     * Sudah ketemu.
     */

    if (
        hasSearchResult(
            query
        )
    ) {

        return;

    }


    /*
     * Ambil batch sampai
     * ketemu atau habis.
     */

    while (
        allStudentHasMore &&
        requestId ===
            searchRequestId
    ) {

        await loadMoreAllStudents(
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


        if (
            hasSearchResult(
                query
            )
        ) {

            return;

        }

    }


    if (
        requestId ===
        searchRequestId
    ) {

        renderSearchResults(
            query
        );

    }

}


/* =========================
   CHECK SEARCH RESULT
========================= */

function hasSearchResult(
    query
) {

    const normalizedQuery =
        String(
            query || ""
        )
            .trim()
            .toLowerCase();


    if (!normalizedQuery) {

        return true;

    }


    return allStudents.some(
        item => {

            const student =
                item.student;


            const name =
                String(
                    student.name ||
                    ""
                )
                    .toLowerCase();


            const id =
                String(
                    student.id ||
                    student.student_id ||
                    ""
                )
                    .toLowerCase();


            return (
                name.includes(
                    normalizedQuery
                ) ||
                id.includes(
                    normalizedQuery
                )
            );

        }
    );

}


/* =========================
   RENDER SEARCH RESULTS
========================= */

function renderSearchResults(
    query
) {

    const studentList =
        document.getElementById(
            "student-list"
        );


    if (!studentList)
        return;


    /*
     * Hapus semua card.
     */

    studentList
        .querySelectorAll(
            ".student-card"
        )
        .forEach(
            card =>
                card.remove()
        );


    const oldEmpty =
        document.getElementById(
            "student-search-empty"
        );


    if (oldEmpty) {

        oldEmpty.remove();

    }


    const normalizedQuery =
        String(
            query || ""
        )
            .trim()
            .toLowerCase();


    if (!normalizedQuery) {

        renderAllLoadedStudents();

        return;

    }


    const results =
        allStudents.filter(
            item => {

                const student =
                    item.student;


                const name =
                    String(
                        student.name ||
                        ""
                    )
                        .toLowerCase();


                const id =
                    String(
                        student.id ||
                        student.student_id ||
                        ""
                    )
                        .toLowerCase();


                return (
                    name.includes(
                        normalizedQuery
                    ) ||
                    id.includes(
                        normalizedQuery
                    )
                );

            }
        );


    /*
     * Deduplicate hasil search.
     */

    const uniqueResults = [];

    const seenIds =
        new Set();


    results.forEach(
        item => {

            const id =
                String(
                    item.student.id ||
                    item.student.student_id ||
                    ""
                );


            if (
                id &&
                seenIds.has(id)
            ) {

                return;

            }


            if (id) {

                seenIds.add(id);

            }


            uniqueResults.push(
                item
            );

        }
    );


    /* =========================
       NO RESULT
    ========================= */

    if (
        uniqueResults.length === 0 &&
        !allStudentHasMore
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "load-error";


        empty.id =
            "student-search-empty";


        empty.innerHTML = `

            <h2>
                Murid tidak ditemukan
            </h2>

            <p>
                Tidak ada murid dengan nama
                atau ID tersebut.
            </p>

        `;


        studentList.prepend(
            empty
        );


        return;

    }


    /* =========================
       RENDER
    ========================= */

    uniqueResults.forEach(
        item => {

            renderStudent(
                item.student,
                item.index,
                item.generation
            );

        }
    );

}


/* =========================
   RENDER ALL LOADED
========================= */

function renderAllLoadedStudents() {

    const studentList =
        document.getElementById(
            "student-list"
        );


    if (!studentList)
        return;


    studentList
        .querySelectorAll(
            ".student-card"
        )
        .forEach(
            card =>
                card.remove()
        );


    const empty =
        document.getElementById(
            "student-search-empty"
        );


    if (empty) {

        empty.remove();

    }


    /*
     * Deduplicate sebelum render.
     */

    const seenIds =
        new Set();


    allStudents.forEach(
        item => {

            const id =
                String(
                    item.student.id ||
                    item.student.student_id ||
                    ""
                );


            if (
                id &&
                seenIds.has(id)
            ) {

                return;

            }


            if (id) {

                seenIds.add(id);

            }


            renderStudent(
                item.student,
                item.index,
                item.generation
            );

        }
    );

}


/* =========================
   RENDER STUDENT
========================= */

function renderStudent(
    student,
    index,
    studentGeneration
) {

    const studentList =
        document.getElementById(
            "student-list"
        );


    if (!studentList)
        return;


    const studentId =
        String(
            student.id ||
            student.student_id ||
            ""
        );


    /*
     * HARD DOM DEDUP
     *
     * Kalau card dengan ID ini
     * sudah ada, jangan buat lagi.
     */

    if (studentId) {

        const existing =
            studentList.querySelector(
                `[data-student-id="${CSS.escape(
                    studentId
                )}"]`
            );


        if (existing) {

            return;

        }

    }


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
            studentGeneration,
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


    if (studentId) {

        card.dataset.studentId =
            studentId;

    }


    card.href =
        `profile.html?id=${encodeURIComponent(
            studentId
        )}&generation=${encodeURIComponent(
            studentGeneration
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
                    studentId ||
                    "-"
                )}

            </div>

        </div>

    `;


    studentList.appendChild(
        card
    );

}


/* =========================
   LAZY LOADING
========================= */

function initializeAllStudentLazyLoading() {

    if (
        !allStudentHasMore
    ) {

        return;

    }


    const studentList =
        document.getElementById(
            "student-list"
        );


    if (!studentList)
        return;


    if (
        document.getElementById(
            "all-student-sentinel"
        )
    ) {

        return;

    }


    const sentinel =
        document.createElement(
            "div"
        );


    sentinel.id =
        "all-student-sentinel";


    sentinel.style.width =
        "100%";


    sentinel.style.height =
        "1px";


    sentinel.style.marginTop =
        "20px";


    studentList.parentNode.appendChild(
        sentinel
    );


    allStudentObserver =
        new IntersectionObserver(

            entries => {

                if (
                    entries[0] &&
                    entries[0].isIntersecting
                ) {

                    /*
                     * Search aktif:
                     * jangan lazy-load dari
                     * scroll.
                     */

                    if (
                        !allStudentSearch
                    ) {

                        loadMoreAllStudents();

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


    allStudentObserver.observe(
        sentinel
    );

}


/* =========================
   LOADING
========================= */

function showLoading() {

    let loader =
        document.getElementById(
            "all-student-loading"
        );


    if (!loader) {

        loader =
            document.createElement(
                "div"
            );


        loader.id =
            "all-student-loading";


        loader.style.textAlign =
            "center";


        loader.style.padding =
            "20px";


        const studentList =
            document.getElementById(
                "student-list"
            );


        if (studentList) {

            studentList.parentNode.appendChild(
                loader
            );

        }

    }


    loader.textContent =
        "Memuat siswa...";

}


/* =========================
   FINISH LOADING
========================= */

function finishAllStudentLoading() {

    const loader =
        document.getElementById(
            "all-student-loading"
        );


    if (loader) {

        loader.textContent =
            "Semua siswa telah dimuat.";

    }


    if (allStudentObserver) {

        allStudentObserver.disconnect();

        allStudentObserver = null;

    }

}


/* =========================
   EMPTY STATE
========================= */

function showAllStudentEmpty() {

    const studentList =
        document.getElementById(
            "student-list"
        );


    if (!studentList)
        return;


    studentList.innerHTML = `

        <div class="load-error">

            <h2>
                Belum ada data murid
            </h2>

            <p>
                Belum ada siswa yang tersedia
                di NEXUS SAC.
            </p>

        </div>

    `;

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

loadStudents();