
import { createServer, Model, Response } from "miragejs"; 
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
            // Restore from IndexedDB if present
            const jobs = await db.jobs.toArray();
            if (jobs.length > 0) {
                jobs.forEach(j => server.create("job", j));
                (await db.candidates.toArray()).forEach(c => server.create("candidate", c));
                (await db.assessments.toArray()).forEach(a => server.create("assessment", a));
                return;
            }

            // Fresh seed
            const jobData = generateJobs();
            jobData.forEach(j => { server.create("job", j); db.jobs.put(j); });

            const candidateData = generateCandidates(1000, jobData);
            candidateData.forEach(c => { server.create("candidate", c); db.candidates.put(c); });

            const assessmentData = generateAssessments(jobData);
            assessmentData.forEach(a => { server.create("assessment", a); db.assessments.put(a); });
        },

        routes() {
            this.namespace = "/api";

            // ---- Jobs ----
            this.get("/jobs", (schema, request) => {
                const page = Number(request.queryParams.page ?? 1);
                const pageSize = Number(request.queryParams.pageSize ?? 10);
                const search = (request.queryParams.search ?? "").toLowerCase();
                const status = request.queryParams.status ?? "";
                const sort = request.queryParams.sort ?? "order";

                let allJobs = schema.jobs.all().models;

                if (search) {
                    allJobs = allJobs.filter(j => j.title.toLowerCase().includes(search));
                }
                if (status) {
                    allJobs = allJobs.filter(j => j.status === status);
                }

                if (sort === "title") {
                    allJobs.sort((a, b) => a.title.localeCompare(b.title));
                } else if (sort === "created") {
                    allJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                } else {
                    allJobs.sort((a, b) => a.order - b.order);
                }

                const total = allJobs.length;
                const totalPages = Math.ceil(total / pageSize);
                const start = (page - 1) * pageSize;
                const paginatedJobs = allJobs.slice(start, start + pageSize);

                return {
                    data: paginatedJobs.map(j => j.attrs),  
                    pagination: {
                        total,
                        totalPages,
                        currentPage: page,
                        pageSize
                    }
                };
            });

            this.post("/jobs", async (schema, req) => {
                await simulateLatency();
                if (Math.random() < 0.08) return new Response(500, {}, { error: "Random error" });

                const attrs = JSON.parse(req.requestBody);
                const exists = schema.jobs.where({ slug: attrs.slug }).models[0];
                if (exists) return new Response(400, {}, { error: "Slug already exists" });

                const job = schema.jobs.create({ ...attrs, createdAt: new Date().toISOString() });
                await db.jobs.put(job.attrs);
                return job.attrs;  
            });

            this.patch("/jobs/:id", async (schema, req) => {
                await simulateLatency();
                if (Math.random() < 0.08) return new Response(500, {}, { error: "Random error" });

                const job = schema.jobs.find(req.params.id).update(JSON.parse(req.requestBody));
                await db.jobs.put(job.attrs);
                return job.attrs;  
            });

            this.patch("/jobs/:id/reorder", async (schema, req) => {
                await simulateLatency();
                if (Math.random() < 0.2) return new Response(500, {}, { error: "Injected 500 for reorder" });

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

            // ---- Candidates ----
            this.get("/candidates", async (schema, req) => {
                await simulateLatency();
                const page = Number(req.queryParams.page ?? 1);
                const pageSize = Number(req.queryParams.pageSize ?? 20);
                const search = (req.queryParams.search ?? "").toLowerCase();
                const stage = req.queryParams.stage ?? "";
                const jobIdParam = req.queryParams.jobId ? Number(req.queryParams.jobId) : null;

                let candidates = schema.candidates.all().models;

                if (search) {
                    candidates = candidates.filter(c =>
                        c.name.toLowerCase().includes(search) ||
                        c.email.toLowerCase().includes(search)
                    );
                }
                if (stage) {
                    candidates = candidates.filter(c => c.stage === stage);
                }
                if (jobIdParam) {
                    candidates = candidates.filter(c => Number(c.jobId) === jobIdParam);
                }

                const total = candidates.length;
                const totalPages = Math.ceil(total / pageSize);
                const start = (page - 1) * pageSize;
                const paginated = candidates.slice(start, start + pageSize);

                return {
                    data: paginated.map(c => c.attrs),
                    pagination: { page, pageSize, total, totalPages }
                };
            });

            this.post("/candidates", async (schema, request) => {
                await simulateLatency();
                if (Math.random() < 0.08) return new Response(500, {}, { error: "Random error" });

                const attrs = JSON.parse(request.requestBody);
                const candidate = schema.candidates.create(attrs);
                await db.candidates.put(candidate.attrs);
                return candidate.attrs;
            });

            this.patch("/candidates/:id", async (schema, req) => {
                await simulateLatency();
                if (Math.random() < 0.08) return new Response(500, {}, { error: "Random error" });

                const id = req.params.id;
                const attrs = JSON.parse(req.requestBody);
                const candidate = schema.candidates.find(id);

                if (attrs.stage && attrs.stage !== candidate.stage) {
                    const entry = schema.timelines.create({
                        id: Date.now(),
                        candidateId: id,
                        from: candidate.stage,
                        to: attrs.stage,
                        timestamp: new Date().toISOString()
                    });
                    await db.timelines.put(entry.attrs);
                }

                const updated = candidate.update(attrs);
                await db.candidates.put(updated.attrs);
                return updated.attrs;
            });

            this.get("/candidates/:id", async (schema, req) => {
                await simulateLatency();
                const candidateId = Number(req.params.id);
                const candidate = schema.candidates.find(candidateId);
                if (!candidate) return new Response(404, {}, { error: "Candidate not found" });
                return candidate.attrs; 
            });

            this.get("/candidates/:id/timeline", async (schema, req) => {
                await simulateLatency();
                const events = schema.timelines.where({ candidateId: req.params.id }).models;
                return events.map(e => e.attrs);
            });

            // ---- Assessments ----
            this.get("/assessments/:jobId", async (schema, req) => {
                await simulateLatency();
                const a = schema.assessments.where({ jobId: Number(req.params.jobId) }).models[0];
                if (!a) return new Response(404, {}, { error: "Assessment not found" });
                return a.attrs; 
            });

            this.put("/assessments/:jobId", async (schema, req) => {
                await simulateLatency();
                if (Math.random() < 0.08) return new Response(500, {}, { error: "Random error" });

                const jobId = Number(req.params.jobId);
                const attrs = JSON.parse(req.requestBody);
                let a = schema.assessments.where({ jobId }).models[0];
                a = a ? a.update(attrs) : schema.assessments.create({ ...attrs, jobId });
                await db.assessments.put(a.attrs);
                return a.attrs; 
            });

            this.post("/assessments/:jobId/submit", async (schema, req) => {
                await simulateLatency();
                if (Math.random() < 0.08) return new Response(500, {}, { error: "Random error" });

                const { candidateId, responses } = JSON.parse(req.requestBody);
                const sub = schema.submissions.create({ id: Date.now(), jobId: Number(req.params.jobId), candidateId, responses });
                await db.submissions.put(sub.attrs);
                return { status: "submitted", id: sub.id };
            });
        },
    });
}
