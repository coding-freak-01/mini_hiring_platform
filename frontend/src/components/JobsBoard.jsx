import { useEffect } from "react";
import useJobStore from "../store/useJobStore";

export default function JobsBoard() {
    const { jobs, loading, error, fetchJobs, createJob } = useJobStore();

    useEffect(() => {
        fetchJobs({ page: 1, pageSize: 10 });
    }, []);

    if (loading) return <p className="text-blue-500">Loading jobs...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-2">Jobs</h2>
            <ul className="space-y-1">
                {jobs.map((job) => (
                    <li key={job.id} className="border p-2 rounded">
                        {job.title} <span className="text-gray-500">({job.status})</span>
                    </li>
                ))}
            </ul>

            <button
                onClick={() =>
                    createJob({
                        id: Date.now(),
                        title: "New React Developer",
                        slug: `react-dev-${Date.now()}`,
                        status: "active",
                        tags: ["remote"],
                        order: jobs.length + 1,
                    })
                }
                className="mt-4 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
                Add Job
            </button>
        </div>
    );
}
