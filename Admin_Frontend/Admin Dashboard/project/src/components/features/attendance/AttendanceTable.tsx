import { Attendance } from '../../../types/attendance';
import { Table } from '../../ui/Table';
import { formatDate, formatTime, getStatusBadgeColor } from '../../../utils/formatters';

interface AttendanceTableProps {
  attendance: Attendance[];
}

export const AttendanceTable = ({ attendance }: AttendanceTableProps) => {
  const columns = [
    {
      header: 'ID',
      accessor: 'id' as keyof Attendance,
      className: 'text-gray-600',
    },
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
      className: 'text-gray-700',
    },
    {
      header: 'Check In',
      accessor: (row: Attendance) => (
        <span className="text-gray-700">{formatTime(row.checkInTime)}</span>
      ),
    },
    {
      header: 'Check Out',
      accessor: (row: Attendance) => (
        <span className="text-gray-700">{formatTime(row.checkOutTime)}</span>
      ),
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

  return <Table data={attendance} columns={columns} />;
};
