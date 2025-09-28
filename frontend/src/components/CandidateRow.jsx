const CandidateRow = ({ candidate, onViewProfile }) => {
    if (!candidate) return <LoadingSpinner size="sm" />

    const getStageColor = (stage) => {
        const colors = {
            applied: 'bg-blue-100 text-blue-800',
            screen: 'bg-yellow-100 text-yellow-800',
            tech: 'bg-purple-100 text-purple-800',
            offer: 'bg-green-100 text-green-800',
            hired: 'bg-emerald-100 text-emerald-800',
            rejected: 'bg-red-100 text-red-800',
        }
        return colors[stage] || 'bg-gray-100 text-gray-800'
    }

    return (
        <div className="border-b border-gray-200 hover:bg-gray-50">
            <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{candidate.name}</p>
                        <p className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-4 w-4 mr-1" /> {candidate.email}
                        </p>
                    </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(candidate.stage)}`}>
                    {candidate.stage}
                </span>
                <button
                    onClick={() => onViewProfile(candidate)}
                    className="text-blue-600 hover:text-blue-900 p-1"
                >
                    <Eye className="h-4 w-4" />
                </button>
            </div>
        </div>
    )
}
