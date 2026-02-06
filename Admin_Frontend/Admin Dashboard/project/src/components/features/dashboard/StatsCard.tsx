import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  color,
}: StatsCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-800">
            {value}
          </p>
        </div>

        <div className={`${colorClasses[color]} p-4 rounded-full`}>
          <Icon size={28} className="text-white" />
        </div>
      </div>
    </div>
  );
};
