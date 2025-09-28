import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Trash2, Eye, Save, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import QuestionBuilder from '../components/QuestionBuilder'
import PreviewAssessment from '../components/PreviewAssessment'
import useAssessmentStore from '../store/useAssessmentStore'

const AssessmentBuilder = () => {
    const { jobId } = useParams()
    const navigate = useNavigate()
    const { assessments, loading, fetchAssessment, saveAssessment } = useAssessmentStore()
    const [assessment, setAssessment] = useState(null)
    const [saving, setSaving] = useState(false)
    const [previewMode, setPreviewMode] = useState(false)

    useEffect(() => { fetchAssessmentData() }, [jobId])

    const fetchAssessmentData = async () => {
        try {
            await fetchAssessment(jobId)
            const data = assessments[jobId]
            setAssessment(
                data || {
                    jobId: parseInt(jobId),
                    sections: [{ id: `section-${Date.now()}`, title: 'General Questions', questions: [] }]
                }
            )
        } catch { toast.error('Failed to fetch assessment') }
    }

    const saveAssessmentData = async () => {
        setSaving(true)
        try {
            await saveAssessment(jobId, assessment)
            toast.success('Assessment saved')
        } catch { toast.error('Failed to save') }
        finally { setSaving(false) }
    }

    const addSection = () =>
        setAssessment({ ...assessment, sections: [...assessment.sections, { id: `section-${Date.now()}`, title: 'New Section', questions: [] }] })

    const updateSection = (id, updates) =>
        setAssessment({ ...assessment, sections: assessment.sections.map(s => s.id === id ? { ...s, ...updates } : s) })

    const addQuestion = (sid) =>
        setAssessment({
            ...assessment,
            sections: assessment.sections.map(s =>
                s.id === sid ? { ...s, questions: [...s.questions, { id: `q-${Date.now()}`, type: 'short-text', label: '', required: false, options: [] }] } : s
            )
        })

    const updateQuestion = (sid, qid, updates) =>
        setAssessment({
            ...assessment,
            sections: assessment.sections.map(s =>
                s.id === sid ? { ...s, questions: s.questions.map(q => q.id === qid ? { ...q, ...updates } : q) } : s
            )
        })

    const deleteQuestion = (sid, qid) =>
        setAssessment({
            ...assessment,
            sections: assessment.sections.map(s =>
                s.id === sid ? { ...s, questions: s.questions.filter(q => q.id !== qid) } : s
            )
        })

    const deleteSection = (sid) =>
        setAssessment({ ...assessment, sections: assessment.sections.filter(s => s.id !== sid) })

    if (loading || !assessment) return <div className="flex justify-center items-center h-96"><LoadingSpinner /></div>

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate('/jobs')} className="text-gray-400 hover:text-gray-600">
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Assessment Builder</h1>
                </div>
                <div className="flex space-x-3">
                    <button onClick={() => setPreviewMode(!previewMode)} className="flex items-center px-3 py-2 border rounded-md">
                        <Eye className="h-4 w-4 mr-2" /> {previewMode ? 'Edit' : 'Preview'}
                    </button>
                    <button onClick={saveAssessmentData} disabled={saving} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50">
                        <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            {previewMode ? (
                <PreviewAssessment assessment={assessment} />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        {assessment.sections.map(section => (
                            <div key={section.id} className="bg-white border rounded-lg p-6">
                                <div className="flex justify-between mb-4">
                                    <input
                                        type="text"
                                        value={section.title}
                                        onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                        className="text-lg font-medium bg-transparent border-none focus:ring-0"
                                    />
                                    <button onClick={() => deleteSection(section.id)} className="text-red-600 hover:text-red-800">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {section.questions.map(q => (
                                        <QuestionBuilder
                                            key={q.id}
                                            question={q}
                                            onChange={(u) => updateQuestion(section.id, q.id, u)}
                                            onDelete={() => deleteQuestion(section.id, q.id)}
                                        />
                                    ))}
                                </div>

                                <button onClick={() => addQuestion(section.id)} className="mt-4 w-full border-2 border-dashed rounded-lg py-2 text-gray-500">
                                    <Plus className="h-4 w-4 mr-2 inline" /> Add Question
                                </button>
                            </div>
                        ))}

                        <button onClick={addSection} className="w-full border-2 border-dashed rounded-lg py-3 text-gray-500">
                            <Plus className="h-5 w-5 mr-2 inline" /> Add Section
                        </button>
                    </div>

                    {/* Live Preview */}
                    <PreviewAssessment assessment={assessment} />
                </div>
            )}
        </div>
    )
}

export default AssessmentBuilder
