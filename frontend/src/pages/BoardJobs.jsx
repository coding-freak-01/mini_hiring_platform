import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Search, Briefcase } from 'lucide-react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import toast from 'react-hot-toast'
import JobModal from '../components/JobModal'
import LoadingSpinner from '../components/LoadingSpinner'
import useJobStore from '../store/useJobStore'
import useAuthStore from '../store/useAuthStore'
import { apiClient } from '../api/apiClient'
import SortableJobRow from '../components/SortableJobRow'


const BoardJobs = () => {
    const { jobId } = useParams()
    const navigate = useNavigate()
    const { jobs, loading, fetchJobs, createJob, updateJob, reorderJobs } = useJobStore()
    const { isCandidate } = useAuthStore()
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [sortBy, setSortBy] = useState('order')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [showModal, setShowModal] = useState(false)
    const [editingJob, setEditingJob] = useState(null)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const fetchJobsData = useCallback(async () => {
        const effectiveStatus = isCandidate() && !statusFilter ? 'active' : statusFilter
        const params = { search, status: effectiveStatus, page: currentPage, pageSize: 10, sort: sortBy }

        try {
            const res = await fetchJobs(params)
            if (res?.pagination?.totalPages) setTotalPages(res.pagination.totalPages)
        } catch (err) {
            console.error('Error fetching jobs:', err)
        }
    }, [search, statusFilter, currentPage, sortBy, fetchJobs])

    useEffect(() => {
        fetchJobsData()
    }, [fetchJobsData])

    useEffect(() => {
        if (jobId) {
            const job = jobs.find((j) => j.id === parseInt(jobId))
            if (job) {
                setEditingJob(job)
                setShowModal(true)
            }
        }
    }, [jobId, jobs])

    const handleArchiveJob = async (job) => {
        try {
            const newStatus = job.status === 'active' ? 'archived' : 'active'
            await updateJob(job.id, { status: newStatus })
            toast.success(`Job ${newStatus}`)
            fetchJobsData()
        } catch {
            toast.error('Failed to update job')
        }
    }

    const handleDeleteJob = async (job) => {
        if (!confirm('Are you sure you want to delete this job?')) return
        try {
            await apiClient.delete(`/jobs/${job.id}`)
            toast.success('Job deleted')
            fetchJobsData()
        } catch {
            toast.error('Failed to delete job')
        }
    }

    const handleDragEnd = async ({ active, over }) => {
        if (!over || active.id === over.id) return
        const oldIndex = jobs.findIndex((j) => j.id === active.id)
        const newIndex = jobs.findIndex((j) => j.id === over.id)
        if (oldIndex === -1 || newIndex === -1) return
        try {
            await reorderJobs(jobs[oldIndex].order, jobs[newIndex].order)
            toast.success('Jobs reordered successfully')
        } catch {
            toast.error('Reorder failed; reverted.')
        }
    }

    const clearFilters = () => {
        setSearch('')
        setStatusFilter('')
        setCurrentPage(1)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{isCandidate() ? 'Available Jobs' : 'Jobs'}</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        {isCandidate() ? 'Browse and apply for available positions' : 'Manage job postings and track applications'}
                    </p>
                </div>
                {!isCandidate() && (
                    <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                        <button
                            onClick={() => {
                                setEditingJob(null)
                                setShowModal(true)
                            }}
                            className="block rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                        >
                            <Plus className="h-4 w-4 inline mr-2" />
                            Add Job
                        </button>
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Search</label>
                        <div className="relative mt-1">
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

                    {!isCandidate() && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Sort By</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                            <option value="order">Order</option>
                            <option value="title">Title</option>
                            <option value="created">Created Date</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={clearFilters}
                            className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Jobs Table */}
            <div className="bg-white shadow rounded-lg">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner />
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-12">
                        <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {search || statusFilter ? 'Try adjusting your filters.' : 'Get started by creating a new job.'}
                        </p>
                        {!isCandidate() && (
                            <button
                                onClick={() => {
                                    setEditingJob(null)
                                    setShowModal(true)
                                }}
                                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500"
                            >
                                Add Job
                            </button>
                        )}
                    </div>
                ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <SortableContext items={jobs.map((j) => j.id)} strategy={verticalListSortingStrategy}>
                                    {jobs.map((job) => (
                                        <SortableJobRow
                                            key={job.id}
                                            job={job}
                                            onEdit={setEditingJob}
                                            onArchive={handleArchiveJob}
                                            onDelete={handleDeleteJob}
                                            onApply={(j) => navigate(`/jobs/${j.id}/apply`)}
                                            isCandidate={isCandidate()}
                                        />
                                    ))}
                                </SortableContext>
                            </tbody>
                        </table>
                    </DndContext>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Showing page {currentPage} of {totalPages}
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Job Modal */}
            {showModal && (
                <JobModal
                    job={editingJob}
                    onClose={() => {
                        setShowModal(false)
                        setEditingJob(null)
                        if (jobId) navigate('/jobs')
                    }}
                    onSave={() => {
                        setShowModal(false)
                        setEditingJob(null)
                        fetchJobsData()
                    }}
                />
            )}
        </div>
    )
}

export default BoardJobs
