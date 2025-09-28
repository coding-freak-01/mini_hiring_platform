import Dexie from "dexie";

export const db = new Dexie("TalentFlowDB");

db.version(1).stores({
    jobs: "id, slug, status, order",
    candidates: "id, email, jobId, stage, createdAt",
    assessments: "id, jobId",
    submissions: "id, jobId, candidateId",
    timelines: "id, candidateId, timestamp",
    notes: "id, candidateId"
});