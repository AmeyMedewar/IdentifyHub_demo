import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { useAttendance } from '../hooks/useAttendance';
import { AttendanceTable } from '../components/features/attendance/AttendanceTable';
import { AttendanceFilters } from '../components/features/attendance/AttendanceFilters';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Card } from '../components/ui/Card';
import { AttendanceFilters as Filters } from '../types/attendance';

export const Attendance = () => {
  const {
    attendance,
    totalElements,
    totalPages,
    isLoading,
    error,
    fetchAttendance,
    exportAttendance,
  } = useAttendance();

  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState<Filters>({});

  useEffect(() => {
    fetchAttendance(currentPage, 10, filters);
  }, [currentPage, filters, fetchAttendance]);

  const handleExport = async () => {
    try {
      await exportAttendance(filters);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleApplyFilters = (newFilters: Filters) => {
    setFilters(newFilters);
    setCurrentPage(0);
  };

  if (isLoading && attendance.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Attendance Management
          </h2>
          <p className="text-gray-600">View and manage employee attendance records</p>
        </div>
        <Button variant="primary" onClick={handleExport}>
          <Download size={20} className="mr-2" />
          Export to Excel
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <AttendanceFilters onApplyFilters={handleApplyFilters} />

      <Card>
        <AttendanceTable attendance={attendance} />

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {attendance.length} of {totalElements} records
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm text-gray-700">
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
