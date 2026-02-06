import { useState, useCallback } from 'react';
import { attendanceApi } from '../api/attendance';
import { Attendance, AttendanceFilters, DashboardStats } from '../types/attendance';
import { downloadFile } from '../utils/formatters';

export const useAttendance = () => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = useCallback(
    async (
      page = 0,
      size = 10,
      filters: AttendanceFilters = {},
      showError = false // 👈 key change
    ) => {
      setIsLoading(true);

      // 👇 clear error on reload / silent fetch
      if (!showError) {
        setError(null);
      }

      try {
        const response = await attendanceApi.getAll(page, size, filters);
        setAttendance(response.content);
        setTotalElements(response.totalElements);
        setTotalPages(response.totalPages);
      } catch (err) {
        if (showError) {
          setError('Failed to fetch attendance records');
        }
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const exportAttendance = useCallback(
    async (filters: AttendanceFilters = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const blob = await attendanceApi.exportToExcel(filters);
        const filename = `attendance-export-${new Date()
          .toISOString()
          .split('T')[0]}.xlsx`;
        downloadFile(blob, filename);
      } catch (err) {
        setError('Failed to export attendance data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    attendance,
    totalElements,
    totalPages,
    isLoading,
    error,
    fetchAttendance,
    exportAttendance,
  };
};

// ================= DASHBOARD =================

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAttendance, setRecentAttendance] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [statsData, recentData] = await Promise.all([
        attendanceApi.getDashboardStats(),
        attendanceApi.getRecentAttendance(10),
      ]);
      setStats(statsData);
      setRecentAttendance(recentData);
    } catch (err) {
      // 👇 dashboard loads silently on reload
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    stats,
    recentAttendance,
    isLoading,
    error,
    fetchDashboardData,
  };
};
