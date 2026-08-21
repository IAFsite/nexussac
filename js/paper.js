/* =========================
   GET PARAMETERS
========================= */

const params =
    new URLSearchParams(
        window.location.search
    );


const paperId =
    params.get("id") || "";


/* =========================
   GENERATION
========================= */

/*
 * Generation sekarang OPTIONAL.
 *
 * Prioritas:
 *
 * 1. generation dari URL
 * 2. generation dari sessionStorage
 * 3. generation dari data paper
 */

const generationId =
    params.get("generation") ||
    sessionStorage.getItem(
        "paperGeneration"
    ) ||
    "";


/* =========================
   LOAD PAPER
========================= */

async function loadPaper() {

    /* =========================
       CHECK PAPER ID
    ========================= */

    if (!paperId) {

        showError(
            "Kode penelitian tidak ditemukan."
        );

        return;

    }


    try {

        /* =========================
           FETCH PAPER
        ========================= */

        const result =
            await fetchPaper(
                generationId,
                paperId
            );


        /* =========================
           RENDER
        ========================= */

        renderPaper(
            paperId,
            result.paper,
            result.student,
            result.generation
        );

    }


    catch (error) {

        console.error(
            "Gagal memuat penelitian:",
            error
        );


        showError(
            "Gagal memuat data penelitian: " +
            error.message
        );

    }

}


/* =========================
   RENDER PAPER
========================= */

function renderPaper(
    id,
    paper,
    student,
    generation
) {

    /* =========================
       HEADER
    ========================= */

    const pageTitle =
        document.getElementById(
            "page-title"
        );


    const typeNames = {

        a: "3S3C",

        b: "Laporan",

        A: "3S3C",

        B: "Laporan"

    };


    if (pageTitle) {

        const typeName =
            typeNames[paper.type] ||
            "Penelitian";


        const resolvedGeneration =
            generation?.name ||
            (
                generation?.id
                    ? `ANGKATAN ${generation.id}`
                    : "NEXUS SAC"
            );


        pageTitle.textContent =
            `${typeName} — ${resolvedGeneration}`;

    }


    /* =========================
       DOCUMENT TITLE
    ========================= */

    document.title =
        `${paper.title || "Penelitian"} | Sekolah Alam Cikeas`;


    /* =========================
       TITLE
    ========================= */

    const title =
        document.getElementById(
            "title"
        );


    if (title) {

        title.textContent =
            paper.title ||
            "Tanpa Judul";

    }


    /* =========================
       PAPER ID
    ========================= */

    const paperIdElement =
        document.getElementById(
            "paper-id"
        );


    if (paperIdElement) {

        paperIdElement.textContent =
            id;

    }


    /* =========================
       AUTHOR
    ========================= */

    const author =
        document.getElementById(
            "author"
        );


    if (author) {

        author.textContent =
            student?.name ||
            "-";

    }


    /* =========================
       MENTOR
    ========================= */

    const mentor =
        document.getElementById(
            "mentor"
        );


    if (mentor) {

        mentor.textContent =
            paper.mentor ||
            "-";

    }


    /* =========================
       YEAR
    ========================= */

    const year =
        document.getElementById(
            "year"
        );


    if (year) {

        year.textContent =
            paper.year ||
            "-";

    }


    /* =========================
       CONTENT
    ========================= */

    const contentElement =
        document.getElementById(
            "content"
        );


    if (!contentElement) {

        return;

    }


    const content =
        Array.isArray(paper.content)

            ? paper.content.join("\n")

            : paper.content || "";


    contentElement.innerHTML =
        parseMarkdown(
            content
        );

}


/* =========================
   FILE ASSET
========================= */

function asset(path) {

    return String(
        path || ""
    ).trim();

}


/* =========================
   ESCAPE HTML
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
   INLINE MARKDOWN
========================= */

