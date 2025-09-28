import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Mail, Calendar, Briefcase, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import useCandidateStore from '../store/useCandidateStore'

const CandidateProfile = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { getCandidateById, fetchCandidateTimeline } = useCandidateStore()

    const [candidate, setCandidate] = useState(null)
    const [timeline, setTimeline] = useState([])
    const [loading, setLoading] = useState(true)
    const [notes, setNotes] = useState([])
    const [newNote, setNewNote] = useState('')

    useEffect(() => {
        fetchCandidateData()
        fetchTimelineData()
    }, [id])

    const fetchCandidateData = () => {
        try {
            const candidateData = getCandidateById(parseInt(id))
            if (candidateData) {
                setCandidate(candidateData)
            } else {
                toast.error('Candidate not found')
                navigate('/candidates')
            }
        } catch {
            toast.error('Failed to fetch candidate')
            navigate('/candidates')
        } finally {
            setLoading(false)
        }
    }

    const fetchTimelineData = async () => {
        try {
            const data = await fetchCandidateTimeline(id)
            setTimeline(data)
        } catch {
            console.error('Failed to fetch timeline')
        }
    }

    const handleAddNote = () => {
        if (!newNote.trim()) return
        const note = {
            id: Date.now(),
            content: newNote,
            createdAt: new Date().toISOString(),
        }
        setNotes([...notes, note])
        setNewNote('')
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <LoadingSpinner />
            </div>
        )
    }

    if (!candidate) {
        return (
            <div className="text-center py-12">
                <User className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Candidate not found</h3>
                <button
                    onClick={() => navigate('/candidates')}
                    className="mt-4 text-blue-600 hover:text-blue-500"
                >
                    Back to candidates
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/candidates')}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
                    <p className="text-sm text-gray-500">Candidate Profile</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Candidate Details */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow p-6 space-y-4">
                        <div className="flex items-center space-x-3">
                            <User className="h-5 w-5 text-gray-400" />
                            <span className="text-sm text-gray-700">{candidate.email}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Briefcase className="h-5 w-5 text-gray-400" />
                            <span className="text-sm text-gray-700">Stage: {candidate.stage}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <span className="text-sm text-gray-700">
                                Applied: {new Date(candidate.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="bg-white rounded-lg shadow p-6 mt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Notes</h3>
                        <div className="flex space-x-2 mb-3">
                            <input
                                type="text"
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Add a note..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                            />
                            <button
                                onClick={handleAddNote}
                                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Add
                            </button>
                        </div>
                        <div className="space-y-2">
                            {notes.map((note) => (
                                <div key={note.id} className="bg-gray-50 p-2 rounded text-sm text-gray-700">
                                    {note.content}
                                </div>
                            ))}
                            {notes.length === 0 && (
                                <p className="text-sm text-gray-500">No notes yet</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Timeline</h3>
                        {timeline.length === 0 ? (
                            <p className="text-sm text-gray-500">No activity yet</p>
                        ) : (
                            <ul className="space-y-3">
                                {timeline.map((event) => (
                                    <li key={event.id} className="flex items-center space-x-3">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-900">{event.event}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(event.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CandidateProfile
