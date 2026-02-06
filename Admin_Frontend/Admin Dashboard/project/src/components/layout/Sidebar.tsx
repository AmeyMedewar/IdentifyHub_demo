import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardList } from 'lucide-react';
import { ROUTES } from '../../utils/constants';

const navItems = [
  { to: ROUTES.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
  { to: ROUTES.USERS, icon: Users, label: 'Users' },
  { to: ROUTES.ATTENDANCE, icon: ClipboardList, label: 'Attendance' },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-800 min-h-screen">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <ClipboardList size={24} className="text-white" />
          </div>
          <span className="text-white font-semibold text-lg">Admin Panel</span>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};
