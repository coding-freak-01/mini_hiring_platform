import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create( persist((set, get) => ({
    user: null,
    isAuthenticated: false,
    userType: null, // 'admin' or 'candidate'

    // Login function
    login: (email, password, userType) => {
        if (userType === 'admin' && email === 'admin@talentflow.com' && password === 'admin123') {
            const user = {
                id: 1,
                email: 'admin@talentflow.com',
                name: 'HR Manager',
                type: 'admin'
            };
            set({ user, isAuthenticated: true, userType: 'admin' });
            return { success: true };
        } else if (userType === 'candidate' && email && password) {
            const user = {
                id: Date.now(),
                email,
                name: email.split('@')[0],
                type: 'candidate'
            };
            set({ user, isAuthenticated: true, userType: 'candidate' });
            return { success: true };
        } else {
            return { success: false, error: 'Invalid credentials' };
        }
    },

    // Logout function
    logout: () => {
        set({ user: null, isAuthenticated: false, userType: null });
    },

    // Check if user is admin
    isAdmin: () => {
        return get().userType === 'admin';
    },

    // Check if user is candidate
    isCandidate: () => {
        return get().userType === 'candidate';
    }
    }),
    {
        name: 'auth-storage',
    }
));

export default useAuthStore;
