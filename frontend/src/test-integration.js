// src/test-integration.js
import {db} from "./db";
import {apiClient} from "./api/apiClient";

/**
 * Run developer integration tests for IndexedDB + API mocks
 * Used only by TestPage.jsx
 */
export async function runTests() {
    const results = {
        indexDB: { success: false, data: null },
        api: { success: false }
    };

    try {
        // ✅ IndexedDB Test
        const jobs = await db.jobs.toArray();
        const candidates = await db.candidates.toArray();
        const assessments = await db.assessments.toArray();

        results.indexDB = {
            success: true,
            data: {
                jobs: jobs.length,
                candidates: candidates.length,
                assessments: assessments.length
            }
        };
    } catch (error) {
        console.error("IndexedDB test failed:", error);
        results.indexDB = { success: false, data: null };
    }

    try {
        // ✅ API Test (Mirage or real API)
        const response = await apiClient.get("/jobs");
        if (response?.data) {
            results.api.success = true;
        }
    } catch (error) {
        console.error("API test failed:", error);
        results.api.success = false;
    }

    return results;
}
