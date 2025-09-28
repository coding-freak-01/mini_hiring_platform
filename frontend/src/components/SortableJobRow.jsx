
import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Edit, Archive, ArchiveRestore, Trash2 } from 'lucide-react'

const SortableJobRow = ({ job, onEdit, onArchive, onDelete, onApply, isCandidate }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: job.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <tr ref={setNodeRef} style={style} className="border-b border-gray-200 hover:bg-gray-50">
            <td className="px-6 py-4">
                <div className="flex items-center">
                    {!isCandidate && (
                        <button {...attributes} {...listeners} className="p-1 text-gray-400 hover:text-gray-600 cursor-grab">
                            <GripVertical className="h-4 w-4" />
                        </button>
                    )}
                    <span className="ml-2 text-sm font-medium text-gray-900">{job.title}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                >
                    {job.status}
                </span>
            </td>
            <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                    {job.tags.map((tag, i) => (
                        <span
                            key={i}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-500">{new Date(job.createdAt).toLocaleDateString()}</td>
            <td className="px-6 py-4 text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                    {isCandidate ? (
                        <button
                            onClick={() => onApply(job)}
                            className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm"
                        >
                            Apply
                        </button>
                    ) : (
                        <>
                            <button onClick={() => onEdit(job)} className="text-blue-600 hover:text-blue-900">
                                <Edit className="h-4 w-4" />
                            </button>
                            <button onClick={() => onArchive(job)} className="text-yellow-600 hover:text-yellow-900">
                                {job.status === 'active' ? <Archive className="h-4 w-4" /> : <ArchiveRestore className="h-4 w-4" />}
                            </button>
                            <button onClick={() => onDelete(job)} className="text-red-600 hover:text-red-900">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </>
                    )}
                </div>
            </td>
        </tr>
    )
}

export default SortableJobRow
