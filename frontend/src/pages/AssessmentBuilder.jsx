import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    Plus,
    Trash2,
    Eye,
    Save,
    ArrowLeft,
    FileText,
    CheckSquare,
    Square,
    Hash,
    Upload,
    Type
} from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import useAssessmentStore from '../store/useAssessmentStore'

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

    const addOption = () => {
        const options = [...(localQuestion.options || []), '']
        handleChange('options', options)
    }

    const updateOption = (index, value) => {
        const options = [...(localQuestion.options || [])]
        options[index] = value
        handleChange('options', options)
    }

    const removeOption = (index) => {
        const options = [...(localQuestion.options || [])]
        options.splice(index, 1)
        handleChange('options', options)
    }

    const QuestionIcon = questionTypes.find(t => t.id === localQuestion.type)?.icon || Type

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <QuestionIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                        {questionTypes.find(t => t.id === localQuestion.type)?.label}
                    </span>
                </div>
                <button
                    onClick={onDelete}
                    className="text-red-600 hover:text-red-800"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question Label
                    </label>
                    <input
                        type="text"
                        value={localQuestion.label || ''}
                        onChange={(e) => handleChange('label', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter question label"
                    />
                </div>

                <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={localQuestion.required || false}
                            onChange={(e) => handleChange('required', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Required</span>
                    </label>
                </div>

                {(localQuestion.type === 'short-text' || localQuestion.type === 'long-text') && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Max Length
                        </label>
                        <input
                            type="number"
                            value={localQuestion.maxLength || ''}
                            onChange={(e) => handleChange('maxLength', parseInt(e.target.value) || null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Maximum character length"
                        />
                    </div>
                )}

                {(localQuestion.type === 'single-choice' || localQuestion.type === 'multi-choice') && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Options
                        </label>
                        <div className="space-y-2">
                            {(localQuestion.options || []).map((option, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => updateOption(index, e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        placeholder={`Option ${index + 1}`}
                                    />
                                    <button
                                        onClick={() => removeOption(index)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addOption}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                                <Plus className="h-4 w-4 inline mr-1" />
                                Add Option
                            </button>
                        </div>
                    </div>
                )}

                {localQuestion.type === 'numeric' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Min Value
                            </label>
                            <input
                                type="number"
                                value={localQuestion.min || ''}
                                onChange={(e) => handleChange('min', parseInt(e.target.value) || null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Minimum value"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Max Value
                            </label>
                            <input
                                type="number"
                                value={localQuestion.max || ''}
                                onChange={(e) => handleChange('max', parseInt(e.target.value) || null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Maximum value"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

const AssessmentBuilder = () => {
    const { jobId } = useParams()
    const navigate = useNavigate()
    const { assessments, loading, fetchAssessment, saveAssessment } = useAssessmentStore()
    const [assessment, setAssessment] = useState(null)
    const [saving, setSaving] = useState(false)
    const [previewMode, setPreviewMode] = useState(false)

    useEffect(() => {
        fetchAssessmentData()
    }, [jobId])

    const fetchAssessmentData = async () => {
        try {
            await fetchAssessment(jobId)
            const assessmentData = assessments[jobId]
            if (assessmentData) {
                setAssessment(assessmentData)
            } else {
                // Create new assessment
                setAssessment({
                    jobId: parseInt(jobId),
                    sections: [
                        {
                            id: 'section-1',
                            title: 'General Questions',
                            questions: []
                        }
                    ]
                })
            }
        } catch (error) {
            toast.error('Failed to fetch assessment')
        }
    }

    const saveAssessmentData = async () => {
        setSaving(true)
        try {
            await saveAssessment(jobId, assessment)
            toast.success('Assessment saved successfully')
        } catch (error) {
            toast.error('Failed to save assessment')
        } finally {
            setSaving(false)
        }
    }

    const addSection = () => {
        const newSection = {
            id: `section-${Date.now()}`,
            title: 'New Section',
            questions: []
        }
        setAssessment({
            ...assessment,
            sections: [...assessment.sections, newSection]
        })
    }

    const updateSection = (sectionId, updates) => {
        setAssessment({
            ...assessment,
            sections: assessment.sections.map(section =>
                section.id === sectionId ? { ...section, ...updates } : section
            )
        })
    }

    const addQuestion = (sectionId) => {
        const newQuestion = {
            id: `q-${Date.now()}`,
            type: 'short-text',
            label: '',
            required: false,
            options: []
        }

        setAssessment({
            ...assessment,
            sections: assessment.sections.map(section =>
                section.id === sectionId
                    ? { ...section, questions: [...section.questions, newQuestion] }
                    : section
            )
        })
    }

    const updateQuestion = (sectionId, questionId, updates) => {
        setAssessment({
            ...assessment,
            sections: assessment.sections.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        questions: section.questions.map(q =>
                            q.id === questionId ? { ...q, ...updates } : q
                        )
                    }
                    : section
            )
        })
    }

    const deleteQuestion = (sectionId, questionId) => {
        setAssessment({
            ...assessment,
            sections: assessment.sections.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        questions: section.questions.filter(q => q.id !== questionId)
                    }
                    : section
            )
        })
    }

    const deleteSection = (sectionId) => {
        setAssessment({
            ...assessment,
            sections: assessment.sections.filter(section => section.id !== sectionId)
        })
    }

    const renderPreview = () => {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Assessment Preview</h3>
                <form className="space-y-6">
                    {assessment.sections.map((section, sectionIndex) => (
                        <div key={section.id} className="border-b border-gray-200 pb-6">
                            <h4 className="text-md font-medium text-gray-900 mb-4">{section.title}</h4>
                            <div className="space-y-4">
                                {section.questions.map((question, questionIndex) => (
                                    <div key={question.id} className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            {question.label || `Question ${questionIndex + 1}`}
                                            {question.required && <span className="text-red-500 ml-1">*</span>}
                                        </label>

                                        {question.type === 'short-text' && (
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter your answer"
                                                maxLength={question.maxLength}
                                            />
                                        )}

                                        {question.type === 'long-text' && (
                                            <textarea
                                                rows={4}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter your answer"
                                                maxLength={question.maxLength}
                                            />
                                        )}

                                        {question.type === 'single-choice' && (
                                            <div className="space-y-2">
                                                {question.options.map((option, optionIndex) => (
                                                    <label key={optionIndex} className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name={`question-${question.id}`}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">{option}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}

                                        {question.type === 'multi-choice' && (
                                            <div className="space-y-2">
                                                {question.options.map((option, optionIndex) => (
                                                    <label key={optionIndex} className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">{option}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}

                                        {question.type === 'numeric' && (
                                            <input
                                                type="number"
                                                min={question.min}
                                                max={question.max}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter a number"
                                            />
                                        )}

                                        {question.type === 'file-upload' && (
                                            <input
                                                type="file"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </form>
            </div>
        )
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
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/jobs')}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Assessment Builder</h1>
                        <p className="text-sm text-gray-500">Create and customize assessment questions</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        {previewMode ? 'Edit' : 'Preview'}
                    </button>
          <button
            onClick={saveAssessmentData}
            disabled={saving}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Assessment'}
          </button>
                </div>
            </div>

            {previewMode ? (
                renderPreview()
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Builder */}
                    <div className="space-y-6">
                        {assessment.sections.map((section, sectionIndex) => (
                            <div key={section.id} className="bg-white border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <input
                                        type="text"
                                        value={section.title}
                                        onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                        className="text-lg font-medium text-gray-900 bg-transparent border-none focus:ring-0 focus:outline-none"
                                    />
                                    <button
                                        onClick={() => deleteSection(section.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {section.questions.map((question) => (
                                        <QuestionBuilder
                                            key={question.id}
                                            question={question}
                                            onChange={(updates) => updateQuestion(section.id, question.id, updates)}
                                            onDelete={() => deleteQuestion(section.id, question.id)}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={() => addQuestion(section.id)}
                                    className="mt-4 w-full flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Question
                                </button>
                            </div>
                        ))}

                        <button
                            onClick={addSection}
                            className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Add Section
                        </button>
                    </div>

                    {/* Live Preview */}
                    <div>
                        {renderPreview()}
                    </div>
                </div>
            )}
        </div>
    )
}

export default AssessmentBuilder
