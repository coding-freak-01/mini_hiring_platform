// Test file to verify IndexedDB and Mirage integration
import { db } from './db.js'

// Test IndexedDB connection
export const testIndexedDB = async () => {
    try {
        console.log('Testing IndexedDB connection...')

        // Test if we can access the database
        const jobs = await db.jobs.toArray()
        const candidates = await db.candidates.toArray()
        const assessments = await db.assessments.toArray()

        console.log('IndexedDB Status:')
        console.log(`- Jobs: ${jobs.length} records`)
        console.log(`- Candidates: ${candidates.length} records`)
        console.log(`- Assessments: ${assessments.length} records`)

        return {
            success: true,
            data: {
                jobs: jobs.length,
                candidates: candidates.length,
                assessments: assessments.length
            }
        }
    } catch (error) {
        console.error('IndexedDB Error:', error)
        return { success: false, error: error.message }
    }
}

// Test API endpoints
export const testAPI = async () => {
    try {
        console.log('Testing API endpoints...')

        // Test jobs endpoint
        const jobsResponse = await fetch('/api/jobs?pageSize=5')
        const jobsData = await jobsResponse.json()
        console.log('Jobs API:', jobsData)

        // Test candidates endpoint
        const candidatesResponse = await fetch('/api/candidates?pageSize=5')
        const candidatesData = await candidatesResponse.json()
        console.log('Candidates API:', candidatesData)

        return {
            success: true,
            data: {
                jobs: jobsData,
                candidates: candidatesData
            }
        }
    } catch (error) {
        console.error('API Error:', error)
        return { success: false, error: error.message }
    }
}

// Run tests
export const runTests = async () => {
    console.log('🧪 Running TalentFlow Integration Tests...')

    const indexDBTest = await testIndexedDB()
    const apiTest = await testAPI()

    console.log('📊 Test Results:')
    console.log('IndexedDB:', indexDBTest.success ? '✅' : '❌')
    console.log('API:', apiTest.success ? '✅' : '❌')

    return {
        indexDB: indexDBTest,
        api: apiTest
    }
}
