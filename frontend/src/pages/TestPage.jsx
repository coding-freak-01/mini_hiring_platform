import React, { useState, useEffect } from 'react'
import { runTests } from '../test-integration.js'
import useAuthStore from '../store/useAuthStore'
import useJobStore from '../store/useJobStore'
import useCandidateStore from '../store/useCandidateStore'
import useAssessmentStore from '../store/useAssessmentStore'

const TestPage = () => {
    const [testResults, setTestResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const auth = useAuthStore()
    const jobs = useJobStore()
    const candidates = useCandidateStore()
    const assessments = useAssessmentStore()

    const runIntegrationTests = async () => {
        setLoading(true)
        try {
            const results = await runTests()
            setTestResults(results)
        } catch (error) {
            console.error('Test error:', error)
        } finally {
            setLoading(false)
        }
    }

    const testAuth = () => {
        console.log('Auth State:', {
            isAuthenticated: auth.isAuthenticated,
            userType: auth.userType,
            user: auth.user
        })
    }

    const testStores = () => {
        console.log('Store States:')
        console.log('Jobs:', jobs.jobs.length, 'loading:', jobs.loading)
        console.log('Candidates:', candidates.candidates.length, 'loading:', candidates.loading)
        console.log('Assessments:', Object.keys(assessments.assessments).length, 'loading:', assessments.loading)
    }

    useEffect(() => {
        runIntegrationTests()
        testAuth()
        testStores()
    }, [])

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">TalentFlow Integration Tests</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Auth Status */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Authentication Status</h2>
                    <div className="space-y-2">
                        <p><strong>Authenticated:</strong> {auth.isAuthenticated ? '✅' : '❌'}</p>
                        <p><strong>User Type:</strong> {auth.userType || 'None'}</p>
                        <p><strong>User:</strong> {auth.user?.name || 'None'}</p>
                    </div>
                </div>

                {/* Store Status */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Store Status</h2>
                    <div className="space-y-2">
                        <p><strong>Jobs:</strong> {jobs.jobs.length} (loading: {jobs.loading ? 'Yes' : 'No'})</p>
                        <p><strong>Candidates:</strong> {candidates.candidates.length} (loading: {candidates.loading ? 'Yes' : 'No'})</p>
                        <p><strong>Assessments:</strong> {Object.keys(assessments.assessments).length} (loading: {assessments.loading ? 'Yes' : 'No'})</p>
                    </div>
                </div>

                {/* Test Results */}
                <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
                    <h2 className="text-lg font-semibold mb-4">Integration Test Results</h2>
                    {loading ? (
                        <p>Running tests...</p>
                    ) : testResults ? (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium">IndexedDB Test:</h3>
                                <p className={testResults.indexDB.success ? 'text-green-600' : 'text-red-600'}>
                                    {testResults.indexDB.success ? '✅ Passed' : '❌ Failed'}
                                </p>
                                {testResults.indexDB.data && (
                                    <p className="text-sm text-gray-600">
                                        Jobs: {testResults.indexDB.data.jobs},
                                        Candidates: {testResults.indexDB.data.candidates},
                                        Assessments: {testResults.indexDB.data.assessments}
                                    </p>
                                )}
                            </div>
                            <div>
                                <h3 className="font-medium">API Test:</h3>
                                <p className={testResults.api.success ? 'text-green-600' : 'text-red-600'}>
                                    {testResults.api.success ? '✅ Passed' : '❌ Failed'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p>No test results yet</p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
                    <h2 className="text-lg font-semibold mb-4">Actions</h2>
                    <div className="space-x-4">
                        <button
                            onClick={runIntegrationTests}
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Running...' : 'Run Tests'}
                        </button>
                        <button
                            onClick={testAuth}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            Test Auth
                        </button>
                        <button
                            onClick={testStores}
                            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                        >
                            Test Stores
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TestPage
