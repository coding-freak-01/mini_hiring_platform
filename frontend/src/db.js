import Dexie from "dexie";

export const db = new Dexie("TalentFlowDB");

db.version(1).stores({
    jobs: "id, title, slug, status, tags, order",
    candidates: "id, name, email, jobId, stage",
    assessments: "id, jobId, sections",
    submissions: "id, jobId, candidateId, responses",
    timeline: "id, candidateId, at, from, to, note",
    notes: "id, candidateId, content"
});

