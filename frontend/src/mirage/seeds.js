const stages = ["applied", "screen", "tech", "offer", "hired", "rejected"];

// 25 jobs
export function generateJobs() {
    return Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        title: `Job Title ${i + 1}`,
        slug: `job-title-${i + 1}`,
        status: i % 3 === 0 ? "archived" : "active",
        tags: ["remote", "full-time", "engineering"].slice(0, (i % 3) + 1),
        order: i + 1,
    }));
}

// 1000 candidates
export function generateCandidates(num, jobs) {
    return Array.from({ length: num }, (_, i) => {
        const job = jobs[Math.floor(Math.random() * jobs.length)];
        return {
        id: i + 1,
        name: `Candidate ${i + 1}`,
        email: `candidate${i + 1}@mail.com`,
        jobId: job.id,
        stage: stages[Math.floor(Math.random() * stages.length)],
        };
    });
}

// 3 assessments (with 10 questions each)
export function generateAssessments(jobs) {
    return jobs.slice(0, 3).map((job, index) => ({
        id: index + 1,
        jobId: job.id,
        sections: [
        {
            title: "General Questions",
            questions: Array.from({ length: 10 }, (_, i) => ({
            type: i % 2 === 0 ? "short-text" : "multi-choice",
            label: `Question ${i + 1} for job ${job.title}`,
            options: ["Option A", "Option B", "Option C"],
            })),
        },
        ],
    }));
}
