import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FileText, Eye, Edit, Search, Briefcase } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import useJobStore from '../store/useJobStore'
import useAssessmentStore from '../store/useAssessmentStore'

const AssessmentsList = () => {
    const navigate = useNavigate()
    const { jobs, loading: jobsLoading, fetchJobs } = useJobStore()
    const { assessments, loading: assessmentsLoading, fetchAssessment } = useAssessmentStore()
    const [search, setSearch] = useState('')
    const [filteredJobs, setFilteredJobs] = useState([])

    const fetchData = useCallback(async () => {
        try {
            await fetchJobs({ pageSize: 1000 })
        } catch (error) {
            console.error('Error fetching jobs:', error)
        }
    }, [fetchJobs])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    useEffect(() => {
        // Filter jobs based on search
        const filtered = jobs.filter(job =>
            job.title.toLowerCase().includes(search.toLowerCase())
        )
        setFilteredJobs(filtered)
    }, [jobs, search])

    const handleCreateAssessment = (jobId) => {
        navigate(`/assessments/${jobId}`)
    }

    const handleViewAssessment = (jobId) => {
        navigate(`/assessments/${jobId}`)
    }

    const handleTakeAssessment = (jobId) => {
        navigate(`/assessments/${jobId}/take`)
    }

    const hasAssessment = (jobId) => {
        return assessments[jobId] && assessments[jobId].sections?.length > 0
    }

    if (jobsLoading) {
        return (
            <div className="flex justify-center py-12">
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Create and manage assessments for job positions
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search jobs..."
                    />
                </div>
            </div>

            {/* Jobs List */}
            <div className="bg-white shadow rounded-lg">
                {filteredJobs.length === 0 ? (
                    <div className="text-center py-12">
                        <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {search ? 'Try adjusting your search.' : 'No jobs available to create assessments for.'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filteredJobs.map((job) => (
                            <div key={job.id} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                                        <div className="mt-1 flex items-center space-x-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${job.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {job.status}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                Created: {new Date(job.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {job.tags && job.tags.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {job.tags.slice(0, 3).map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                                {job.tags.length > 3 && (
                                                    <span className="text-xs text-gray-500">
                                                        +{job.tags.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {hasAssessment(job.id) ? (
                                            <>
                                                <button
                                                    onClick={() => handleViewAssessment(job.id)}
                                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit Assessment
                                                </button>
                                                <button
                                                    onClick={() => handleTakeAssessment(job.id)}
                                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Take Assessment
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => handleCreateAssessment(job.id)}
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Create Assessment
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default AssessmentsList
