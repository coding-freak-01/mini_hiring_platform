import { create } from "zustand";
import { apiClient } from "../api/apiClient";
import { db } from "../db";

const useAssessmentStore = create((set, get) => ({
    assessments: {},
    loading: false,
    error: null,

    // GET /assessments/:jobId
    fetchAssessment: async (jobId) => {
        set({ loading: true, error: null });
        try {
            const res = await apiClient.get(`/assessments/${jobId}`);
            const assessment = res.data;

            set({
                assessments: { ...get().assessments, [jobId]: assessment },
                loading: false
            });

            // Mirror to IndexedDB
            await db.assessments.put(assessment);
        } catch (err) {
            set({ error: err.message, loading: false });

            // Fallback to IndexedDB
            const cached = await db.assessments.where('jobId').equals(parseInt(jobId)).first();
            if (cached) {
                set({ assessments: { ...get().assessments, [jobId]: cached } });
            }
        }
    },

    // PUT /assessments/:jobId
    saveAssessment: async (jobId, assessmentData) => {
        set({ loading: true });
        try {
            const res = await apiClient.put(`/assessments/${jobId}`, assessmentData);
            const savedAssessment = res.data;

            set({
                assessments: { ...get().assessments, [jobId]: savedAssessment },
                loading: false
            });
            await db.assessments.put(savedAssessment);
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },

    // POST /assessments/:jobId/submit
    submitAssessment: async (jobId, submissionData) => {
        set({ loading: true });
        try {
            const res = await apiClient.post(`/assessments/${jobId}/submit`, submissionData);
            set({ loading: false });
            return res.data;
        } catch (err) {
            set({ error: err.message, loading: false });
            throw err;
        }
    },

    // Get assessment by job ID
    getAssessmentByJobId: (jobId) => {
        return get().assessments[jobId];
    },

    // Clear error
    clearError: () => {
        set({ error: null });
    }
}));

export default useAssessmentStore;
