import { create } from "zustand";
import { apiClient } from "../api/apiClient";
import { db } from "../db"; // Dexie

const useJobStore = create((set, get) => ({
    jobs: [],
    loading: false,
    error: null,

    // GET /jobs?search=&status=&page=&pageSize=&sort=
    fetchJobs: async (params = {}) => {
        set({ loading: true, error: null });
        try {
            const res = await apiClient.get("/jobs", { params });
            const jobs = res.data.data || res.data;

            set({ jobs, loading: false });

            // Mirror to IndexedDB
            await db.jobs.clear();
            jobs.forEach((j) => db.jobs.put(j));
        } catch (err) {
            set({ error: err.message, loading: false });

            // Fallback to IndexedDB
            const cached = await db.jobs.toArray();
            if (cached.length) set({ jobs: cached });
        }
    },

    // POST /jobs
    createJob: async (jobData) => {
        set({ loading: true });
        try {
            const res = await apiClient.post("/jobs", jobData);
            const newJob = res.data;

            set({ jobs: [...get().jobs, newJob], loading: false });
            await db.jobs.put(newJob); // Persist
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },

    // PATCH /jobs/:id
    updateJob: async (id, updates) => {
        set({ loading: true });
        try {
            const res = await apiClient.patch(`/jobs/${id}`, updates);
            const updatedJob = res.data;

            set({
                jobs: get().jobs.map((j) => (j.id === id ? updatedJob : j)),
            });
            await db.jobs.put(updatedJob);
            set({loading: false})
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },

    // PATCH /jobs/:id/reorder
    reorderJobs: async (fromOrder, toOrder) => {
        set({loading: true})
        try {
            // Find the job with the fromOrder to get its ID
            const job = get().jobs.find(j => j.order === fromOrder);
            if (!job) {
                throw new Error('Job not found');
            }
            
            const res = await apiClient.patch(`/jobs/${job.id}/reorder`, { fromOrder, toOrder });
            
            if (res.data.success) {
                // Refresh jobs after successful reorder
                await get().fetchJobs();
            }
            set({loading: false})
        } catch (err) {
            // Simulate rollback if Mirage returns 500
            set({ error: "Reorder failed, rolled back" });
            await get().fetchJobs();
            set({loading: false})
        }
    },
}));

export default useJobStore;
