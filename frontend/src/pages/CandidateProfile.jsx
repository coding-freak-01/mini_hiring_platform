import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    ArrowLeft,
    User,
    Mail,
    Calendar,
    Briefcase,
    Clock,
    MessageSquare,
    Plus,
    Send
} from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import useCandidateStore from '../store/useCandidateStore'

const CandidateProfile = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { getCandidateById, fetchCandidateTimeline } = useCandidateStore()
    const [candidate, setCandidate] = useState(null)
    const [timeline, setTimeline] = useState([])
    const [notes, setNotes] = useState([])
    const [loading, setLoading] = useState(true)
    const [newNote, setNewNote] = useState('')
    const [addingNote, setAddingNote] = useState(false)

    useEffect(() => {
        fetchCandidateData()
        fetchTimelineData()
        fetchNotes()
    }, [id])

    const fetchCandidateData = async () => {
        try {
            const candidateData = getCandidateById(parseInt(id))
            if (candidateData) {
                setCandidate(candidateData)
            } else {
                toast.error('Candidate not found')
                navigate('/candidates')
            }
        } catch (error) {
            toast.error('Failed to fetch candidate')
            navigate('/candidates')
        } finally {
            setLoading(false)
        }
    }

    const fetchTimelineData = async () => {
        try {
            const timelineData = await fetchCandidateTimeline(id)
            setTimeline(timelineData)
        } catch (error) {
            console.error('Failed to fetch timeline:', error)
        }
    }

    const fetchNotes = async () => {
        try {
            // For now, we'll simulate notes from localStorage
            const savedNotes = localStorage.getItem(`candidate-${id}-notes`)
            if (savedNotes) {
                setNotes(JSON.parse(savedNotes))
            }
        } catch (error) {
            console.error('Failed to fetch notes:', error)
        }
    }

    const handleAddNote = async () => {
        if (!newNote.trim()) return

        setAddingNote(true)
        try {
            const note = {
                id: Date.now(),
                content: newNote,
                author: 'HR Manager',
                createdAt: new Date().toISOString()
            }

            const updatedNotes = [...notes, note]
            setNotes(updatedNotes)
            localStorage.setItem(`candidate-${id}-notes`, JSON.stringify(updatedNotes))

            setNewNote('')
            toast.success('Note added successfully')
        } catch (error) {
            toast.error('Failed to add note')
        } finally {
            setAddingNote(false)
        }
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

    const formatTimelineEvent = (event) => {
        switch (event.event) {
            case 'stage_change':
                return `Moved from ${event.fromStage} to ${event.toStage}`
            case 'created':
                return 'Candidate applied'
            default:
                return event.event
        }
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
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                                <User className="h-8 w-8 text-gray-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-medium text-gray-900">{candidate.name}</h2>
                                <p className="text-sm text-gray-500">{candidate.email}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <Briefcase className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Current Stage</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(candidate.stage)}`}>
                                        {candidate.stage}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Calendar className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Applied</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(candidate.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Mail className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Email</p>
                                    <p className="text-sm text-gray-500">{candidate.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="bg-white rounded-lg shadow p-6 mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Notes</h3>
                            <button
                                onClick={() => document.getElementById('note-input').focus()}
                                className="text-blue-600 hover:text-blue-500"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex space-x-2">
                                <input
                                    id="note-input"
                                    type="text"
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder="Add a note..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                                />
                                <button
                                    onClick={handleAddNote}
                                    disabled={!newNote.trim() || addingNote}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {notes.map((note) => (
                                    <div key={note.id} className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-start justify-between">
                                            <p className="text-sm text-gray-900">{note.content}</p>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                                            <span>{note.author}</span>
                                            <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                                {notes.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-4">No notes yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-6">Activity Timeline</h3>

                        {timeline.length === 0 ? (
                            <div className="text-center py-8">
                                <Clock className="mx-auto h-8 w-8 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-500">No activity yet</p>
                            </div>
                        ) : (
                            <div className="flow-root">
                                <ul className="-mb-8">
                                    {timeline.map((event, index) => (
                                        <li key={event.id}>
                                            <div className="relative pb-8">
                                                {index !== timeline.length - 1 && (
                                                    <span
                                                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                                        aria-hidden="true"
                                                    />
                                                )}
                                                <div className="relative flex space-x-3">
                                                    <div>
                                                        <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center ring-8 ring-white">
                                                            <Clock className="h-4 w-4 text-blue-600" />
                                                        </span>
                                                    </div>
                                                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                                        <div>
                                                            <p className="text-sm text-gray-900">
                                                                {formatTimelineEvent(event)}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {new Date(event.timestamp).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CandidateProfile
