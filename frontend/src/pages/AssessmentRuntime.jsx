import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import useAssessmentStore from '../store/useAssessmentStore'
import QuestionRuntime from '../components/QuestionRuntime'

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
        setResponses((prev) => ({
            ...prev,
            [questionId]: value,
        }))
    }

    const validateResponses = () => {
        const newErrors = {}

        assessment.sections.forEach((section) => {
            section.questions.forEach((question) => {
                const answer = responses[question.id]

                if (question.required && (!answer || answer.length === 0)) {
                    newErrors[question.id] = 'This field is required'
                }

                if (question.maxLength && answer && answer.length > question.maxLength) {
                    newErrors[question.id] = `Maximum ${question.maxLength} characters allowed`
                }

                if (question.type === 'numeric' && answer) {
                    const value = parseFloat(answer)
                    if (
                        isNaN(value) ||
                        (question.min !== null && value < question.min) ||
                        (question.max !== null && value > question.max)
                    ) {
                        newErrors[question.id] = `Value must be between ${question.min ?? 'no limit'
                            } and ${question.max ?? 'no limit'}`
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
                candidateId: 1, // TODO: Replace with real candidateId from auth
                responses,
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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Assessment Submitted!
                </h1>
                <p className="text-gray-600 mb-6">
                    Thank you for completing the assessment. We'll review your responses and
                    get back to you soon.
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
                        <p className="text-sm text-gray-500">
                            Please complete all required questions
                        </p>
                    </div>
                </div>
                <button
                    onClick={saveDraft}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                </button>
            </div>

            {/* Assessment Form */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <form className="space-y-8">
                    {assessment.sections.map((section) => (
                        <div
                            key={section.id}
                            className="border-b border-gray-200 pb-8 last:border-b-0"
                        >
                            <h3 className="text-lg font-medium text-gray-900 mb-6">
                                {section.title}
                            </h3>
                            <div className="space-y-6">
                                {section.questions.map((q, idx) => (
                                    <QuestionRuntime
                                        key={q.id}
                                        question={q}
                                        value={responses[q.id]}
                                        error={errors[q.id]}
                                        updateResponse={updateResponse}
                                    />
                                ))}
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
