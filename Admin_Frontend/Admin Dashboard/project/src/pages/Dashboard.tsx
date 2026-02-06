import { useEffect } from 'react';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useDashboard } from '../hooks/useAttendance';
import { StatsCard } from '../components/features/dashboard/StatsCard';
import { RecentAttendance } from '../components/features/dashboard/RecentAttendance';
import { Spinner } from '../components/ui/Spinner';

export const Dashboard = () => {
  const { stats, recentAttendance, isLoading, error, fetchDashboardData } =
    useDashboard();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Dashboard
        </h2>
        <p className="text-gray-600">
          Overview of attendance system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          title="Total Employees"
          value={stats?.totalEmployees || 0}
          icon={Users}
          color="blue"
        />

        <StatsCard
          title="Present Today"
          value={stats?.presentToday || 0}
          icon={CheckCircle}
          color="green"
        />

        <StatsCard
          title="Absent Today"
          value={stats?.absentToday || 0}
          icon={XCircle}
          color="red"
        />

        {/* ✅ Half Day BEFORE Late */}
        <StatsCard
          title="Half Day"
          value={(stats as any)?.halfDayToday || 0}
          icon={AlertCircle}
          color="purple"
        />

        <StatsCard
          title="Late Today"
          value={stats?.lateToday || 0}
          icon={Clock}
          color="yellow"
        />
      </div>

      <RecentAttendance attendance={recentAttendance} />
    </div>
  );
};
