import { create } from 'zustand';

const useAttendanceStore = create((set) => ({
  // Attendance records
  attendanceRecords: [],
  
  // Today's attendance status
  isMarkedToday: false,
  
  // Loading state
  isLoading: false,
  
  // Error state
  error: null,

  // Actions
  setAttendanceRecords: (records) => set({ attendanceRecords: records }),
  
  setMarkedToday: (marked) => set({ isMarkedToday: marked }),
  
  addAttendanceRecord: (record) =>
    set((state) => ({
      attendanceRecords: [record, ...state.attendanceRecords],
      isMarkedToday: true,
    })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
  
  resetAttendance: () =>
    set({
      attendanceRecords: [],
      isMarkedToday: false,
      error: null,
    }),
}));

export default useAttendanceStore;