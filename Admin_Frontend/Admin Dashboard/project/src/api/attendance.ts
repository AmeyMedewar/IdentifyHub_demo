import apiClient from './axios';
import { Attendance, AttendanceFilters, DashboardStats } from '../types/attendance';

export const attendanceApi = {
  getAll: async (
    page = 0,
    size = 10,
    filters: AttendanceFilters = {}
  ): Promise<{ content: Attendance[]; totalElements: number; totalPages: number }> => {
    const response = await apiClient.get('/api/admin/attendance', {
      params: { page, size, ...filters },
    });
    return response.data;
  },

  getById: async (id: number): Promise<Attendance> => {
    const response = await apiClient.get(`/api/admin/attendance/${id}`);
    return response.data;
  },

  getByUser: async (userId: number, startDate?: string, endDate?: string): Promise<Attendance[]> => {
    const response = await apiClient.get(`/api/admin/attendance/user/${userId}`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/api/admin/attendance/stats/dashboard');
    return response.data;
  },

  getRecentAttendance: async (limit = 10): Promise<Attendance[]> => {
    const response = await apiClient.get('/api/admin/attendance/recent', {
      params: { limit },
    });
    return response.data;
  },

  exportToExcel: async (filters: AttendanceFilters = {}): Promise<Blob> => {
    const response = await apiClient.get('/api/admin/attendance/export', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
};
