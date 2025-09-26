import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    Upload,
    Save
} from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import useAssessmentStore from '../store/useAssessmentStore'

const AssessmentRuntime = () => {
    const { jobId } = useParams()
    const navigate = useNavigate()
    const { assessments, loading, fetchAssessment, submitAssessment } = useAssessmentStore()
    const [assessment, setAssessment] = useState(null)
    const [responses, setResponses] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [errors, setErrors] = useState({})

    useEffect(() => {
        fetchAssessmentData()
        loadDraft()
    }, [jobId])

    const fetchAssessmentData = async () => {
        try {
            await fetchAssessment(jobId)
            const assessmentData = assessments[jobId]
            if (assessmentData) {
                setAssessment(assessmentData)
            } else {
                toast.error('Assessment not found')
                navigate('/jobs')
            }
        } catch (error) {
            toast.error('Failed to fetch assessment')
            navigate('/jobs')
        }
    }

    const loadDraft = () => {
        try {
            const draft = localStorage.getItem(`assessment-${jobId}-draft`)
            if (draft) {
                setResponses(JSON.parse(draft))
            }
        } catch (error) {
            console.error('Failed to load draft:', error)
        }
    }

    const saveDraft = () => {
        try {
            localStorage.setItem(`assessment-${jobId}-draft`, JSON.stringify(responses))
            toast.success('Draft saved')
        } catch (error) {
            console.error('Failed to save draft:', error)
        }
    }

    const updateResponse = (questionId, value) => {
        setResponses(prev => ({
            ...prev,
            [questionId]: value
        }))
    }

    const validateResponses = () => {
        const newErrors = {}

        assessment.sections.forEach(section => {
            section.questions.forEach(question => {
                if (question.required && (!responses[question.id] || responses[question.id] === '')) {
                    newErrors[question.id] = 'This field is required'
                }

                if (question.maxLength && responses[question.id] && responses[question.id].length > question.maxLength) {
                    newErrors[question.id] = `Maximum ${question.maxLength} characters allowed`
                }

                if (question.type === 'numeric') {
                    const value = parseFloat(responses[question.id])
                    if (responses[question.id] && (isNaN(value) ||
                        (question.min !== null && value < question.min) ||
                        (question.max !== null && value > question.max))) {
                        newErrors[question.id] = `Value must be between ${question.min || 'no limit'} and ${question.max || 'no limit'}`
                    }
                }
            })
        })

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

  const handleSubmit = async () => {
    if (!validateResponses()) {
      toast.error('Please fix the errors before submitting')
      return
    }

    setSubmitting(true)
    try {
      await submitAssessment(jobId, {
        candidateId: 1, // Simulated candidate ID
        responses
      })
      setSubmitted(true)
      localStorage.removeItem(`assessment-${jobId}-draft`)
      toast.success('Assessment submitted successfully!')
    } catch (error) {
      toast.error('Failed to submit assessment')
    } finally {
      setSubmitting(false)
    }
  }

    const renderQuestion = (question, sectionIndex, questionIndex) => {
        const hasError = errors[question.id]
        const value = responses[question.id] || ''

        return (
            <div key={question.id} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    {question.label || `Question ${questionIndex + 1}`}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {question.type === 'short-text' && (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => updateResponse(question.id, e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${hasError ? 'border-red-300' : 'border-gray-300'
                            }`}
                        placeholder="Enter your answer"
                        maxLength={question.maxLength}
                    />
                )}

                {question.type === 'long-text' && (
                    <textarea
                        rows={4}
                        value={value}
                        onChange={(e) => updateResponse(question.id, e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${hasError ? 'border-red-300' : 'border-gray-300'
                            }`}
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
                                    value={option}
                                    checked={value === option}
                                    onChange={(e) => updateResponse(question.id, e.target.value)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">{option}</span>
                            </label>
                        ))}
                    </div>
                )}

                {question.type === 'multi-choice' && (
                    <div className="space-y-2">
                        {question.options.map((option, optionIndex) => {
                            const selectedOptions = Array.isArray(value) ? value : []
                            return (
                                <label key={optionIndex} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedOptions.includes(option)}
                                        onChange={(e) => {
                                            const selectedOptions = Array.isArray(value) ? value : []
                                            if (e.target.checked) {
                                                updateResponse(question.id, [...selectedOptions, option])
                                            } else {
                                                updateResponse(question.id, selectedOptions.filter(opt => opt !== option))
                                            }
                                        }}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{option}</span>
                                </label>
                            )
                        })}
                    </div>
                )}

                {question.type === 'numeric' && (
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => updateResponse(question.id, e.target.value)}
                        min={question.min}
                        max={question.max}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${hasError ? 'border-red-300' : 'border-gray-300'
                            }`}
                        placeholder="Enter a number"
                    />
                )}

                {question.type === 'file-upload' && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">File upload not implemented in demo</p>
                    </div>
                )}

                {hasError && (
                    <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {hasError}
                    </p>
                )}
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

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12">
                <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Assessment Submitted!</h1>
                <p className="text-gray-600 mb-6">
                    Thank you for completing the assessment. We'll review your responses and get back to you soon.
                </p>
                <button
                    onClick={() => navigate('/jobs')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                    Back to Jobs
                </button>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
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
                        <h1 className="text-2xl font-bold text-gray-900">Assessment</h1>
                        <p className="text-sm text-gray-500">Please complete all required questions</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={saveDraft}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        Save Draft
                    </button>
                </div>
            </div>

            {/* Assessment Form */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <form className="space-y-8">
                    {assessment.sections.map((section, sectionIndex) => (
                        <div key={section.id} className="border-b border-gray-200 pb-8 last:border-b-0">
                            <h3 className="text-lg font-medium text-gray-900 mb-6">{section.title}</h3>
                            <div className="space-y-6">
                                {section.questions.map((question, questionIndex) =>
                                    renderQuestion(question, sectionIndex, questionIndex)
                                )}
                            </div>
                        </div>
                    ))}
                </form>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                    {submitting ? (
                        <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Submit Assessment
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

export default AssessmentRuntime
