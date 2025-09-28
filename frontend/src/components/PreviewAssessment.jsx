import React from 'react'

const PreviewAssessment = ({ assessment }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">

        <h3 className="text-lg font-medium text-gray-900 mb-4">Assessment Preview</h3>

        <form className="space-y-6">
            {assessment.sections.map((section, i) => (
                <div key={section.id} className="border-b border-gray-200 pb-6">

                    <h4 className="text-md font-medium text-gray-900 mb-4">{section.title}</h4>

                    <div className="space-y-4">
                        {section.questions.map((q, j) => (
                            <div key={q.id} className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    {q.label || `Question ${j + 1}`}
                                    {q.required && <span className="text-red-500 ml-1">*</span>}
                                </label>

                                {q.type === 'short-text' && <input type="text" className="w-full px-3 py-2 border rounded-md" />}
                                {q.type === 'long-text' && <textarea rows={4} className="w-full px-3 py-2 border rounded-md" />}
                                {q.type === 'numeric' && <input type="number" min={q.min} max={q.max} className="w-full px-3 py-2 border rounded-md" />}
                                {q.type === 'file-upload' && <input type="file" className="w-full px-3 py-2 border rounded-md" />}

                                {q.type === 'single-choice' && (
                                    <div className="space-y-2">
                                        {q.options.map((o, k) => (
                                            <label key={k} className="flex items-center">
                                                <input type="radio" name={`q-${q.id}`} className="text-blue-600" />
                                                <span className="ml-2">{o}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {q.type === 'multi-choice' && (
                                    <div className="space-y-2">
                                        {q.options.map((o, k) => (
                                            <label key={k} className="flex items-center">
                                                <input type="checkbox" className="text-blue-600" />
                                                <span className="ml-2">{o}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    
                </div>
            ))}
        </form>

    </div>
)

export default PreviewAssessment
