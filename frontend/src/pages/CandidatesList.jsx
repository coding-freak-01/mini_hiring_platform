import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, User, Mail, Calendar, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import useCandidateStore from '../store/useCandidateStore'

const CandidateRow = ({ candidate, onViewProfile }) => {
  if (!candidate) {
    return (
      <div className="flex items-center justify-center p-4">
        <LoadingSpinner size="sm" />
      </div>
    )
  }

  const getStageColor = (stage) => {
    const colors = {
      applied: 'bg-blue-100 text-blue-800',
      screen: 'bg-yellow-100 text-yellow-800',
      tech: 'bg-purple-100 text-purple-800',
      offer: 'bg-green-100 text-green-800',
      hired: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return colors[stage] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div style={style} className="border-b border-gray-200 hover:bg-gray-50">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              <User className="h-5 w-5 text-gray-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-gray-900 truncate">
                {candidate.name}
              </p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(candidate.stage)}`}>
                {candidate.stage}
              </span>
            </div>
            <div className="flex items-center space-x-4 mt-1">
              <div className="flex items-center text-sm text-gray-500">
                <Mail className="h-4 w-4 mr-1" />
                {candidate.email}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(candidate.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewProfile(candidate)}
            className="text-blue-600 hover:text-blue-900 p-1"
            title="View Profile"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

const CandidatesList = () => {
  const navigate = useNavigate()
  const { candidates, loading, pagination, fetchCandidates, createCandidate } = useCandidateStore()
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
    const params = {
      search,
      stage: stageFilter,
      page: currentPage,
      pageSize: 50 // Larger page size for virtualization
    }

    try {
      await fetchCandidates(params)
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

  const handleApply = async () => {
    try {
      await createCandidate({
        name: 'New Candidate',
        email: 'candidate@example.com',
        stage: 'applied',
        jobId: 1
      })
      toast.success('Application submitted')
      fetchCandidatesData()
    } catch (error) {
      toast.error('Failed to submit application')
    }
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
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={handleApply}
            className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            Simulate Apply
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Search</label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {stages.map(stage => (
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">No candidates found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {search || stageFilter ? 'Try adjusting your filters.' : 'No candidates have applied yet.'}
            </p>
            {search || stageFilter ? (
              <button
                onClick={clearFilters}
                className="mt-4 text-blue-600 hover:text-blue-500"
              >
                Clear filters
              </button>
            ) : (
              <button
                onClick={handleApply}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500"
              >
                Simulate Application
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">
                  {candidates.length} candidates
                </h3>
                <div className="text-sm text-gray-500">
                  Page {currentPage} of {pagination.totalPages}
                </div>
              </div>
            </div>

            <div className="space-y-0">
              {candidates.map((candidate) => (
                <CandidateRow
                  key={candidate.id}
                  candidate={candidate}
                  onViewProfile={handleViewProfile}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {candidates.length} of {pagination.total} candidates
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
              onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
              disabled={currentPage === pagination.totalPages}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
