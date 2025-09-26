import Dexie from "dexie";

export const db = new Dexie("TalentFlowDB");

db.version(1).stores({
    jobs: "id, title, status, slug, order, tags",
    candidates: "id, name, email, jobId, stage, createdAt",
    assessments: "id, jobId, sections, createdAt, updatedAt",
    submissions: "id, jobId, candidateId, responses, submittedAt",
    timeline: "id, candidateId, event, fromStage, toStage, timestamp, notes",
    notes: "id, candidateId, content, author, createdAt"
});
