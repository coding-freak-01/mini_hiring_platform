import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { X, Plus, X as XIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import useJobStore from '../store/useJobStore'

const schema = yup.object({
    title: yup.string().required('Title is required'),
    slug: yup.string().required('Slug is required').matches(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
    status: yup.string().oneOf(['active', 'archived']).required(),
    tags: yup.array().of(yup.string()).min(1, 'At least one tag is required')
})

const JobModal = ({ job, onClose, onSave }) => {
  const { createJob, updateJob, loading } = useJobStore()
  const [tagInput, setTagInput] = useState('')
  const [slugError, setSlugError] = useState('')

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            title: '',
            slug: '',
            status: 'active',
            tags: []
        }
    })

    const watchedTitle = watch('title')
    const watchedTags = watch('tags')

    useEffect(() => {
        if (job) {
            reset({
                title: job.title,
                slug: job.slug,
                status: job.status,
                tags: job.tags || []
            })
        }
    }, [job, reset])

    // Auto-generate slug from title
    useEffect(() => {
        if (watchedTitle && !job) {
            const slug = watchedTitle
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()
            setValue('slug', slug)
        }
    }, [watchedTitle, setValue, job])

    const addTag = () => {
        if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
            setValue('tags', [...watchedTags, tagInput.trim()])
            setTagInput('')
        }
    }

    const removeTag = (tagToRemove) => {
        setValue('tags', watchedTags.filter(tag => tag !== tagToRemove))
    }

  const onSubmit = async (data) => {
    setSlugError('')

    try {
      if (job) {
        await updateJob(job.id, data)
        toast.success('Job updated successfully')
      } else {
        await createJob(data)
        toast.success('Job created successfully')
      }
      onSave()
    } catch (error) {
      if (error.message === 'Slug already exists') {
        setSlugError('This slug is already in use')
      } else {
        toast.error(error.message || 'Failed to save job')
      }
    }
  }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            addTag()
        }
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />

                <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">
                            {job ? 'Edit Job' : 'Create New Job'}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Job Title *
                            </label>
                            <input
                                {...register('title')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter job title"
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Slug *
                            </label>
                            <input
                                {...register('slug')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="job-slug"
                            />
                            {errors.slug && (
                                <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
                            )}
                            {slugError && (
                                <p className="mt-1 text-sm text-red-600">{slugError}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                {...register('status')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="active">Active</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tags *
                            </label>
                            <div className="flex space-x-2 mb-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
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

                            {watchedTags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {watchedTags.map((tag, index) => (
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
                                                <XIcon className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {errors.tags && (
                                <p className="mt-1 text-sm text-red-600">{errors.tags.message}</p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : (job ? 'Update Job' : 'Create Job')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default JobModal
