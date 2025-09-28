import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { apiClient } from "../api/apiClient"
import LoadingSpinner from "../components/LoadingSpinner"

const JobDetail = () => {
    const { jobId } = useParams()
    const [job, setJob] = useState(null)
    const [candidates, setCandidates] = useState([])
    const [assessment, setAssessment] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch job
                const jobRes = await apiClient.get(`/jobs?page=1&pageSize=50`)
                const foundJob = jobRes.data.data.find(j => j.id === Number(jobId))
                if (!foundJob) throw new Error("Job not found")
                setJob(foundJob)

                // 2. Fetch candidates for this job
                const candidateRes = await apiClient.get(`/candidates?page=1&pageSize=50`)
                const jobCandidates = candidateRes.data.data.filter(c => c.jobId === Number(jobId))
                setCandidates(jobCandidates)

                // 3. Fetch assessment for this job
                try {
                    const assessRes = await apiClient.get(`/assessments/${jobId}`)
                    setAssessment(assessRes.data)
                } catch (err) {
                    // no assessment yet
                    setAssessment(null)
                }
            } catch (err) {
                setError(err.message || "Error loading job details")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [jobId])

    if (loading) return <LoadingSpinner />
    if (error) return <p className="text-red-500">{error}</p>

    return (
        <div className="p-6">
            {/* Job Info */}
            <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
            <p className="text-gray-600">Status: {job.status}</p>
            <p className="text-gray-600">Tags: {job.tags?.join(", ")}</p>
            <p className="text-gray-500 text-sm mb-6">
                Created at: {new Date(job.createdAt).toLocaleDateString()}
            </p>

            {/* Candidates */}
            <h2 className="text-2xl font-semibold mb-2">Candidates ({candidates.length})</h2>
            {candidates.length === 0 ? (
                <p className="text-gray-500 mb-4">No candidates yet.</p>
            ) : (
                <ul className="list-disc pl-6 mb-6">
                    {candidates.slice(0, 5).map(c => (
                        <li key={c.id}>
                            {c.name} — {c.stage}
                        </li>
                    ))}
                </ul>
            )}

            {/* Assessment */}
            <h2 className="text-2xl font-semibold mb-2">Assessment</h2>
            {assessment ? (
                <div className="mb-6">
                    <p className="text-gray-700">Sections: {assessment.sections.length}</p>
                    <a
                        href={`/assessments/${job.id}`}
                        className="px-4 py-2 bg-indigo-600 text-white rounded mt-2 inline-block"
                    >
                        Open Builder
                    </a>
                    <a
                        href={`/assessments/${job.id}/take`}
                        className="px-4 py-2 bg-green-600 text-white rounded mt-2 ml-2 inline-block"
                    >
                        Take Assessment
                    </a>
                </div>
            ) : (
                <p className="text-gray-500">No assessment created yet.</p>
            )}

            {/* Apply button */}
            <div>
                <a
                    href={`/jobs/${job.id}/apply`}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    Apply for this Job
                </a>
            </div>
        </div>
    )
}

export default JobDetail
