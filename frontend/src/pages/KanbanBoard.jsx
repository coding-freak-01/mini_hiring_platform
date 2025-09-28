// pages/KanbanBoard.jsx
import React, { useState, useEffect, useCallback } from 'react'
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { User } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'
import useCandidateStore from '../store/useCandidateStore'
import StageColumn from '../components/StageColumn'

const stages = [
    { id: 'applied', title: 'Applied', color: 'bg-blue-100 border-blue-200' },
    { id: 'screen', title: 'Screen', color: 'bg-yellow-100 border-yellow-200' },
    { id: 'tech', title: 'Tech', color: 'bg-purple-100 border-purple-200' },
    { id: 'offer', title: 'Offer', color: 'bg-green-100 border-green-200' },
    { id: 'hired', title: 'Hired', color: 'bg-emerald-100 border-emerald-200' },
    { id: 'rejected', title: 'Rejected', color: 'bg-red-100 border-red-200' }
]

const KanbanBoard = () => {
    const { candidates, loading, fetchCandidates, updateCandidate, getCandidatesByStage } =
        useCandidateStore()
    const [activeCandidate, setActiveCandidate] = useState(null)
    const navigate = useNavigate()

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const fetchCandidatesData = useCallback(async () => {
        await fetchCandidates({ pageSize: 1000 })
    }, [fetchCandidates])

    useEffect(() => {
        fetchCandidatesData()
    }, [fetchCandidatesData])

    const handleDragStart = (event) => {
        const candidate = candidates.find((c) => c.id === event.active.id)
        setActiveCandidate(candidate)
    }

    const handleDragEnd = async ({ active, over }) => {
        if (!over || active.id === over.id) return

        const candidate = candidates.find((c) => c.id === active.id)
        if (!candidate) return

        // Check if dropped on a stage column (over.id is a stage) or on another candidate
        let newStage = over.id
        
        // If dropped on another candidate, get the stage of that candidate
        const targetCandidate = candidates.find((c) => c.id === over.id)
        if (targetCandidate) {
            newStage = targetCandidate.stage
        }

        // Check if it's a valid stage
        const validStages = stages.map(s => s.id)
        if (!validStages.includes(newStage)) return

        if (candidate.stage === newStage) return

        try {
            await updateCandidate(active.id, { stage: newStage })
            toast.success('Candidate moved successfully')
        } catch {
            toast.error('Failed to update candidate stage')
        } finally {
            setActiveCandidate(null)
        }
    }

    const handleViewProfile = (candidate) => navigate(`/candidates/${candidate.id}`)

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Candidate Pipeline</h1>
                <p className="mt-2 text-sm text-gray-700">
                    Drag and drop candidates between stages to update their status
                </p>
            </div>

            {/* Kanban Board */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={candidates.map(c => c.id)}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                        {stages.map((stage) => (
                            <StageColumn
                                key={stage.id}
                                stage={stage}
                                candidates={getCandidatesByStage(stage.id)}
                                onViewProfile={handleViewProfile}
                            />
                        ))}
                    </div>
                </SortableContext>

                <DragOverlay>
                    {activeCandidate && (
                        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 opacity-90">
                            <div className="flex items-center space-x-2">
                                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                    <User className="h-4 w-4 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{activeCandidate.name}</p>
                                    <p className="text-xs text-gray-500">{activeCandidate.email}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DragOverlay>
            </DndContext>

            {/* Stats */}
            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Pipeline Overview</h3>
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                    {stages.map((stage) => {
                        const count = getCandidatesByStage(stage.id).length
                        const percentage =
                            candidates.length > 0 ? Math.round((count / candidates.length) * 100) : 0
                        return (
                            <div key={stage.id} className="text-center">
                                <div
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stage.color}`}
                                >
                                    {count}
                                </div>
                                <p className="mt-1 text-xs text-gray-500">{stage.title}</p>
                                <p className="text-xs text-gray-400">{percentage}%</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default KanbanBoard
