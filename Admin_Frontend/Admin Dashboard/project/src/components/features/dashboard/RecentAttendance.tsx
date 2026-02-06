import { Attendance } from '../../../types/attendance';
import { Table } from '../../ui/Table';
import { formatDate, formatTime, getStatusBadgeColor } from '../../../utils/formatters';

interface RecentAttendanceProps {
  attendance: Attendance[];
}

export const RecentAttendance = ({ attendance }: RecentAttendanceProps) => {
  const columns = [
    {
      header: 'Employee',
      accessor: (row: Attendance) => (
        <div>
          <p className="font-medium text-gray-800">{row.user.name}</p>
          <p className="text-sm text-gray-500">{row.user.email}</p>
        </div>
      ),
    },
    {
      header: 'Date',
      accessor: (row: Attendance) => formatDate(row.attendanceDate),
    },
    {
      header: 'Check In',
      accessor: (row: Attendance) => formatTime(row.checkInTime),
    },
    {
      header: 'Check Out',
      accessor: (row: Attendance) => formatTime(row.checkOutTime),
    },
    {
      header: 'Status',
      accessor: (row: Attendance) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
            row.status
          )}`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Recent Attendance</h3>
      </div>
      <Table data={attendance} columns={columns} />
    </div>
  );
};
