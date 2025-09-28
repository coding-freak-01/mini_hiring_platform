import React from 'react'
import { User, Mail } from 'lucide-react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import CandidateCard from './CandidateCard'

const StageColumn = ({ stage, candidates, onViewProfile }) => {
    return (
        <div className={`flex-1 min-w-0 ${stage.color} rounded-lg border-2 border-dashed`}>
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
                        <CandidateCard
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

export default StageColumn
