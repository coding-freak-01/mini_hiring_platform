import React, { useState, useEffect, useCallback } from 'react'
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { User, Mail, Calendar, GripVertical } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import useCandidateStore from '../store/useCandidateStore'

const stages = [
    { id: 'applied', title: 'Applied', color: 'bg-blue-100 border-blue-200' },
    { id: 'screen', title: 'Screen', color: 'bg-yellow-100 border-yellow-200' },
    { id: 'tech', title: 'Tech', color: 'bg-purple-100 border-purple-200' },
    { id: 'offer', title: 'Offer', color: 'bg-green-100 border-green-200' },
    { id: 'hired', title: 'Hired', color: 'bg-emerald-100 border-emerald-200' },
    { id: 'rejected', title: 'Rejected', color: 'bg-red-100 border-red-200' }
]

const SortableCandidateCard = ({ candidate, onViewProfile }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: candidate.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md cursor-pointer"
            onClick={() => onViewProfile(candidate)}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                        <button
                            {...attributes}
                            {...listeners}
                            className="p-1 text-gray-400 hover:text-gray-600 cursor-grab"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <GripVertical className="h-4 w-4" />
                        </button>
                        <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                <User className="h-4 w-4 text-gray-600" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {candidate.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {candidate.email}
                            </p>
                        </div>
                    </div>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(candidate.createdAt).toLocaleDateString()}
                    </div>
                </div>
            </div>
        </div>
    )
}

const SortableStageColumn = ({ stage, candidates, onViewProfile }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: stage.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex-1 min-w-0 ${stage.color} rounded-lg border-2 border-dashed`}
        >
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">{stage.title}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-gray-800">
                        {candidates.length}
                    </span>
                </div>
            </div>
            <div className="p-4 space-y-3 min-h-[400px]">
                <SortableContext items={candidates.map(c => c.id)} strategy={verticalListSortingStrategy}>
                    {candidates.map((candidate) => (
                        <SortableCandidateCard
                            key={candidate.id}
                            candidate={candidate}
                            onViewProfile={onViewProfile}
                        />
                    ))}
                </SortableContext>
                {candidates.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                        <User className="mx-auto h-8 w-8 mb-2" />
                        <p className="text-sm">No candidates</p>
                    </div>
                )}
            </div>
        </div>
    )
}

const KanbanBoard = () => {
  const { candidates, loading, fetchCandidates, updateCandidate, getCandidatesByStage } = useCandidateStore()
  const [activeCandidate, setActiveCandidate] = useState(null)
  const [draggedCandidate, setDraggedCandidate] = useState(null)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

  const fetchCandidatesData = useCallback(async () => {
    await fetchCandidates({ pageSize: 1000 })
  }, [fetchCandidates])

  useEffect(() => {
    fetchCandidatesData()
  }, [fetchCandidatesData])

    const handleDragStart = (event) => {
        const candidate = candidates.find(c => c.id === event.active.id)
        setActiveCandidate(candidate)
        setDraggedCandidate(candidate)
    }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) {
      setActiveCandidate(null)
      setDraggedCandidate(null)
      return
    }

    const candidate = candidates.find(c => c.id === active.id)
    const newStage = over.id

    if (candidate.stage === newStage) {
      setActiveCandidate(null)
      setDraggedCandidate(null)
      return
    }

    try {
      await updateCandidate(active.id, { stage: newStage })
      toast.success('Candidate moved successfully')
    } catch (error) {
      toast.error('Failed to update candidate stage')
    } finally {
      setActiveCandidate(null)
      setDraggedCandidate(null)
    }
  }

    const handleViewProfile = (candidate) => {
        // Navigate to candidate profile
        window.location.href = `/candidates/${candidate.id}`
    }

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
                <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {stages.map((stage) => (
                        <SortableStageColumn
                            key={stage.id}
                            stage={stage}
                            candidates={getCandidatesByStage(stage.id)}
                            onViewProfile={handleViewProfile}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeCandidate ? (
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
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Stats */}
            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Pipeline Overview</h3>
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                    {stages.map((stage) => {
                        const count = getCandidatesByStage(stage.id).length
                        const percentage = candidates.length > 0 ? Math.round((count / candidates.length) * 100) : 0

                        return (
                            <div key={stage.id} className="text-center">
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stage.color}`}>
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
