import { useState } from 'react';
import { LayoutGrid, CheckSquare, BarChart3, Users, ChevronLeft, ChevronRight } from 'lucide-react';

export const Sidebar = ({ activeMenu, setActiveMenu, userName = 'User', isAdmin = false, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'boards', label: 'Board', icon: LayoutGrid },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ...(isAdmin ? [{ id: 'users', label: 'User Management', icon: Users }] : []),
  ];

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300`}>
      {/* Logo & Toggle */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-3 flex-1">
            <img src="assets/eos-logo.png" alt="EOS Logo" className="h-10 w-auto" />
            <div>
              <h1 className="text-2xl font-bold text-indigo-600">EOS</h1>
              {isAdmin ? (
                <p className="text-xs text-gray-500">Admin Panel</p>
              ) : (
                <p className="text-xs text-gray-500">Task Manager</p>
              )}
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900 flex-shrink-0"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeMenu === item.id
                      ? 'bg-indigo-100 text-indigo-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};
