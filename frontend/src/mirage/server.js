import { createServer, Model } from "miragejs";
import { generateJobs, generateCandidates, generateAssessments } from "./seeds";
import { db } from "../db";

const simulateLatency = () =>
    new Promise(res => setTimeout(res, Math.random() * 1000 + 200));

export function makeServer() {
    return createServer({
        models: {
            job: Model,
            candidate: Model,
            assessment: Model,
            submission: Model,
            timeline: Model,
            note: Model,
        },

        seeds: async (server) => {
            // lets first check does indexedDB already have data?
            const jobs = await db.jobs.toArray();
            if (jobs.length > 0) {
                jobs.forEach(j => server.create("job", j));
                (await db.candidates.toArray()).forEach(c => server.create("candidate", c));
                (await db.assessments.toArray()).forEach(a => server.create("assessment", a));
                return;
            }

            const jobData = generateJobs();
            jobData.forEach(j => { server.create("job", j); db.jobs.put(j); });

            const candidateData = generateCandidates(1000, jobData);
            candidateData.forEach(c => { server.create("candidate", c); db.candidates.put(c); });

            const assessmentData = generateAssessments(jobData);
            assessmentData.forEach(a => { server.create("assessment", a); db.assessments.put(a); });
        },

        routes() {
            this.namespace = "/api";

            // Jobs
            this.get("/jobs", async (schema, req) => {
                await simulateLatency();
                const { search, status, page = 1, pageSize = 10 } = req.queryParams;
                let jobs = schema.jobs.all().models;

                if (search) {
                    jobs = jobs.filter(j =>
                        j.title.toLowerCase().includes(search.toLowerCase()) ||
                        j.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
                    );
                }

                if (status) jobs = jobs.filter(j => j.status === status);

                const start = (page - 1) * pageSize;
                const data = jobs.slice(start, start + +pageSize);

                return { data, pagination: { page: +page, pageSize: +pageSize, total: jobs.length } };
            });

            this.post("/jobs", async (schema, req) => {
                await simulateLatency();

                // artificial network delay
                if (Math.random() < 0.08) return this.response(500, { error: "Random error" });

                const attrs = JSON.parse(req.requestBody);
                const exists = schema.jobs.where({ slug: attrs.slug }).models[0];

                if (exists) return this.response(400, { error: "Slug already exists" });

                const job = schema.jobs.create(attrs); // updates the mirage in memory model
                await db.jobs.put(job.attrs); // saves the updated data into indexedDB
                return job;
            });

            this.patch("/jobs/:id", async (schema, req) => {
                await simulateLatency();
                if (Math.random() < 0.08) return this.response(500, { error: "Random error" });

                const job = schema.jobs.find(req.params.id).update(JSON.parse(req.requestBody));
                await db.jobs.put(job.attrs);
                return job;
            });

            this.patch("/jobs/:id/reorder", async (schema, req) => {
                await simulateLatency();
                if (Math.random() < 0.2) return this.response(500, { error: "Injected 500 for reorder" });

                const { fromOrder, toOrder } = JSON.parse(req.requestBody);
                const jobs = schema.jobs.all().models;

                jobs.forEach(j => {
                    if (j.order === fromOrder) j.update({ order: toOrder });
                    else if (fromOrder < toOrder && j.order > fromOrder && j.order <= toOrder) j.update({ order: j.order - 1 });
                    else if (fromOrder > toOrder && j.order < fromOrder && j.order >= toOrder) j.update({ order: j.order + 1 });
                    db.jobs.put(j.attrs);
                });

                return { success: true };
            });

            // Candidates
            this.get("/candidates", async (schema, req) => {
                await simulateLatency();
                const { search, stage, page = 1, pageSize = 20 } = req.queryParams;
                let candidates = schema.candidates.all().models;

                if (search) {
                    candidates = candidates.filter(c =>
                        c.name.toLowerCase().includes(search.toLowerCase()) ||
                        c.email.toLowerCase().includes(search.toLowerCase())
                    );
                }
                if (stage) candidates = candidates.filter(c => c.stage === stage);

                const start = (page - 1) * pageSize;
                const data = candidates.slice(start, start + +pageSize);

                return { data, pagination: { page: +page, pageSize: +pageSize, total: candidates.length } };
            });

            this.post("/candidates", async (schema, request) => {
                await simulateLatency();
            
                if (Math.random() < 0.08) return this.response(500, { error: "Random error" });
            
                const attrs = JSON.parse(request.requestBody);

                const candidate = schema.candidates.create(attrs);
                await db.candidates.put(candidate.attrs);
                return candidate;
            });
            

            this.patch("/candidates/:id", async (schema, req) => {
                await simulateLatency();
                if (Math.random() < 0.08) return this.response(500, { error: "Random error" });

                const id = req.params.id;
                const attrs = JSON.parse(req.requestBody);
                const candidate = schema.candidates.find(id);

                if (attrs.stage && attrs.stage !== candidate.stage) {
                    const entry = schema.timeline.create({
                        id: Date.now(),
                        candidateId: id,
                        from: candidate.stage,
                        to: attrs.stage
                    });
                    await db.timeline.put(entry.attrs);
                }

                const updated = candidate.update(attrs);
                await db.candidates.put(updated.attrs);
                return updated;
            });

            this.get("/candidates/:id/timeline", async (schema, req) => {
                await simulateLatency();
                return schema.timeline.where({ candidateId: req.params.id }).models;
            });

            // Assessments
            this.get("/assessments/:jobId", async (schema, req) => {
                await simulateLatency();
                return schema.assessments.where({ jobId: +req.params.jobId }).models[0] || this.response(404);
            });

            this.put("/assessments/:jobId", async (schema, req) => {
                await simulateLatency();
                if (Math.random() < 0.08) return this.response(500, { error: "Random error" });

                const jobId = +req.params.jobId;
                const attrs = JSON.parse(req.requestBody);
                let a = schema.assessments.where({ jobId }).models[0];
                a = a ? a.update(attrs) : schema.assessments.create({ ...attrs, jobId });
                await db.assessments.put(a.attrs);
                return a;
            });

            this.post("/assessments/:jobId/submit", async (schema, req) => {
                await simulateLatency();
                if (Math.random() < 0.08) return this.response(500, { error: "Random error" });

                const { candidateId, responses } = JSON.parse(req.requestBody);
                const sub = schema.submissions.create({ id: Date.now(), jobId: +req.params.jobId, candidateId, responses });
                await db.submissions.put(sub.attrs);
                return { status: "submitted", id: sub.id };
            });
        },
    });
}
