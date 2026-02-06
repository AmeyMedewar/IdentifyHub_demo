import { create } from 'zustand';

const useUserStore = create((set) => ({
  // Current user data
  currentUser: null,
  
  // Loading states
  isLoading: false,
  
  // Error state
  error: null,

  // Actions
  setCurrentUser: (user) => set({ currentUser: user, error: null }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  clearUser: () => set({ currentUser: null, error: null }),
  
  clearError: () => set({ error: null }),
}));

export default useUserStore;