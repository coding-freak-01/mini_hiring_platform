import { createServer, Model } from "miragejs";
import { generateJobs, generateCandidates, generateAssessments } from "./seeds";

export function makeServer() {
    return createServer({
        models: {
            job: Model,
            candidate: Model,
            assessment: Model,
        },

        seeds(server) {
            // 1. Seed 25 jobs
            const jobs = generateJobs();
            jobs.forEach((job) => server.create("job", job));

            // 2. Seed 1000 candidates across jobs
            const candidates = generateCandidates(1000, jobs);
            candidates.forEach((c) => server.create("candidate", c));

            // 3. Seed 3 assessments linked to jobs
            const assessments = generateAssessments(jobs);
            assessments.forEach((a) => server.create("assessment", a));
        },

        routes() {
            this.namespace = "/api";

            // Jobs
            this.get("/jobs", (schema) => schema.jobs.all());
            this.post("/jobs", (schema, request) => {
                let attrs = JSON.parse(request.requestBody);
                return schema.jobs.create(attrs);
            });
            this.patch("/jobs/:id", (schema, request) => {
                let id = request.params.id;
                let attrs = JSON.parse(request.requestBody);
                return schema.jobs.find(id).update(attrs);
            });

            // Candidates
            this.get("/candidates", (schema) => schema.candidates.all());
            this.post("/candidates", (schema, request) => {
                let attrs = JSON.parse(request.requestBody);
                return schema.candidates.create(attrs);
            });
            this.patch("/candidates/:id", (schema, request) => {
                let id = request.params.id;
                let attrs = JSON.parse(request.requestBody);
                return schema.candidates.find(id).update(attrs);
            });

            // Assessments
            this.get("/assessments/:jobId", (schema, request) => {
                let jobId = request.params.jobId;
                return schema.assessments.where({ jobId: Number(jobId) });
            });
            this.put("/assessments/:jobId", (schema, request) => {
                let jobId = request.params.jobId;
                let attrs = JSON.parse(request.requestBody);
                return schema.assessments.findBy({ jobId: Number(jobId) }).update(attrs);
            });
            this.post("/assessments/:jobId/submit", (schema, request) => {
                // Here you can just return success since it's local only
                return { status: "submitted", data: JSON.parse(request.requestBody) };
            });
        },
    });
}
