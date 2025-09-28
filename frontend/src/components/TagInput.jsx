import React, { useState } from 'react'
import { Plus, X } from 'lucide-react'

const TagInput = ({ tags, onChange, error }) => {
    const [input, setInput] = useState('')

    const addTag = () => {
        const newTag = input.trim()
        if (newTag && !tags.includes(newTag)) {
            onChange([...tags, newTag])
            setInput('')
        }
    }

    const removeTag = (tagToRemove) => {
        onChange(tags.filter(tag => tag !== tagToRemove))
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            addTag()
        }
    }

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags *
            </label>
            <div className="flex space-x-2 mb-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add a tag"
                />
                <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>

            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-blue-100 text-blue-800"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    )
}

export default TagInput
