import { createServer, Model } from "miragejs";
import { generateJobs, generateCandidates, generateAssessments } from "./seeds";
import { db } from "../db";

// Utility functions for latency and error simulation
const simulateLatency = () => new Promise(resolve =>
    setTimeout(resolve, Math.random() * 1000 + 200)
);

const shouldSimulateError = () => Math.random() < 0.08; // 8% error rate

const handleError = (response) => {
    if (shouldSimulateError()) {
        response(500, { error: "Internal server error" });
        return true;
    }
    return false;
};

async function loadFromIndexDB(server) {
    try {
        const jobs = await db.jobs.toArray();
        const candidates = await db.candidates.toArray();
        const assessments = await db.assessments.toArray();
        const submissions = await db.submissions.toArray();
        const timeline = await db.timeline.toArray();
        const notes = await db.notes.toArray();

        if (jobs.length) jobs.forEach(j => server.create("job", j));
        if (candidates.length) candidates.forEach(c => server.create("candidate", c));
        if (assessments.length) assessments.forEach(a => server.create("assessment", a));
        if (submissions.length) submissions.forEach(s => server.create("submission", s));
        if (timeline.length) timeline.forEach(t => server.create("timeline", t));
        if (notes.length) notes.forEach(n => server.create("note", n));

        return jobs.length > 0;
    } catch (error) {
        console.error("Error loading from IndexedDB:", error);
        return false;
    }
}

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
            const hasData = await loadFromIndexDB(server);

            if (!hasData) {
                // Only seed if no data exists
                const jobs = generateJobs();
                jobs.forEach(job => {
                    server.create("job", job);
                    db.jobs.put(job);
                });

                const candidates = generateCandidates(1000, jobs);
                candidates.forEach(c => {
                    server.create("candidate", c);
                    db.candidates.put(c);
                });

                const assessments = generateAssessments(jobs);
                assessments.forEach(a => {
                    server.create("assessment", a);
                    db.assessments.put(a);
                });
            }
        },

        routes() {
            this.namespace = "/api";

            // Jobs endpoints with pagination, filtering, and sorting
            this.get("/jobs", async (schema, request) => {
                await simulateLatency();

                const { search, status, page = 1, pageSize = 10, sort = "order" } = request.queryParams;
                let jobs = schema.jobs.all().models;

                // Filtering
                if (search) {
                    jobs = jobs.filter(job =>
                        job.title.toLowerCase().includes(search.toLowerCase()) ||
                        job.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
                    );
                }

                if (status) {
                    jobs = jobs.filter(job => job.status === status);
                }

                // Sorting
                if (sort === "title") {
                    jobs.sort((a, b) => a.title.localeCompare(b.title));
                } else if (sort === "created") {
                    jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                } else {
                    // Default order: active jobs first, then archived, each by order
                    jobs.sort((a, b) => {
                        if (a.status !== b.status) {
                            // active before archived
                            return a.status === 'active' ? -1 : 1;
                        }
                        return a.order - b.order;
                    });
                }

                // Pagination
                const start = (page - 1) * pageSize;
                const end = start + parseInt(pageSize);
                const paginatedJobs = jobs.slice(start, end);

                return {
                    data: paginatedJobs,
                    pagination: {
                        page: parseInt(page),
                        pageSize: parseInt(pageSize),
                        total: jobs.length,
                        totalPages: Math.ceil(jobs.length / pageSize)
                    }
                };
            });

            this.post("/jobs", async (schema, request) => {
                await simulateLatency();

                if (handleError(this)) return;

                const attrs = JSON.parse(request.requestBody);

                // Check for duplicate slug
                const existingJob = schema.jobs.where({ slug: attrs.slug }).models[0];
                if (existingJob) {
                    return this.response(400, { error: "Slug already exists" });
                }

                const job = schema.jobs.create(attrs);
                await db.jobs.put(job.attrs);
                return job;
            });

            this.patch("/jobs/:id", async (schema, request) => {
                await simulateLatency();

                if (handleError(this)) return;

                const id = request.params.id;
                const attrs = JSON.parse(request.requestBody);

                // Check for duplicate slug if slug is being updated
                if (attrs.slug) {
                    const existingJob = schema.jobs.where({ slug: attrs.slug }).models.find(j => j.id !== id);
                    if (existingJob) {
                        return this.response(400, { error: "Slug already exists" });
                    }
                }

                const job = schema.jobs.find(id).update(attrs);
                await db.jobs.put(job.attrs);
                return job;
            });

            this.patch("/jobs/:id/reorder", async (schema, request) => {
                await simulateLatency();

                if (handleError(this)) return;

                const { fromOrder, toOrder } = JSON.parse(request.requestBody);
                const jobs = schema.jobs.all().models;

                // Update order values
                jobs.forEach(job => {
                    if (job.order === fromOrder) {
                        job.update({ order: toOrder });
                    } else if (fromOrder < toOrder && job.order > fromOrder && job.order <= toOrder) {
                        job.update({ order: job.order - 1 });
                    } else if (fromOrder > toOrder && job.order < fromOrder && job.order >= toOrder) {
                        job.update({ order: job.order + 1 });
                    }
                });

                // Update IndexedDB
                for (const job of jobs) {
                    await db.jobs.put(job.attrs);
                }

                return { success: true };
            });

            // Candidates endpoints
            this.get("/candidates", async (schema, request) => {
                await simulateLatency();

                const { search, stage, page = 1, pageSize = 20 } = request.queryParams;
                let candidates = schema.candidates.all().models;

                // Filtering
                if (search) {
                    candidates = candidates.filter(candidate =>
                        candidate.name.toLowerCase().includes(search.toLowerCase()) ||
                        candidate.email.toLowerCase().includes(search.toLowerCase())
                    );
                }

                if (stage) {
                    candidates = candidates.filter(candidate => candidate.stage === stage);
                }

                // Pagination
                const start = (page - 1) * pageSize;
                const end = start + parseInt(pageSize);
                const paginatedCandidates = candidates.slice(start, end);

                return {
                    data: paginatedCandidates,
                    pagination: {
                        page: parseInt(page),
                        pageSize: parseInt(pageSize),
                        total: candidates.length,
                        totalPages: Math.ceil(candidates.length / pageSize)
                    }
                };
            });

            this.post("/candidates", async (schema, request) => {
                await simulateLatency();

                if (handleError(this)) return;

                const attrs = JSON.parse(request.requestBody);
                const candidate = schema.candidates.create(attrs);
                await db.candidates.put(candidate.attrs);
                return candidate;
            });

            this.patch("/candidates/:id", async (schema, request) => {
                await simulateLatency();

                if (handleError(this)) return;

                const id = request.params.id;
                const attrs = JSON.parse(request.requestBody);
                const candidate = schema.candidates.find(id);

                // Create timeline entry for stage changes
                if (attrs.stage && attrs.stage !== candidate.stage) {
                    const timelineEntry = schema.timeline.create({
                        candidateId: id,
                        event: "stage_change",
                        fromStage: candidate.stage,
                        toStage: attrs.stage,
                        timestamp: new Date().toISOString()
                    });
                    await db.timeline.put(timelineEntry.attrs);
                }

                const updatedCandidate = candidate.update(attrs);
                await db.candidates.put(updatedCandidate.attrs);
                return updatedCandidate;
            });

            this.get("/candidates/:id/timeline", async (schema, request) => {
                await simulateLatency();

                const candidateId = request.params.id;
                const timeline = schema.timeline.where({ candidateId: candidateId }).models;
                return timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            });

            // Assessments endpoints
            this.get("/assessments/:jobId", async (schema, request) => {
                await simulateLatency();

                const jobId = request.params.jobId;
                const assessment = schema.assessments.where({ jobId: Number(jobId) }).models[0];

                if (!assessment) {
                    return this.response(404, { error: "Assessment not found" });
                }

                return assessment;
            });

            this.put("/assessments/:jobId", async (schema, request) => {
                await simulateLatency();

                if (handleError(this)) return;

                const jobId = request.params.jobId;
                const attrs = JSON.parse(request.requestBody);

                let assessment = schema.assessments.where({ jobId: Number(jobId) }).models[0];

                if (assessment) {
                    assessment = assessment.update(attrs);
                } else {
                    assessment = schema.assessments.create({ ...attrs, jobId: Number(jobId) });
                }

                await db.assessments.put(assessment.attrs);
                return assessment;
            });

            this.post("/assessments/:jobId/submit", async (schema, request) => {
                await simulateLatency();

                if (handleError(this)) return;

                const jobId = request.params.jobId;
                const data = JSON.parse(request.requestBody);

                const submission = schema.submissions.create({
                    jobId: Number(jobId),
                    candidateId: data.candidateId,
                    responses: data.responses,
                    submittedAt: new Date().toISOString()
                });

                await db.submissions.put(submission.attrs);
                return { status: "submitted", id: submission.id };
            });
        },
    });
}
