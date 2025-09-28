import React from "react"
import { AlertCircle, Upload } from "lucide-react"

const QuestionRuntime = ({ question, value, error, updateResponse }) => {
    const hasError = !!error

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {question.label}
                {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {/* Short Text */}
            {question.type === "short-text" && (
                <input
                    type="text"
                    value={value || ""}
                    onChange={(e) => updateResponse(question.id, e.target.value)}
                    maxLength={question.maxLength}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${hasError ? "border-red-300" : "border-gray-300"
                        }`}
                    placeholder="Enter your answer"
                />
            )}

            {/* Long Text */}
            {question.type === "long-text" && (
                <textarea
                    rows={4}
                    value={value || ""}
                    onChange={(e) => updateResponse(question.id, e.target.value)}
                    maxLength={question.maxLength}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${hasError ? "border-red-300" : "border-gray-300"
                        }`}
                    placeholder="Enter your answer"
                />
            )}

            {/* Single Choice */}
            {question.type === "single-choice" && (
                <div className="space-y-2">
                    {question.options.map((option, idx) => (
                        <label key={idx} className="flex items-center">
                            <input
                                type="radio"
                                name={`q-${question.id}`}
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

            {/* Multi Choice */}
            {question.type === "multi-choice" && (
                <div className="space-y-2">
                    {question.options.map((option, idx) => {
                        const selected = Array.isArray(value) ? value : []
                        return (
                            <label key={idx} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selected.includes(option)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            updateResponse(question.id, [...selected, option])
                                        } else {
                                            updateResponse(question.id, selected.filter((o) => o !== option))
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

            {/* Numeric */}
            {question.type === "numeric" && (
                <input
                    type="number"
                    value={value || ""}
                    min={question.min}
                    max={question.max}
                    onChange={(e) => updateResponse(question.id, e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${hasError ? "border-red-300" : "border-gray-300"
                        }`}
                    placeholder="Enter a number"
                />
            )}

            {/* File Upload */}
            {question.type === "file-upload" && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">File upload not implemented in demo</p>
                </div>
            )}

            {/* Error */}
            {hasError && (
                <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {error}
                </p>
            )}
        </div>
    )
}

export default QuestionRuntime
