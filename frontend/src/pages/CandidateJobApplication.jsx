import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, User, Mail, FileText, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import useCandidateStore from '../store/useCandidateStore'
import useAuthStore from '../store/useAuthStore'
import useAssessmentStore from '../store/useAssessmentStore'

const CandidateJobApplication = () => {
    const { jobId } = useParams()
    const navigate = useNavigate()
    const { createCandidate } = useCandidateStore()
    const { user } = useAuthStore()
    const { assessments, fetchAssessment } = useAssessmentStore()
    const [loading, setLoading] = useState(false)
    const [assessmentLoading, setAssessmentLoading] = useState(false)
    const [hasAssessment, setHasAssessment] = useState(false)
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || ''
    })

    useEffect(() => {
        checkForAssessment()
    }, [jobId])

    const checkForAssessment = async () => {
        setAssessmentLoading(true)
        try {
            await fetchAssessment(jobId)
            const assessment = assessments[jobId]
            setHasAssessment(assessment && assessment.sections && assessment.sections.length > 0)
        } catch (error) {
            console.error('Error checking for assessment:', error)
        } finally {
            setAssessmentLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            await createCandidate({
                name: formData.name,
                email: formData.email,
                jobId: parseInt(jobId),
                stage: 'applied',
                createdAt: new Date().toISOString()
            })

            toast.success('Application submitted successfully!')
            navigate('/jobs')
        } catch (error) {
            toast.error('Failed to submit application')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto py-8">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-8">
                <button
                    onClick={() => navigate('/jobs')}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Apply for Job</h1>
                    <p className="text-sm text-gray-500">Job ID: {jobId}</p>
                </div>
            </div>

            {/* Application Form */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Application Form</h2>
                    <p className="text-sm text-gray-500">Fill out your details to apply for this job.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name *
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email *
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Assessment Section */}
                    {assessmentLoading ? (
                        <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                            <span className="ml-2 text-sm text-gray-600">Checking for assessment...</span>
                        </div>
                    ) : hasAssessment ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center mb-2">
                                <FileText className="h-5 w-5 text-blue-600 mr-2" />
                                <h3 className="text-sm font-medium text-blue-900">Assessment Available</h3>
                            </div>
                            <p className="text-sm text-blue-700 mb-3">
                                This job requires completing an assessment. You can take it now or after submitting your application.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/assessments/${jobId}/take`)}
                                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200"
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Take Assessment Now
                                </button>
                            </div>
                        </div>
                    ) : null}

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => navigate('/jobs')}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Submit Application
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CandidateJobApplication
