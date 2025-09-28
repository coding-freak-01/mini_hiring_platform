// src/seeds.js
const stages = ["applied", "screen", "tech", "offer", "hired", "rejected"];

const jobTitles = [
    "Senior Frontend Developer", "Full Stack Engineer", "React Developer",
    "Node.js Developer", "Python Developer", "DevOps Engineer", "UI/UX Designer",
    "Product Manager", "Data Scientist", "Machine Learning Engineer",
    "Backend Developer", "Mobile App Developer", "QA Engineer", "Technical Lead",
    "Software Architect", "Cloud Engineer", "Security Engineer",
    "Database Administrator", "System Administrator", "Business Analyst",
    "Project Manager", "Scrum Master", "Technical Writer", "Sales Engineer",
    "Customer Success Manager"
];

const candidateNames = [
    "Alex Johnson", "Sarah Chen", "Michael Rodriguez", "Emily Davis", "David Kim",
    "Lisa Wang", "James Brown", "Maria Garcia", "Robert Taylor", "Jennifer Lee",
    "Christopher Wilson", "Amanda Martinez", "Daniel Anderson", "Jessica Thompson",
    "Matthew White", "Ashley Jackson", "Andrew Harris", "Stephanie Clark",
    "Ryan Lewis", "Nicole Walker", "Kevin Hall", "Rachel Green", "Brandon Adams",
    "Samantha Turner", "Justin Scott"
];

const tags = [
    "remote", "full-time", "part-time", "contract", "senior", "junior",
    "mid-level", "frontend", "backend", "full-stack", "react", "node", "python",
    "javascript", "typescript", "aws", "docker", "kubernetes", "agile",
    "startup", "enterprise"
];

// ---- Jobs ----
export function generateJobs() {
    const usedSlugs = new Set();

    return Array.from({ length: 25 }, (_, i) => {
        let slug = jobTitles[i].toLowerCase().replace(/[^a-z0-9]+/g, "-");
        // Ensure unique slug
        if (usedSlugs.has(slug)) slug = `${slug}-${i}`;
        usedSlugs.add(slug);

        return {
            id: i + 1,
            title: jobTitles[i],
            slug,
            status: Math.random() < 0.3 ? "archived" : "active",
            tags: tags.slice(i % 5, (i % 5) + 3),
            order: i + 1,
            createdAt: new Date().toISOString(),
        };
    });
}

// ---- Candidates ----
export function generateCandidates(num, jobs) {
    return Array.from({ length: num }, (_, i) => {
        const job = jobs[Math.floor(Math.random() * jobs.length)];
        const nameIndex = i % candidateNames.length;
        const [firstName, lastName] = candidateNames[nameIndex].split(" ");

        return {
            id: i + 1,
            name: `${firstName} ${lastName}${i >= candidateNames.length ? ` ${Math.floor(i / candidateNames.length) + 1}` : ""}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i >= candidateNames.length ? Math.floor(i / candidateNames.length) + 1 : ""}@email.com`,
            jobId: job.id,
            stage: stages[Math.floor(Math.random() * stages.length)],
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        };
    });
}

// ---- Assessments ----
export function generateAssessments(jobs) {
    const questionTypes = [
        { type: "short-text", label: "What is your experience with this technology?" },
        { type: "long-text", label: "Describe a challenging project you worked on" },
        { type: "single-choice", label: "How many years of experience do you have?", options: ["0-1", "2-3", "4-5", "5+"] },
        { type: "multi-choice", label: "Which technologies are you familiar with?", options: ["React", "Vue", "Angular", "Node.js", "Python", "Java"] },
        { type: "numeric", label: "Rate your proficiency (1-10)", min: 1, max: 10 },
        { type: "file-upload", label: "Upload your portfolio or resume" }
    ];

    return jobs.slice(0, 5).map((job, jobIndex) => ({
        id: jobIndex + 1,
        jobId: job.id,
        sections: [
            {
                id: `section-${jobIndex}-1`,
                title: "Technical Skills",
                questions: Array.from({ length: 8 }, (_, qIndex) => {
                    const qType = questionTypes[qIndex % questionTypes.length];
                    return {
                        id: `job${jobIndex}-q${qIndex}`,
                        type: qType.type,
                        label: qType.label,
                        required: qIndex < 3,
                        options: qType.options || null,
                        min: qType.min,
                        max: qType.max,
                        maxLength: 500,
                        conditional: qIndex === 5
                            ? {
                                dependsOn: `job${jobIndex}-q3`,
                                condition: "includes",
                                value: "React"
                            }
                            : null
                    };
                })
            },
            {
                id: `section-${jobIndex}-2`,
                title: "Behavioral Questions",
                questions: Array.from({ length: 4 }, (_, i) => ({
                    id: `job${jobIndex}-q${i + 8}`,
                    type: "long-text",
                    label: `Describe a time when you had to ${[
                        "solve a complex problem",
                        "work with a difficult team member",
                        "learn a new technology quickly",
                        "meet a tight deadline"
                    ][i]}`,
                    required: true,
                    maxLength: 1000
                }))
            }
        ]
    }));
}
