import { useState } from 'react';
import { LayoutGrid, CheckSquare, Users, ChevronLeft, ChevronRight, X } from 'lucide-react';

export const Sidebar = ({
  activeMenu,
  setActiveMenu,
  userName = 'User',
  isAdmin = false,
  onLogout = () => {},
  isMobileOpen = false,
  onMobileClose = () => {},
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'boards', label: 'Board', icon: LayoutGrid },
    ...(isAdmin 
      ? [
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'jobs', label: 'Jobs', icon: LayoutGrid },
        ] 
      : []
    ),
  ];

  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';

  return (
    <aside
      className={`
        ${sidebarWidth}
        bg-white border-r border-gray-200 h-screen flex flex-col transition-[width] duration-300 ease-in-out
        fixed inset-y-0 left-0 z-40 transform shadow-2xl lg:static lg:translate-x-0 lg:shadow-none
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
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
        <div className="flex items-center gap-2">
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          <button
            onClick={onMobileClose}
            className={`lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition ${
              isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            title="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveMenu(item.id);
                    if (!window.matchMedia('(min-width: 1024px)').matches) {
                      onMobileClose();
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeMenu === item.id
                      ? 'bg-indigo-100 text-indigo-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!isCollapsed && <span className="transition-opacity duration-200">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-gray-200 p-4">
        <div
          className={`flex items-center justify-between gap-3 transition-opacity duration-200 ${
            isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div>
            <p className="text-sm font-semibold text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500">{isAdmin ? 'Administrator' : 'Member'}</p>
          </div>
          <button
            onClick={onLogout}
            className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
          >
            Logout
          </button>
        </div>
        {isCollapsed && (
          <button
            onClick={onLogout}
            className="w-full rounded-lg bg-gray-100 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200"
            title="Sign out"
          >
            Logout
          </button>
        )}
      </div>
    </aside>
  );
};