function parseInline(text) {

    text =
        escapeHTML(text);


    /* =========================
       LINK
    ========================= */

    text =
        text.replace(
            /\[([^\]]+)\]\(([^)]+)\)/g,
            '<a href="$2" target="_blank" rel="noopener">$1</a>'
        );


    /* =========================
       CODE
    ========================= */

    text =
        text.replace(
            /`([^`]+)`/g,
            "<code>$1</code>"
        );


    /* =========================
       BOLD
    ========================= */

    text =
        text.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    /* =========================
       UNDERLINE
    ========================= */

    text =
        text.replace(
            /__(.*?)__/g,
            "<u>$1</u>"
        );


    /* =========================
       ITALIC
    ========================= */

    text =
        text.replace(
            /(?<!\*)\*([^*]+)\*(?!\*)/g,
            "<em>$1</em>"
        );


    /* =========================
       DELETE
    ========================= */

    text =
        text.replace(
            /~~(.*?)~~/g,
            "<del>$1</del>"
        );


    return text;

}


/* =========================
   MARKDOWN
========================= */

function parseMarkdown(
    text = ""
) {

    const lines =
        text.split(
            /\r?\n/
        );


    let html = "";

    let inList = false;

    let listType = null;


    function closeList() {

        if (!inList) {

            return;

        }


        html +=
            listType === "ol"
                ? "</ol>"
                : "</ul>";


        inList = false;

        listType = null;

    }


    for (
        const rawLine
        of lines
    ) {

        const line =
            rawLine.trim();


        /* =========================
           EMPTY
        ========================= */

        if (!line) {

            closeList();

            continue;

        }


        /* =========================
           H1
        ========================= */

        if (
            line.startsWith("#h1")
        ) {

            closeList();


            const value =
                line
                    .replace(
                        "#h1",
                        ""
                    )
                    .trim();


            html += `
                <h1>
                    ${parseInline(value)}
                </h1>
            `;


            continue;

        }


        /* =========================
           H2
        ========================= */

        if (
            line.startsWith("## ")
        ) {

            closeList();


            const value =
                line
                    .replace(
                        /^##\s*/,
                        ""
                    )
                    .trim();


            html += `
                <h2>
                    ${parseInline(value)}
                </h2>
            `;


            continue;

        }


        /* =========================
           H3
        ========================= */

        if (
            line.startsWith("### ")
        ) {

            closeList();


            const value =
                line
                    .replace(
                        /^###\s*/,
                        ""
                    )
                    .trim();


            html += `
                <h3>
                    ${parseInline(value)}
                </h3>
            `;


            continue;

        }


        /* =========================
           SEPARATOR
        ========================= */

        if (
            line === "___"
        ) {

            closeList();

            html += "<hr>";

            continue;

        }


        /* =========================
           IMAGE
        ========================= */

        if (
            line.startsWith("#img")
        ) {

            closeList();


            const src =
                line
                    .replace(
                        "#img",
                        ""
                    )
                    .trim();


            const resolvedGeneration =
                generationId ||
                sessionStorage.getItem(
                    "paperGeneration"
                ) ||
                "";


            const mediaURL =
                getMediaURL(
                    resolvedGeneration,
                    src
                );


            if (mediaURL) {

                html += `
                    <figure class="paper-image">

                        <img
                            src="${escapeHTML(mediaURL)}"
                            loading="lazy"
                            alt="Dokumentasi penelitian">

                    </figure>
                `;

            }


            continue;

        }


        /* =========================
           VIDEO
        ========================= */

        if (
            line.startsWith("#vid")
        ) {

            closeList();


            const src =
                line
                    .replace(
                        "#vid",
                        ""
                    )
                    .trim();


            const resolvedGeneration =
                generationId ||
                sessionStorage.getItem(
                    "paperGeneration"
                ) ||
                "";


            const mediaURL =
                getMediaURL(
                    resolvedGeneration,
                    src
                );


            if (mediaURL) {

                html += `
                    <div class="paper-video">

                        <video
                            controls
                            preload="metadata"
                            src="${escapeHTML(mediaURL)}">
                        </video>

                    </div>
                `;

            }


            continue;

        }


        /* =========================
           FILE
        ========================= */

        if (
            line.startsWith("#file")
        ) {

            closeList();


            const src =
                line
                    .replace(
                        "#file",
                        ""
                    )
                    .trim();


            if (src) {

                const name =
                    src
                        .split("/")
                        .pop();


                html += `
                    <a
                        class="edu-file"
                        href="${escapeHTML(
                            asset(src)
                        )}"
                        target="_blank"
                        rel="noopener">

                        ${parseInline(name)}

                    </a>
                `;

            }


            continue;

        }


        /* =========================
           BULLET
        ========================= */

        if (
            line.startsWith("- ")
        ) {

            if (
                !inList ||
                listType !== "ul"
            ) {

                closeList();

                html += "<ul>";

                inList = true;

                listType = "ul";

            }


            html += `
                <li>
                    ${parseInline(
                        line.substring(2)
                    )}
                </li>
            `;


            continue;

        }


        /* =========================
           NUMBER LIST
        ========================= */

        if (
            /^\d+\.\s/.test(line)
        ) {

            if (
                !inList ||
                listType !== "ol"
            ) {

                closeList();

                html += "<ol>";

                inList = true;

                listType = "ol";

            }


            html += `
                <li>
                    ${parseInline(
                        line.replace(
                            /^\d+\.\s/,
                            ""
                        )
                    )}
                </li>
            `;


            continue;

        }


        /* =========================
           BLOCKQUOTE
        ========================= */

        if (
            line.startsWith(">")
        ) {

            closeList();


            html += `
                <blockquote>
                    ${parseInline(
                        line
                            .substring(1)
                            .trim()
                    )}
                </blockquote>
            `;


            continue;

        }


        /* =========================
           NORMAL TEXT
        ========================= */

        closeList();


        html += `
            <p>
                ${parseInline(line)}
            </p>
        `;

    }


    closeList();


    return html;

}


/* =========================
   ERROR
========================= */

function showError(
    message
) {

    const title =
        document.getElementById(
            "title"
        );


    const content =
        document.getElementById(
            "content"
        );


    if (title) {

        title.textContent =
            "Penelitian tidak dapat dimuat";

    }


    if (content) {

        content.innerHTML = `
            <p class="error-message">
                ${escapeHTML(message)}
            </p>
        `;

    }

}


/* =========================
   START
========================= */

loadPaper();