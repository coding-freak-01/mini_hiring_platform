import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Archive,
    ArchiveRestore,
    Edit,
    Trash2,
    GripVertical,
    Briefcase
} from 'lucide-react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import toast from 'react-hot-toast'
import JobModal from '../components/JobModal'
import LoadingSpinner from '../components/LoadingSpinner'
import useJobStore from '../store/useJobStore'
import useAuthStore from '../store/useAuthStore'

const SortableJobRow = ({ job, onEdit, onArchive, onDelete, onApply, isCandidate }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: job.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <tr ref={setNodeRef} style={style} className="border-b border-gray-200 hover:bg-gray-50">
            <td className="px-6 py-4">
                <div className="flex items-center">
                    <button
                        {...attributes}
                        {...listeners}
                        className="p-1 text-gray-400 hover:text-gray-600 cursor-grab"
                    >
                        <GripVertical className="h-4 w-4" />
                    </button>
                    <span className="ml-2 text-sm font-medium text-gray-900">{job.title}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${job.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                    }`}>
                    {job.status}
                </span>
            </td>
            <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                    {job.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                            {tag}
                        </span>
                    ))}
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-500">
                {new Date(job.createdAt).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                    {isCandidate ? (
                        <button
                            onClick={() => onApply(job)}
                            className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm"
                        >
                            Apply
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => onEdit(job)}
                                className="text-blue-600 hover:text-blue-900"
                            >
                                <Edit className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => onArchive(job)}
                                className="text-yellow-600 hover:text-yellow-900"
                            >
                                {job.status === 'active' ? <Archive className="h-4 w-4" /> : <ArchiveRestore className="h-4 w-4" />}
                            </button>
                            <button
                                onClick={() => onDelete(job)}
                                className="text-red-600 hover:text-red-900"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </>
                    )}
                </div>
            </td>
        </tr>
    )
}

const BoardJobs = () => {
    const { jobId } = useParams()
    const navigate = useNavigate()
    const { jobs, loading, error, fetchJobs, createJob, updateJob, reorderJobs } = useJobStore()
    const { isCandidate } = useAuthStore()
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [sortBy, setSortBy] = useState('order')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [showModal, setShowModal] = useState(false)
    const [editingJob, setEditingJob] = useState(null)
    const [draggedJob, setDraggedJob] = useState(null)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const fetchJobsData = useCallback(async () => {
        // For candidates, default to showing only active jobs when "All Status" is selected
        const effectiveStatus = isCandidate() && !statusFilter ? 'active' : statusFilter
        const params = {
            search,
            status: effectiveStatus,
            page: currentPage,
            pageSize: 10,
            sort: sortBy
        }

        try {
            await fetchJobs(params)
        } catch (error) {
            console.error('Error fetching jobs:', error)
        }
    }, [search, statusFilter, currentPage, sortBy, fetchJobs])

    useEffect(() => {
        fetchJobsData()
    }, [fetchJobsData])

    useEffect(() => {
        if (jobId) {
            const job = jobs.find(j => j.id === parseInt(jobId))
            if (job) {
                setEditingJob(job)
                setShowModal(true)
            }
        }
    }, [jobId, jobs])

    const handleCreateJob = () => {
        setEditingJob(null)
        setShowModal(true)
    }

    const handleEditJob = (job) => {
        setEditingJob(job)
        setShowModal(true)
    }

    const handleArchiveJob = async (job) => {
        try {
            await updateJob(job.id, { status: job.status === 'active' ? 'archived' : 'active' })
            toast.success(`Job ${job.status === 'active' ? 'archived' : 'restored'}`)
            fetchJobsData()
        } catch (error) {
            toast.error('Failed to update job')
        }
    }

    const handleDeleteJob = async (job) => {
        if (!confirm('Are you sure you want to delete this job?')) return

        try {
            const response = await fetch(`/api/jobs/${job.id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                toast.success('Job deleted')
                fetchJobsData()
            } else {
                toast.error('Failed to delete job')
            }
        } catch (error) {
            toast.error('Failed to delete job')
        }
    }

    const handleApply = (job) => {
        navigate(`/jobs/${job.id}/apply`)
    }

    const handleDragStart = (event) => {
        setDraggedJob(jobs.find(job => job.id === event.active.id))
    }

    const handleDragEnd = async (event) => {
        const { active, over } = event

        if (!over || active.id === over.id) {
            setDraggedJob(null)
            return
        }

        const oldIndex = jobs.findIndex(job => job.id === active.id)
        const newIndex = jobs.findIndex(job => job.id === over.id)

        if (oldIndex === -1 || newIndex === -1) {
            setDraggedJob(null)
            return
        }

        const draggedJob = jobs[oldIndex]
        const targetJob = jobs[newIndex]

        // Optimistic update
        const newJobs = arrayMove(jobs, oldIndex, newIndex)

        try {
            await reorderJobs(draggedJob.order, targetJob.order)
            toast.success('Jobs reordered successfully')
        } catch (error) {
            toast.error('Reorder failed; reverted.')
        } finally {
            setDraggedJob(null)
        }
    }

    const handleJobSaved = () => {
        setShowModal(false)
        setEditingJob(null)
        fetchJobsData()
        if (jobId) {
            navigate('/jobs')
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
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isCandidate() ? 'Available Jobs' : 'Jobs'}
                    </h1>
                    <p className="mt-2 text-sm text-gray-700">
                        {isCandidate()
                            ? 'Browse and apply for available positions'
                            : 'Manage job postings and track applications'
                        }
                    </p>
                </div>
                {!isCandidate() && (
                    <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                        <button
                            onClick={handleCreateJob}
                            className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
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
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Search jobs..."
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Sort By</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
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
                        {search || statusFilter ? (
                            <button
                                onClick={clearFilters}
                                className="mt-4 text-blue-600 hover:text-blue-500"
                            >
                                Clear filters
                            </button>
                        ) : (
                            <button
                                onClick={handleCreateJob}
                                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500"
                            >
                                Add Job
                            </button>
                        )}
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Job Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tags
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <SortableContext items={jobs.map(job => job.id)} strategy={verticalListSortingStrategy}>
                                    {jobs.map((job) => (
                                        <SortableJobRow
                                            key={job.id}
                                            job={job}
                                            onEdit={handleEditJob}
                                            onArchive={handleArchiveJob}
                                            onDelete={handleDeleteJob}
                                            onApply={handleApply}
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
                            className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
                    onSave={handleJobSaved}
                />
            )}
        </div>
    )
}

export default BoardJobs
