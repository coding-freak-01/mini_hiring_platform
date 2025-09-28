import React from "react"
import { useDroppable } from "@dnd-kit/core"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import CandidateCard from "./CandidateCard"

function SortableCandidate({ candidate, onViewProfile }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: candidate.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <CandidateCard candidate={candidate} onViewProfile={onViewProfile} />
        </div>
    )
}

const StageColumn = ({ stage, candidates, onViewProfile }) => {
    const { setNodeRef } = useDroppable({
        id: stage.id,
    })

    return (
        <div 
            ref={setNodeRef}
            id={stage.id} 
            className={`rounded-lg border p-3 ${stage.color} min-h-[200px]`}
        >
            <h2 className="text-sm font-semibold mb-2">{stage.title}</h2>
            <div className="space-y-2">
                {candidates.map((candidate) => (
                    <SortableCandidate
                        key={candidate.id}
                        candidate={candidate}
                        onViewProfile={onViewProfile}
                    />
                ))}
            </div>
        </div>
    )
}

export default StageColumn
