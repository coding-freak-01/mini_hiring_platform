import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, User } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import CandidateRow from '../components/CandidateRow'
import useCandidateStore from '../store/useCandidateStore'

const CandidatesList = () => {
    const navigate = useNavigate()
    const { candidates, loading, pagination, fetchCandidates } = useCandidateStore()
    const [search, setSearch] = useState('')
    const [stageFilter, setStageFilter] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    const stages = [
        { value: '', label: 'All Stages' },
        { value: 'applied', label: 'Applied' },
        { value: 'screen', label: 'Screen' },
        { value: 'tech', label: 'Tech' },
        { value: 'offer', label: 'Offer' },
        { value: 'hired', label: 'Hired' },
        { value: 'rejected', label: 'Rejected' }
    ]

    const fetchCandidatesData = useCallback(async () => {
        try {
            await fetchCandidates({
                search,
                stage: stageFilter,
                page: currentPage,
                pageSize: 20
            })
        } catch (error) {
            console.error('Error fetching candidates:', error)
        }
    }, [search, stageFilter, currentPage, fetchCandidates])

    useEffect(() => {
        fetchCandidatesData()
    }, [fetchCandidatesData])

    const handleViewProfile = (candidate) => {
        navigate(`/candidates/${candidate.id}`)
    }

    const clearFilters = () => {
        setSearch('')
        setStageFilter('')
        setCurrentPage(1)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        {pagination.total} candidates found
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Search</label>
                        <div className="relative mt-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Search candidates..."
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Stage</label>
                        <select
                            value={stageFilter}
                            onChange={(e) => setStageFilter(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                            {stages.map((stage) => (
                                <option key={stage.value} value={stage.value}>
                                    {stage.label}
                                </option>
                            ))}
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

            {/* Candidates List */}
            <div className="bg-white shadow rounded-lg">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner />
                    </div>
                ) : candidates.length === 0 ? (
                    <div className="text-center py-12">
                        <User className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                            No candidates found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {search || stageFilter
                                ? 'Try adjusting your filters.'
                                : 'No candidates have applied yet.'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {candidates.map((candidate) => (
                            <CandidateRow
                                key={candidate.id}
                                candidate={candidate}
                                onViewProfile={handleViewProfile}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Page {currentPage} of {pagination.totalPages}
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
                            onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                            disabled={currentPage === pagination.totalPages}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CandidatesList
