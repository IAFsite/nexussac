 /* =========================
    NEXUS SAC DATA API
 ========================= */

 const NEXSAC_BASE =
     "https://raw.githubusercontent.com/IAFsite/nexsac/main/data";


 /* =========================
    FETCH RESEARCH
 ========================= */

 async function fetchResearchByGeneration(
     generationId,
     researchType
 ) {

     const response =
         await fetch(
             `${NEXSAC_BASE}/${encodeURIComponent(generationId)}.json`
         );


     if (!response.ok) {

         throw new Error(
             `Data angkatan ${generationId} tidak dapat dimuat (HTTP ${response.status}).`
         );

     }


     const data =
         await response.json();


     const researchList = [];


     for (
         const student
         of data.students || []
     ) {

         for (
             const research
             of student.research || []
         ) {

             if (
                 research.type ===
                 researchType
             ) {

                 researchList.push({

                     research,

                     student

                 });

             }

         }

     }


     return researchList;

 }