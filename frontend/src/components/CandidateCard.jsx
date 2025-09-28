import React from 'react'
import { User, Mail } from 'lucide-react'

const CandidateCard = ({ candidate, onViewProfile }) => {
    return (
        <div
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md cursor-pointer"
            onClick={() => onViewProfile(candidate)}
        >
            <div className="flex items-start space-x-3">
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{candidate.name}</p>
                    <p className="text-xs text-gray-500 flex items-center">
                        <Mail className="h-3 w-3 mr-1" /> {candidate.email}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default CandidateCard
