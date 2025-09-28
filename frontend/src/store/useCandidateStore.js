import { create } from "zustand";
import { apiClient } from "../api/apiClient";
import { db } from "../db";

const useCandidateStore = create((set, get) => ({
    candidates: [],
    loading: false,
    error: null,
    pagination: {
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 0
    },

    // GET /candidates?search=&stage=&page=
    fetchCandidates: async (params = {}) => {
        set({ loading: true, error: null });
        try {
            const res = await apiClient.get("/candidates", { params });
            const data = res.data;

            set({
                candidates: data.data || data,
                pagination: {
                    ...data.pagination,
                    totalPages: Math.ceil(data.pagination.total / data.pagination.pageSize),
                },
                loading: false
            });

            // Mirror to IndexedDB
            if (data.data) {
                await db.candidates.clear();
                data.data.forEach((c) => db.candidates.put(c));
            }
        } catch (err) {
            set({ error: err.message, loading: false });

            // Fallback to IndexedDB
            const cached = await db.candidates.toArray();
            if (cached.length) set({ candidates: cached });
        }
    },

    // POST /candidates
    createCandidate: async (candidateData) => {
        set({ loading: true });
        try {
            const res = await apiClient.post("/candidates", candidateData);
            const newCandidate = res.data;

            set({ candidates: [...get().candidates, newCandidate], loading: false });
            await db.candidates.put(newCandidate);
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },

    // PATCH /candidates/:id
    updateCandidate: async (id, updates) => {
        set({ loading: true });
        try {
            const res = await apiClient.patch(`/candidates/${id}`, updates);
            const updatedCandidate = res.data;

            set({
                candidates: get().candidates.map((c) => (c.id === id ? updatedCandidate : c)),
                loading: false
            });
            await db.candidates.put(updatedCandidate);
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },

    // GET /candidates/:id/timeline
    fetchCandidateTimeline: async (candidateId) => {
        try {
            const res = await apiClient.get(`/candidates/${candidateId}/timeline`);
            return res.data;
        } catch (err) {
            set({ error: err.message });
            return [];
        }
    },

    // Get candidate by ID
    getCandidateById: (id) => {
        return get().candidates.find(c => c.id === id);
    },

    // Fetch single candidate by ID from API
    fetchCandidateById: async (id) => {
        set({ loading: true, error: null });
        try {
            const res = await apiClient.get(`/candidates/${id}`);
            const candidate = res.data;
            
            // Update the candidates array with this candidate
            const currentCandidates = get().candidates;
            const existingIndex = currentCandidates.findIndex(c => c.id === candidate.id);
            let updatedCandidates;
            
            if (existingIndex >= 0) {
                updatedCandidates = currentCandidates.map(c => c.id === candidate.id ? candidate : c);
            } else {
                updatedCandidates = [...currentCandidates, candidate];
            }
            
            set({ candidates: updatedCandidates, loading: false });
            await db.candidates.put(candidate);
            return candidate;
        } catch (err) {
            set({ error: err.message, loading: false });
            
            // Fallback to IndexedDB
            const cached = await db.candidates.get(parseInt(id));
            if (cached) {
                set({ candidates: [...get().candidates, cached] });
                return cached;
            }
            throw err;
        }
    },

    // Get candidates by stage for Kanban
    getCandidatesByStage: (stage) => {
        return get().candidates.filter(c => c.stage === stage);
    }
}));

export default useCandidateStore;
