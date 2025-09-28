
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
            console.error('Integration test error:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        runIntegrationTests()
    }, [])

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <h1 className="text-2xl font-bold">⚡ TalentFlow Dev Dashboard</h1>
            <p className="text-gray-600">
                This page is for <strong>developers only</strong> to verify Zustand stores,
                IndexedDB, and API mocks are working.
            </p>

            {/* Auth Status */}
            <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-2">🔐 Authentication</h2>
                <ul className="space-y-1 text-sm">
                    <li><strong>Authenticated:</strong> {auth.isAuthenticated ? '✅' : '❌'}</li>
                    <li><strong>User Type:</strong> {auth.userType || 'None'}</li>
                    <li><strong>User:</strong> {auth.user?.name || 'None'}</li>
                </ul>
            </div>

            {/* Store Status */}
            <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-2">🗂️ Store States</h2>
                <ul className="space-y-1 text-sm">
                    <li>Jobs: {jobs.jobs.length} {jobs.loading && '(loading...)'}</li>
                    <li>Candidates: {candidates.candidates.length} {candidates.loading && '(loading...)'}</li>
                    <li>Assessments: {Object.keys(assessments.assessments).length} {assessments.loading && '(loading...)'}</li>
                </ul>
            </div>

            {/* Integration Test Results */}
            <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-2">🧪 Integration Tests</h2>
                {loading ? (
                    <p>Running tests...</p>
                ) : testResults ? (
                    <div className="space-y-2 text-sm">
                        <div>
                            <strong>IndexedDB:</strong>{' '}
                            {testResults.indexDB.success ? '✅ Passed' : '❌ Failed'}
                            {testResults.indexDB.data && (
                                <span className="block text-gray-600">
                                    Jobs: {testResults.indexDB.data.jobs}, Candidates: {testResults.indexDB.data.candidates}, Assessments: {testResults.indexDB.data.assessments}
                                </span>
                            )}
                        </div>
                        <div>
                            <strong>API:</strong>{' '}
                            {testResults.api.success ? '✅ Passed' : '❌ Failed'}
                        </div>
                    </div>
                ) : (
                    <p>No results yet.</p>
                )}
            </div>

            {/* Actions */}
            <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-2">⚙️ Actions</h2>
                <button
                    onClick={runIntegrationTests}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Running...' : 'Re-run Tests'}
                </button>
            </div>
        </div>
    )
}

export default TestPage
