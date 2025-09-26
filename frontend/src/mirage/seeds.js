const stages = ["applied", "screen", "tech", "offer", "hired", "rejected"];

const jobTitles = [
    "Senior Frontend Developer", "Full Stack Engineer", "React Developer", "Node.js Developer",
    "Python Developer", "DevOps Engineer", "UI/UX Designer", "Product Manager", "Data Scientist",
    "Machine Learning Engineer", "Backend Developer", "Mobile App Developer", "QA Engineer",
    "Technical Lead", "Software Architect", "Cloud Engineer", "Security Engineer", "Database Administrator",
    "System Administrator", "Business Analyst", "Project Manager", "Scrum Master", "Technical Writer",
    "Sales Engineer", "Customer Success Manager"
];

const candidateNames = [
    "Alex Johnson", "Sarah Chen", "Michael Rodriguez", "Emily Davis", "David Kim",
    "Lisa Wang", "James Brown", "Maria Garcia", "Robert Taylor", "Jennifer Lee",
    "Christopher Wilson", "Amanda Martinez", "Daniel Anderson", "Jessica Thompson", "Matthew White",
    "Ashley Jackson", "Andrew Harris", "Stephanie Clark", "Ryan Lewis", "Nicole Walker",
    "Kevin Hall", "Rachel Green", "Brandon Adams", "Samantha Turner", "Justin Scott"
];

const tags = [
    "remote", "full-time", "part-time", "contract", "senior", "junior", "mid-level",
    "frontend", "backend", "full-stack", "react", "node", "python", "javascript",
    "typescript", "aws", "docker", "kubernetes", "agile", "startup", "enterprise"
];

// 25 realistic jobs
export function generateJobs() {
    return Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        title: jobTitles[i],
        slug: jobTitles[i].toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        status: i % 4 === 0 ? "archived" : "active",
        tags: tags.slice(i % 5, (i % 5) + 3),
        order: i + 1,
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    }));
}

// 1000 realistic candidates
export function generateCandidates(num, jobs) {
    return Array.from({ length: num }, (_, i) => {
        const job = jobs[Math.floor(Math.random() * jobs.length)];
        const nameIndex = i % candidateNames.length;
        const firstName = candidateNames[nameIndex].split(' ')[0];
        const lastName = candidateNames[nameIndex].split(' ')[1];
        
        return {
            id: i + 1,
            name: `${firstName} ${lastName}${i >= candidateNames.length ? ` ${Math.floor(i / candidateNames.length) + 1}` : ''}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i >= candidateNames.length ? Math.floor(i / candidateNames.length) + 1 : ''}@email.com`,
            jobId: job.id,
            stage: stages[Math.floor(Math.random() * stages.length)],
            createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        };
    });
}

// Enhanced assessments with multiple question types
export function generateAssessments(jobs) {
    const questionTypes = [
        { type: "short-text", label: "What is your experience with this technology?" },
        { type: "long-text", label: "Describe a challenging project you worked on" },
        { type: "single-choice", label: "How many years of experience do you have?", options: ["0-1", "2-3", "4-5", "5+"] },
        { type: "multi-choice", label: "Which technologies are you familiar with?", options: ["React", "Vue", "Angular", "Node.js", "Python", "Java"] },
        { type: "numeric", label: "Rate your proficiency (1-10)", min: 1, max: 10 },
        { type: "file-upload", label: "Upload your portfolio or resume" }
    ];

    return jobs.slice(0, 5).map((job, index) => ({
        id: index + 1,
        jobId: job.id,
        sections: [
            {
                id: `section-${index}-1`,
                title: "Technical Skills",
                questions: Array.from({ length: 8 }, (_, i) => ({
                    id: `q-${index}-${i}`,
                    type: questionTypes[i % questionTypes.length].type,
                    label: questionTypes[i % questionTypes.length].label,
                    required: i < 3,
                    options: questionTypes[i % questionTypes.length].options,
                    min: questionTypes[i % questionTypes.length].min,
                    max: questionTypes[i % questionTypes.length].max,
                    maxLength: 500,
                    conditional: i > 2 ? {
                        dependsOn: `q-${index}-${i-1}`,
                        condition: "equals",
                        value: "Yes"
                    } : null
                }))
            },
            {
                id: `section-${index}-2`,
                title: "Behavioral Questions",
                questions: Array.from({ length: 4 }, (_, i) => ({
                    id: `q-${index}-${i + 8}`,
                    type: "long-text",
                    label: `Describe a time when you had to ${["solve a complex problem", "work with a difficult team member", "learn a new technology quickly", "meet a tight deadline"][i]}`,
                    required: true,
                    maxLength: 1000
                }))
            }
        ],
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
    }));
}
