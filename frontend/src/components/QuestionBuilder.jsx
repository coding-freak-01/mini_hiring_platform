import React, { useState, useEffect } from 'react'
import { Trash2, Plus, Type, FileText, Square, CheckSquare, Hash, Upload } from 'lucide-react'

const questionTypes = [
    { id: 'short-text', label: 'Short Text', icon: Type },
    { id: 'long-text', label: 'Long Text', icon: FileText },
    { id: 'single-choice', label: 'Single Choice', icon: Square },
    { id: 'multi-choice', label: 'Multiple Choice', icon: CheckSquare },
    { id: 'numeric', label: 'Numeric', icon: Hash },
    { id: 'file-upload', label: 'File Upload', icon: Upload }
]

const QuestionBuilder = ({ question, onChange, onDelete }) => {
    const [localQuestion, setLocalQuestion] = useState(question)

    useEffect(() => {
        setLocalQuestion(question)
    }, [question])

    const handleChange = (field, value) => {
        const updated = { ...localQuestion, [field]: value }
        setLocalQuestion(updated)
        onChange(updated)
    }

    const addOption = () => handleChange('options', [...(localQuestion.options || []), ''])
    const updateOption = (i, v) => {
        const opts = [...(localQuestion.options || [])]
        opts[i] = v
        handleChange('options', opts)
    }
    const removeOption = (i) => {
        const opts = [...(localQuestion.options || [])]
        opts.splice(i, 1)
        handleChange('options', opts)
    }

    const QuestionIcon = questionTypes.find(t => t.id === localQuestion.type)?.icon || Type

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <QuestionIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                        {questionTypes.find(t => t.id === localQuestion.type)?.label}
                    </span>
                </div>
                <button onClick={onDelete} className="text-red-600 hover:text-red-800">
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            {/* Question Label */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question Label</label>
                    <input
                        type="text"
                        value={localQuestion.label || ''}
                        onChange={(e) => handleChange('label', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter question label"
                    />
                </div>

                {/* Required Toggle */}
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={localQuestion.required || false}
                        onChange={(e) => handleChange('required', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Required</span>
                </label>

                {/* Short/Long Text */}
                {(localQuestion.type === 'short-text' || localQuestion.type === 'long-text') && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Length</label>
                        <input
                            type="number"
                            value={localQuestion.maxLength || ''}
                            onChange={(e) => handleChange('maxLength', parseInt(e.target.value) || null)}
                            className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Maximum characters"
                        />
                    </div>
                )}

                {/* Options */}
                {(localQuestion.type === 'single-choice' || localQuestion.type === 'multi-choice') && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                        <div className="space-y-2">
                            {(localQuestion.options || []).map((opt, i) => (
                                <div key={i} className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => updateOption(i, e.target.value)}
                                        className="flex-1 px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        placeholder={`Option ${i + 1}`}
                                    />
                                    <button onClick={() => removeOption(i)} className="text-red-600 hover:text-red-800">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            <button onClick={addOption} className="text-blue-600 hover:text-blue-800 text-sm">
                                <Plus className="h-4 w-4 inline mr-1" /> Add Option
                            </button>
                        </div>
                    </div>
                )}

                {/* Numeric */}
                {localQuestion.type === 'numeric' && (
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="number"
                            value={localQuestion.min || ''}
                            onChange={(e) => handleChange('min', parseInt(e.target.value) || null)}
                            className="px-3 py-2 border rounded-md"
                            placeholder="Min"
                        />
                        <input
                            type="number"
                            value={localQuestion.max || ''}
                            onChange={(e) => handleChange('max', parseInt(e.target.value) || null)}
                            className="px-3 py-2 border rounded-md"
                            placeholder="Max"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export default QuestionBuilder
