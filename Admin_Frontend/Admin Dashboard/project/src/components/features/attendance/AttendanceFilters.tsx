import { useState } from 'react';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { AttendanceFilters as Filters, AttendanceStatus } from '../../../types/attendance';
import { Filter } from 'lucide-react';

interface AttendanceFiltersProps {
  onApplyFilters: (filters: Filters) => void;
}

export const AttendanceFilters = ({ onApplyFilters }: AttendanceFiltersProps) => {
  const [filters, setFilters] = useState<Filters>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const handleApply = () => {
    onApplyFilters(filters);
  };

  const handleReset = () => {
    setFilters({});
    onApplyFilters({});
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-gray-700 font-medium hover:text-gray-900"
        >
          <Filter size={20} />
          <span>Filters</span>
        </button>
        {isExpanded && (
          <div className="flex gap-2">
            <Button size="sm" variant="primary" onClick={handleApply}>
              Apply
            </Button>
            <Button size="sm" variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            type="date"
            label="Start Date"
            value={filters.startDate || ''}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />
          <Input
            type="date"
            label="End Date"
            value={filters.endDate || ''}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  status: e.target.value as AttendanceStatus | undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value={AttendanceStatus.PRESENT}>Present</option>
              <option value={AttendanceStatus.ABSENT}>Absent</option>
              <option value={AttendanceStatus.LATE}>Late</option>
              <option value={AttendanceStatus.HALF_DAY}>Half Day</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
